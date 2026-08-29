import { DIFFICULTY_WEIGHT, type Difficulty } from "@/lib/domain/enums";

/**
 * Motor adaptativo de seleção de questões.
 *
 * Cada questão candidata recebe um score somando sinais ponderados. O objetivo
 * NÃO é maximizar a pontuação de curto prazo, e sim maximizar aprendizado: por
 * isso há tanto pressão para tópicos fracos quanto um mecanismo anti-overfitting
 * que garante mistura (ver `applyMixQuota`).
 */

export interface CandidateSignals {
  questionId: string;
  specialtySlug: string;
  topicSlug: string | null;
  difficulty: Difficulty;
  /** Peso 1–5 de relevância do tópico para prova. */
  topicYieldWeight: number;
  /** Acurácia do usuário no tópico (0–1); null se nunca respondeu o tópico. */
  topicAccuracy: number | null;
  /** Quantas questões o usuário já respondeu nesse tópico. */
  topicVolume: number;
  /** Nunca respondida por este usuário. */
  unseen: boolean;
  /** Última resposta foi errada. */
  lastWrong: boolean;
  lastConfidence: "GUESS" | "UNSURE" | "CONFIDENT" | null;
  /** Dias desde a última resposta; null se nunca respondida. */
  daysSinceAnswered: number | null;
  /** Dias até a revisão agendada (negativo = atrasada); null se sem agendamento. */
  daysUntilDue: number | null;
  /** Peso do tópico no perfil da prova-alvo (0–1). */
  examProfileWeight: number;
  /** Acurácia média global na questão (0–1); null se sem dados. */
  globalAccuracy: number | null;
}

export interface AdaptiveOptions {
  /** Habilidade estimada do usuário, 0–1. Usada para casar dificuldade. */
  ability: number;
  /** Semente determinística — torna a seleção reproduzível em testes. */
  seed?: number;
}

/** Pesos dos dez sinais. Somam 1.0 para manter o score em escala interpretável. */
export const SIGNAL_WEIGHTS = {
  topicWeakness: 0.2,
  recentError: 0.16,
  topicYield: 0.12,
  difficultyMatch: 0.12,
  reviewDue: 0.12,
  lowConfidence: 0.08,
  examProfileFit: 0.08,
  novelty: 0.06,
  recency: 0.04,
  discrimination: 0.02,
} as const;

export function scoreCandidate(c: CandidateSignals, opts: AdaptiveOptions): number {
  const w = SIGNAL_WEIGHTS;

  // 1. Fraqueza no tópico. Sem histórico → neutro (0.5), para não penalizar o novo.
  const topicWeakness = c.topicAccuracy === null ? 0.5 : 1 - c.topicAccuracy;
  // Confiança na estimativa cresce com o volume; satura em ~15 questões.
  const weaknessConfidence = Math.min(1, c.topicVolume / 15);
  const weaknessSignal = 0.5 + (topicWeakness - 0.5) * weaknessConfidence;

  // 2. Erro recente — decai ao longo de ~21 dias.
  const recentError = c.lastWrong
    ? Math.exp(-(c.daysSinceAnswered ?? 0) / 21)
    : 0;

  // 3. Importância do tópico para a prova.
  const topicYield = (c.topicYieldWeight - 1) / 4;

  // 4. Casamento de dificuldade: pico quando a dificuldade fica um pouco acima
  //    da habilidade (zona de desenvolvimento proximal).
  const target = Math.min(0.95, opts.ability + 0.12);
  const difficultyMatch = 1 - Math.min(1, Math.abs(DIFFICULTY_WEIGHT[c.difficulty] - target) / 0.5);

  // 5. Revisão devida. Atrasada vale mais; futura distante vale ~0.
  const reviewDue =
    c.daysUntilDue === null ? 0 : c.daysUntilDue <= 0 ? 1 : Math.max(0, 1 - c.daysUntilDue / 7);

  // 6. Baixa confiança na última resposta (mesmo tendo acertado).
  const lowConfidence =
    c.lastConfidence === "GUESS" ? 1 : c.lastConfidence === "UNSURE" ? 0.55 : 0;

  // 7. Aderência ao perfil da prova-alvo.
  const examProfileFit = c.examProfileWeight;

  // 8. Novidade.
  const novelty = c.unseen ? 1 : 0;

  // 9. Recência invertida: questão vista ontem desce; vista há muito tempo sobe.
  const recency =
    c.daysSinceAnswered === null ? 0.5 : Math.min(1, c.daysSinceAnswered / 30);

  // 10. Discriminação: questões que a maioria erra ensinam mais.
  const discrimination = c.globalAccuracy === null ? 0.5 : 1 - c.globalAccuracy;

  return (
    w.topicWeakness * weaknessSignal +
    w.recentError * recentError +
    w.topicYield * topicYield +
    w.difficultyMatch * difficultyMatch +
    w.reviewDue * reviewDue +
    w.lowConfidence * lowConfidence +
    w.examProfileFit * examProfileFit +
    w.novelty * novelty +
    w.recency * recency +
    w.discrimination * discrimination
  );
}

/** Cotas de mistura — impedem que o plano vire monocultura do tópico mais fraco. */
export const MIX_QUOTA = { weak: 0.45, medium: 0.25, strong: 0.15, highYield: 0.15 } as const;

type Bucket = "weak" | "medium" | "strong" | "highYield";

function bucketOf(c: CandidateSignals): Bucket {
  if (c.topicYieldWeight >= 5 && (c.topicAccuracy ?? 0.5) >= 0.7) return "highYield";
  const acc = c.topicAccuracy;
  if (acc === null) return "medium";
  if (acc < 0.6) return "weak";
  if (acc < 0.8) return "medium";
  return "strong";
}

/**
 * Seleciona `count` questões respeitando as cotas de mistura.
 * Dentro de cada balde ordena por score; entre baldes respeita a proporção.
 * Sobras são preenchidas pelo score global — nunca devolve menos do que existe.
 */
export function selectAdaptive(
  candidates: CandidateSignals[],
  count: number,
  opts: AdaptiveOptions,
): string[] {
  if (candidates.length === 0) return [];

  const scored = candidates
    .map((c) => ({ c, score: scoreCandidate(c, opts), bucket: bucketOf(c) }))
    .sort((a, b) => b.score - a.score);

  const byBucket = new Map<Bucket, typeof scored>();
  for (const item of scored) {
    const list = byBucket.get(item.bucket) ?? [];
    list.push(item);
    byBucket.set(item.bucket, list);
  }

  const picked: string[] = [];
  const used = new Set<string>();

  for (const [bucket, quota] of Object.entries(MIX_QUOTA) as [Bucket, number][]) {
    const target = Math.round(count * quota);
    const pool = byBucket.get(bucket) ?? [];
    for (const item of pool.slice(0, target)) {
      if (!used.has(item.c.questionId)) {
        used.add(item.c.questionId);
        picked.push(item.c.questionId);
      }
    }
  }

  for (const item of scored) {
    if (picked.length >= count) break;
    if (!used.has(item.c.questionId)) {
      used.add(item.c.questionId);
      picked.push(item.c.questionId);
    }
  }

  return picked.slice(0, count);
}

/**
 * Estima a habilidade do usuário (0–1) a partir de tentativas recentes,
 * ponderando cada acerto pela dificuldade da questão.
 */
export function estimateAbility(
  attempts: { isCorrect: boolean | null; difficulty: Difficulty }[],
): number {
  if (attempts.length === 0) return 0.5;
  let num = 0;
  let den = 0;
  for (const a of attempts) {
    const w = DIFFICULTY_WEIGHT[a.difficulty];
    den += w;
    if (a.isCorrect) num += w;
  }
  if (den === 0) return 0.5;
  // Suavização bayesiana em direção a 0.5 — evita extremos com poucas amostras.
  const raw = num / den;
  const k = 8;
  return (raw * attempts.length + 0.5 * k) / (attempts.length + k);
}
