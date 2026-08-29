"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { questionsForMinutes } from "@/lib/engines/daily-plan";

const PRESETS = [15, 30, 45, 60, 90, 120];

export function StudyLauncher({
  specialties,
  profiles,
  defaultProfileSlug,
}: {
  specialties: { slug: string; name: string; questionCount: number }[];
  profiles: { slug: string; name: string }[];
  defaultProfileSlug?: string;
}) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(45);
  const [specialty, setSpecialty] = useState("");
  const [profile, setProfile] = useState(defaultProfileSlug ?? "");
  const [loading, setLoading] = useState<"daily" | "adaptive" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(kind: "daily" | "adaptive") {
    setLoading(kind);
    setError(null);
    try {
      const body =
        kind === "daily"
          ? { minutes, specialty: specialty || undefined, examProfile: profile || undefined }
          : {
              count: questionsForMinutes(minutes),
              specialty: specialty || undefined,
              examProfile: profile || undefined,
            };

      const res = await fetch(`/api/study/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { studySessionId?: string; questionIds?: string[]; error?: string };

      if (!res.ok || !data.studySessionId) {
        setError(data.error ?? "Não foi possível montar o bloco.");
        return;
      }
      if (!data.questionIds?.length) {
        setError("Não há questões disponíveis com esses critérios. Tente ampliar os filtros.");
        return;
      }
      router.push(`/estudar/sessao/${data.studySessionId}`);
    } catch {
      setError("Falha de conexão ao montar o bloco.");
    } finally {
      setLoading(null);
    }
  }

  const estimated = questionsForMinutes(minutes);

  return (
    <section className="surface p-4 sm:p-5">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide">Tempo disponível</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              aria-pressed={minutes === m}
              className={`btn px-3 py-1.5 text-sm ${minutes === m ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              {m} min
            </button>
          ))}
        </div>
        <label className="mt-3 grid gap-1.5">
          <span className="muted text-xs">Ou defina exatamente</span>
          <input
            type="number"
            min={5}
            max={480}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(5, Math.min(480, Number(e.target.value) || 5)))}
            className="input max-w-32"
          />
        </label>
        <p className="muted mt-2 text-xs tabular-nums">≈ {estimated} questões neste bloco</p>
      </fieldset>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Especialidade</span>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input">
            <option value="">Todas</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.questionCount})
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Perfil de prova</span>
          <select value={profile} onChange={(e) => setProfile(e.target.value)} className="input">
            <option value="">Nenhum</option>
            {profiles.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
        <button
          type="button"
          onClick={() => start("daily")}
          disabled={loading !== null}
          className="btn btn-primary"
        >
          {loading === "daily" ? "Montando…" : "Montar estudo de hoje"}
        </button>
        <button type="button" onClick={() => start("adaptive")} disabled={loading !== null} className="btn">
          {loading === "adaptive" ? "Montando…" : "Só questões adaptativas"}
        </button>
      </div>
      <p className="muted mt-2 text-[11px] leading-relaxed">
        &ldquo;Estudo de hoje&rdquo; mistura questões novas, revisão de erros, revisão espaçada e
        tópicos fracos. &ldquo;Só questões adaptativas&rdquo; ignora as cotas e busca puramente o que
        o motor considera mais útil agora.
      </p>
    </section>
  );
}
