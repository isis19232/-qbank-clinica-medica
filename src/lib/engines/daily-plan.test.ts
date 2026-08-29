import { describe, expect, it } from "vitest";
import { DEFAULT_MIX, questionsForMinutes, resolveComposition } from "./daily-plan";

describe("questionsForMinutes", () => {
  it("converte minutos em questões pelo ritmo de referência", () => {
    expect(questionsForMinutes(45)).toBe(17);
    expect(questionsForMinutes(120)).toBe(46);
  });

  it("nunca devolve zero", () => {
    expect(questionsForMinutes(1)).toBeGreaterThanOrEqual(1);
  });
});

describe("resolveComposition", () => {
  it("respeita as proporções quando há material em todas as fontes", () => {
    const c = resolveComposition(20, { fresh: 100, errorReview: 100, spaced: 100, weakTopics: 100 });
    expect(c.fresh).toBe(Math.round(20 * DEFAULT_MIX.fresh));
    expect(c.errorReview).toBe(Math.round(20 * DEFAULT_MIX.errorReview));
    expect(c.total).toBe(20);
  });

  it("realoca para questões novas quando as filas estão vazias", () => {
    const c = resolveComposition(20, { fresh: 100, errorReview: 0, spaced: 0, weakTopics: 0 });
    expect(c.errorReview).toBe(0);
    expect(c.spaced).toBe(0);
    expect(c.fresh).toBe(20);
    expect(c.total).toBe(20);
  });

  it("nunca pede mais do que existe em cada fonte", () => {
    const available = { fresh: 3, errorReview: 2, spaced: 1, weakTopics: 0 };
    const c = resolveComposition(50, available);
    expect(c.fresh).toBeLessThanOrEqual(available.fresh);
    expect(c.errorReview).toBeLessThanOrEqual(available.errorReview);
    expect(c.spaced).toBeLessThanOrEqual(available.spaced);
    expect(c.weakTopics).toBeLessThanOrEqual(available.weakTopics);
    expect(c.total).toBe(6);
  });

  it("devolve bloco vazio quando não há nenhum material", () => {
    const c = resolveComposition(20, { fresh: 0, errorReview: 0, spaced: 0, weakTopics: 0 });
    expect(c.total).toBe(0);
  });

  it("o total é sempre a soma dos slots", () => {
    const c = resolveComposition(17, { fresh: 40, errorReview: 3, spaced: 2, weakTopics: 9 });
    expect(c.total).toBe(c.fresh + c.errorReview + c.spaced + c.weakTopics);
  });
});
