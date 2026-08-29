import { prisma } from "@/lib/db";
import {
  explanationSchema,
  guidelineRefSchema,
  labRowSchema,
  mediaSchema,
  parseJson,
  rubricSchema,
  type QuestionFilter,
} from "@/lib/domain/schemas";
import { z } from "zod";

/**
 * Leitura de questões. Converte as colunas JSON em objetos tipados e aplica os
 * filtros da tela de questões, incluindo os escopos que dependem do usuário.
 */

export type QuestionView = Awaited<ReturnType<typeof getQuestion>>;

const labArray = z.array(labRowSchema);
const mediaArray = z.array(mediaSchema);
const guidelineArray = z.array(guidelineRefSchema);
const stringArray = z.array(z.string());

export async function getQuestion(id: string, userId?: string) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      alternatives: { orderBy: { order: "asc" } },
      specialty: true,
      topic: true,
      subtopic: true,
      examProfile: { select: { id: true, slug: true, name: true } },
      tags: { include: { tag: true } },
      stats: true,
    },
  });
  if (!q) return null;

  const [userStat, favorite] = userId
    ? await Promise.all([
        prisma.userQuestionStat.findUnique({ where: { userId_questionId: { userId, questionId: id } } }),
        prisma.favorite.findUnique({ where: { userId_questionId: { userId, questionId: id } } }),
      ])
    : [null, null];

  return {
    id: q.id,
    code: q.code,
    type: q.type,
    status: q.status,
    sourceType: q.sourceType,
    stem: q.stem,
    prompt: q.prompt,
    difficulty: q.difficulty,
    clinicalReasoningType: q.clinicalReasoningType,
    specialty: { slug: q.specialty.slug, name: q.specialty.name },
    topic: q.topic ? { slug: q.topic.slug, name: q.topic.name } : null,
    subtopic: q.subtopic ? { slug: q.subtopic.slug, name: q.subtopic.name } : null,
    examProfile: q.examProfile,
    examYear: q.examYear,
    labData: parseJson(q.labData, labArray, []),
    media: parseJson(q.media, mediaArray, []),
    guidelineReference: parseJson(q.guidelineReference, guidelineArray, []),
    keywords: parseJson(q.keywords, stringArray, []),
    explanation: parseJson(q.explanation, explanationSchema, {
      answerSummary: "",
      whyCorrect: "",
      keyClues: [],
      clinicalPearl: "",
      commonTrap: "",
      managementSteps: [],
    }),
    rubric: q.rubric ? parseJson(q.rubric, rubricSchema, null as never) : null,
    tags: q.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
    alternatives: q.alternatives.map((a) => ({
      id: a.id,
      label: a.label,
      text: a.text,
      isCorrect: a.isCorrect,
      rationale: a.rationale,
    })),
    globalStats: q.stats
      ? {
          timesAnswered: q.stats.timesAnswered,
          accuracy: q.stats.timesAnswered ? q.stats.correctCount / q.stats.timesAnswered : null,
          avgTimeMs: q.stats.timesAnswered ? Math.round(q.stats.totalTimeMs / q.stats.timesAnswered) : 0,
        }
      : null,
    userStats: userStat
      ? {
          timesAnswered: userStat.timesAnswered,
          personalAccuracy: userStat.personalAccuracy,
          lastCorrect: userStat.lastCorrect,
          lastConfidence: userStat.lastConfidence,
          nextReviewAt: userStat.nextReviewAt,
        }
      : null,
    isFavorite: Boolean(favorite),
  };
}

export async function listQuestions(filter: QuestionFilter, userId?: string) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (filter.specialty) where.specialty = { slug: filter.specialty };
  if (filter.topic) where.topic = { slug: filter.topic };
  if (filter.difficulty?.length) where.difficulty = { in: filter.difficulty };
  if (filter.reasoningType?.length) where.clinicalReasoningType = { in: filter.reasoningType };
  if (filter.examProfile) where.examProfile = { slug: filter.examProfile };
  if (filter.type) where.type = filter.type;
  if (filter.search) {
    where.OR = [
      { stem: { contains: filter.search } },
      { prompt: { contains: filter.search } },
      { keywords: { contains: filter.search } },
      { code: { contains: filter.search } },
    ];
  }

  // Escopos dependentes do usuário resolvem-se por lista de ids, o que mantém
  // uma única consulta paginada em vez de joins condicionais.
  if (userId && filter.scope !== "ALL") {
    const ids = await idsForScope(filter.scope, userId);
    where.id = { in: ids };
  }

  const [total, rows] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      include: {
        specialty: { select: { slug: true, name: true } },
        topic: { select: { slug: true, name: true } },
        stats: { select: { timesAnswered: true, correctCount: true } },
      },
      orderBy: { code: "asc" },
      skip: (filter.page - 1) * filter.perPage,
      take: filter.perPage,
    }),
  ]);

  const userStats = userId
    ? await prisma.userQuestionStat.findMany({
        where: { userId, questionId: { in: rows.map((r) => r.id) } },
      })
    : [];
  const statByQuestion = new Map(userStats.map((s) => [s.questionId, s]));

  return {
    total,
    page: filter.page,
    perPage: filter.perPage,
    pages: Math.max(1, Math.ceil(total / filter.perPage)),
    items: rows.map((r) => {
      const us = statByQuestion.get(r.id);
      return {
        id: r.id,
        code: r.code,
        type: r.type,
        prompt: r.prompt,
        difficulty: r.difficulty,
        clinicalReasoningType: r.clinicalReasoningType,
        specialty: r.specialty,
        topic: r.topic,
        globalAccuracy:
          r.stats && r.stats.timesAnswered ? r.stats.correctCount / r.stats.timesAnswered : null,
        answered: Boolean(us?.timesAnswered),
        lastCorrect: us?.lastCorrect ?? null,
      };
    }),
  };
}

async function idsForScope(scope: QuestionFilter["scope"], userId: string): Promise<string[]> {
  switch (scope) {
    case "UNSEEN": {
      const seen = await prisma.userQuestionStat.findMany({
        where: { userId },
        select: { questionId: true },
      });
      const seenIds = new Set(seen.map((s) => s.questionId));
      const all = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true },
      });
      return all.filter((q) => !seenIds.has(q.id)).map((q) => q.id);
    }
    case "WRONG": {
      const entries = await prisma.errorNotebookEntry.findMany({
        where: { userId },
        select: { questionId: true },
      });
      return entries.map((e) => e.questionId);
    }
    case "FAVORITES": {
      const favs = await prisma.favorite.findMany({ where: { userId }, select: { questionId: true } });
      return favs.map((f) => f.questionId);
    }
    default:
      return [];
  }
}

/**
 * Fila de revisão editorial: questões `IN_REVIEW` (hoje, só geradas por IA)
 * com todo o conteúdo visível, gabarito incluso — quem revisa precisa ver o
 * que o estudante nunca vê antes de responder.
 */
export async function listReviewQueue() {
  const rows = await prisma.question.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: {
      alternatives: { orderBy: { order: "asc" } },
      specialty: { select: { name: true } },
      topic: { select: { name: true } },
    },
  });

  return rows.map((q) => ({
    id: q.id,
    code: q.code,
    type: q.type,
    sourceType: q.sourceType,
    stem: q.stem,
    prompt: q.prompt,
    difficulty: q.difficulty,
    clinicalReasoningType: q.clinicalReasoningType,
    specialty: q.specialty,
    topic: q.topic,
    guidelineReference: parseJson(q.guidelineReference, guidelineArray, []),
    explanation: parseJson(q.explanation, explanationSchema, {
      answerSummary: "",
      whyCorrect: "",
      keyClues: [],
      clinicalPearl: "",
      commonTrap: "",
      managementSteps: [],
    }),
    createdAt: q.createdAt,
    alternatives: q.alternatives.map((a) => ({
      id: a.id,
      label: a.label,
      text: a.text,
      isCorrect: a.isCorrect,
      rationale: a.rationale,
    })),
  }));
}

/** Aprova (publica) ou rejeita (retira) uma questão em revisão. Idempotente por status. */
export async function reviewQuestion(id: string, action: "APPROVE" | "REJECT") {
  const question = await prisma.question.findUnique({ where: { id }, select: { status: true } });
  if (!question) return null;
  if (question.status !== "IN_REVIEW") return { id, status: question.status };

  const updated = await prisma.question.update({
    where: { id },
    data: { status: action === "APPROVE" ? "PUBLISHED" : "RETIRED", reviewedAt: new Date() },
    select: { id: true, status: true },
  });
  return updated;
}

export async function getTaxonomy() {
  const areas = await prisma.area.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      specialties: {
        orderBy: { order: "asc" },
        include: {
          topics: { orderBy: { order: "asc" }, include: { _count: { select: { questions: true } } } },
          _count: { select: { questions: true } },
        },
      },
    },
  });

  return areas.map((a) => ({
    slug: a.slug,
    name: a.name,
    specialties: a.specialties.map((s) => ({
      slug: s.slug,
      name: s.name,
      questionCount: s._count.questions,
      topics: s.topics.map((t) => ({
        slug: t.slug,
        name: t.name,
        yieldWeight: t.yieldWeight,
        questionCount: t._count.questions,
      })),
    })),
  }));
}
