import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { AnswerInput } from "@/lib/domain/schemas";
import type { Confidence, ReasoningType } from "@/lib/domain/enums";
import { classifyError } from "@/lib/engines/error-classifier";
import { scheduleNext } from "@/lib/engines/spaced-repetition";
import { parseJson } from "@/lib/domain/schemas";
import { z } from "zod";

/**
 * Registro de resposta. Um único fluxo transacional atualiza cinco coisas:
 * a tentativa, a estatística global da questão, a estatística pessoal com o
 * agendamento de revisão, o caderno de erros e — quando em simulado — o
 * agregado da tentativa de prova.
 */

export interface AnswerResult {
  isCorrect: boolean;
  correctLabel: string | null;
  selectedLabel: string | null;
  nextReviewAt: Date | null;
  errorType: string | null;
  explanationUnlocked: true;
}

export async function recordAnswer(userId: string, input: AnswerInput): Promise<AnswerResult> {
  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    include: { alternatives: true, stats: true },
  });
  if (!question) throw new Error("Questão não encontrada");

  const correct = question.alternatives.find((a) => a.isCorrect) ?? null;
  const isObjective = question.type === "OBJECTIVE";

  // Discursiva não tem acerto binário automático — a nota vem da correção por rubrica.
  const isCorrect = isObjective
    ? input.selectedLabel !== null && input.selectedLabel === correct?.label
    : null;

  const prevStat = await prisma.userQuestionStat.findUnique({
    where: { userId_questionId: { userId, questionId: question.id } },
  });

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      questionId: question.id,
      selectedLabel: input.selectedLabel,
      discursiveText: input.discursiveText ?? null,
      isCorrect,
      confidence: input.confidence,
      responseTimeMs: input.responseTimeMs,
      changedAnswer: input.changedAnswer,
      mode: input.mode,
      studySessionId: input.studySessionId,
      examAttemptId: input.examAttemptId,
    },
  });

  // ── Estatística global (anônima) ──
  const histogram = parseJson(
    question.stats?.answerHistogram ?? "{}",
    z.record(z.string(), z.number()),
    {} as Record<string, number>,
  );
  const key = input.selectedLabel ?? "BLANK";
  histogram[key] = (histogram[key] ?? 0) + 1;

  await prisma.questionStat.upsert({
    where: { questionId: question.id },
    create: {
      questionId: question.id,
      timesAnswered: 1,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect === false ? 1 : 0,
      blankCount: input.selectedLabel === null ? 1 : 0,
      totalTimeMs: input.responseTimeMs,
      answerHistogram: JSON.stringify(histogram),
    },
    update: {
      timesAnswered: { increment: 1 },
      correctCount: { increment: isCorrect ? 1 : 0 },
      incorrectCount: { increment: isCorrect === false ? 1 : 0 },
      blankCount: { increment: input.selectedLabel === null ? 1 : 0 },
      totalTimeMs: { increment: input.responseTimeMs },
      answerHistogram: JSON.stringify(histogram),
    },
  });

  // ── Estatística pessoal + agendamento de revisão ──
  const timesAnswered = (prevStat?.timesAnswered ?? 0) + 1;
  const correctCount = (prevStat?.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const incorrectCount = (prevStat?.incorrectCount ?? 0) + (isCorrect === false ? 1 : 0);
  const totalTimeMs = (prevStat?.totalTimeMs ?? 0) + input.responseTimeMs;

  // Discursiva ainda não pontuada entra no SRS como "em dúvida", nunca como erro.
  const srs = scheduleNext(
    {
      easeFactor: prevStat?.easeFactor ?? 2.5,
      intervalDays: prevStat?.intervalDays ?? 0,
      repetitions: prevStat?.repetitions ?? 0,
      nextReviewAt: prevStat?.nextReviewAt ?? null,
    },
    isCorrect ?? true,
    (isCorrect === null ? "UNSURE" : input.confidence) as Confidence,
  );

  await prisma.userQuestionStat.upsert({
    where: { userId_questionId: { userId, questionId: question.id } },
    create: {
      userId,
      questionId: question.id,
      timesAnswered,
      correctCount,
      incorrectCount,
      personalAccuracy: correctCount / timesAnswered,
      totalTimeMs,
      avgResponseTimeMs: Math.round(totalTimeMs / timesAnswered),
      lastAnsweredAt: attempt.createdAt,
      lastConfidence: input.confidence,
      lastCorrect: isCorrect,
      ...srs,
    },
    update: {
      timesAnswered,
      correctCount,
      incorrectCount,
      personalAccuracy: correctCount / timesAnswered,
      totalTimeMs,
      avgResponseTimeMs: Math.round(totalTimeMs / timesAnswered),
      lastAnsweredAt: attempt.createdAt,
      lastConfidence: input.confidence,
      lastCorrect: isCorrect,
      ...srs,
    },
  });

  // ── Caderno de erros ──
  let errorType: string | null = null;
  if (isCorrect === false && correct) {
    errorType = await upsertErrorEntry(userId, question, input, Boolean(prevStat?.lastCorrect === false));
  } else if (isCorrect === true) {
    // Acertar não apaga o registro — marca como resolvido, preservando o histórico.
    await prisma.errorNotebookEntry.updateMany({
      where: { userId, questionId: question.id, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });
  }

  return {
    isCorrect: isCorrect ?? false,
    correctLabel: correct?.label ?? null,
    selectedLabel: input.selectedLabel,
    nextReviewAt: srs.nextReviewAt,
    errorType,
    explanationUnlocked: true,
  };
}

type QuestionWithStats = Prisma.QuestionGetPayload<{
  include: { alternatives: true; stats: true };
}>;

async function upsertErrorEntry(
  userId: string,
  question: QuestionWithStats,
  input: AnswerInput,
  isRepeatError: boolean,
): Promise<string> {
  const correct = question.alternatives.find((a) => a.isCorrect)!;

  const histogram = parseJson(
    question.stats?.answerHistogram ?? "{}",
    z.record(z.string(), z.number()),
    {} as Record<string, number>,
  );
  // Distrator dominante = alternativa errada mais escolhida por quem errou.
  const wrongEntries = Object.entries(histogram).filter(([k]) => k !== correct.label && k !== "BLANK");
  const dominant = wrongEntries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const medianTimeMs =
    question.stats && question.stats.timesAnswered > 0
      ? Math.round(question.stats.totalTimeMs / question.stats.timesAnswered)
      : null;

  const guidelines = parseJson(question.guidelineReference, z.array(z.unknown()), []);
  const hasCalculation = /escore|score|gap|fração|relação|clearance|índice|critérios de light|fena/i.test(
    `${question.stem} ${question.prompt}`,
  );

  const errorType = classifyError({
    reasoningType: question.clinicalReasoningType as ReasoningType,
    confidence: input.confidence as Confidence,
    responseTimeMs: input.responseTimeMs,
    medianTimeMs,
    isDominantDistractor: dominant !== null && dominant === input.selectedLabel,
    hasCalculation,
    hasGuideline: guidelines.length > 0,
    isRepeatError,
  });

  const existing = await prisma.errorNotebookEntry.findUnique({
    where: { userId_questionId: { userId, questionId: question.id } },
  });

  await prisma.errorNotebookEntry.upsert({
    where: { userId_questionId: { userId, questionId: question.id } },
    create: {
      userId,
      questionId: question.id,
      selectedLabel: input.selectedLabel,
      correctLabel: correct.label,
      errorType,
      classifiedBy: "AUTO",
      occurrences: 1,
    },
    update: {
      selectedLabel: input.selectedLabel,
      correctLabel: correct.label,
      // Uma classificação feita pelo usuário nunca é sobrescrita pela heurística.
      errorType: existing?.classifiedBy === "USER" ? existing.errorType : errorType,
      resolved: false,
      resolvedAt: null,
      occurrences: { increment: 1 },
    },
  });

  return errorType;
}
