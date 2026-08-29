import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { studySessionSummary } from "@/lib/services/study";
import { Card, Stat, formatDuration } from "@/components/ui";
import { SLOT_LABEL, type PlanSlot } from "@/lib/engines/daily-plan";

export const metadata: Metadata = { title: "Resumo do bloco" };
export const dynamic = "force-dynamic";

export default async function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const summary = await studySessionSummary(user.id, id);
  if (!summary) notFound();

  const slots = (Object.keys(SLOT_LABEL) as PlanSlot[]).filter(
    (s) => ((summary.composition as Record<string, number>)[s] ?? 0) > 0,
  );

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Bloco concluído</h1>
        <p className="muted mt-0.5 text-sm">
          {summary.answered} de {summary.plannedCount} questões respondidas
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Acurácia"
          value={summary.answered ? `${Math.round(summary.accuracy * 100)}%` : "—"}
          hint={`${summary.correct} acertos`}
          tone={summary.accuracy >= 0.8 ? "good" : summary.accuracy >= 0.6 ? "warn" : "bad"}
        />
        <Stat label="Tempo total" value={formatDuration(summary.totalTimeMs)} />
        <Stat label="Tempo médio" value={formatDuration(summary.avgTimeMs)} hint="por questão" />
        <Stat label="Modo" value={summary.mode === "DAILY" ? "Diário" : "Prática"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Tópico mais fraco neste bloco">
          {summary.weakestTopic ? (
            <>
              <p className="text-sm font-medium">{summary.weakestTopic.name}</p>
              <p className="muted mt-1 text-sm tabular-nums">
                {Math.round(summary.weakestTopic.accuracy * 100)}% em {summary.weakestTopic.answered} questões
              </p>
              <Link
                href={`/questoes?topic=${summary.weakestTopic.slug}`}
                className="btn mt-3 px-3 py-1.5 text-xs"
              >
                Praticar este tópico
              </Link>
            </>
          ) : (
            <p className="muted text-sm">Sem dados suficientes por tópico neste bloco.</p>
          )}
        </Card>

        <Card title="Tópico mais forte neste bloco">
          {summary.strongestTopic ? (
            <>
              <p className="text-sm font-medium">{summary.strongestTopic.name}</p>
              <p className="muted mt-1 text-sm tabular-nums">
                {Math.round(summary.strongestTopic.accuracy * 100)}% em {summary.strongestTopic.answered} questões
              </p>
            </>
          ) : (
            <p className="muted text-sm">Sem dados suficientes por tópico neste bloco.</p>
          )}
        </Card>
      </div>

      {slots.length > 0 && (
        <Card title="Composição planejada">
          <ul className="grid gap-2 text-sm">
            {slots.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span>{SLOT_LABEL[s]}</span>
                <span className="font-medium tabular-nums">
                  {(summary.composition as Record<string, number>)[s]}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/estudar" className="btn btn-primary">
          Novo bloco
        </Link>
        <Link href="/erros" className="btn">
          Revisar erros
        </Link>
        <Link href="/dashboard" className="btn">
          Painel
        </Link>
      </div>
    </div>
  );
}
