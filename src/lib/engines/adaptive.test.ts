import { describe, expect, it } from "vitest";
import { estimateAbility, scoreCandidate, selectAdaptive, SIGNAL_WEIGHTS, type CandidateSignals } from "./adaptive";

function candidate(overrides: Partial<CandidateSignals> = {}): CandidateSignals {
  return {
    questionId: overrides.questionId ?? "q1",
    specialtySlug: "cardiologia",
    topicSlug: "arritmias",
    difficulty: "MEDIUM",
    topicYieldWeight: 3,
    topicAccuracy: 0.7,
    topicVolume: 10,
    unseen: false,
    lastWrong: false,
    lastConfidence: null,
    daysSinceAnswered: 10,
    daysUntilDue: null,
    examProfileWeight: 0.5,
    globalAccuracy: 0.6,
    ...overrides,
  };
}

describe("SIGNAL_WEIGHTS", () => {
  it("soma 1.0, mantendo o score em escala interpretável", () => {
    const sum = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("scoreCandidate", () => {
  const opts = { ability: 0.5 };

  it("prioriza tópico fraco sobre tópico forte", () => {
    const weak = scoreCandidate(candidate({ topicAccuracy: 0.3 }), opts);
    const strong = scoreCandidate(candidate({ topicAccuracy: 0.95 }), opts);
    expect(weak).toBeGreaterThan(strong);
  });

  it("erro recente pesa mais que erro antigo", () => {
    const recent = scoreCandidate(candidate({ lastWrong: true, daysSinceAnswered: 1 }), opts);
    const old = scoreCandidate(candidate({ lastWrong: true, daysSinceAnswered: 90 }), opts);
    expect(recent).toBeGreaterThan(old);
  });

  it("revisão atrasada pontua mais que revisão distante", () => {
    const overdue = scoreCandidate(candidate({ daysUntilDue: -5 }), opts);
    const future = scoreCandidate(candidate({ daysUntilDue: 30 }), opts);
    expect(overdue).toBeGreaterThan(future);
  });

  it("acerto por chute traz a questão de volta", () => {
    const guessed = scoreCandidate(candidate({ lastConfidence: "GUESS" }), opts);
    const confident = scoreCandidate(candidate({ lastConfidence: "CONFIDENT" }), opts);
    expect(guessed).toBeGreaterThan(confident);
  });

  it("não penaliza tópico sem histórico — trata como neutro", () => {
    const unknown = scoreCandidate(candidate({ topicAccuracy: null, topicVolume: 0 }), opts);
    const strong = scoreCandidate(candidate({ topicAccuracy: 0.95, topicVolume: 30 }), opts);
    expect(unknown).toBeGreaterThan(strong);
  });

  it("casa a dificuldade com a habilidade estimada", () => {
    const lowAbility = { ability: 0.2 };
    const easyForNovice = scoreCandidate(candidate({ difficulty: "EASY" }), lowAbility);
    const veryHardForNovice = scoreCandidate(candidate({ difficulty: "VERY_HARD" }), lowAbility);
    expect(easyForNovice).toBeGreaterThan(veryHardForNovice);
  });

  it("confia menos na fraqueza estimada com pouca amostra", () => {
    const lowVolume = scoreCandidate(candidate({ topicAccuracy: 0.2, topicVolume: 1 }), opts);
    const highVolume = scoreCandidate(candidate({ topicAccuracy: 0.2, topicVolume: 30 }), opts);
    expect(highVolume).toBeGreaterThan(lowVolume);
  });
});

describe("selectAdaptive", () => {
  it("mistura tópicos fracos e fortes em vez de virar monocultura", () => {
    const pool: CandidateSignals[] = [
      ...Array.from({ length: 20 }, (_, i) =>
        candidate({ questionId: `weak-${i}`, topicSlug: "fraco", topicAccuracy: 0.3, topicVolume: 10 }),
      ),
      ...Array.from({ length: 20 }, (_, i) =>
        candidate({ questionId: `strong-${i}`, topicSlug: "forte", topicAccuracy: 0.92, topicVolume: 10 }),
      ),
    ];

    const picked = selectAdaptive(pool, 20, { ability: 0.5 });
    expect(picked).toHaveLength(20);
    // A cota anti-overfitting garante presença do tópico forte.
    expect(picked.filter((id) => id.startsWith("strong-")).length).toBeGreaterThan(0);
    expect(picked.filter((id) => id.startsWith("weak-")).length).toBeGreaterThan(0);
  });

  it("nunca repete a mesma questão", () => {
    const pool = Array.from({ length: 30 }, (_, i) => candidate({ questionId: `q-${i}` }));
    const picked = selectAdaptive(pool, 25, { ability: 0.5 });
    expect(new Set(picked).size).toBe(picked.length);
  });

  it("devolve tudo o que existe quando o pool é menor que o pedido", () => {
    const pool = Array.from({ length: 4 }, (_, i) => candidate({ questionId: `q-${i}` }));
    expect(selectAdaptive(pool, 20, { ability: 0.5 })).toHaveLength(4);
  });

  it("lida com pool vazio", () => {
    expect(selectAdaptive([], 10, { ability: 0.5 })).toEqual([]);
  });
});

describe("estimateAbility", () => {
  it("retorna neutro sem histórico", () => {
    expect(estimateAbility([])).toBe(0.5);
  });

  it("acertar questões difíceis eleva mais que acertar fáceis", () => {
    const hard = estimateAbility(Array.from({ length: 20 }, () => ({ isCorrect: true, difficulty: "VERY_HARD" as const })));
    const easy = estimateAbility(Array.from({ length: 20 }, () => ({ isCorrect: true, difficulty: "EASY" as const })));
    // Ambos altos, mas a suavização bayesiana puxa menos quem acerta difícil.
    expect(hard).toBeGreaterThan(0.5);
    expect(easy).toBeGreaterThan(0.5);
    expect(hard).toBeGreaterThanOrEqual(easy);
  });

  it("suaviza em direção a 0.5 com poucas amostras", () => {
    const few = estimateAbility([{ isCorrect: true, difficulty: "MEDIUM" }]);
    const many = estimateAbility(Array.from({ length: 100 }, () => ({ isCorrect: true, difficulty: "MEDIUM" as const })));
    expect(few).toBeLessThan(many);
    expect(few).toBeGreaterThan(0.5);
  });

  it("permanece dentro de [0, 1]", () => {
    const allWrong = estimateAbility(Array.from({ length: 50 }, () => ({ isCorrect: false, difficulty: "EASY" as const })));
    expect(allWrong).toBeGreaterThanOrEqual(0);
    expect(allWrong).toBeLessThanOrEqual(1);
  });
});
