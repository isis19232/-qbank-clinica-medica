import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listQuestions, getTaxonomy } from "@/lib/services/questions";
import { questionFilterSchema } from "@/lib/domain/schemas";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/domain/enums";
import { DifficultyChip, EmptyState, ReasoningChip } from "@/components/ui";

export const metadata: Metadata = { title: "Questões" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SCOPES = [
  { key: "ALL", label: "Todas" },
  { key: "UNSEEN", label: "Não respondidas" },
  { key: "WRONG", label: "Que errei" },
  { key: "FAVORITES", label: "Favoritas" },
] as const;

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const sp = await searchParams;

  const filter = questionFilterSchema.parse({
    specialty: sp.specialty,
    topic: sp.topic,
    difficulty: sp.difficulty ? [sp.difficulty].flat() : undefined,
    scope: sp.scope ?? "ALL",
    search: sp.search,
    type: sp.type,
    page: sp.page ? Number(sp.page) : 1,
    perPage: 20,
  });

  const [result, taxonomy] = await Promise.all([listQuestions(filter, user.id), getTaxonomy()]);
  const specialties = taxonomy[0]?.specialties ?? [];

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      specialty: filter.specialty,
      topic: filter.topic,
      scope: filter.scope,
      search: filter.search,
      difficulty: filter.difficulty?.[0],
      page: String(filter.page),
      ...patch,
    };
    for (const [k, v] of Object.entries(current)) {
      if (v && v !== "ALL" && !(k === "page" && v === "1")) params.set(k, v);
    }
    const qs = params.toString();
    return `/questoes${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Banco de questões</h1>
          <p className="muted mt-0.5 text-sm">{result.total} questões com os filtros atuais</p>
        </div>
        <Link href="/estudar" className="btn btn-primary">
          Bloco adaptativo
        </Link>
      </header>

      <div className="surface p-4">
        <form action="/questoes" method="get" className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            name="search"
            defaultValue={filter.search ?? ""}
            placeholder="Buscar por tema, palavra-chave ou código…"
            className="input"
            aria-label="Buscar questões"
          />
          <button type="submit" className="btn">Buscar</button>
          {filter.specialty && <input type="hidden" name="specialty" value={filter.specialty} />}
          {filter.scope !== "ALL" && <input type="hidden" name="scope" value={filter.scope} />}
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SCOPES.map((s) => (
            <Link
              key={s.key}
              href={buildHref({ scope: s.key, page: "1" })}
              className={`chip ${filter.scope === s.key ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]" : ""}`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href={buildHref({ difficulty: undefined, page: "1" })} className={`chip ${!filter.difficulty?.length ? "border-[var(--color-brand-500)]" : ""}`}>
            Toda dificuldade
          </Link>
          {DIFFICULTIES.map((d) => (
            <Link
              key={d}
              href={buildHref({ difficulty: d, page: "1" })}
              className={`chip ${filter.difficulty?.[0] === d ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              {DIFFICULTY_LABEL[d]}
            </Link>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href={buildHref({ specialty: undefined, topic: undefined, page: "1" })} className={`chip ${!filter.specialty ? "border-[var(--color-brand-500)]" : ""}`}>
            Todas as especialidades
          </Link>
          {specialties
            .filter((s) => s.questionCount > 0)
            .map((s) => (
              <Link
                key={s.slug}
                href={buildHref({ specialty: s.slug, topic: undefined, page: "1" })}
                className={`chip ${filter.specialty === s.slug ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
              >
                {s.name} <span className="muted">{s.questionCount}</span>
              </Link>
            ))}
        </div>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          title="Nenhuma questão encontrada"
          hint="Tente remover filtros, ou gere questões novas com o motor de IA."
          action={
            <Link href="/gerar" className="btn mt-2">
              Gerar questões
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-2">
          {result.items.map((q) => (
            <li key={q.id}>
              <Link
                href={`/questoes/${q.id}`}
                className="surface block p-4 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyChip difficulty={q.difficulty} />
                  <ReasoningChip type={q.clinicalReasoningType} />
                  <span className="chip">{q.specialty.name}</span>
                  {q.topic && <span className="chip">{q.topic.name}</span>}
                  {q.type === "DISCURSIVE" && <span className="chip">Discursiva</span>}
                  <span className="muted ml-auto flex items-center gap-2 text-[11px]">
                    {q.answered && (
                      <span
                        title={q.lastCorrect ? "Você acertou na última vez" : "Você errou na última vez"}
                        style={{ color: q.lastCorrect ? "var(--color-ok-500)" : "var(--color-bad-500)" }}
                      >
                        {q.lastCorrect ? "✓" : "✕"}
                      </span>
                    )}
                    {q.globalAccuracy !== null && <span>{Math.round(q.globalAccuracy * 100)}% acerto</span>}
                    <span>{q.code}</span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{q.prompt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {result.pages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginação">
          {filter.page > 1 && (
            <Link href={buildHref({ page: String(filter.page - 1) })} className="btn">
              ← Anterior
            </Link>
          )}
          <span className="muted text-sm tabular-nums">
            Página {result.page} de {result.pages}
          </span>
          {filter.page < result.pages && (
            <Link href={buildHref({ page: String(filter.page + 1) })} className="btn">
              Próxima →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
