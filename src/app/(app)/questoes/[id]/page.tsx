import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getQuestion } from "@/lib/services/questions";
import { QuestionRunner, type RunnerQuestion } from "@/components/question-runner";
import { DiscursiveRunner } from "@/components/discursive-runner";

export const metadata: Metadata = { title: "Questão" };
export const dynamic = "force-dynamic";

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const question = await getQuestion(id, user.id);
  if (!question) notFound();

  if (question.type === "DISCURSIVE" && question.rubric) {
    return (
      <div className="grid gap-4">
        <BackLink />
        <DiscursiveRunner
          question={{
            id: question.id,
            code: question.code,
            stem: question.stem,
            prompt: question.prompt,
            difficulty: question.difficulty,
            specialty: question.specialty,
            topic: question.topic,
            labData: question.labData,
            media: question.media,
            guidelineReference: question.guidelineReference,
            rubric: question.rubric,
          }}
        />
      </div>
    );
  }

  const runnerQuestion: RunnerQuestion = {
    id: question.id,
    code: question.code,
    type: question.type,
    stem: question.stem,
    prompt: question.prompt,
    difficulty: question.difficulty,
    clinicalReasoningType: question.clinicalReasoningType,
    specialty: question.specialty,
    topic: question.topic,
    labData: question.labData,
    media: question.media,
    guidelineReference: question.guidelineReference,
    // A flag isCorrect nunca chega ao cliente antes da resposta.
    alternatives: question.alternatives.map((a) => ({ id: a.id, label: a.label, text: a.text })),
    isFavorite: question.isFavorite,
    globalStats: question.globalStats,
  };

  return (
    <div className="grid gap-4">
      <BackLink />
      <QuestionRunner questions={[runnerQuestion]} mode="PRACTICE" />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/questoes" className="muted no-print text-sm hover:underline">
      ← Voltar ao banco de questões
    </Link>
  );
}
