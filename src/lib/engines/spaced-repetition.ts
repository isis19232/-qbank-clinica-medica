import type { Confidence } from "@/lib/domain/enums";

/**
 * Repetição espaçada — SM-2 modificado por confiança declarada.
 *
 * Diferença em relação ao SM-2 clássico: a nota de qualidade não vem de uma
 * autoavaliação livre de 0–5, e sim do cruzamento entre *acerto* e *confiança*.
 * Isso captura o caso que mais importa em prova: acertar chutando (não consolidado,
 * precisa voltar cedo) e errar com confiança (conceito errado gravado, precisa
 * voltar muito cedo).
 */

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date | null;
}

/** Mapeia (correto, confiança) → qualidade SM-2 de 0 a 5. */
export function qualityFrom(isCorrect: boolean, confidence: Confidence): number {
  if (isCorrect) {
    if (confidence === "CONFIDENT") return 5;
    if (confidence === "UNSURE") return 4;
    return 3; // acertou chutando — pouco crédito
  }
  if (confidence === "CONFIDENT") return 0; // erro confiante: conceito equivocado
  if (confidence === "UNSURE") return 1;
  return 2; // errou sabendo que não sabia — menos grave
}

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
/** Teto de 180 dias: além disso o intervalo perde utilidade num ciclo de prova. */
const MAX_INTERVAL_DAYS = 180;

export function scheduleNext(
  prev: SrsState,
  isCorrect: boolean,
  confidence: Confidence,
  now: Date = new Date(),
): SrsState {
  const q = qualityFrom(isCorrect, confidence);
  const passed = q >= 3;

  let { easeFactor, repetitions } = prev;
  let intervalDays: number;

  easeFactor = clamp(easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), MIN_EASE, MAX_EASE);

  if (!passed) {
    repetitions = 0;
    // Erro confiante volta ainda mais rápido que erro assumido.
    intervalDays = q === 0 ? 0.25 : 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = q === 5 ? 2 : 1;
    else if (repetitions === 2) intervalDays = q === 5 ? 6 : 3;
    else intervalDays = Math.min(prev.intervalDays * easeFactor, MAX_INTERVAL_DAYS);
    // Acertar chutando não deve empurrar a questão para longe.
    if (q === 3) intervalDays = Math.min(intervalDays, 3);
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt: new Date(now.getTime() + intervalDays * 86_400_000),
  };
}

/** Grades manuais de flashcard (Anki-like) reaproveitando o mesmo motor. */
export function scheduleFlashcard(
  prev: SrsState,
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY",
  now: Date = new Date(),
): SrsState {
  const map = { AGAIN: 0, HARD: 3, GOOD: 4, EASY: 5 } as const;
  const q = map[grade];
  return scheduleNext(prev, q >= 3, q === 5 ? "CONFIDENT" : q === 4 ? "UNSURE" : "GUESS", now);
}

export function isDue(state: { nextReviewAt: Date | null }, now: Date = new Date()): boolean {
  return state.nextReviewAt !== null && state.nextReviewAt <= now;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
