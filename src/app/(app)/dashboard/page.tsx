import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { dashboardData } from "@/lib/services/analytics";
import { AccuracyBar, Card, EmptyState, Stat, formatDuration } from "@/components/ui";
import { DIFFICULTY_LABEL, type Difficulty } from "@/lib/domain/enums";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await dashboardData(user.id);
  const { overall, goal } = data;
  const goalPct = goal.daily ? Math.min(100, Math.round((goal.answeredToday / goal.daily) * 100)) : 0;

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Olá, {user.name.split(" ")[0]}</h1>
          <p className="muted mt-0.5 text-sm">
            {data.targetExam ? `Prova-alvo: ${data.targetExam.name}` : "Nenhuma prova-alvo definida"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/estudar" className="btn btn-primary">
            Estudar agora
          </Link>
          <Link href="/simulados" className="btn">
            Novo simulado
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Acurácia geral"
          value={overall.answered ? `${Math.round(overall.accuracy * 100)}%` : "—"}
          hint={`${overall.correct} de ${overall.answered} questões`}
          tone={overall.accuracy >= 0.8 ? "good" : overall.accuracy >= 0.6 ? "warn" : overall.answered ? "bad" : "default"}
        />
        <Stat
          label="Meta de hoje"
          value={`${goal.answeredToday}/${goal.daily}`}
          hint={`${goalPct}% concluída`}
          tone={goalPct >= 100 ? "good" : "default"}
        />
        <Stat label="Sequência" value={`${overall.streakDays} d`} hint="dias consecutivos de estudo" />
        <Stat
          label="Tempo médio"
          value={formatDuration(overall.avgTimeMs)}
          hint="por questão"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/erros" className="surface p-4 transition-colors hover:bg-[var(--surface-2)]">
          <div className="muted text-xs font-medium uppercase tracking-wide">Erros em aberto</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{data.queues.openErrors}</div>
          <div className="muted mt-1 text-xs">Revisar caderno de erros →</div>
        </Link>
        <Link href="/estudar" className="surface p-4 transition-colors hover:bg-[var(--surface-2)]">
          <div className="muted text-xs font-medium uppercase tracking-wide">Revisões devidas</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{data.queues.dueForReview}</div>
          <div className="muted mt-1 text-xs">Repetição espaçada →</div>
        </Link>
        <Link href="/questoes?scope=UNSEEN" className="surface p-4 transition-colors hover:bg-[var(--surface-2)]">
          <div className="muted text-xs font-medium uppercase tracking-wide">Cobertura do banco</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {Math.round(data.coverage.pct * 100)}%
          </div>
          <div className="muted mt-1 text-xs">
            {data.coverage.remaining} questões restantes →
          </div>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Mapa de fraquezas — por especialidade">
          {data.bySpecialty.length === 0 ? (
            <EmptyState
              title="Ainda sem dados"
              hint="Responda algumas questões para que o mapa comece a se formar."
            />
          ) : (
            <div className="divide-y">
              {data.bySpecialty.map((s) => (
                <AccuracyBar key={s.key} label={s.label} accuracy={s.accuracy} answered={s.answered} />
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Tópicos prioritários"
          action={<span className="muted text-[11px]">alta importância × baixo desempenho</span>}
        >
          {data.priorityTopics.length === 0 ? (
            <EmptyState
              title="Nada priorizado ainda"
              hint="São necessárias ao menos 4 questões respondidas por tópico para calcular prioridade sem ruído."
            />
          ) : (
            <ol className="grid gap-2">
              {data.priorityTopics.map((t, i) => (
                <li key={t.key} className="flex min-w-0 items-center gap-3 text-sm">
                  <span className="muted w-4 shrink-0 tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{t.label}</span>
                  <span className="chip shrink-0">peso {t.yieldWeight}/5</span>
                  <span
                    className="w-12 shrink-0 text-right font-medium tabular-nums"
                    style={{
                      color: t.accuracy < 0.6 ? "var(--color-bad-500)" : "var(--color-warn-500)",
                    }}
                  >
                    {Math.round(t.accuracy * 100)}%
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Desempenho por dificuldade">
          {data.byDifficulty.length === 0 ? (
            <EmptyState title="Sem dados suficientes" />
          ) : (
            <div className="divide-y">
              {data.byDifficulty.map((d) => (
                <AccuracyBar
                  key={d.key}
                  label={DIFFICULTY_LABEL[d.key as Difficulty] ?? d.key}
                  accuracy={d.accuracy}
                  answered={d.answered}
                />
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Confiança × acerto"
          action={<span className="muted text-[11px]">calibração</span>}
        >
          {data.confidenceCalibration.length === 0 ? (
            <EmptyState
              title="Sem dados de calibração"
              hint="Marque seu nível de confiança ao responder para que este gráfico se forme."
            />
          ) : (
            <>
              <div className="divide-y">
                {data.confidenceCalibration.map((c) => (
                  <AccuracyBar
                    key={c.confidence}
                    label={
                      c.confidence === "GUESS"
                        ? "😕 Chutei"
                        : c.confidence === "UNSURE"
                          ? "😐 Em dúvida"
                          : "🙂 Confiante"
                    }
                    accuracy={c.accuracy}
                    answered={c.answered}
                  />
                ))}
              </div>
              <p className="muted mt-3 text-[11px] leading-relaxed">
                Bem calibrado significa acertar quase tudo que você marca como &ldquo;confiante&rdquo;.
                Muito erro nessa faixa aponta conceito consolidado de forma equivocada — o tipo de
                erro mais caro em prova.
              </p>
            </>
          )}
        </Card>
      </div>

      {data.accuracyOverTime.length > 1 && (
        <Card title="Evolução da acurácia" action={<span className="muted text-[11px]">últimos 30 dias com estudo</span>}>
          <Sparkline points={data.accuracyOverTime} />
        </Card>
      )}
    </div>
  );
}

/** Gráfico de linha inline. SVG puro — sem dependência de biblioteca de charts. */
function Sparkline({ points }: { points: { date: string; accuracy: number; answered: number }[] }) {
  const width = 720;
  const height = 120;
  const pad = 8;
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;

  const path = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (1 - p.accuracy) * (height - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="scroll-x">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full min-w-[420px]"
        role="img"
        aria-label={`Acurácia diária ao longo de ${points.length} dias de estudo`}
      >
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={width - pad}
            y1={pad + (1 - g) * (height - pad * 2)}
            y2={pad + (1 - g) * (height - pad * 2)}
            stroke="var(--border)"
            strokeDasharray="3 4"
          />
        ))}
        <path d={path} fill="none" stroke="var(--color-brand-600)" strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={pad + i * step}
            cy={pad + (1 - p.accuracy) * (height - pad * 2)}
            r={2.5}
            fill="var(--color-brand-600)"
          >
            <title>{`${new Date(p.date).toLocaleDateString("pt-BR")}: ${Math.round(p.accuracy * 100)}% (${p.answered} questões)`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
