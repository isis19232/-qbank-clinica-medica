import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { listReviewQueue } from "@/lib/services/questions";
import { SOURCE_TYPE_LABEL, type SourceType } from "@/lib/domain/enums";
import { Card, DifficultyChip, EmptyState } from "@/components/ui";
import { ReviewActions } from "@/components/review-actions";

export const metadata: Metadata = { title: "Revisão editorial" };
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requireUser();

  if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
    return (
      <EmptyState
        title="Sem permissão"
        hint="A revisão editorial é restrita a contas com papel de autor ou administrador."
      />
    );
  }

  const queue = await listReviewQueue();

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Revisão editorial</h1>
        <p className="muted mt-0.5 text-sm">
          {queue.length} questão{queue.length === 1 ? "" : "ões"} aguardando revisão antes de entrar
          no banco publicado.
        </p>
      </header>

      {queue.length === 0 ? (
        <EmptyState
          title="Nenhuma questão pendente"
          hint="Questões geradas por IA aparecem aqui até serem aprovadas ou rejeitadas."
        />
      ) : (
        <ul className="grid gap-3">
          {queue.map((q) => (
            <li key={q.id} className="surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyChip difficulty={q.difficulty} />
                <span className="chip">{q.specialty.name}</span>
                {q.topic && <span className="chip">{q.topic.name}</span>}
                <span className="chip">{SOURCE_TYPE_LABEL[q.sourceType as SourceType] ?? q.sourceType}</span>
                <span className="muted ml-auto text-[11px]">{q.code}</span>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{q.stem}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">{q.prompt}</p>

              <ul className="mt-3 grid gap-1.5">
                {q.alternatives.map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      a.isCorrect
                        ? "border-[var(--color-ok-500)] bg-[var(--color-ok-100)]"
                        : "border-[var(--surface-2)]"
                    }`}
                  >
                    <p>
                      <strong>{a.label})</strong> {a.text}
                    </p>
                    <p className="muted mt-1 text-xs leading-relaxed">{a.rationale}</p>
                  </li>
                ))}
              </ul>

              <Card className="mt-3" title="Explicação">
                <div className="grid gap-2 text-sm leading-relaxed">
                  <p>{q.explanation.answerSummary}</p>
                  <p className="muted">{q.explanation.whyCorrect}</p>
                  {q.explanation.clinicalPearl && (
                    <p className="rounded-md bg-[var(--color-brand-50)] px-3 py-2 text-xs">
                      💡 {q.explanation.clinicalPearl}
                    </p>
                  )}
                  {q.guidelineReference.length > 0 && (
                    <p className="muted text-xs">
                      Diretrizes:{" "}
                      {q.guidelineReference
                        .map((g) => `${g.society} — ${g.title}${g.year ? ` (${g.year})` : ""}`)
                        .join("; ")}
                    </p>
                  )}
                </div>
              </Card>

              <div className="mt-3 border-t pt-3">
                <ReviewActions questionId={q.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
