import type { QuestionInput } from "@/lib/domain/schemas";

/**
 * Contrato da camada de IA. A aplicação nunca fala com o SDK diretamente —
 * fala com esta interface, o que permite trocar de provider, rodar offline em
 * testes e registrar consumo de tokens de forma uniforme.
 */

export interface AiUsage {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AiResult<T> {
  data: T;
  usage: AiUsage;
}

export interface GenerationContext {
  count: number;
  type: "OBJECTIVE" | "DISCURSIVE";
  difficulties: string[];
  reasoningTypes: string[];
  specialty?: { slug: string; name: string };
  topic?: { slug: string; name: string };
  weakTopics?: { name: string; accuracy: number }[];
  examProfile?: {
    name: string;
    alternativesCount: number;
    avgStemWords: number;
    labDataFrequency: number;
    ecgFrequency: number;
    imagingFrequency: number;
    calculationFrequency: number;
    managementFrequency: number;
    clinicalReasoningIntensity: number;
    difficultyDistribution: Record<string, number>;
    distractorPatterns: string[];
    preferredTerminology: string[];
    recurringThemes: string[];
  };
  /** Códigos/temas já existentes, para o gerador evitar repetição. */
  existingThemes: string[];
  extraInstructions?: string;
}

export interface TutorContext {
  action: string;
  questionStem: string;
  questionPrompt: string;
  alternatives: { label: string; text: string; isCorrect: boolean; rationale: string }[];
  explanation: unknown;
  specialtyName: string;
  topicName: string | null;
  difficulty: string;
  guidelineReference: { society: string; title: string; year: number | null }[];
  alternativeLabel?: string;
  userMessage?: string;
}

export interface DiscursiveGradingContext {
  stem: string;
  subQuestions: { label: string; prompt: string; criteria: { keyPoint: string; points: number }[] }[];
  modelAnswer: string;
  maxScore: number;
  studentAnswer: string;
}

export interface DiscursiveGrade {
  score: number;
  maxScore: number;
  perCriterion: { keyPoint: string; awarded: number; possible: number; comment: string }[];
  overallFeedback: string;
}

export interface AiProvider {
  readonly name: string;
  readonly available: boolean;
  generateQuestions(ctx: GenerationContext): Promise<AiResult<QuestionInput[]>>;
  tutor(ctx: TutorContext): Promise<AiResult<string>>;
  gradeDiscursive(ctx: DiscursiveGradingContext): Promise<AiResult<DiscursiveGrade>>;
}
