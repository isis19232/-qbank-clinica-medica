"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CONFIDENCE_META, CONFIDENCE_LEVELS, type Confidence } from "@/lib/domain/enums";
import { DifficultyChip, ReasoningChip, formatDuration } from "./ui";
import { TutorPanel } from "./tutor-panel";

/**
 * Tela de resolução — o núcleo do produto.
 *
 * Fluxo: questão → alternativas → confirmar → resultado → explicação → próxima.
 * Sem distrações: a explicação só aparece depois da resposta, e nada na tela
 * antecipa o gabarito (nem a ordem, nem o comprimento das alternativas).
 */

export interface RunnerQuestion {
  id: string;
  code: string;
  type: string;
  stem: string;
  prompt: string;
  difficulty: string;
  clinicalReasoningType: string;
  specialty: { slug: string; name: string };
  topic: { slug: string; name: string } | null;
  labData: { exam: string; result: string; reference: string }[];
  media: { kind: string; caption: string; alt: string }[];
  guidelineReference: { society: string; title: string; year: number | null }[];
  alternatives: { id: string; label: string; text: string }[];
  isFavorite: boolean;
  globalStats: { timesAnswered: number; accuracy: number | null } | null;
}

interface RevealedData {
  isCorrect: boolean;
  correctLabel: string | null;
  nextReviewAt: string | null;
  errorType: string | null;
  explanation: {
    answerSummary: string;
    whyCorrect: string;
    keyClues: string[];
    clinicalPearl: string;
    commonTrap: string;
    managementSteps: string[];
  };
  alternativeRationales: Record<string, string>;
}

export function QuestionRunner({
  questions,
  mode = "PRACTICE",
  studySessionId = null,
  examAttemptId = null,
  onFinishHref,
}: {
  questions: RunnerQuestion[];
  mode?: string;
  studySessionId?: string | null;
  examAttemptId?: string | null;
  onFinishHref?: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence>("UNSURE");
  const [revealed, setRevealed] = useState<RevealedData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [score, setScore] = useState({ answered: 0, correct: 0 });

  const startedAt = useRef(Date.now());
  const question = questions[index];

  useEffect(() => {
    // Estado por questão é reinicializado a cada avanço.
    setSelected(null);
    setConfidence("UNSURE");
    setRevealed(null);
    setChanged(false);
    setError(null);
    setFavorite(question?.isFavorite ?? false);
    startedAt.current = Date.now();
  }, [index, question?.isFavorite]);

  const pick = useCallback(
    (label: string) => {
      if (revealed) return;
      setSelected((prev) => {
        if (prev !== null && prev !== label) setChanged(true);
        return label;
      });
    },
    [revealed],
  );

  const submit = useCallback(async () => {
    if (!question || revealed || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedLabel: selected,
          confidence,
          responseTimeMs: Date.now() - startedAt.current,
          changedAnswer: changed,
          mode,
          studySessionId,
          examAttemptId,
        }),
      });
      const data = (await res.json()) as { error?: string } & Record<string, unknown>;
      if (!res.ok) {
        setError(data.error ?? "Não foi possível registrar a resposta.");
        return;
      }

      // A explicação é buscada só agora — antes disso ela nem chega ao cliente.
      const detailRes = await fetch(`/api/questions/${question.id}`);
      const detail = (await detailRes.json()) as {
        explanation: RevealedData["explanation"];
        alternatives: { label: string; rationale: string }[];
      };

      setRevealed({
        isCorrect: Boolean(data.isCorrect),
        correctLabel: (data.correctLabel as string) ?? null,
        nextReviewAt: (data.nextReviewAt as string) ?? null,
        errorType: (data.errorType as string) ?? null,
        explanation: detail.explanation,
        alternativeRationales: Object.fromEntries(
          detail.alternatives.map((a) => [a.label, a.rationale]),
        ),
      });
      setScore((s) => ({ answered: s.answered + 1, correct: s.correct + (data.isCorrect ? 1 : 0) }));
    } catch {
      setError("Falha de conexão ao registrar a resposta.");
    } finally {
      setSubmitting(false);
    }
  }, [question, revealed, submitting, selected, confidence, changed, mode, studySessionId, examAttemptId]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, questions.length)), [questions.length]);

  // Atalhos de teclado: A–E escolhem, Enter confirma ou avança.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      const key = e.key.toUpperCase();
      if (!revealed && question?.alternatives.some((a) => a.label === key)) {
        e.preventDefault();
        pick(key);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (revealed) next();
        else if (selected) void submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, selected, question, pick, submit, next]);

  async function toggleFavorite() {
    if (!question) return;
    const nextState = !favorite;
    setFavorite(nextState);
    await fetch(`/api/favorites/${question.id}`, { method: nextState ? "PUT" : "DELETE" });
  }

  const progress = useMemo(
    () => (questions.length ? Math.round((index / questions.length) * 100) : 0),
    [index, questions.length],
  );

  if (questions.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <p className="text-sm font-medium">Nenhuma questão disponível com esses critérios.</p>
        <p className="muted mt-1 text-xs">Ajuste os filtros ou gere questões novas.</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="surface fade-in p-8 text-center">
        <h2 className="text-lg font-semibold">Bloco concluído</h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums">
          {score.correct}/{score.answered}
        </p>
        <p className="muted mt-1 text-sm">
          {score.answered ? `${Math.round((score.correct / score.answered) * 100)}% de acerto` : ""}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {onFinishHref && (
            <Link href={onFinishHref} className="btn btn-primary">
              Ver relatório
            </Link>
          )}
          <Link href="/dashboard" className="btn">
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Progresso */}
      <div className="no-print flex items-center gap-3 text-xs">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-brand-600)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="muted shrink-0 tabular-nums">
          {index + 1} / {questions.length}
        </span>
        {score.answered > 0 && (
          <span className="muted shrink-0 tabular-nums">
            · {score.correct}/{score.answered} certas
          </span>
        )}
      </div>

      <article className="surface fade-in p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center gap-2">
          <DifficultyChip difficulty={question.difficulty} />
          <ReasoningChip type={question.clinicalReasoningType} />
          <span className="chip">{question.specialty.name}</span>
          {question.topic && <span className="chip">{question.topic.name}</span>}
          <span className="muted ml-auto flex items-center gap-2 text-[11px]">
            <span>{question.code}</span>
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={favorite}
              aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="no-print rounded px-1 text-sm leading-none"
            >
              {favorite ? "★" : "☆"}
            </button>
          </span>
        </header>

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{question.stem}</div>

        {question.labData.length > 0 && (
          <div className="scroll-x mt-4">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="muted mb-2 text-left text-xs font-medium">
                Exames complementares
              </caption>
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide">
                  <th scope="col" className="py-1.5 pr-3 font-medium">Exame</th>
                  <th scope="col" className="py-1.5 pr-3 font-medium">Resultado</th>
                  <th scope="col" className="py-1.5 font-medium">Referência</th>
                </tr>
              </thead>
              <tbody>
                {question.labData.map((row, i) => (
                  <tr key={`${row.exam}-${i}`} className="border-b last:border-0">
                    <td className="py-1.5 pr-3">{row.exam}</td>
                    <td className="py-1.5 pr-3 font-medium tabular-nums">{row.result}</td>
                    <td className="muted py-1.5 tabular-nums">{row.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {question.media.length > 0 && (
          <div className="mt-4 grid gap-2">
            {question.media.map((m, i) => (
              <figure key={i} className="rounded-lg border bg-[var(--surface-2)] p-3">
                <figcaption className="text-xs font-medium">
                  <span className="chip mr-2">{m.kind}</span>
                  {m.caption}
                </figcaption>
                {/* Descrição textual do exame: a questão é respondível sem a imagem. */}
                <p className="mt-2 text-sm leading-relaxed">{m.alt}</p>
              </figure>
            ))}
          </div>
        )}

        <p className="mt-5 font-medium leading-relaxed">{question.prompt}</p>

        <div className="mt-4 grid gap-2">
          {question.alternatives.map((alt) => {
            const isSelected = selected === alt.label;
            const isCorrect = revealed?.correctLabel === alt.label;
            const isWrongPick = Boolean(revealed) && isSelected && !isCorrect;

            const style = isCorrect
              ? "border-[var(--color-ok-500)] bg-[var(--color-ok-100)]"
              : isWrongPick
                ? "border-[var(--color-bad-500)] bg-[var(--color-bad-100)]"
                : isSelected
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                  : "hover:bg-[var(--surface-2)]";

            return (
              <div key={alt.id}>
                <button
                  type="button"
                  onClick={() => pick(alt.label)}
                  disabled={Boolean(revealed)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm leading-relaxed transition-colors ${style} ${
                    revealed ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    aria-hidden
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-semibold"
                  >
                    {alt.label}
                  </span>
                  <span className="flex-1">{alt.text}</span>
                  {isCorrect && <span aria-label="correta" className="shrink-0 text-[var(--color-ok-500)]">✓</span>}
                  {isWrongPick && <span aria-label="sua resposta" className="shrink-0 text-[var(--color-bad-500)]">✕</span>}
                </button>

                {revealed && (
                  <p className="muted mt-1 pl-9 pr-2 text-xs leading-relaxed">
                    {revealed.alternativeRationales[alt.label]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!revealed && (
          <div className="no-print mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
            <fieldset className="flex items-center gap-1.5">
              <legend className="muted sr-only">Nível de confiança</legend>
              <span className="muted mr-1 text-xs">Confiança:</span>
              {CONFIDENCE_LEVELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfidence(c)}
                  aria-pressed={confidence === c}
                  title={CONFIDENCE_META[c].label}
                  className={`rounded-md border px-2 py-1 text-sm transition-colors ${
                    confidence === c ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]" : ""
                  }`}
                >
                  <span aria-hidden>{CONFIDENCE_META[c].emoji}</span>
                  <span className="sr-only">{CONFIDENCE_META[c].label}</span>
                </button>
              ))}
            </fieldset>

            <button
              type="button"
              onClick={submit}
              disabled={!selected || submitting}
              className="btn btn-primary ml-auto"
            >
              {submitting ? "Registrando…" : "Confirmar resposta"}
            </button>
            <button type="button" onClick={submit} disabled={submitting} className="btn">
              Deixar em branco
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
            {error}
          </p>
        )}
      </article>

      {revealed && (
        <Explanation
          data={revealed}
          question={question}
          onNext={next}
          isLast={index === questions.length - 1}
        />
      )}
    </div>
  );
}

function Explanation({
  data,
  question,
  onNext,
  isLast,
}: {
  data: RevealedData;
  question: RunnerQuestion;
  onNext: () => void;
  isLast: boolean;
}) {
  const [savingCard, setSavingCard] = useState<"idle" | "saving" | "saved">("idle");
  const e = data.explanation;

  async function makeFlashcards() {
    setSavingCard("saving");
    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromQuestionId: question.id }),
    });
    setSavingCard("saved");
  }

  return (
    <div className="fade-in grid gap-4">
      <div
        className={`surface p-4 sm:p-5 ${
          data.isCorrect ? "border-[var(--color-ok-500)]" : "border-[var(--color-bad-500)]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              data.isCorrect ? "text-[var(--color-ok-500)]" : "text-[var(--color-bad-500)]"
            }`}
          >
            {data.isCorrect ? "✓ Resposta correta" : "✕ Resposta incorreta"}
          </span>
          {data.correctLabel && (
            <span className="chip">Gabarito: {data.correctLabel}</span>
          )}
          {data.nextReviewAt && (
            <span className="muted ml-auto text-[11px]">
              Próxima revisão: {new Date(data.nextReviewAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium leading-relaxed">{e.answerSummary}</p>
      </div>

      <section className="surface p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide">Por que está correta</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{e.whyCorrect}</p>

        {e.keyClues.length > 0 && (
          <>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide">Pistas-chave</h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed">
              {e.keyClues.map((clue, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="muted shrink-0">→</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {e.managementSteps.length > 0 && (
          <>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide">Sequência de manejo</h3>
            <ol className="mt-2 grid gap-1.5 text-sm leading-relaxed">
              {e.managementSteps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="muted shrink-0 tabular-nums">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-700)]">
              💡 Pérola clínica
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-800)]">{e.clinicalPearl}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ background: "var(--color-warn-100)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-warn-500)]">
              ⚠ Armadilha comum
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-800)]">{e.commonTrap}</p>
          </div>
        </div>

        {question.guidelineReference.length > 0 && (
          <div className="mt-5 border-t pt-3">
            <h3 className="muted text-[11px] font-semibold uppercase tracking-wide">Referências</h3>
            <ul className="muted mt-1.5 grid gap-1 text-xs">
              {question.guidelineReference.map((g, i) => (
                <li key={i}>
                  {g.society} — {g.title}
                  {g.year ? ` (${g.year})` : ""}
                </li>
              ))}
            </ul>
            <p className="muted mt-2 text-[11px] leading-relaxed">
              Confirme sempre a versão vigente da diretriz antes de aplicar clinicamente.
            </p>
          </div>
        )}
      </section>

      <TutorPanel questionId={question.id} alternatives={question.alternatives.map((a) => a.label)} />

      <div className="no-print flex flex-wrap items-center gap-2">
        <button type="button" onClick={onNext} className="btn btn-primary">
          {isLast ? "Finalizar bloco" : "Próxima questão"} →
        </button>
        <button
          type="button"
          onClick={makeFlashcards}
          disabled={savingCard !== "idle"}
          className="btn"
        >
          {savingCard === "saved" ? "✓ Flashcards criados" : savingCard === "saving" ? "Criando…" : "Criar flashcards"}
        </button>
        {data.errorType && (
          <Link href="/erros" className="muted ml-auto text-xs underline">
            Ver no caderno de erros
          </Link>
        )}
      </div>
    </div>
  );
}
