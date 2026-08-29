import type { Difficulty, ReasoningType } from "@/lib/domain/enums";

/**
 * Raio-X de Prova. Calcula o perfil estatístico de um conjunto de questões.
 *
 * Regra de ouro do produto: **não inventar estatística**. Abaixo de
 * MIN_SAMPLE questões o retorno vem marcado como `insufficient`, e a UI mostra
 * "dados insuficientes" em vez de um número que parece preciso e não é.
 */

export const MIN_SAMPLE = 12;

export interface XrayInput {
  id: string;
  specialtySlug: string;
  specialtyName: string;
  topicSlug: string | null;
  topicName: string | null;
  difficulty: Difficulty;
  reasoningType: ReasoningType;
  stemWords: number;
  hasLabData: boolean;
  hasEcg: boolean;
  hasImaging: boolean;
  hasCalculation: boolean;
  isManagement: boolean;
  guidelineSocieties: string[];
}

export interface XrayReport {
  sampleSize: number;
  insufficient: boolean;
  avgStemWords: number;
  difficultyDistribution: Record<Difficulty, number>;
  topSpecialties: { key: string; label: string; count: number; share: number }[];
  topTopics: { key: string; label: string; count: number; share: number }[];
  reasoningDistribution: { key: ReasoningType; count: number; share: number }[];
  frequencies: {
    labData: number;
    ecg: number;
    imaging: number;
    calculation: number;
    management: number;
  };
  topSocieties: { name: string; count: number }[];
  /** Proporção clínica (vinheta) vs. teórica — proxy: enunciados ≥ 80 palavras. */
  clinicalShare: number;
}

export function buildXray(items: XrayInput[]): XrayReport {
  const n = items.length;
  const empty: XrayReport = {
    sampleSize: n,
    insufficient: true,
    avgStemWords: 0,
    difficultyDistribution: { EASY: 0, MEDIUM: 0, HARD: 0, VERY_HARD: 0 },
    topSpecialties: [],
    topTopics: [],
    reasoningDistribution: [],
    frequencies: { labData: 0, ecg: 0, imaging: 0, calculation: 0, management: 0 },
    topSocieties: [],
    clinicalShare: 0,
  };
  if (n === 0) return empty;

  const diff: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0, VERY_HARD: 0 };
  const spec = new Map<string, { label: string; count: number }>();
  const topic = new Map<string, { label: string; count: number }>();
  const reasoning = new Map<ReasoningType, number>();
  const society = new Map<string, number>();
  let words = 0;
  let lab = 0;
  let ecg = 0;
  let imaging = 0;
  let calc = 0;
  let mgmt = 0;
  let clinical = 0;

  for (const q of items) {
    diff[q.difficulty] += 1;
    words += q.stemWords;
    if (q.hasLabData) lab += 1;
    if (q.hasEcg) ecg += 1;
    if (q.hasImaging) imaging += 1;
    if (q.hasCalculation) calc += 1;
    if (q.isManagement) mgmt += 1;
    if (q.stemWords >= 80) clinical += 1;

    const s = spec.get(q.specialtySlug) ?? { label: q.specialtyName, count: 0 };
    s.count += 1;
    spec.set(q.specialtySlug, s);

    if (q.topicSlug) {
      const t = topic.get(q.topicSlug) ?? { label: q.topicName ?? q.topicSlug, count: 0 };
      t.count += 1;
      topic.set(q.topicSlug, t);
    }

    reasoning.set(q.reasoningType, (reasoning.get(q.reasoningType) ?? 0) + 1);
    for (const soc of q.guidelineSocieties) society.set(soc, (society.get(soc) ?? 0) + 1);
  }

  const rank = (m: Map<string, { label: string; count: number }>) =>
    [...m.entries()]
      .map(([key, v]) => ({ key, label: v.label, count: v.count, share: v.count / n }))
      .sort((a, b) => b.count - a.count);

  return {
    sampleSize: n,
    insufficient: n < MIN_SAMPLE,
    avgStemWords: Math.round(words / n),
    difficultyDistribution: {
      EASY: diff.EASY / n,
      MEDIUM: diff.MEDIUM / n,
      HARD: diff.HARD / n,
      VERY_HARD: diff.VERY_HARD / n,
    },
    topSpecialties: rank(spec),
    topTopics: rank(topic).slice(0, 12),
    reasoningDistribution: [...reasoning.entries()]
      .map(([key, count]) => ({ key, count, share: count / n }))
      .sort((a, b) => b.count - a.count),
    frequencies: {
      labData: lab / n,
      ecg: ecg / n,
      imaging: imaging / n,
      calculation: calc / n,
      management: mgmt / n,
    },
    topSocieties: [...society.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    clinicalShare: clinical / n,
  };
}

const MANAGEMENT_TYPES: ReasoningType[] = [
  "INITIAL_MANAGEMENT",
  "TREATMENT_SELECTION",
  "NEXT_STEP",
  "CONTRAINDICATION",
];

export function isManagementType(t: ReasoningType): boolean {
  return MANAGEMENT_TYPES.includes(t);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
