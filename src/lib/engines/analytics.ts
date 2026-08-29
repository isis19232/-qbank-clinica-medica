import type { Difficulty } from "@/lib/domain/enums";

/**
 * Camada de analytics: agregações puras, sem I/O. Recebe linhas já lidas do
 * banco e devolve os números da dashboard, do mapa de fraquezas e do Raio-X.
 */

export interface AttemptRow {
  questionId: string;
  isCorrect: boolean | null;
  selectedLabel: string | null;
  confidence: string;
  responseTimeMs: number;
  createdAt: Date;
  specialtySlug: string;
  specialtyName: string;
  topicSlug: string | null;
  topicName: string | null;
  topicYieldWeight: number;
  difficulty: Difficulty;
}

export interface GroupPerformance {
  key: string;
  label: string;
  answered: number;
  correct: number;
  accuracy: number;
  avgTimeMs: number;
  /** Semáforo: verde ≥80%, amarelo 60–79%, vermelho <60%. */
  band: "green" | "yellow" | "red";
  yieldWeight?: number;
}

export function bandFor(accuracy: number): "green" | "yellow" | "red" {
  if (accuracy >= 0.8) return "green";
  if (accuracy >= 0.6) return "yellow";
  return "red";
}

function summarize(
  rows: AttemptRow[],
  keyOf: (r: AttemptRow) => string | null,
  labelOf: (r: AttemptRow) => string,
  yieldOf?: (r: AttemptRow) => number,
): GroupPerformance[] {
  const acc = new Map<
    string,
    { label: string; answered: number; correct: number; timeMs: number; yieldWeight: number }
  >();
  for (const r of rows) {
    const key = keyOf(r);
    if (!key) continue;
    const cur =
      acc.get(key) ?? { label: labelOf(r), answered: 0, correct: 0, timeMs: 0, yieldWeight: yieldOf?.(r) ?? 3 };
    cur.answered += 1;
    if (r.isCorrect) cur.correct += 1;
    cur.timeMs += r.responseTimeMs;
    acc.set(key, cur);
  }
  return [...acc.entries()]
    .map(([key, v]) => ({
      key,
      label: v.label,
      answered: v.answered,
      correct: v.correct,
      accuracy: v.answered ? v.correct / v.answered : 0,
      avgTimeMs: v.answered ? Math.round(v.timeMs / v.answered) : 0,
      band: bandFor(v.answered ? v.correct / v.answered : 0),
      yieldWeight: v.yieldWeight,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function bySpecialty(rows: AttemptRow[]): GroupPerformance[] {
  return summarize(rows, (r) => r.specialtySlug, (r) => r.specialtyName);
}

export function byTopic(rows: AttemptRow[]): GroupPerformance[] {
  return summarize(rows, (r) => r.topicSlug, (r) => r.topicName ?? "—", (r) => r.topicYieldWeight);
}

export function byDifficulty(rows: AttemptRow[]): GroupPerformance[] {
  const order: Difficulty[] = ["EASY", "MEDIUM", "HARD", "VERY_HARD"];
  const out = summarize(rows, (r) => r.difficulty, (r) => r.difficulty);
  return out.sort((a, b) => order.indexOf(a.key as Difficulty) - order.indexOf(b.key as Difficulty));
}

/**
 * Tópicos prioritários = alta importância para prova × baixo desempenho.
 * Só considera tópicos com amostra mínima, para não priorizar ruído.
 */
export function priorityTopics(rows: AttemptRow[], minSample = 4): (GroupPerformance & { priority: number })[] {
  return byTopic(rows)
    .filter((t) => t.answered >= minSample)
    .map((t) => ({
      ...t,
      priority: ((t.yieldWeight ?? 3) / 5) * (1 - t.accuracy),
    }))
    .sort((a, b) => b.priority - a.priority);
}

/** Acurácia por dia, para o gráfico de evolução. */
export function accuracyOverTime(rows: AttemptRow[]): { date: string; answered: number; accuracy: number }[] {
  const byDay = new Map<string, { answered: number; correct: number }>();
  for (const r of rows) {
    const day = r.createdAt.toISOString().slice(0, 10);
    const cur = byDay.get(day) ?? { answered: 0, correct: 0 };
    cur.answered += 1;
    if (r.isCorrect) cur.correct += 1;
    byDay.set(day, cur);
  }
  return [...byDay.entries()]
    .map(([date, v]) => ({ date, answered: v.answered, accuracy: v.answered ? v.correct / v.answered : 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calibração: para cada nível de confiança declarada, qual foi a acurácia real.
 * Um estudante bem calibrado acerta ~95% do que marca como "confiante".
 */
export function confidenceCalibration(
  rows: AttemptRow[],
): { confidence: string; answered: number; accuracy: number }[] {
  const order = ["GUESS", "UNSURE", "CONFIDENT"];
  const map = new Map<string, { answered: number; correct: number }>();
  for (const r of rows) {
    const cur = map.get(r.confidence) ?? { answered: 0, correct: 0 };
    cur.answered += 1;
    if (r.isCorrect) cur.correct += 1;
    map.set(r.confidence, cur);
  }
  return order
    .filter((c) => map.has(c))
    .map((c) => {
      const v = map.get(c)!;
      return { confidence: c, answered: v.answered, accuracy: v.answered ? v.correct / v.answered : 0 };
    });
}

export interface OverallStats {
  answered: number;
  correct: number;
  accuracy: number;
  avgTimeMs: number;
  blank: number;
  streakDays: number;
}

export function overall(rows: AttemptRow[]): OverallStats {
  const answered = rows.length;
  const correct = rows.filter((r) => r.isCorrect).length;
  const blank = rows.filter((r) => r.selectedLabel === null).length;
  const timeMs = rows.reduce((s, r) => s + r.responseTimeMs, 0);
  return {
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    avgTimeMs: answered ? Math.round(timeMs / answered) : 0,
    blank,
    streakDays: studyStreak(rows),
  };
}

/** Dias consecutivos de estudo terminando hoje ou ontem. */
export function studyStreak(rows: AttemptRow[], now: Date = new Date()): number {
  const days = new Set(rows.map((r) => r.createdAt.toISOString().slice(0, 10)));
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date(now);
  // Tolera o dia de hoje ainda não ter estudo: começa a contar de ontem.
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
