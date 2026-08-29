import { describe, expect, it } from "vitest";
import { questionInputSchema } from "../../src/lib/domain/schemas";
import { CLINICAL_MEDICINE } from "./taxonomy";
import { CARDIO_PNEUMO_QUESTIONS } from "./questions-cardio-pneumo";
import { NEURO_NEFRO_ENDO_QUESTIONS } from "./questions-neuro-nefro-endo";
import { INFECTO_HEMATO_ONCO_QUESTIONS } from "./questions-infecto-hemato-onco";
import { EMERGENCIA_GERIATRIA_QUESTIONS } from "./questions-emergencia-geriatria";
import { DISCURSIVE_QUESTIONS } from "./questions-discursivas";

/**
 * Integridade do banco semeado. Estes testes protegem contra o erro mais caro
 * de uma plataforma de questões: subir ao banco uma questão com gabarito
 * ausente, duplicado, ou apontando para taxonomia inexistente.
 */

const ALL = [
  ...CARDIO_PNEUMO_QUESTIONS,
  ...NEURO_NEFRO_ENDO_QUESTIONS,
  ...INFECTO_HEMATO_ONCO_QUESTIONS,
  ...EMERGENCIA_GERIATRIA_QUESTIONS,
  ...DISCURSIVE_QUESTIONS,
];

const specialtySlugs = new Set(CLINICAL_MEDICINE.map((s) => s.slug));
const topicSlugs = new Set(CLINICAL_MEDICINE.flatMap((s) => s.topics.map((t) => t.slug)));
const subtopicSlugs = new Set(
  CLINICAL_MEDICINE.flatMap((s) => s.topics.flatMap((t) => (t.subtopics ?? []).map((x) => x.slug))),
);

describe("banco de questões semeado", () => {
  it("tem questões", () => {
    expect(ALL.length).toBeGreaterThan(20);
  });

  it("toda questão passa na validação de schema", () => {
    for (const q of ALL) {
      const result = questionInputSchema.safeParse(q);
      if (!result.success) {
        throw new Error(`${q.code}: ${result.error.issues.map((i) => i.message).join("; ")}`);
      }
    }
  });

  it("não há códigos duplicados", () => {
    const codes = ALL.map((q) => q.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("toda objetiva tem exatamente 4 alternativas e uma única correta", () => {
    for (const q of ALL.filter((x) => x.type === "OBJECTIVE")) {
      expect(q.alternatives, q.code).toHaveLength(4);
      expect(q.alternatives.filter((a) => a.isCorrect), q.code).toHaveLength(1);
      expect(q.alternatives.map((a) => a.label), q.code).toEqual(["A", "B", "C", "D"]);
    }
  });

  it("toda alternativa tem justificativa própria", () => {
    for (const q of ALL) {
      for (const a of q.alternatives) {
        expect(a.rationale.length, `${q.code}-${a.label}`).toBeGreaterThan(30);
      }
    }
  });

  it("os slugs de taxonomia existem", () => {
    for (const q of ALL) {
      expect(specialtySlugs.has(q.specialtySlug), `${q.code}: ${q.specialtySlug}`).toBe(true);
      if (q.topicSlug) expect(topicSlugs.has(q.topicSlug), `${q.code}: ${q.topicSlug}`).toBe(true);
      if (q.subtopicSlug) {
        expect(subtopicSlugs.has(q.subtopicSlug), `${q.code}: ${q.subtopicSlug}`).toBe(true);
      }
    }
  });

  it("a explicação está completa em todas as questões", () => {
    for (const q of ALL) {
      expect(q.explanation.whyCorrect.length, q.code).toBeGreaterThan(100);
      expect(q.explanation.keyClues.length, q.code).toBeGreaterThanOrEqual(3);
      expect(q.explanation.clinicalPearl.length, q.code).toBeGreaterThan(30);
      expect(q.explanation.commonTrap.length, q.code).toBeGreaterThan(30);
    }
  });

  it("a vinheta tem densidade compatível com o perfil da prova de referência", () => {
    for (const q of ALL) {
      const words = q.stem.trim().split(/\s+/).length;
      expect(words, `${q.code} tem ${words} palavras`).toBeGreaterThan(60);
    }
  });

  it("nenhuma diretriz citada tem ano inventado — ausência é preferível a chute", () => {
    for (const q of ALL) {
      for (const g of q.guidelineReference) {
        expect(g.society.length, q.code).toBeGreaterThan(3);
        expect(g.title.length, q.code).toBeGreaterThan(5);
        if (g.year !== null) {
          expect(g.year, q.code).toBeGreaterThan(1990);
          expect(g.year, q.code).toBeLessThanOrEqual(new Date().getFullYear() + 1);
        }
      }
    }
  });

  it("toda discursiva tem rubrica com critérios pontuáveis e resposta-modelo", () => {
    for (const q of ALL.filter((x) => x.type === "DISCURSIVE")) {
      expect(q.rubric, q.code).toBeDefined();
      const rubric = q.rubric!;
      expect(rubric.subQuestions.length, q.code).toBeGreaterThanOrEqual(2);
      expect(rubric.modelAnswer.length, q.code).toBeGreaterThan(300);

      const totalPoints = rubric.subQuestions
        .flatMap((sq) => sq.criteria)
        .reduce((sum, c) => sum + c.points, 0);
      expect(totalPoints, `${q.code}: critérios somam ${totalPoints}, rubrica declara ${rubric.maxScore}`)
        .toBeCloseTo(rubric.maxScore, 1);
    }
  });

  it("cobre uma faixa ampla de especialidades e dificuldades", () => {
    expect(new Set(ALL.map((q) => q.specialtySlug)).size).toBeGreaterThanOrEqual(10);
    expect(new Set(ALL.map((q) => q.difficulty)).size).toBe(4);
    expect(new Set(ALL.map((q) => q.clinicalReasoningType)).size).toBeGreaterThanOrEqual(6);
  });

  it("a taxonomia não tem slugs duplicados", () => {
    const all = [
      ...CLINICAL_MEDICINE.map((s) => s.slug),
      ...CLINICAL_MEDICINE.flatMap((s) => s.topics.map((t) => t.slug)),
      ...CLINICAL_MEDICINE.flatMap((s) => s.topics.flatMap((t) => (t.subtopics ?? []).map((x) => x.slug))),
    ];
    expect(new Set(all).size).toBe(all.length);
  });
});
