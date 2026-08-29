/**
 * Enums do domínio. Modelados como const objects (não `enum` do TS) para que
 * atravessem a fronteira server/client sem runtime extra e permaneçam
 * compatíveis com SQLite e PostgreSQL sem migração de tipo.
 */

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "VERY_HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Média",
  HARD: "Difícil",
  VERY_HARD: "Muito difícil",
};

/** Rubrica de dificuldade — baseada em complexidade de raciocínio, não em raridade. */
export const DIFFICULTY_RUBRIC: Record<Difficulty, string> = {
  EASY: "Reconhecimento de padrão clínico clássico. Um único achado-âncora define a resposta.",
  MEDIUM: "Integração de história, exame físico e investigação básica. Dois ou três achados precisam ser combinados.",
  HARD: "Diagnósticos competindo entre si, interpretação de dados quantitativos ou aplicação de diretriz específica.",
  VERY_HARD: "Raciocínio clínico complexo: estratégias de manejo concorrentes, nuance de diretriz ou múltiplas variáveis interagindo.",
};

/** Peso numérico usado pelo motor adaptativo para casar dificuldade e habilidade. */
export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  EASY: 0.25,
  MEDIUM: 0.5,
  HARD: 0.75,
  VERY_HARD: 0.95,
};

export const QUESTION_TYPES = ["OBJECTIVE", "DISCURSIVE"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_STATUSES = ["DRAFT", "IN_REVIEW", "PUBLISHED", "RETIRED"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const SOURCE_TYPES = ["ORIGINAL", "AI_GENERATED", "USER_UPLOADED", "PUBLIC_DOMAIN"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  ORIGINAL: "Original da plataforma",
  AI_GENERATED: "Gerada por IA (revisão pendente)",
  USER_UPLOADED: "Enviada pelo usuário",
  PUBLIC_DOMAIN: "Domínio público",
};

export const REASONING_TYPES = [
  "DIAGNOSIS",
  "NEXT_STEP",
  "INITIAL_MANAGEMENT",
  "TREATMENT_SELECTION",
  "DATA_INTERPRETATION",
  "PATHOPHYSIOLOGY",
  "CONTRAINDICATION",
  "DIFFERENTIAL",
  "CLASSIFICATION",
  "ETHICS_COMMUNICATION",
] as const;
export type ReasoningType = (typeof REASONING_TYPES)[number];

export const REASONING_LABEL: Record<ReasoningType, string> = {
  DIAGNOSIS: "Diagnóstico",
  NEXT_STEP: "Próximo passo",
  INITIAL_MANAGEMENT: "Manejo inicial",
  TREATMENT_SELECTION: "Escolha de tratamento",
  DATA_INTERPRETATION: "Interpretação de dados",
  PATHOPHYSIOLOGY: "Fisiopatologia aplicada",
  CONTRAINDICATION: "Contraindicação",
  DIFFERENTIAL: "Diagnóstico diferencial",
  CLASSIFICATION: "Classificação/estadiamento",
  ETHICS_COMMUNICATION: "Ética e comunicação",
};

export const CONFIDENCE_LEVELS = ["GUESS", "UNSURE", "CONFIDENT"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const CONFIDENCE_META: Record<Confidence, { emoji: string; label: string }> = {
  GUESS: { emoji: "😕", label: "Chutei" },
  UNSURE: { emoji: "😐", label: "Em dúvida" },
  CONFIDENT: { emoji: "🙂", label: "Confiante" },
};

export const ERROR_TYPES = [
  "KNOWLEDGE_GAP",
  "MISINTERPRETATION",
  "DIAGNOSTIC_REASONING",
  "THERAPEUTIC_REASONING",
  "MISREAD_QUESTION",
  "DISTRACTOR_CONFUSION",
  "CALCULATION_ERROR",
  "GUIDELINE_ERROR",
] as const;
export type ErrorType = (typeof ERROR_TYPES)[number];

export const ERROR_TYPE_LABEL: Record<ErrorType, string> = {
  KNOWLEDGE_GAP: "Lacuna de conhecimento",
  MISINTERPRETATION: "Interpretação equivocada",
  DIAGNOSTIC_REASONING: "Raciocínio diagnóstico",
  THERAPEUTIC_REASONING: "Raciocínio terapêutico",
  MISREAD_QUESTION: "Leitura apressada do enunciado",
  DISTRACTOR_CONFUSION: "Confusão com distrator",
  CALCULATION_ERROR: "Erro de cálculo",
  GUIDELINE_ERROR: "Erro de diretriz",
};

export const STUDY_MODES = ["PRACTICE", "DAILY", "REVIEW", "SPACED", "SIMULATION"] as const;
export type StudyMode = (typeof STUDY_MODES)[number];

export const USER_ROLES = ["STUDENT", "AUTHOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E"] as const;
export type AlternativeLabel = (typeof ALTERNATIVE_LABELS)[number];
