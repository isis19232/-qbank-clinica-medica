import { describe, expect, it } from "vitest";
import { buildXray, countWords, isManagementType, MIN_SAMPLE, type XrayInput } from "./exam-xray";

function item(overrides: Partial<XrayInput> = {}): XrayInput {
  return {
    id: "q1",
    specialtySlug: "cardiologia",
    specialtyName: "Cardiologia",
    topicSlug: "arritmias",
    topicName: "Arritmias",
    difficulty: "MEDIUM",
    reasoningType: "DIAGNOSIS",
    stemWords: 150,
    hasLabData: true,
    hasEcg: false,
    hasImaging: false,
    hasCalculation: false,
    isManagement: false,
    guidelineSocieties: ["Sociedade Brasileira de Cardiologia"],
    ...overrides,
  };
}

describe("buildXray", () => {
  it("marca amostra pequena como insuficiente em vez de reportar número frágil", () => {
    const report = buildXray(Array.from({ length: MIN_SAMPLE - 1 }, (_, i) => item({ id: `q${i}` })));
    expect(report.insufficient).toBe(true);
  });

  it("libera as estatísticas ao atingir a amostra mínima", () => {
    const report = buildXray(Array.from({ length: MIN_SAMPLE }, (_, i) => item({ id: `q${i}` })));
    expect(report.insufficient).toBe(false);
    expect(report.sampleSize).toBe(MIN_SAMPLE);
  });

  it("lida com conjunto vazio sem divisão por zero", () => {
    const report = buildXray([]);
    expect(report.sampleSize).toBe(0);
    expect(report.avgStemWords).toBe(0);
    expect(report.insufficient).toBe(true);
  });

  it("calcula frequências como proporção do total", () => {
    const items = [
      ...Array.from({ length: 15 }, (_, i) => item({ id: `a${i}`, hasEcg: false })),
      ...Array.from({ length: 5 }, (_, i) => item({ id: `b${i}`, hasEcg: true })),
    ];
    expect(buildXray(items).frequencies.ecg).toBeCloseTo(0.25);
  });

  it("a distribuição de dificuldade soma 1", () => {
    const items = [
      ...Array.from({ length: 5 }, (_, i) => item({ id: `e${i}`, difficulty: "EASY" })),
      ...Array.from({ length: 10 }, (_, i) => item({ id: `m${i}`, difficulty: "MEDIUM" })),
      ...Array.from({ length: 5 }, (_, i) => item({ id: `h${i}`, difficulty: "HARD" })),
    ];
    const dist = buildXray(items).difficultyDistribution;
    expect(Object.values(dist).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(dist.MEDIUM).toBeCloseTo(0.5);
  });

  it("ordena especialidades por frequência", () => {
    const items = [
      ...Array.from({ length: 3 }, (_, i) =>
        item({ id: `c${i}`, specialtySlug: "cardiologia", specialtyName: "Cardiologia" }),
      ),
      ...Array.from({ length: 10 }, (_, i) =>
        item({ id: `n${i}`, specialtySlug: "nefrologia", specialtyName: "Nefrologia" }),
      ),
    ];
    expect(buildXray(items).topSpecialties[0]!.key).toBe("nefrologia");
  });

  it("usa 80 palavras como limiar de questão clínica", () => {
    const items = [
      ...Array.from({ length: 10 }, (_, i) => item({ id: `long${i}`, stemWords: 200 })),
      ...Array.from({ length: 10 }, (_, i) => item({ id: `short${i}`, stemWords: 30 })),
    ];
    expect(buildXray(items).clinicalShare).toBeCloseTo(0.5);
  });
});

describe("isManagementType", () => {
  it("reconhece os tipos de raciocínio voltados a conduta", () => {
    expect(isManagementType("INITIAL_MANAGEMENT")).toBe(true);
    expect(isManagementType("TREATMENT_SELECTION")).toBe(true);
    expect(isManagementType("DIAGNOSIS")).toBe(false);
    expect(isManagementType("PATHOPHYSIOLOGY")).toBe(false);
  });
});

describe("countWords", () => {
  it("ignora espaços múltiplos e bordas", () => {
    expect(countWords("  paciente   de 45  anos ")).toBe(4);
    expect(countWords("")).toBe(0);
  });
});
