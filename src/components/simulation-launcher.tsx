"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/domain/enums";

export function SimulationLauncher({
  specialties,
  profiles,
}: {
  specialties: { slug: string; name: string; questionCount: number }[];
  profiles: { slug: string; name: string; objectiveCount: number; durationMinutes: number }[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState("");
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(120);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [includeDiscursive, setIncludeDiscursive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyProfile(slug: string) {
    setProfile(slug);
    const p = profiles.find((x) => x.slug === slug);
    if (p) {
      setCount(p.objectiveCount);
      setMinutes(p.durationMinutes);
    }
  }

  function toggle(list: string[], setter: (v: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/exams/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionCount: count,
          timeLimitMin: minutes,
          examProfile: profile || undefined,
          specialties: selectedSpecialties,
          difficulty,
          includeDiscursive,
        }),
      });
      const data = (await res.json()) as { examAttemptId?: string; questionIds?: string[]; error?: string };
      if (!res.ok || !data.examAttemptId) {
        setError(data.error ?? "Não foi possível montar o simulado.");
        return;
      }
      if (!data.questionIds?.length) {
        setError("Não há questões suficientes com esses critérios.");
        return;
      }
      router.push(`/simulados/${data.examAttemptId}/prova`);
    } catch {
      setError("Falha de conexão ao montar o simulado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface p-4 sm:p-5">
      <label className="grid gap-1.5">
        <span className="text-xs font-medium">Perfil de prova</span>
        <select value={profile} onChange={(e) => applyProfile(e.target.value)} className="input">
          <option value="">Personalizado (sem perfil)</option>
          {profiles.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="muted text-[11px]">
          Ao escolher um perfil, o simulado reproduz sua distribuição de dificuldade e mix de
          especialidades.
        </span>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Número de questões</span>
          <input
            type="number"
            min={5}
            max={120}
            value={count}
            onChange={(e) => setCount(Math.max(5, Math.min(120, Number(e.target.value) || 5)))}
            className="input"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Tempo limite (min)</span>
          <input
            type="number"
            min={5}
            max={360}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(5, Math.min(360, Number(e.target.value) || 5)))}
            className="input"
          />
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium">Dificuldade</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggle(difficulty, setDifficulty, d)}
              aria-pressed={difficulty.includes(d)}
              className={`chip ${difficulty.includes(d) ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
        <p className="muted mt-1.5 text-[11px]">Nenhuma selecionada = todas.</p>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium">Especialidades</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {specialties.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => toggle(selectedSpecialties, setSelectedSpecialties, s.slug)}
              aria-pressed={selectedSpecialties.includes(s.slug)}
              className={`chip ${selectedSpecialties.includes(s.slug) ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className="muted mt-1.5 text-[11px]">Nenhuma selecionada = todas.</p>
      </fieldset>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeDiscursive}
          onChange={(e) => setIncludeDiscursive(e.target.checked)}
        />
        Incluir questões discursivas
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
          {error}
        </p>
      )}

      <button type="button" onClick={start} disabled={loading} className="btn btn-primary mt-5">
        {loading ? "Montando…" : "Iniciar simulado"}
      </button>
    </section>
  );
}
