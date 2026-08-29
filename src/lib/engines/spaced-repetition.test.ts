import { describe, expect, it } from "vitest";
import { isDue, qualityFrom, scheduleFlashcard, scheduleNext, type SrsState } from "./spaced-repetition";

const fresh: SrsState = { easeFactor: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null };
const NOW = new Date("2026-03-01T12:00:00Z");

describe("qualityFrom", () => {
  it("premia acerto confiante acima de acerto com dúvida", () => {
    expect(qualityFrom(true, "CONFIDENT")).toBeGreaterThan(qualityFrom(true, "UNSURE"));
    expect(qualityFrom(true, "UNSURE")).toBeGreaterThan(qualityFrom(true, "GUESS"));
  });

  it("trata erro confiante como o pior caso — conceito equivocado consolidado", () => {
    expect(qualityFrom(false, "CONFIDENT")).toBe(0);
    expect(qualityFrom(false, "CONFIDENT")).toBeLessThan(qualityFrom(false, "GUESS"));
  });
});

describe("scheduleNext", () => {
  it("erro confiante volta em horas, não em dias", () => {
    const next = scheduleNext(fresh, false, "CONFIDENT", NOW);
    expect(next.intervalDays).toBeLessThan(1);
    expect(next.repetitions).toBe(0);
  });

  it("acerto por chute não empurra a questão para longe", () => {
    const state = { ...fresh, repetitions: 5, intervalDays: 40 };
    const next = scheduleNext(state, true, "GUESS", NOW);
    expect(next.intervalDays).toBeLessThanOrEqual(3);
  });

  it("acertos confiantes sucessivos aumentam o intervalo", () => {
    let state = fresh;
    const intervals: number[] = [];
    for (let i = 0; i < 4; i++) {
      state = scheduleNext(state, true, "CONFIDENT", NOW);
      intervals.push(state.intervalDays);
    }
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]!).toBeGreaterThan(intervals[i - 1]!);
    }
  });

  it("nunca ultrapassa o teto de 180 dias", () => {
    let state = { ...fresh, repetitions: 10, intervalDays: 170, easeFactor: 2.8 };
    for (let i = 0; i < 5; i++) state = scheduleNext(state, true, "CONFIDENT", NOW);
    expect(state.intervalDays).toBeLessThanOrEqual(180);
  });

  it("mantém o fator de facilidade dentro dos limites após erros repetidos", () => {
    let state = fresh;
    for (let i = 0; i < 10; i++) state = scheduleNext(state, false, "CONFIDENT", NOW);
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(state.easeFactor).toBeLessThanOrEqual(2.8);
  });

  it("agenda a próxima revisão a partir do momento informado", () => {
    const next = scheduleNext(fresh, true, "CONFIDENT", NOW);
    expect(next.nextReviewAt!.getTime()).toBeGreaterThan(NOW.getTime());
  });
});

describe("scheduleFlashcard", () => {
  it("AGAIN reinicia as repetições", () => {
    const state = { ...fresh, repetitions: 4, intervalDays: 20 };
    expect(scheduleFlashcard(state, "AGAIN", NOW).repetitions).toBe(0);
  });

  it("EASY produz intervalo maior que GOOD", () => {
    const easy = scheduleFlashcard(fresh, "EASY", NOW);
    const good = scheduleFlashcard(fresh, "GOOD", NOW);
    expect(easy.intervalDays).toBeGreaterThanOrEqual(good.intervalDays);
  });
});

describe("isDue", () => {
  it("considera devida uma revisão agendada no passado", () => {
    expect(isDue({ nextReviewAt: new Date("2026-02-01") }, NOW)).toBe(true);
    expect(isDue({ nextReviewAt: new Date("2026-04-01") }, NOW)).toBe(false);
    expect(isDue({ nextReviewAt: null }, NOW)).toBe(false);
  });
});
