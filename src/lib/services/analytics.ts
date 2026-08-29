import { prisma } from "@/lib/db";
import type { Difficulty } from "@/lib/domain/enums";
import {
  accuracyOverTime,
  byDifficulty,
  bySpecialty,
  byTopic,
  confidenceCalibration,
  overall,
  priorityTopics,
  type AttemptRow,
} from "@/lib/engines/analytics";

/** Carrega as tentativas do usuário no formato que a camada de analytics consome. */
export async function loadAttemptRows(userId: string, since?: Date): Promise<AttemptRow[]> {
  const rows = await prisma.attempt.findMany({
    where: { userId, ...(since ? { createdAt: { gte: since } } : {}) },
    orderBy: { createdAt: "asc" },
    select: {
      questionId: true,
      isCorrect: true,
      selectedLabel: true,
      confidence: true,
      responseTimeMs: true,
      createdAt: true,
      question: {
        select: {
          difficulty: true,
          specialty: { select: { slug: true, name: true } },
          topic: { select: { slug: true, name: true, yieldWeight: true } },
        },
      },
    },
  });

  return rows.map((r) => ({
    questionId: r.questionId,
    isCorrect: r.isCorrect,
    selectedLabel: r.selectedLabel,
    confidence: r.confidence,
    responseTimeMs: r.responseTimeMs,
    createdAt: r.createdAt,
    specialtySlug: r.question.specialty.slug,
    specialtyName: r.question.specialty.name,
    topicSlug: r.question.topic?.slug ?? null,
    topicName: r.question.topic?.name ?? null,
    topicYieldWeight: r.question.topic?.yieldWeight ?? 3,
    difficulty: r.question.difficulty as Difficulty,
  }));
}

export async function dashboardData(userId: string) {
  const [rows, totalQuestions, dueCount, errorCount, favoriteCount, user] = await Promise.all([
    loadAttemptRows(userId),
    prisma.question.count({ where: { status: "PUBLISHED" } }),
    prisma.userQuestionStat.count({
      where: { userId, suspended: false, nextReviewAt: { lte: new Date() } },
    }),
    prisma.errorNotebookEntry.count({ where: { userId, resolved: false } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true, targetExam: { select: { slug: true, name: true } } },
    }),
  ]);

  const distinctAnswered = new Set(rows.map((r) => r.questionId)).size;
  const todayIso = new Date().toISOString().slice(0, 10);
  const answeredToday = rows.filter((r) => r.createdAt.toISOString().slice(0, 10) === todayIso).length;

  return {
    overall: overall(rows),
    bySpecialty: bySpecialty(rows),
    byTopic: byTopic(rows),
    byDifficulty: byDifficulty(rows),
    priorityTopics: priorityTopics(rows).slice(0, 8),
    accuracyOverTime: accuracyOverTime(rows).slice(-30),
    confidenceCalibration: confidenceCalibration(rows),
    coverage: {
      totalQuestions,
      answered: distinctAnswered,
      remaining: Math.max(0, totalQuestions - distinctAnswered),
      pct: totalQuestions ? distinctAnswered / totalQuestions : 0,
    },
    queues: { dueForReview: dueCount, openErrors: errorCount, favorites: favoriteCount },
    goal: { daily: user?.dailyGoal ?? 20, answeredToday },
    targetExam: user?.targetExam ?? null,
  };
}
