import { describe, expect, it } from "vitest";
import {
  accuracyOverTime,
  bandFor,
  bySpecialty,
  byTopic,
  confidenceCalibration,
  overall,
  priorityTopics,
  studyStreak,
  type AttemptRow,
} from "./analytics";

function row(overrides: Partial<AttemptRow> = {}): AttemptRow {
  return {
    questionId: "q1",
    isCorrect: true,
    selectedLabel: "A",
    confidence: "CONFIDENT",
    responseTimeMs: 60_000,
    createdAt: new Date("2026-03-01T10:00:00Z"),
    specialtySlug: "cardiologia",
    specialtyName: "Cardiologia",
    topicSlug: "arritmias",
    topicName: "Arritmias",
    topicYieldWeight: 4,
    difficulty: "MEDIUM",
    ...overrides,
  };
}

describe("bandFor", () => {
  it("aplica os limiares do semáforo", () => {
    expect(bandFor(0.85)).toBe("green");
    expect(bandFor(0.8)).toBe("green");
    expect(bandFor(0.7)).toBe("yellow");
    expect(bandFor(0.6)).toBe("yellow");
    expect(bandFor(0.59)).toBe("red");
  });
});

describe("overall", () => {
  it("calcula acurácia, brancos e tempo médio", () => {
    const rows = [
      row({ isCorrect: true, responseTimeMs: 40_000 }),
      row({ isCorrect: false, responseTimeMs: 80_000 }),
      row({ isCorrect: false, selectedLabel: null, responseTimeMs: 60_000 }),
    ];
    const o = overall(rows);
    expect(o.answered).toBe(3);
    expect(o.correct).toBe(1);
    expect(o.accuracy).toBeCloseTo(1 / 3);
    expect(o.blank).toBe(1);
    expect(o.avgTimeMs).toBe(60_000);
  });

  it("lida com histórico vazio sem divisão por zero", () => {
    const o = overall([]);
    expect(o.accuracy).toBe(0);
    expect(o.avgTimeMs).toBe(0);
    expect(o.streakDays).toBe(0);
  });
});

describe("bySpecialty e byTopic", () => {
  it("agrupa e ordena do pior para o melhor desempenho", () => {
    const rows = [
      row({ specialtySlug: "cardiologia", specialtyName: "Cardiologia", isCorrect: true }),
      row({ specialtySlug: "cardiologia", specialtyName: "Cardiologia", isCorrect: true }),
      row({ specialtySlug: "nefrologia", specialtyName: "Nefrologia", isCorrect: false }),
    ];
    const result = bySpecialty(rows);
    expect(result[0]!.key).toBe("nefrologia");
    expect(result[0]!.band).toBe("red");
    expect(result[1]!.accuracy).toBe(1);
  });

  it("ignora tentativas sem tópico", () => {
    const rows = [row({ topicSlug: null, topicName: null }), row()];
    expect(byTopic(rows)).toHaveLength(1);
  });
});

describe("priorityTopics", () => {
  it("exige amostra mínima para evitar priorizar ruído", () => {
    const rows = [row({ topicSlug: "raro", topicName: "Raro", isCorrect: false })];
    expect(priorityTopics(rows, 4)).toHaveLength(0);
  });

  it("prioriza alta importância combinada com baixo desempenho", () => {
    const highYieldWeak = Array.from({ length: 5 }, () =>
      row({ topicSlug: "sepse", topicName: "Sepse", topicYieldWeight: 5, isCorrect: false }),
    );
    const lowYieldWeak = Array.from({ length: 5 }, () =>
      row({ topicSlug: "raro", topicName: "Raro", topicYieldWeight: 1, isCorrect: false }),
    );
    const result = priorityTopics([...highYieldWeak, ...lowYieldWeak]);
    expect(result[0]!.key).toBe("sepse");
  });
});

describe("accuracyOverTime", () => {
  it("agrupa por dia em ordem cronológica", () => {
    const rows = [
      row({ createdAt: new Date("2026-03-02T10:00:00Z"), isCorrect: true }),
      row({ createdAt: new Date("2026-03-01T10:00:00Z"), isCorrect: false }),
      row({ createdAt: new Date("2026-03-01T18:00:00Z"), isCorrect: true }),
    ];
    const series = accuracyOverTime(rows);
    expect(series).toHaveLength(2);
    expect(series[0]!.date).toBe("2026-03-01");
    expect(series[0]!.accuracy).toBe(0.5);
    expect(series[1]!.accuracy).toBe(1);
  });
});

describe("confidenceCalibration", () => {
  it("preserva a ordem chute → dúvida → confiante", () => {
    const rows = [
      row({ confidence: "CONFIDENT", isCorrect: true }),
      row({ confidence: "GUESS", isCorrect: false }),
      row({ confidence: "UNSURE", isCorrect: true }),
    ];
    expect(confidenceCalibration(rows).map((c) => c.confidence)).toEqual(["GUESS", "UNSURE", "CONFIDENT"]);
  });
});

describe("studyStreak", () => {
  const now = new Date("2026-03-10T20:00:00Z");

  it("conta dias consecutivos terminando hoje", () => {
    const rows = ["2026-03-10", "2026-03-09", "2026-03-08"].map((d) =>
      row({ createdAt: new Date(`${d}T10:00:00Z`) }),
    );
    expect(studyStreak(rows, now)).toBe(3);
  });

  it("tolera o dia de hoje ainda sem estudo", () => {
    const rows = ["2026-03-09", "2026-03-08"].map((d) => row({ createdAt: new Date(`${d}T10:00:00Z`) }));
    expect(studyStreak(rows, now)).toBe(2);
  });

  it("quebra a sequência com um dia de intervalo", () => {
    const rows = ["2026-03-10", "2026-03-08"].map((d) => row({ createdAt: new Date(`${d}T10:00:00Z`) }));
    expect(studyStreak(rows, now)).toBe(1);
  });

  it("devolve zero sem histórico", () => {
    expect(studyStreak([], now)).toBe(0);
  });
});
