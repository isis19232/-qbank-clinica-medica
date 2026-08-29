import { prisma } from "@/lib/db";
import type { Difficulty } from "@/lib/domain/enums";
import {
  estimateAbility,
  selectAdaptive,
  type CandidateSignals,
} from "@/lib/engines/adaptive";
import { questionsForMinutes, resolveComposition, type Composition } from "@/lib/engines/daily-plan";
import { parseJson } from "@/lib/domain/schemas";
import { z } from "zod";

/**
 * Montagem de blocos de estudo. Reúne os candidatos, calcula os sinais que o
 * motor adaptativo consome e persiste a sessão com a ordem definida.
 */

const DAY_MS = 86_400_000;

export async function buildCandidateSignals(
  userId: string,
  opts: { specialtySlug?: string; examProfileSlug?: string; questionIds?: string[] } = {},
): Promise<CandidateSignals[]> {
  const where: Record<string, unknown> = { status: "PUBLISHED", type: "OBJECTIVE" };
  if (opts.specialtySlug) where.specialty = { slug: opts.specialtySlug };
  if (opts.questionIds) where.id = { in: opts.questionIds };

  const [questions, userStats, user] = await Promise.all([
    prisma.question.findMany({
      where,
      select: {
        id: true,
        difficulty: true,
        specialty: { select: { slug: true } },
        topic: { select: { slug: true, yieldWeight: true } },
        stats: { select: { timesAnswered: true, correctCount: true } },
      },
    }),
    prisma.userQuestionStat.findMany({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { targetExam: { select: { slug: true, specialtyMix: true } } },
    }),
  ]);

  const statByQuestion = new Map(userStats.map((s) => [s.questionId, s]));

  // Desempenho por tópico, calculado a partir das tentativas do usuário.
  const topicPerf = await topicPerformance(userId);

  const profileSlug = opts.examProfileSlug ?? user?.targetExam?.slug;
  const specialtyMix = profileSlug
    ? await specialtyMixFor(profileSlug)
    : ({} as Record<string, number>);
  const maxMix = Math.max(1e-6, ...Object.values(specialtyMix));

  const now = Date.now();

  return questions.map((q) => {
    const us = statByQuestion.get(q.id);
    const perf = q.topic ? topicPerf.get(q.topic.slug) : undefined;

    return {
      questionId: q.id,
      specialtySlug: q.specialty.slug,
      topicSlug: q.topic?.slug ?? null,
      difficulty: q.difficulty as Difficulty,
      topicYieldWeight: q.topic?.yieldWeight ?? 3,
      topicAccuracy: perf ? perf.accuracy : null,
      topicVolume: perf?.answered ?? 0,
      unseen: !us,
      lastWrong: us?.lastCorrect === false,
      lastConfidence: (us?.lastConfidence as CandidateSignals["lastConfidence"]) ?? null,
      daysSinceAnswered: us?.lastAnsweredAt ? (now - us.lastAnsweredAt.getTime()) / DAY_MS : null,
      daysUntilDue: us?.nextReviewAt ? (us.nextReviewAt.getTime() - now) / DAY_MS : null,
      examProfileWeight: (specialtyMix[q.specialty.slug] ?? 0) / maxMix,
      globalAccuracy:
        q.stats && q.stats.timesAnswered > 0 ? q.stats.correctCount / q.stats.timesAnswered : null,
    };
  });
}

export async function topicPerformance(
  userId: string,
): Promise<Map<string, { answered: number; correct: number; accuracy: number; yieldWeight: number }>> {
  const attempts = await prisma.attempt.findMany({
    where: { userId, question: { topicId: { not: null } } },
    select: {
      isCorrect: true,
      question: { select: { topic: { select: { slug: true, yieldWeight: true } } } },
    },
  });

  const map = new Map<string, { answered: number; correct: number; accuracy: number; yieldWeight: number }>();
  for (const a of attempts) {
    const topic = a.question.topic;
    if (!topic) continue;
    const cur = map.get(topic.slug) ?? { answered: 0, correct: 0, accuracy: 0, yieldWeight: topic.yieldWeight };
    cur.answered += 1;
    if (a.isCorrect) cur.correct += 1;
    cur.accuracy = cur.correct / cur.answered;
    map.set(topic.slug, cur);
  }
  return map;
}

export async function currentAbility(userId: string): Promise<number> {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 120,
    select: { isCorrect: true, question: { select: { difficulty: true } } },
  });
  return estimateAbility(
    attempts.map((a) => ({ isCorrect: a.isCorrect, difficulty: a.question.difficulty as Difficulty })),
  );
}

async function specialtyMixFor(slug: string): Promise<Record<string, number>> {
  const profile = await prisma.examProfile.findUnique({
    where: { slug },
    select: { specialtyMix: true },
  });
  return parseJson(profile?.specialtyMix, z.record(z.string(), z.number()), {});
}

export interface DailyPlan {
  studySessionId: string;
  composition: Composition;
  questionIds: string[];
  plannedMinutes: number;
}

/**
 * Monta o bloco "Estudo de Hoje". Cada slot puxa de uma fonte distinta e as
 * seleções são desduplicadas: uma questão que já entrou por revisão de erro não
 * volta a entrar como questão nova.
 */
export async function buildDailyPlan(
  userId: string,
  opts: { minutes: number; questionCount?: number; specialtySlug?: string; examProfileSlug?: string },
): Promise<DailyPlan> {
  const total = opts.questionCount ?? questionsForMinutes(opts.minutes);
  const ability = await currentAbility(userId);
  const now = new Date();

  const [errorIds, dueIds, allSignals, topicPerf] = await Promise.all([
    prisma.errorNotebookEntry
      .findMany({ where: { userId, resolved: false }, select: { questionId: true } })
      .then((r) => r.map((e) => e.questionId)),
    prisma.userQuestionStat
      .findMany({
        where: { userId, suspended: false, nextReviewAt: { lte: now } },
        select: { questionId: true },
      })
      .then((r) => r.map((s) => s.questionId)),
    buildCandidateSignals(userId, {
      specialtySlug: opts.specialtySlug,
      examProfileSlug: opts.examProfileSlug,
    }),
    topicPerformance(userId),
  ]);

  // Tópicos fracos: acurácia abaixo de 70% com amostra mínima de 3 questões.
  const weakTopics = new Set(
    [...topicPerf.entries()].filter(([, v]) => v.answered >= 3 && v.accuracy < 0.7).map(([slug]) => slug),
  );

  const byId = new Map(allSignals.map((s) => [s.questionId, s]));
  const freshPool = allSignals.filter((s) => s.unseen);
  const errorPool = errorIds.map((id) => byId.get(id)).filter(isSignal);
  const spacedPool = dueIds.map((id) => byId.get(id)).filter(isSignal);
  const weakPool = allSignals.filter((s) => s.topicSlug && weakTopics.has(s.topicSlug) && !s.unseen);

  const composition = resolveComposition(total, {
    fresh: freshPool.length,
    errorReview: errorPool.length,
    spaced: spacedPool.length,
    weakTopics: weakPool.length,
  });

  const picked: string[] = [];
  const used = new Set<string>();
  const take = (pool: CandidateSignals[], count: number) => {
    if (count <= 0) return;
    const available = pool.filter((s) => !used.has(s.questionId));
    for (const id of selectAdaptive(available, count, { ability })) {
      if (!used.has(id)) {
        used.add(id);
        picked.push(id);
      }
    }
  };

  // Ordem de atendimento: revisão de erro e espaçada primeiro, pois são as
  // fontes finitas — questões novas preenchem o que sobrar.
  take(errorPool, composition.errorReview);
  take(spacedPool, composition.spaced);
  take(weakPool, composition.weakTopics);
  take(freshPool, composition.fresh);

  const session = await prisma.studySession.create({
    data: {
      userId,
      mode: "DAILY",
      plannedMinutes: opts.minutes,
      plannedCount: picked.length,
      composition: JSON.stringify(composition),
      questionOrder: JSON.stringify(picked),
      filters: JSON.stringify({
        specialty: opts.specialtySlug ?? null,
        examProfile: opts.examProfileSlug ?? null,
      }),
    },
  });

  return {
    studySessionId: session.id,
    composition,
    questionIds: picked,
    plannedMinutes: opts.minutes,
  };
}

function isSignal(s: CandidateSignals | undefined): s is CandidateSignals {
  return s !== undefined;
}

/** Bloco de prática adaptativa simples, sem a composição do plano diário. */
export async function buildAdaptiveBlock(
  userId: string,
  count: number,
  opts: { specialtySlug?: string; examProfileSlug?: string } = {},
): Promise<{ studySessionId: string; questionIds: string[] }> {
  const [signals, ability] = await Promise.all([
    buildCandidateSignals(userId, opts),
    currentAbility(userId),
  ]);
  const questionIds = selectAdaptive(signals, count, { ability });

  const session = await prisma.studySession.create({
    data: {
      userId,
      mode: "PRACTICE",
      plannedCount: questionIds.length,
      questionOrder: JSON.stringify(questionIds),
      filters: JSON.stringify(opts),
    },
  });

  return { studySessionId: session.id, questionIds };
}

export async function studySessionSummary(userId: string, sessionId: string) {
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId },
    include: {
      attempts: {
        include: {
          question: {
            select: {
              difficulty: true,
              specialty: { select: { slug: true, name: true } },
              topic: { select: { slug: true, name: true } },
            },
          },
        },
      },
    },
  });
  if (!session) return null;

  const attempts = session.attempts;
  const answered = attempts.length;
  const correct = attempts.filter((a) => a.isCorrect).length;
  const totalTimeMs = attempts.reduce((s, a) => s + a.responseTimeMs, 0);

  const byTopic = new Map<string, { name: string; answered: number; correct: number }>();
  for (const a of attempts) {
    const t = a.question.topic;
    if (!t) continue;
    const cur = byTopic.get(t.slug) ?? { name: t.name, answered: 0, correct: 0 };
    cur.answered += 1;
    if (a.isCorrect) cur.correct += 1;
    byTopic.set(t.slug, cur);
  }
  const ranked = [...byTopic.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, accuracy: v.answered ? v.correct / v.answered : 0, answered: v.answered }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    sessionId: session.id,
    mode: session.mode,
    composition: parseJson(session.composition, z.record(z.string(), z.number()), {}),
    plannedCount: session.plannedCount,
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    totalTimeMs,
    avgTimeMs: answered ? Math.round(totalTimeMs / answered) : 0,
    weakestTopic: ranked[0] ?? null,
    strongestTopic: ranked.length > 1 ? ranked[ranked.length - 1] : null,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
  };
}
