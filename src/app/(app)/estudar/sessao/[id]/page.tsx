import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getQuestion } from "@/lib/services/questions";
import { QuestionRunner, type RunnerQuestion } from "@/components/question-runner";
import { parseJson } from "@/lib/domain/schemas";
import { SLOT_LABEL, type PlanSlot } from "@/lib/engines/daily-plan";
import { z } from "zod";

export const metadata: Metadata = { title: "Sessão de estudo" };
export const dynamic = "force-dynamic";

export default async function StudySessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const session = await prisma.studySession.findFirst({ where: { id, userId: user.id } });
  if (!session) notFound();

  const order = parseJson(session.questionOrder, z.array(z.string()), []);
  const composition = parseJson(session.composition, z.record(z.string(), z.number()), {});

  const loaded = await Promise.all(order.map((qid) => getQuestion(qid, user.id)));
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
      globalStats: q.globalStats,
    }));

  const slots = (Object.keys(SLOT_LABEL) as PlanSlot[]).filter((s) => (composition[s] ?? 0) > 0);

  return (
    <div className="grid gap-4">
      <header className="no-print flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold tracking-tight">
          {session.mode === "DAILY" ? "Estudo de hoje" : "Bloco adaptativo"}
        </h1>
        {session.plannedMinutes && <span className="chip">{session.plannedMinutes} min</span>}
        {slots.map((s) => (
          <span key={s} className="chip">
            {composition[s]} {SLOT_LABEL[s].toLowerCase()}
          </span>
        ))}
      </header>

      <QuestionRunner
        questions={questions}
        mode={session.mode}
        studySessionId={session.id}
        onFinishHref={`/estudar/sessao/${session.id}/resumo`}
      />
    </div>
  );
}
