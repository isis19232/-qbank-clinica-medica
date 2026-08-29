import { describe, expect, it } from "vitest";
import { classifyError, ERROR_TYPE_ADVICE, type ErrorSignals } from "./error-classifier";
import { ERROR_TYPES } from "@/lib/domain/enums";

function signals(overrides: Partial<ErrorSignals> = {}): ErrorSignals {
  return {
    reasoningType: "DIAGNOSIS",
    confidence: "UNSURE",
    responseTimeMs: 90_000,
    medianTimeMs: 100_000,
    isDominantDistractor: false,
    hasCalculation: false,
    hasGuideline: false,
    isRepeatError: false,
    ...overrides,
  };
}

describe("classifyError", () => {
  it("resposta rápida demais para uma vinheta indica leitura apressada", () => {
    expect(classifyError(signals({ responseTimeMs: 8_000 }))).toBe("MISREAD_QUESTION");
  });

  it("tempo muito abaixo da mediana também indica leitura apressada", () => {
    expect(classifyError(signals({ responseTimeMs: 30_000, medianTimeMs: 120_000 }))).toBe("MISREAD_QUESTION");
  });

  it("erro confiante em questão de cálculo aponta a conta", () => {
    expect(classifyError(signals({ hasCalculation: true, confidence: "CONFIDENT" }))).toBe("CALCULATION_ERROR");
  });

  it("chute puro é lacuna de conhecimento", () => {
    expect(classifyError(signals({ confidence: "GUESS" }))).toBe("KNOWLEDGE_GAP");
  });

  it("cair no distrator dominante com convicção é confusão com distrator", () => {
    expect(classifyError(signals({ isDominantDistractor: true, confidence: "CONFIDENT" }))).toBe(
      "DISTRACTOR_CONFUSION",
    );
  });

  it("erro repetido em questão de diretriz é erro de diretriz", () => {
    expect(classifyError(signals({ hasGuideline: true, isRepeatError: true }))).toBe("GUIDELINE_ERROR");
  });

  it("questão de conduta sem diretriz cai em raciocínio terapêutico", () => {
    expect(classifyError(signals({ reasoningType: "INITIAL_MANAGEMENT" }))).toBe("THERAPEUTIC_REASONING");
  });

  it("questão de conduta com diretriz cai em erro de diretriz", () => {
    expect(classifyError(signals({ reasoningType: "TREATMENT_SELECTION", hasGuideline: true }))).toBe(
      "GUIDELINE_ERROR",
    );
  });

  it("questão de diagnóstico cai em raciocínio diagnóstico", () => {
    expect(classifyError(signals({ reasoningType: "DIFFERENTIAL" }))).toBe("DIAGNOSTIC_REASONING");
  });

  it("sempre devolve um tipo válido", () => {
    for (const reasoningType of ["DIAGNOSIS", "PATHOPHYSIOLOGY", "ETHICS_COMMUNICATION", "DATA_INTERPRETATION"] as const) {
      expect(ERROR_TYPES).toContain(classifyError(signals({ reasoningType })));
    }
  });

  it("toda categoria de erro tem orientação acionável", () => {
    for (const t of ERROR_TYPES) {
      expect(ERROR_TYPE_ADVICE[t]).toBeTruthy();
      expect(ERROR_TYPE_ADVICE[t].length).toBeGreaterThan(20);
    }
  });
});
