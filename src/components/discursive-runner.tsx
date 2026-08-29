"use client";

import { useState } from "react";
import { DifficultyChip } from "./ui";

/** Resolução de questão discursiva, com correção assistida contra a rubrica. */

interface Rubric {
  maxScore: number;
  modelAnswer: string;
  subQuestions: {
    label: string;
    prompt: string;
    criteria: { keyPoint: string; points: number }[];
  }[];
}

interface Grade {
  score: number;
  maxScore: number;
  perCriterion: { keyPoint: string; awarded: number; possible: number; comment: string }[];
  overallFeedback: string;
  modelAnswer: string;
  degraded: boolean;
}

export function DiscursiveRunner({
  question,
}: {
  question: {
    id: string;
    code: string;
    stem: string;
    prompt: string;
    difficulty: string;
    specialty: { name: string };
    topic: { name: string } | null;
    labData: { exam: string; result: string; reference: string }[];
    media: { kind: string; caption: string; alt: string }[];
    guidelineReference: { society: string; title: string; year: number | null }[];
    rubric: Rubric;
  };
}) {
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      // Registra a tentativa (para estatísticas e SRS) e pede a correção.
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedLabel: null,
          discursiveText: answer,
          confidence: "UNSURE",
          responseTimeMs: Date.now() - startedAt,
          mode: "PRACTICE",
        }),
      });

      const res = await fetch("/api/ai/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer }),
      });
      const data = (await res.json()) as Grade & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível corrigir a resposta.");
        return;
      }
      setGrade(data);
    } catch {
      setError("Falha de conexão ao enviar a resposta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <article className="surface p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip">Discursiva</span>
          <DifficultyChip difficulty={question.difficulty} />
          <span className="chip">{question.specialty.name}</span>
          {question.topic && <span className="chip">{question.topic.name}</span>}
          <span className="muted ml-auto text-[11px]">{question.code}</span>
        </header>

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{question.stem}</div>

        {question.labData.length > 0 && (
          <div className="scroll-x mt-4">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="muted mb-2 text-left text-xs font-medium">Exames complementares</caption>
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide">
                  <th scope="col" className="py-1.5 pr-3 font-medium">Exame</th>
                  <th scope="col" className="py-1.5 pr-3 font-medium">Resultado</th>
                  <th scope="col" className="py-1.5 font-medium">Referência</th>
                </tr>
              </thead>
              <tbody>
                {question.labData.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-3">{row.exam}</td>
                    <td className="py-1.5 pr-3 font-medium tabular-nums">{row.result}</td>
                    <td className="muted py-1.5 tabular-nums">{row.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {question.media.map((m, i) => (
          <figure key={i} className="mt-4 rounded-lg border bg-[var(--surface-2)] p-3">
            <figcaption className="text-xs font-medium">
              <span className="chip mr-2">{m.kind}</span>
              {m.caption}
            </figcaption>
            <p className="mt-2 text-sm leading-relaxed">{m.alt}</p>
          </figure>
        ))}

        <p className="mt-5 font-medium">{question.prompt}</p>

        <ol className="mt-3 grid gap-2">
          {question.rubric.subQuestions.map((sq) => (
            <li key={sq.label} className="text-sm leading-relaxed">
              <strong>{sq.label})</strong> {sq.prompt}
            </li>
          ))}
        </ol>
      </article>

      <section className="surface p-4 sm:p-5">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide">Sua resposta</span>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={Boolean(grade)}
            rows={12}
            placeholder="Responda aos itens A e B. Identifique cada item na sua resposta."
            className="input resize-y font-normal leading-relaxed"
          />
        </label>
        <div className="muted mt-1 text-[11px] tabular-nums">{answer.trim().split(/\s+/).filter(Boolean).length} palavras</div>

        {!grade && (
          <button
            type="button"
            onClick={submit}
            disabled={loading || answer.trim().length < 20}
            className="btn btn-primary mt-3"
          >
            {loading ? "Corrigindo…" : "Enviar para correção"}
          </button>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
            {error}
          </p>
        )}
      </section>

      {grade && (
        <div className="fade-in grid gap-4">
          <section className="surface p-4 sm:p-5">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide">Nota</h2>
              <span className="text-2xl font-semibold tabular-nums">
                {grade.score.toFixed(1)}
                <span className="muted text-base"> / {grade.maxScore}</span>
              </span>
            </div>
            {grade.degraded && (
              <p className="muted mt-2 text-[11px] leading-relaxed">
                Correção por correspondência de termos (IA indisponível). Ela detecta palavras-chave,
                não raciocínio — compare com a resposta-modelo abaixo.
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{grade.overallFeedback}</p>
          </section>

          <section className="surface p-4 sm:p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Pontuação por critério</h2>
            <ul className="mt-3 divide-y">
              {grade.perCriterion.map((c, i) => (
                <li key={i} className="flex items-start gap-3 py-2 text-sm">
                  <span
                    aria-hidden
                    className="shrink-0"
                    style={{ color: c.awarded > 0 ? "var(--color-ok-500)" : "var(--color-bad-500)" }}
                  >
                    {c.awarded > 0 ? "✓" : "✕"}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium">{c.keyPoint}</span>
                    <span className="muted block text-xs leading-relaxed">{c.comment}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-xs">
                    {c.awarded}/{c.possible}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-4 sm:p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Resposta-modelo</h2>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{grade.modelAnswer}</div>
            {question.guidelineReference.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h3 className="muted text-[11px] font-semibold uppercase tracking-wide">Referências</h3>
                <ul className="muted mt-1.5 grid gap-1 text-xs">
                  {question.guidelineReference.map((g, i) => (
                    <li key={i}>
                      {g.society} — {g.title}
                      {g.year ? ` (${g.year})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
