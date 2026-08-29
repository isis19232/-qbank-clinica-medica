import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTaxonomy } from "@/lib/services/questions";
import { SimulationLauncher } from "@/components/simulation-launcher";
import { Card, EmptyState, formatDuration } from "@/components/ui";

export const metadata: Metadata = { title: "Simulados" };
export const dynamic = "force-dynamic";

export default async function SimulationsPage() {
  const user = await requireUser();

  const [taxonomy, profiles, past] = await Promise.all([
    getTaxonomy(),
    prisma.examProfile.findMany({
      select: { slug: true, name: true, objectiveCount: true, durationMinutes: true },
      orderBy: { name: "asc" },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 10,
      include: { exam: { select: { title: true, questionCount: true } } },
    }),
  ]);

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Simulados</h1>
        <p className="muted mt-0.5 text-sm">
          Monte uma prova completa no formato do perfil escolhido, com tempo cronometrado.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SimulationLauncher
          specialties={(taxonomy[0]?.specialties ?? []).filter((s) => s.questionCount > 0)}
          profiles={profiles}
        />

        <Card title="Simulados anteriores">
          {past.length === 0 ? (
            <EmptyState title="Nenhum simulado concluído ainda" />
          ) : (
            <ul className="grid gap-2">
              {past.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/simulados/${a.id}`}
                    className="flex min-w-0 items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <span className="block truncate font-medium">{a.exam.title}</span>
                      <span className="muted text-xs">
                        {a.finishedAt?.toLocaleDateString("pt-BR")} · {formatDuration(a.totalTimeMs)}
                      </span>
                    </span>
                    <span
                      className="shrink-0 text-lg font-semibold tabular-nums"
                      style={{
                        color:
                          a.scorePct >= 0.8
                            ? "var(--color-ok-500)"
                            : a.scorePct >= 0.6
                              ? "var(--color-warn-500)"
                              : "var(--color-bad-500)",
                      }}
                    >
                      {Math.round(a.scorePct * 100)}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
