import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listExamProfiles } from "@/lib/services/xray";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Raio-X de prova" };
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  DERIVED: "Calculado a partir do banco",
  REFERENCE: "Calibrado por material de referência",
  MANUAL: "Definido manualmente",
};

export default async function XrayIndexPage() {
  await requireUser();
  const profiles = await listExamProfiles();

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Raio-X de prova</h1>
        <p className="muted mt-0.5 text-sm">
          Perfil estatístico de cada prova: temas frequentes, tipos de pergunta e uso de exames.
        </p>
      </header>

      {profiles.length === 0 ? (
        <EmptyState title="Nenhum perfil de prova cadastrado" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {profiles.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/raio-x/${p.slug}`}
                className="surface block h-full p-4 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{SOURCE_LABEL[p.statsSource] ?? p.statsSource}</span>
                  {p.year && <span className="chip">{p.year}</span>}
                  <span className="muted ml-auto text-[11px] tabular-nums">
                    {p.questionCount} questões
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-semibold">{p.name}</h2>
                {p.institution && <p className="muted mt-0.5 text-xs">{p.institution}</p>}
                {p.description && <p className="muted mt-2 text-xs leading-relaxed">{p.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
