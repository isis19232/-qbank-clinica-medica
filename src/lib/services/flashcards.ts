import { prisma } from "@/lib/db";
import { scheduleFlashcard } from "@/lib/engines/spaced-repetition";
import { explanationSchema, parseJson } from "@/lib/domain/schemas";

/** Flashcards, com o mesmo motor de repetição espaçada das questões. */

export async function listDueFlashcards(userId: string, limit = 30) {
  const now = new Date();
  return prisma.flashcard.findMany({
    where: { userId, OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }] },
    orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export async function reviewFlashcard(
  userId: string,
  id: string,
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY",
) {
  const card = await prisma.flashcard.findFirst({ where: { id, userId } });
  if (!card) return null;

  const next = scheduleFlashcard(
    {
      easeFactor: card.easeFactor,
      intervalDays: card.intervalDays,
      repetitions: card.repetitions,
      nextReviewAt: card.nextReviewAt,
    },
    grade,
  );

  return prisma.flashcard.update({ where: { id }, data: next });
}

/**
 * Converte uma questão em flashcards. Gera até dois cartões: um sobre o
 * raciocínio central e outro sobre a pérola clínica — evitando duplicar
 * cartões já criados a partir da mesma questão.
 */
export async function flashcardsFromQuestion(userId: string, questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      alternatives: { where: { isCorrect: true } },
      topic: { select: { name: true } },
      specialty: { select: { name: true } },
    },
  });
  if (!question) return [];

  const existing = await prisma.flashcard.count({ where: { userId, questionId } });
  if (existing > 0) return [];

  const explanation = parseJson(question.explanation, explanationSchema, {
    answerSummary: "",
    whyCorrect: "",
    keyClues: [],
    clinicalPearl: "",
    commonTrap: "",
    managementSteps: [],
  });

  const topicLabel = question.topic?.name ?? question.specialty.name;
  const correct = question.alternatives[0];

  const cards: { front: string; back: string; source: "QUESTION_ERROR" | "CLINICAL_PEARL" }[] = [
    {
      front: question.prompt,
      back: [
        correct ? `${correct.label}) ${correct.text}` : explanation.answerSummary,
        "",
        explanation.whyCorrect,
      ]
        .filter(Boolean)
        .join("\n"),
      source: "QUESTION_ERROR",
    },
  ];

  if (explanation.clinicalPearl) {
    cards.push({
      front: `Pérola clínica — ${topicLabel}`,
      back: explanation.clinicalPearl,
      source: "CLINICAL_PEARL",
    });
  }

  return Promise.all(
    cards.map((c) =>
      prisma.flashcard.create({
        data: {
          userId,
          questionId,
          front: c.front,
          back: c.back,
          topicLabel,
          difficulty: question.difficulty,
          source: c.source,
        },
      }),
    ),
  );
}
