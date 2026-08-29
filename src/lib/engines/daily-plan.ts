/**
 * Montagem do bloco "Estudo de Hoje".
 *
 * Traduz minutos disponíveis em número de questões e reparte esse total entre
 * quatro fontes. As proporções são fixas por desenho — a variação vem de quanto
 * material existe em cada fonte (ver `resolveComposition`).
 */

/** Ritmo-alvo derivado da prova de referência: ~2h para 20 objetivas + 2 discursivas. */
export const MINUTES_PER_QUESTION = 2.6;

export const DEFAULT_MIX = {
  fresh: 0.4,      // questões novas
  errorReview: 0.2, // caderno de erros
  spaced: 0.2,      // revisão espaçada devida
  weakTopics: 0.2,  // tópicos fracos
} as const;

export type PlanSlot = keyof typeof DEFAULT_MIX;

export interface Composition {
  fresh: number;
  errorReview: number;
  spaced: number;
  weakTopics: number;
  total: number;
}

export function questionsForMinutes(minutes: number): number {
  return Math.max(1, Math.round(minutes / MINUTES_PER_QUESTION));
}

/**
 * Reparte `total` entre os quatro slots, limitado pela disponibilidade real de
 * cada fonte. O que faltar é realocado para questões novas — a fonte que nunca
 * se esgota enquanto houver banco.
 */
export function resolveComposition(
  total: number,
  available: Record<PlanSlot, number>,
): Composition {
  const desired: Record<PlanSlot, number> = {
    fresh: Math.round(total * DEFAULT_MIX.fresh),
    errorReview: Math.round(total * DEFAULT_MIX.errorReview),
    spaced: Math.round(total * DEFAULT_MIX.spaced),
    weakTopics: Math.round(total * DEFAULT_MIX.weakTopics),
  };

  const granted: Record<PlanSlot, number> = { fresh: 0, errorReview: 0, spaced: 0, weakTopics: 0 };
  let deficit = 0;

  for (const slot of ["errorReview", "spaced", "weakTopics"] as const) {
    granted[slot] = Math.min(desired[slot], available[slot]);
    deficit += desired[slot] - granted[slot];
  }

  granted.fresh = Math.min(desired.fresh + deficit, available.fresh);

  const sum = granted.fresh + granted.errorReview + granted.spaced + granted.weakTopics;
  return { ...granted, total: sum };
}

export const SLOT_LABEL: Record<PlanSlot, string> = {
  fresh: "Questões novas",
  errorReview: "Revisão de erros",
  spaced: "Revisão espaçada",
  weakTopics: "Tópicos fracos",
};
