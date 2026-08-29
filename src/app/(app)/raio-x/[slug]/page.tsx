import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { examXray } from "@/lib/services/xray";
import { MIN_SAMPLE } from "@/lib/engines/exam-xray";
import { Card, EmptyState, Stat } from "@/components/ui";
import { DIFFICULTY_LABEL, REASONING_LABEL, type Difficulty, type ReasoningType } from "@/lib/domain/enums";

export const metadata: Metadata = { title: "Raio-X" };
export const dynamic = "force-dynamic";

export default async function XrayPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;
  const data = await examXray(slug);
  if (!data) notFound();

  const { profile, measured } = data;
  const d = profile.declared;

  return (
    <div className="grid gap-5">
      <header>
        <Link href="/raio-x" className="muted text-sm hover:underline">
          ← Todos os perfis
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{profile.name}</h1>
        {profile.description && (
          <p className="muted mt-1 max-w-3xl text-sm leading-relaxed">{profile.description}</p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Formato" value={`${d.objectiveCount} + ${d.discursiveCount}`} hint="objetivas + discursivas" />
        <Stat label="Alternativas" value={d.alternativesCount} hint="por questão objetiva" />
        <Stat label="Duração" value={`${d.durationMinutes} min`} />
        <Stat
          label="Enunciado médio"
          value={`${d.avgStemWords}`}
          hint="palavras (perfil declarado)"
        />
      </div>

      <Card
        title="Perfil declarado"
        action={<span className="muted text-[11px]">amostra de calibração: {d.sampleSize || "—"}</span>}
      >
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <FrequencyRow label="Intensidade de raciocínio clínico" value={d.clinicalReasoningIntensity} />
          <FrequencyRow label="Perguntas de manejo/conduta" value={d.managementFrequency} />
          <FrequencyRow label="Tabela laboratorial" value={d.labDataFrequency} />
          <FrequencyRow label="Exame de imagem" value={d.imagingFrequency} />
          <FrequencyRow label="ECG" value={d.ecgFrequency} />
          <FrequencyRow label="Cálculo explícito" value={d.calculationFrequency} />
        </div>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide">Distribuição de dificuldade</h3>
        <div className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {(Object.keys(d.difficultyDistribution) as Difficulty[]).map((k) => (
            <FrequencyRow key={k} label={DIFFICULTY_LABEL[k]} value={d.difficultyDistribution[k]} />
          ))}
        </div>
      </Card>

      <Card
        title="Estatísticas medidas no banco"
        action={
          <span className="muted text-[11px] tabular-nums">
            {measured.sampleSize} {measured.sampleSize === 1 ? "questão associada" : "questões associadas"}
          </span>
        }
      >
        {measured.insufficient ? (
          <EmptyState
            title="Dados insuficientes para estatística confiável"
            hint={`São necessárias ao menos ${MIN_SAMPLE} questões associadas a este perfil. Atualmente há ${measured.sampleSize}. Números não são exibidos para não sugerir precisão que a amostra não sustenta.`}
            action={
              <Link href="/gerar" className="btn mt-2">
                Gerar questões para este perfil
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Enunciado médio" value={measured.avgStemWords} hint="palavras" />
              <Stat label="Proporção clínica" value={`${Math.round(measured.clinicalShare * 100)}%`} hint="vinheta vs. teórica" />
              <Stat label="Com laboratório" value={`${Math.round(measured.frequencies.labData * 100)}%`} />
              <Stat label="Perguntas de manejo" value={`${Math.round(measured.frequencies.management * 100)}%`} />
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-wide">Especialidades mais frequentes</h3>
                <ul className="mt-2 grid gap-1.5">
                  {measured.topSpecialties.map((s) => (
                    <li key={s.key} className="flex min-w-0 items-center gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">{s.label}</span>
                      <span className="muted shrink-0 tabular-nums text-xs">{s.count}</span>
                      <span className="w-12 shrink-0 text-right font-medium tabular-nums">
                        {Math.round(s.share * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-wide">Tipos de pergunta</h3>
                <ul className="mt-2 grid gap-1.5">
                  {measured.reasoningDistribution.map((r) => (
                    <li key={r.key} className="flex min-w-0 items-center gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">{REASONING_LABEL[r.key as ReasoningType] ?? r.key}</span>
                      <span className="muted shrink-0 tabular-nums text-xs">{r.count}</span>
                      <span className="w-12 shrink-0 text-right font-medium tabular-nums">
                        {Math.round(r.share * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {measured.topTopics.length > 0 && (
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide">Tópicos recorrentes</h3>
                  <ul className="mt-2 grid gap-1.5">
                    {measured.topTopics.map((t) => (
                      <li key={t.key} className="flex min-w-0 items-center gap-3 text-sm">
                        <span className="min-w-0 flex-1 truncate">{t.label}</span>
                        <span className="muted shrink-0 tabular-nums text-xs">{t.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {measured.topSocieties.length > 0 && (
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide">Diretrizes mais citadas</h3>
                  <ul className="mt-2 grid gap-1.5">
                    {measured.topSocieties.map((s) => (
                      <li key={s.name} className="flex min-w-0 items-center gap-3 text-sm">
                        <span className="min-w-0 flex-1 truncate">{s.name}</span>
                        <span className="muted shrink-0 tabular-nums text-xs">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {profile.distractorPatterns.length > 0 && (
          <Card title="Padrões de distrator">
            <ul className="grid gap-2 text-sm leading-relaxed">
              {profile.distractorPatterns.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="muted shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {profile.recurringThemes.length > 0 && (
          <Card title="Temas recorrentes">
            <ul className="grid gap-2 text-sm leading-relaxed">
              {profile.recurringThemes.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="muted shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/gerar?profile=${profile.slug}`} className="btn btn-primary">
          Gerar questões neste estilo
        </Link>
        <Link href="/simulados" className="btn">
          Simulado com este perfil
        </Link>
      </div>
    </div>
  );
}

function FrequencyRow({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3 py-1 text-sm">
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)] sm:block">
        <div className="h-full rounded-full bg-[var(--color-brand-500)]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-medium tabular-nums">{pct}%</span>
    </div>
  );
}
