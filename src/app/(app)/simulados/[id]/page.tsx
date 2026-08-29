import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AccuracyBar, Card, EmptyState, Stat, formatDuration } from "@/components/ui";
import { DIFFICULTY_LABEL, type Difficulty } from "@/lib/domain/enums";
import { parseJson } from "@/lib/domain/schemas";
import { z } from "zod";

export const metadata: Metadata = { title: "Relatório do simulado" };
export const dynamic = "force-dynamic";

const groupSchema = z.array(
  z.object({
    key: z.string(),
    label: z.string(),
    answered: z.number(),
    correct: z.number(),
    accuracy: z.number(),
  }),
);

const reportSchema = z.object({
  total: z.number(),
  correct: z.number(),
  blank: z.number(),
  changed: z.number(),
  accuracy: z.number(),
  avgTimeMs: z.number(),
  bySpecialty: groupSchema,
  byTopic: groupSchema,
  byDifficulty: groupSchema,
  weakestDomains: z.array(z.string()),
  percentile: z.number().nullable(),
});

export default async function ExamReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const attempt = await prisma.examAttempt.findFirst({
    where: { id, userId: user.id },
    include: { exam: { select: { title: true, timeLimitMin: true } } },
  });
  if (!attempt) notFound();
  if (!attempt.finishedAt) redirect(`/simulados/${attempt.id}/prova`);

  const report = parseJson(attempt.report, reportSchema, null as never);
  if (!report) {
    return <EmptyState title="Relatório indisponível" hint="Os dados desta tentativa não puderam ser lidos." />;
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{attempt.exam.title}</h1>
          <p className="muted mt-0.5 text-sm">
            Concluído em {attempt.finishedAt.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/simulados" className="btn">
            Novo simulado
          </Link>
          <Link href="/erros" className="btn">
            Ver erros
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Pontuação"
          value={`${report.correct}/${report.total}`}
          hint={`${Math.round(report.accuracy * 100)}% de acerto`}
          tone={report.accuracy >= 0.8 ? "good" : report.accuracy >= 0.6 ? "warn" : "bad"}
        />
        <Stat label="Tempo total" value={formatDuration(attempt.totalTimeMs)} hint={`limite de ${attempt.exam.timeLimitMin} min`} />
        <Stat label="Tempo médio" value={formatDuration(report.avgTimeMs)} hint="por questão" />
        <Stat
          label="Percentil"
          value={report.percentile !== null ? `${Math.round(report.percentile * 100)}º` : "—"}
          hint={report.percentile !== null ? "entre quem fez este simulado" : "amostra insuficiente"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Em branco" value={report.blank} />
        <Stat label="Respostas alteradas" value={report.changed} hint="mudou de alternativa antes de confirmar" />
        <Stat label="Domínios frágeis" value={report.weakestDomains.length} hint="abaixo de 60% de acerto" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Desempenho por especialidade">
          {report.bySpecialty.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className="divide-y">
              {report.bySpecialty.map((s) => (
                <AccuracyBar key={s.key} label={s.label} accuracy={s.accuracy} answered={s.answered} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Desempenho por dificuldade">
          {report.byDifficulty.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className="divide-y">
              {report.byDifficulty.map((d) => (
                <AccuracyBar
                  key={d.key}
                  label={DIFFICULTY_LABEL[d.key as Difficulty] ?? d.label}
                  accuracy={d.accuracy}
                  answered={d.answered}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="Desempenho por tópico" className="lg:col-span-2">
          {report.byTopic.length === 0 ? (
            <EmptyState title="Sem dados por tópico" />
          ) : (
            <div className="grid gap-x-6 sm:grid-cols-2 [&>*]:min-w-0">
              {report.byTopic.map((t) => (
                <AccuracyBar key={t.key} label={t.label} accuracy={t.accuracy} answered={t.answered} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {report.weakestDomains.length > 0 && (
        <Card title="Onde focar agora">
          <ul className="grid gap-1.5 text-sm">
            {report.weakestDomains.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <span aria-hidden style={{ color: "var(--color-bad-500)" }}>●</span>
                {d}
              </li>
            ))}
          </ul>
          <Link href="/estudar" className="btn btn-primary mt-4">
            Montar bloco focado nas lacunas
          </Link>
        </Card>
      )}
    </div>
  );
}
