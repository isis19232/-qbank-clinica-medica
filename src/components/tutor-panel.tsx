"use client";

import { useState } from "react";

/** Tutor de IA acoplado à questão. Cada botão é uma ação pré-definida. */

const ACTIONS = [
  { key: "EXPLAIN_BETTER", label: "Explique melhor" },
  { key: "CLINICAL_PEARL", label: "Dê uma pérola clínica" },
  { key: "TEACH_TOPIC", label: "Ensine este tópico" },
  { key: "SIMILAR_QUESTIONS", label: "Crie 3 questões semelhantes" },
  { key: "QUIZ_ME", label: "Me teste neste tópico" },
] as const;

export function TutorPanel({ questionId, alternatives }: { questionId: string; alternatives: string[] }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(action: string, alternativeLabel?: string) {
    setLoading(alternativeLabel ? `WHY_WRONG-${alternativeLabel}` : action);
    setError(null);
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId, action, alternativeLabel }),
      });
      const data = (await res.json()) as { content?: string; degraded?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível consultar o tutor.");
        return;
      }
      setContent(data.content ?? "");
      setDegraded(Boolean(data.degraded));
    } catch {
      setError("Falha de conexão ao consultar o tutor.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="surface no-print p-4 sm:p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide">Tutor de IA</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => ask(a.key)}
            disabled={loading !== null}
            className="btn px-2.5 py-1 text-xs"
          >
            {loading === a.key ? "Pensando…" : a.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="muted text-xs">Por que está errada:</span>
        {alternatives.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => ask("WHY_WRONG", label)}
            disabled={loading !== null}
            className="btn px-2 py-1 text-xs"
          >
            {loading === `WHY_WRONG-${label}` ? "…" : label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
          {error}
        </p>
      )}

      {content && (
        <div className="fade-in mt-4 rounded-lg border bg-[var(--surface-2)] p-3">
          {degraded && (
            <p className="muted mb-2 text-[11px]">
              Resposta do modo offline — sem IA configurada. Conteúdo limitado ao que já está no banco.
            </p>
          )}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
          <p className="muted mt-3 border-t pt-2 text-[11px] leading-relaxed">
            Conteúdo gerado por IA para fins de estudo. Confirme condutas e limiares na diretriz
            vigente antes de qualquer aplicação clínica.
          </p>
        </div>
      )}
    </section>
  );
}
