"use client";

import { useState } from "react";
import { DIFFICULTIES, DIFFICULTY_LABEL, REASONING_LABEL, REASONING_TYPES } from "@/lib/domain/enums";
import { DifficultyChip } from "./ui";

interface GeneratedQuestion {
  id: string;
  code: string;
  prompt: string;
  difficulty: string;
}

export function GeneratorForm({
  specialties,
  profiles,
  defaultProfile,
  disabled,
}: {
  specialties: { slug: string; name: string; topics: { slug: string; name: string }[] }[];
  profiles: { slug: string; name: string }[];
  defaultProfile: string;
  disabled: boolean;
}) {
  const [count, setCount] = useState(5);
  const [specialty, setSpecialty] = useState("");
  const [topic, setTopic] = useState("");
  const [profile, setProfile] = useState(defaultProfile);
  const [difficulty, setDifficulty] = useState<string[]>(["MEDIUM"]);
  const [reasoning, setReasoning] = useState<string[]>([]);
  const [type, setType] = useState<"OBJECTIVE" | "DISCURSIVE">("OBJECTIVE");
  const [weakTopics, setWeakTopics] = useState(false);
  const [extra, setExtra] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    generated: number;
    rejected: number;
    questions: GeneratedQuestion[];
  } | null>(null);

  const topics = specialties.find((s) => s.slug === specialty)?.topics ?? [];

  function toggle(list: string[], setter: (v: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          count,
          specialtySlug: specialty || undefined,
          topicSlug: topic || undefined,
          examProfileSlug: profile || undefined,
          difficulty: difficulty.length ? difficulty : ["MEDIUM"],
          reasoningTypes: reasoning,
          type,
          targetWeakTopics: weakTopics,
          extraInstructions: extra || undefined,
        }),
      });
      const data = (await res.json()) as {
        generated?: number;
        rejected?: number;
        questions?: GeneratedQuestion[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível gerar as questões.");
        return;
      }
      setResult({
        generated: data.generated ?? 0,
        rejected: data.rejected ?? 0,
        questions: data.questions ?? [],
      });
    } catch {
      setError("Falha de conexão. A geração pode levar alguns minutos — verifique sua rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Quantidade</span>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="input"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Tipo</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "OBJECTIVE" | "DISCURSIVE")}
            className="input"
          >
            <option value="OBJECTIVE">Objetiva (A–D)</option>
            <option value="DISCURSIVE">Discursiva com rubrica</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Especialidade</span>
          <select
            value={specialty}
            onChange={(e) => {
              setSpecialty(e.target.value);
              setTopic("");
            }}
            className="input"
          >
            <option value="">Qualquer</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Tópico</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!specialty}
            className="input"
          >
            <option value="">Qualquer</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-xs font-medium">Perfil de prova (estilo-alvo)</span>
        <select value={profile} onChange={(e) => setProfile(e.target.value)} className="input">
          <option value="">Nenhum</option>
          {profiles.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

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
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium">Tipo de raciocínio clínico</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REASONING_TYPES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggle(reasoning, setReasoning, r)}
              aria-pressed={reasoning.includes(r)}
              className={`chip ${reasoning.includes(r) ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""}`}
            >
              {REASONING_LABEL[r]}
            </button>
          ))}
        </div>
        <p className="muted mt-1.5 text-[11px]">Nenhum selecionado = o gerador decide pelo perfil.</p>
      </fieldset>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={weakTopics}
          onChange={(e) => setWeakTopics(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Focar nos meus pontos fracos
          <span className="muted block text-[11px]">
            Envia ao gerador seus tópicos com pior desempenho (mínimo de 3 questões respondidas).
          </span>
        </span>
      </label>

      <label className="mt-4 grid gap-1.5">
        <span className="text-xs font-medium">Instruções adicionais (opcional)</span>
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Ex.: priorizar cenários de pronto-socorro; incluir interpretação de gasometria."
          className="input resize-y"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading || disabled}
        className="btn btn-primary mt-5"
      >
        {loading
          ? "Gerando… isto pode levar alguns minutos"
          : `Gerar ${count} ${count === 1 ? "questão" : "questões"}`}
      </button>

      {result && (
        <div className="fade-in mt-5 border-t pt-4">
          <p className="text-sm font-medium">
            {result.generated} {result.generated === 1 ? "questão gerada" : "questões geradas"}
            {result.rejected > 0 && (
              <span className="muted font-normal">
                {" "}
                · {result.rejected} descartada{result.rejected === 1 ? "" : "s"} por falha de validação
              </span>
            )}
          </p>
          <ul className="mt-3 grid gap-2">
            {result.questions.map((q) => (
              <li key={q.id} className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <DifficultyChip difficulty={q.difficulty} />
                  <span className="chip">Em revisão</span>
                  <span className="muted ml-auto text-[11px]">{q.code}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{q.prompt}</p>
              </li>
            ))}
          </ul>
          <p className="muted mt-3 text-[11px] leading-relaxed">
            As questões ficam com status <strong>em revisão</strong>. Revise conteúdo, gabarito e
            diretrizes citadas antes de publicá-las no banco.
          </p>
        </div>
      )}
    </section>
  );
}
