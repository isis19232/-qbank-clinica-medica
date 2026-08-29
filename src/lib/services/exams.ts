import { prisma } from "@/lib/db";
import type { Difficulty } from "@/lib/domain/enums";
import type { SimulationInput } from "@/lib/domain/schemas";
import { parseJson } from "@/lib/domain/schemas";
import { z } from "zod";

/**
 * Motor de simulados. A montagem respeita o blueprint do perfil de prova
 * escolhido: distribuição de dificuldade e mix de especialidades entram como
 * cotas, com preenchimento por sorteio determinístico dentro de cada cota.
 */

const DIFFICULTY_KEYS: Difficulty[] = ["EASY", "MEDIUM", "HARD", "VERY_HARD"];

export async function createSimulation(userId: string, input: SimulationInput) {
  const profile = input.examProfile
    ? await prisma.examProfile.findUnique({ where: { slug: input.examProfile } })
    : null;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    type: input.includeDiscursive ? undefined : "OBJECTIVE",
  };
  if (input.specialties.length) where.specialty = { slug: { in: input.specialties } };
  if (input.difficulty.length) where.difficulty = { in: input.difficulty };

  const pool = await prisma.question.findMany({
    where,
    select: { id: true, difficulty: true, specialty: { select: { slug: true } } },
  });

  const picked = profile
    ? pickByBlueprint(pool, input.questionCount, {
        difficultyShares: {
          EASY: profile.easyShare,
          MEDIUM: profile.mediumShare,
          HARD: profile.hardShare,
          VERY_HARD: profile.veryHardShare,
        },
        specialtyMix: parseJson(profile.specialtyMix, z.record(z.string(), z.number()), {}),
      })
    : shuffle(pool.map((q) => q.id)).slice(0, input.questionCount);

  const timeLimit = profile && !input.timeLimitMin ? profile.durationMinutes : input.timeLimitMin;

  const exam = await prisma.exam.create({
    data: {
      slug: `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      title: profile ? `Simulado — ${profile.name}` : "Simulado personalizado",
      examProfileId: profile?.id ?? null,
      questionCount: picked.length,
      timeLimitMin: timeLimit,
      blueprint: JSON.stringify(input),
      isPublic: false,
      items: { create: picked.map((questionId, order) => ({ questionId, order })) },
    },
  });

  const attempt = await prisma.examAttempt.create({ data: { examId: exam.id, userId } });

  return {
    examId: exam.id,
    examAttemptId: attempt.id,
    title: exam.title,
    questionIds: picked,
    timeLimitMin: timeLimit,
  };
}

interface Blueprint {
  difficultyShares: Record<Difficulty, number>;
  specialtyMix: Record<string, number>;
}

/**
 * Preenche as cotas de dificuldade e, dentro de cada uma, prioriza as
 * especialidades com maior peso no perfil. Se uma cota não tem material
 * suficiente, a sobra volta para o pool geral — o simulado nunca sai curto
 * por rigidez do blueprint.
 */
function pickByBlueprint(
  pool: { id: string; difficulty: string; specialty: { slug: string } }[],
  count: number,
  blueprint: Blueprint,
): string[] {
  const picked: string[] = [];
  const used = new Set<string>();

  const specialtyRank = (slug: string) => blueprint.specialtyMix[slug] ?? 0;

  for (const difficulty of DIFFICULTY_KEYS) {
    const quota = Math.round(count * (blueprint.difficultyShares[difficulty] ?? 0));
    if (quota <= 0) continue;

    const candidates = shuffle(pool.filter((q) => q.difficulty === difficulty && !used.has(q.id)).map((q) => q.id));
    const byId = new Map(pool.map((q) => [q.id, q]));
    // Ordenação estável por peso da especialidade, mantendo o embaralhamento
    // como critério de desempate dentro do mesmo peso.
    candidates.sort((a, b) => specialtyRank(byId.get(b)!.specialty.slug) - specialtyRank(byId.get(a)!.specialty.slug));

    for (const id of candidates.slice(0, quota)) {
      used.add(id);
      picked.push(id);
    }
  }

  for (const id of shuffle(pool.map((q) => q.id))) {
    if (picked.length >= count) break;
    if (!used.has(id)) {
      used.add(id);
      picked.push(id);
    }
  }

  return picked.slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function finishSimulation(userId: string, examAttemptId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: examAttemptId, userId },
    include: {
      exam: { include: { items: true } },
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
  if (!attempt) return null;

  const answers = attempt.attempts;
  const total = attempt.exam.items.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const blank = total - answers.filter((a) => a.selectedLabel !== null).length;
  const changed = answers.filter((a) => a.changedAnswer).length;
  const totalTimeMs = answers.reduce((s, a) => s + a.responseTimeMs, 0);

  const group = <K extends string>(keyOf: (a: (typeof answers)[number]) => K | null, labelOf: (a: (typeof answers)[number]) => string) => {
    const m = new Map<string, { label: string; answered: number; correct: number }>();
    for (const a of answers) {
      const k = keyOf(a);
      if (!k) continue;
      const cur = m.get(k) ?? { label: labelOf(a), answered: 0, correct: 0 };
      cur.answered += 1;
      if (a.isCorrect) cur.correct += 1;
      m.set(k, cur);
    }
    return [...m.entries()]
      .map(([key, v]) => ({ key, label: v.label, answered: v.answered, correct: v.correct, accuracy: v.correct / v.answered }))
      .sort((x, y) => x.accuracy - y.accuracy);
  };

  const bySpecialty = group((a) => a.question.specialty.slug, (a) => a.question.specialty.name);
  const byTopic = group((a) => a.question.topic?.slug ?? null, (a) => a.question.topic?.name ?? "—");
  const byDifficulty = group((a) => a.question.difficulty, (a) => a.question.difficulty);

  const report = {
    total,
    correct,
    blank,
    changed,
    accuracy: total ? correct / total : 0,
    avgTimeMs: answers.length ? Math.round(totalTimeMs / answers.length) : 0,
    bySpecialty,
    byTopic,
    byDifficulty,
    weakestDomains: bySpecialty.filter((s) => s.accuracy < 0.6).map((s) => s.label),
    percentile: await percentileFor(attempt.examId, total ? correct / total : 0),
  };

  const updated = await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      finishedAt: new Date(),
      scoreRaw: correct,
      scorePct: total ? correct / total : 0,
      blankCount: blank,
      changedCount: changed,
      totalTimeMs,
      report: JSON.stringify(report),
    },
  });

  return { attemptId: updated.id, report };
}

/**
 * Percentil só é calculado com amostra suficiente. Abaixo disso retorna null e
 * a UI mostra "dados insuficientes" — nunca um número inventado.
 */
const MIN_PERCENTILE_SAMPLE = 10;

async function percentileFor(examId: string, scorePct: number): Promise<number | null> {
  const others = await prisma.examAttempt.findMany({
    where: { examId, finishedAt: { not: null } },
    select: { scorePct: true },
  });
  if (others.length < MIN_PERCENTILE_SAMPLE) return null;
  const below = others.filter((o) => o.scorePct < scorePct).length;
  return below / others.length;
}
