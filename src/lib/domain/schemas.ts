import { z } from "zod";
import {
  ALTERNATIVE_LABELS,
  CONFIDENCE_LEVELS,
  DIFFICULTIES,
  ERROR_TYPES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  REASONING_TYPES,
  SOURCE_TYPES,
  STUDY_MODES,
} from "./enums";

/**
 * Schemas Zod para os payloads JSON armazenados em colunas de texto e para
 * validação de entrada da API. São a fonte única de verdade para a forma dos
 * dados; o Prisma garante apenas que a coluna é uma string.
 */

// ── Blocos internos da questão ────────────────────────────────

export const labRowSchema = z.object({
  exam: z.string().min(1),
  result: z.string().min(1),
  reference: z.string().default(""),
});
export type LabRow = z.infer<typeof labRowSchema>;

export const mediaSchema = z.object({
  kind: z.enum(["ECG", "XRAY", "CT", "MRI", "US", "PHOTO", "CHART", "OTHER"]),
  caption: z.string().min(1),
  /** Descrição textual do achado — permite responder sem a imagem renderizada. */
  alt: z.string().min(1),
  url: z.string().optional(),
});
export type MediaRef = z.infer<typeof mediaSchema>;

export const guidelineRefSchema = z.object({
  society: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int().min(1980).max(2100).nullable().default(null),
  note: z.string().optional(),
});
export type GuidelineRef = z.infer<typeof guidelineRefSchema>;

/** Explicação estruturada — espelha o "motor de explicação" do produto. */
export const explanationSchema = z.object({
  answerSummary: z.string().min(1),
  whyCorrect: z.string().min(1),
  keyClues: z.array(z.string().min(1)).min(1),
  clinicalPearl: z.string().min(1),
  commonTrap: z.string().min(1),
  /** Sequência de manejo, limiares ou critérios — opcional. */
  managementSteps: z.array(z.string().min(1)).default([]),
});
export type Explanation = z.infer<typeof explanationSchema>;

export const rubricCriterionSchema = z.object({
  keyPoint: z.string().min(1),
  points: z.number().min(0),
  /** Termos aceitos como equivalentes — usados na correção assistida. */
  acceptedTerms: z.array(z.string()).default([]),
});

export const rubricSchema = z.object({
  maxScore: z.number().min(1),
  subQuestions: z
    .array(
      z.object({
        label: z.string().min(1),
        prompt: z.string().min(1),
        criteria: z.array(rubricCriterionSchema).min(1),
      }),
    )
    .min(1),
  modelAnswer: z.string().min(1),
});
export type Rubric = z.infer<typeof rubricSchema>;

// ── Questão completa (usado por seed, import e gerador de IA) ──

export const alternativeInputSchema = z.object({
  label: z.enum(ALTERNATIVE_LABELS),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  rationale: z.string().min(1),
});

export const questionInputSchema = z
  .object({
    code: z.string().min(3),
    type: z.enum(QUESTION_TYPES).default("OBJECTIVE"),
    status: z.enum(QUESTION_STATUSES).default("PUBLISHED"),
    sourceType: z.enum(SOURCE_TYPES).default("ORIGINAL"),
    stem: z.string().min(40),
    prompt: z.string().min(10),
    difficulty: z.enum(DIFFICULTIES),
    clinicalReasoningType: z.enum(REASONING_TYPES),
    specialtySlug: z.string().min(1),
    topicSlug: z.string().optional(),
    subtopicSlug: z.string().optional(),
    examProfileSlug: z.string().optional(),
    examYear: z.number().int().optional(),
    labData: z.array(labRowSchema).default([]),
    media: z.array(mediaSchema).default([]),
    guidelineReference: z.array(guidelineRefSchema).default([]),
    keywords: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    explanation: explanationSchema,
    alternatives: z.array(alternativeInputSchema).default([]),
    rubric: rubricSchema.optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === "OBJECTIVE") {
      if (q.alternatives.length < 4) {
        ctx.addIssue({ code: "custom", message: "Questão objetiva exige ao menos 4 alternativas." });
      }
      const correct = q.alternatives.filter((a) => a.isCorrect);
      if (correct.length !== 1) {
        ctx.addIssue({ code: "custom", message: "Deve haver exatamente uma alternativa correta." });
      }
      const labels = new Set(q.alternatives.map((a) => a.label));
      if (labels.size !== q.alternatives.length) {
        ctx.addIssue({ code: "custom", message: "Rótulos de alternativa duplicados." });
      }
    } else if (!q.rubric) {
      ctx.addIssue({ code: "custom", message: "Questão discursiva exige rubrica." });
    }
  });
export type QuestionInput = z.infer<typeof questionInputSchema>;

// ── Entrada de API ────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const answerSchema = z.object({
  questionId: z.string().min(1),
  selectedLabel: z.enum(ALTERNATIVE_LABELS).nullable().default(null),
  discursiveText: z.string().max(8000).optional(),
  confidence: z.enum(CONFIDENCE_LEVELS).default("UNSURE"),
  responseTimeMs: z.number().int().min(0).max(3_600_000).default(0),
  changedAnswer: z.boolean().default(false),
  mode: z.enum(STUDY_MODES).default("PRACTICE"),
  studySessionId: z.string().nullable().default(null),
  examAttemptId: z.string().nullable().default(null),
});
export type AnswerInput = z.infer<typeof answerSchema>;

export const questionFilterSchema = z.object({
  specialty: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.array(z.enum(DIFFICULTIES)).optional(),
  reasoningType: z.array(z.enum(REASONING_TYPES)).optional(),
  examProfile: z.string().optional(),
  type: z.enum(QUESTION_TYPES).optional(),
  search: z.string().max(200).optional(),
  /** ALL: todas · UNSEEN: nunca respondidas · WRONG: erradas · FAVORITES: favoritas */
  scope: z.enum(["ALL", "UNSEEN", "WRONG", "FAVORITES"]).default("ALL"),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(50).default(20),
});
export type QuestionFilter = z.infer<typeof questionFilterSchema>;

export const dailyPlanSchema = z.object({
  minutes: z.number().int().min(5).max(480).default(45),
  questionCount: z.number().int().min(1).max(120).optional(),
  specialty: z.string().optional(),
  examProfile: z.string().optional(),
});

export const simulationSchema = z.object({
  questionCount: z.number().int().min(5).max(120).default(20),
  timeLimitMin: z.number().int().min(5).max(360).default(120),
  examProfile: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  difficulty: z.array(z.enum(DIFFICULTIES)).default([]),
  includeDiscursive: z.boolean().default(false),
});
export type SimulationInput = z.infer<typeof simulationSchema>;

export const errorTypeUpdateSchema = z.object({
  entryId: z.string().min(1),
  errorType: z.enum(ERROR_TYPES),
  note: z.string().max(2000).optional(),
});

export const generateQuestionsSchema = z.object({
  count: z.number().int().min(1).max(20).default(5),
  specialtySlug: z.string().optional(),
  topicSlug: z.string().optional(),
  difficulty: z.array(z.enum(DIFFICULTIES)).default(["MEDIUM"]),
  reasoningTypes: z.array(z.enum(REASONING_TYPES)).default([]),
  examProfileSlug: z.string().optional(),
  type: z.enum(QUESTION_TYPES).default("OBJECTIVE"),
  /** Gera a partir dos tópicos com pior desempenho do usuário. */
  targetWeakTopics: z.boolean().default(false),
  extraInstructions: z.string().max(1000).optional(),
});
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;

export const tutorSchema = z.object({
  questionId: z.string().min(1),
  action: z.enum([
    "EXPLAIN_BETTER",
    "WHY_WRONG",
    "CLINICAL_PEARL",
    "TEACH_TOPIC",
    "SIMILAR_QUESTIONS",
    "QUIZ_ME",
    "FREE",
  ]),
  alternativeLabel: z.enum(ALTERNATIVE_LABELS).optional(),
  message: z.string().max(2000).optional(),
});
export type TutorInput = z.infer<typeof tutorSchema>;

export const flashcardSchema = z.object({
  front: z.string().min(3).max(1000),
  back: z.string().min(3).max(4000),
  topicLabel: z.string().max(200).optional(),
  difficulty: z.enum(DIFFICULTIES).default("MEDIUM"),
  questionId: z.string().optional(),
  source: z.enum(["QUESTION_ERROR", "CLINICAL_PEARL", "MANUAL", "AI"]).default("MANUAL"),
});

export const flashcardReviewSchema = z.object({
  id: z.string().min(1),
  grade: z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
});

// ── Helpers de (des)serialização ──────────────────────────────

/** Faz parse de uma coluna JSON com fallback silencioso — dados legados nunca quebram a tela. */
export function parseJson<T>(raw: string | null | undefined, schema: z.ZodType<T>, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}
