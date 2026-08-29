"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DifficultyChip } from "./ui";
import type { RunnerQuestion } from "./question-runner";

/**
 * Modo simulado. Diferente do modo prática em três pontos deliberados:
 * não revela gabarito durante a prova, permite navegar livremente entre
 * questões e cronometra o tempo total.
 */
export function ExamRunner({
  questions,
  examAttemptId,
  timeLimitMin,
  title,
}: {
  questions: RunnerQuestion[];
  examAttemptId: string;
  timeLimitMin: number;
  title: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [changedSet, setChangedSet] = useState<Set<string>>(new Set());
  const [remaining, setRemaining] = useState(timeLimitMin * 60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionStart = useRef(Date.now());
  const timeSpent = useRef<Record<string, number>>({});
  const finishing = useRef(false);

  const question = questions[index]!;

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    setSubmitting(true);
    setError(null);

    // Acumula o tempo da questão em tela antes de enviar.
    timeSpent.current[question.id] =
      (timeSpent.current[question.id] ?? 0) + (Date.now() - questionStart.current);

    try {
      // Envia todas as respostas — inclusive as em branco, que contam no relatório.
      for (const q of questions) {
        await fetch("/api/attempts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            questionId: q.id,
            selectedLabel: answers[q.id] ?? null,
            confidence: "UNSURE",
            responseTimeMs: Math.round(timeSpent.current[q.id] ?? 0),
            changedAnswer: changedSet.has(q.id),
            mode: "SIMULATION",
            examAttemptId,
          }),
        });
      }

      const res = await fetch("/api/exams/finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ examAttemptId }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Não foi possível finalizar o simulado.");
        finishing.current = false;
        setSubmitting(false);
        return;
      }
      router.push(`/simulados/${examAttemptId}`);
    } catch {
      setError("Falha de conexão ao finalizar. Suas respostas locais foram preservadas — tente novamente.");
      finishing.current = false;
      setSubmitting(false);
    }
  }, [answers, changedSet, examAttemptId, question.id, questions, router]);

  // Cronômetro. Ao zerar, entrega automaticamente.
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          void finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finish]);

  function goTo(nextIndex: number) {
    timeSpent.current[question.id] =
      (timeSpent.current[question.id] ?? 0) + (Date.now() - questionStart.current);
    questionStart.current = Date.now();
    setIndex(nextIndex);
  }

  function pick(label: string) {
    setAnswers((prev) => {
      if (prev[question.id] != null && prev[question.id] !== label) {
        setChangedSet((s) => new Set(s).add(question.id));
      }
      return { ...prev, [question.id]: label };
    });
  }

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] != null).length,
    [answers, questions],
  );

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const urgent = remaining <= 300;

  return (
    <div className="grid gap-4">
      <header className="surface sticky top-16 z-20 flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          <p className="muted text-xs tabular-nums">
            {answeredCount}/{questions.length} respondidas
          </p>
        </div>
        <div
          className="shrink-0 text-lg font-semibold tabular-nums"
          style={{ color: urgent ? "var(--color-bad-500)" : undefined }}
          role="timer"
          aria-live={urgent ? "polite" : "off"}
        >
          {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        </div>
        <button type="button" onClick={finish} disabled={submitting} className="btn shrink-0">
          {submitting ? "Entregando…" : "Entregar prova"}
        </button>
      </header>

      {/* Navegador de questões — sempre visível, como uma folha de respostas. */}
      <nav aria-label="Navegar entre questões" className="surface flex flex-wrap gap-1 p-3">
        {questions.map((q, i) => {
          const answered = answers[q.id] != null;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === index ? "true" : undefined}
              className={`h-7 w-7 rounded border text-xs font-medium tabular-nums transition-colors ${
                i === index
                  ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)] text-white"
                  : answered
                    ? "border-[var(--color-brand-300)] bg-[var(--color-brand-50)]"
                    : "hover:bg-[var(--surface-2)]"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      <article className="surface fade-in p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip">Questão {index + 1}</span>
          <DifficultyChip difficulty={question.difficulty} />
          <span className="chip">{question.specialty.name}</span>
        </header>

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{question.stem}</div>

        {question.labData.length > 0 && (
          <div className="scroll-x mt-4">
            <table className="w-full min-w-[420px] border-collapse text-sm">
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

        <p className="mt-5 font-medium leading-relaxed">{question.prompt}</p>

        <div className="mt-4 grid gap-2">
          {question.alternatives.map((alt) => {
            const isSelected = answers[question.id] === alt.label;
            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => pick(alt.label)}
                aria-pressed={isSelected}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm leading-relaxed transition-colors ${
                  isSelected
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                    : "hover:bg-[var(--surface-2)]"
                }`}
              >
                <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-semibold">
                  {alt.label}
                </span>
                <span className="flex-1">{alt.text}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2 border-t pt-4">
          <button type="button" onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0} className="btn">
            ← Anterior
          </button>
          <button
            type="button"
            onClick={() => setAnswers((p) => ({ ...p, [question.id]: null }))}
            className="btn"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(questions.length - 1, index + 1))}
            disabled={index === questions.length - 1}
            className="btn btn-primary ml-auto"
          >
            Próxima →
          </button>
        </div>
      </article>
    </div>
  );
}
