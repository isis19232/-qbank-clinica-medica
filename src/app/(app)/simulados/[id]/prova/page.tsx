import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getQuestion } from "@/lib/services/questions";
import { ExamRunner } from "@/components/exam-runner";
import type { RunnerQuestion } from "@/components/question-runner";

export const metadata: Metadata = { title: "Prova em andamento" };
export const dynamic = "force-dynamic";

export default async function ExamRunPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id, userId: user.id },
    include: { exam: { include: { items: { orderBy: { order: "asc" } } } } },
  });
  if (!attempt) notFound();
  // Simulado já entregue vai direto ao relatório.
  if (attempt.finishedAt) redirect(`/simulados/${attempt.id}`);

  const loaded = await Promise.all(attempt.exam.items.map((i) => getQuestion(i.questionId, user.id)));
  const questions: RunnerQuestion[] = loaded
    .filter((q): q is NonNullable<typeof q> => q !== null && q.type === "OBJECTIVE")
    .map((q) => ({
      id: q.id,
      code: q.code,
      type: q.type,
      stem: q.stem,
      prompt: q.prompt,
      difficulty: q.difficulty,
      clinicalReasoningType: q.clinicalReasoningType,
      specialty: q.specialty,
      topic: q.topic,
      labData: q.labData,
      media: q.media,
      guidelineReference: q.guidelineReference,
      alternatives: q.alternatives.map((a) => ({ id: a.id, label: a.label, text: a.text })),
      isFavorite: q.isFavorite,
      globalStats: null,
    }));

  if (questions.length === 0) notFound();

  return (
    <ExamRunner
      questions={questions}
      examAttemptId={attempt.id}
      timeLimitMin={attempt.exam.timeLimitMin}
      title={attempt.exam.title}
    />
  );
}
