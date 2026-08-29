import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ERROR_TYPE_ADVICE } from "@/lib/engines/error-classifier";
import { ERROR_TYPE_LABEL, type ErrorType } from "@/lib/domain/enums";
import { explanationSchema, parseJson } from "@/lib/domain/schemas";
import { Card, DifficultyChip, EmptyState } from "@/components/ui";
import { ErrorTypeEditor } from "@/components/error-type-editor";

export const metadata: Metadata = { title: "Caderno de erros" };
export const dynamic = "force-dynamic";

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const showResolved = sp.resolved === "true";
  const typeFilter = typeof sp.type === "string" ? sp.type : undefined;

  const entries = await prisma.errorNotebookEntry.findMany({
    where: {
      userId: user.id,
      ...(showResolved ? {} : { resolved: false }),
      ...(typeFilter ? { errorType: typeFilter } : {}),
    },
    orderBy: [{ occurrences: "desc" }, { updatedAt: "desc" }],
    include: {
      question: {
        select: {
          id: true,
          code: true,
          prompt: true,
          difficulty: true,
          explanation: true,
          specialty: { select: { name: true } },
          topic: { select: { name: true } },
        },
      },
    },
  });

  // Contagem por tipo é feita sobre o conjunto sem o filtro de tipo, para que
  // os chips não sumam depois de selecionado um deles.
  const allOpen = await prisma.errorNotebookEntry.groupBy({
    by: ["errorType"],
    where: { userId: user.id, ...(showResolved ? {} : { resolved: false }) },
    _count: { errorType: true },
  });
  const counts = allOpen
    .map((g) => ({ errorType: g.errorType, count: g._count.errorType }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Caderno de erros</h1>
          <p className="muted mt-0.5 text-sm">
            {entries.length} registro{entries.length === 1 ? "" : "s"}
            {showResolved ? " (incluindo resolvidos)" : " em aberto"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={showResolved ? "/erros" : "/erros?resolved=true"} className="btn">
            {showResolved ? "Só os em aberto" : "Incluir resolvidos"}
          </Link>
        </div>
      </header>

      {counts.length > 0 && (
        <Card title="Padrão dos seus erros">
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={showResolved ? "/erros?resolved=true" : "/erros"}
              className={`chip ${!typeFilter ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              Todos
            </Link>
            {counts.map((c) => (
              <Link
                key={c.errorType}
                href={`/erros?type=${c.errorType}${showResolved ? "&resolved=true" : ""}`}
                className={`chip ${typeFilter === c.errorType ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
              >
                {ERROR_TYPE_LABEL[c.errorType as ErrorType] ?? c.errorType}{" "}
                <span className="muted">{c.count}</span>
              </Link>
            ))}
          </div>

          {counts[0] && (
            <div className="mt-4 rounded-lg border bg-[var(--surface-2)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Seu erro mais frequente: {ERROR_TYPE_LABEL[counts[0].errorType as ErrorType]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">
                {ERROR_TYPE_ADVICE[counts[0].errorType as ErrorType]}
              </p>
            </div>
          )}
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState
          title={showResolved ? "Nenhum registro" : "Nenhum erro em aberto"}
          hint="Questões que você errar aparecem aqui automaticamente, já classificadas por tipo de erro."
          action={
            <Link href="/estudar" className="btn mt-2">
              Começar a estudar
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-2">
          {entries.map((e) => {
            const pearl = parseJson(e.question.explanation, explanationSchema, null as never)?.clinicalPearl;
            return (
              <li key={e.id} className="surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyChip difficulty={e.question.difficulty} />
                  <span className="chip">{e.question.specialty.name}</span>
                  {e.question.topic && <span className="chip">{e.question.topic.name}</span>}
                  {e.occurrences > 1 && (
                    <span className="chip border-[var(--color-bad-500)] text-[var(--color-bad-500)]">
                      errada {e.occurrences}×
                    </span>
                  )}
                  {e.resolved && (
                    <span className="chip border-[var(--color-ok-500)] text-[var(--color-ok-500)]">resolvida</span>
                  )}
                  <span className="muted ml-auto text-[11px]">{e.question.code}</span>
                </div>

                <p className="mt-2 text-sm leading-relaxed">{e.question.prompt}</p>

                <p className="muted mt-2 text-xs tabular-nums">
                  Você marcou <strong>{e.selectedLabel ?? "em branco"}</strong> · gabarito{" "}
                  <strong>{e.correctLabel}</strong>
                </p>

                {pearl && (
                  <p className="mt-2 rounded-md bg-[var(--color-brand-50)] px-3 py-2 text-xs leading-relaxed text-[var(--color-ink-800)]">
                    💡 {pearl}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                  <ErrorTypeEditor
                    entryId={e.id}
                    current={e.errorType}
                    classifiedBy={e.classifiedBy}
                  />
                  <Link href={`/questoes/${e.question.id}`} className="btn ml-auto px-2.5 py-1 text-xs">
                    Refazer questão
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
