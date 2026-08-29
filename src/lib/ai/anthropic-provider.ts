import Anthropic from "@anthropic-ai/sdk";
import { questionInputSchema, type QuestionInput } from "@/lib/domain/schemas";
import {
  GENERATOR_SYSTEM,
  GRADER_SYSTEM,
  TUTOR_SYSTEM,
  buildGenerationPrompt,
  buildGradingPrompt,
  buildTutorPrompt,
} from "./prompts";
import type {
  AiProvider,
  AiResult,
  DiscursiveGrade,
  DiscursiveGradingContext,
  GenerationContext,
  TutorContext,
} from "./types";

const MODEL = process.env.AI_MODEL ?? "claude-opus-5";

/** Schema JSON dos structured outputs para geração de questões. */
const questionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "code",
          "type",
          "stem",
          "prompt",
          "difficulty",
          "clinicalReasoningType",
          "specialtySlug",
          "explanation",
          "alternatives",
        ],
        properties: {
          code: { type: "string" },
          type: { type: "string", enum: ["OBJECTIVE", "DISCURSIVE"] },
          stem: { type: "string" },
          prompt: { type: "string" },
          difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD", "VERY_HARD"] },
          clinicalReasoningType: {
            type: "string",
            enum: [
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
            ],
          },
          specialtySlug: { type: "string" },
          topicSlug: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          labData: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["exam", "result", "reference"],
              properties: {
                exam: { type: "string" },
                result: { type: "string" },
                reference: { type: "string" },
              },
            },
          },
          media: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["kind", "caption", "alt"],
              properties: {
                kind: {
                  type: "string",
                  enum: ["ECG", "XRAY", "CT", "MRI", "US", "PHOTO", "CHART", "OTHER"],
                },
                caption: { type: "string" },
                alt: { type: "string" },
              },
            },
          },
          guidelineReference: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["society", "title", "year"],
              properties: {
                society: { type: "string" },
                title: { type: "string" },
                year: { type: ["integer", "null"] },
              },
            },
          },
          explanation: {
            type: "object",
            additionalProperties: false,
            required: ["answerSummary", "whyCorrect", "keyClues", "clinicalPearl", "commonTrap", "managementSteps"],
            properties: {
              answerSummary: { type: "string" },
              whyCorrect: { type: "string" },
              keyClues: { type: "array", items: { type: "string" } },
              clinicalPearl: { type: "string" },
              commonTrap: { type: "string" },
              managementSteps: { type: "array", items: { type: "string" } },
            },
          },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "text", "isCorrect", "rationale"],
              properties: {
                label: { type: "string", enum: ["A", "B", "C", "D", "E"] },
                text: { type: "string" },
                isCorrect: { type: "boolean" },
                rationale: { type: "string" },
              },
            },
          },
          rubric: {
            type: "object",
            additionalProperties: false,
            required: ["maxScore", "subQuestions", "modelAnswer"],
            properties: {
              maxScore: { type: "number" },
              modelAnswer: { type: "string" },
              subQuestions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["label", "prompt", "criteria"],
                  properties: {
                    label: { type: "string" },
                    prompt: { type: "string" },
                    criteria: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["keyPoint", "points", "acceptedTerms"],
                        properties: {
                          keyPoint: { type: "string" },
                          points: { type: "number" },
                          acceptedTerms: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const gradeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "perCriterion", "overallFeedback"],
  properties: {
    score: { type: "number" },
    overallFeedback: { type: "string" },
    perCriterion: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["keyPoint", "awarded", "possible", "comment"],
        properties: {
          keyPoint: { type: "string" },
          awarded: { type: "number" },
          possible: { type: "number" },
          comment: { type: "string" },
        },
      },
    },
  },
} as const;

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";
  readonly available = true;
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = apiKey ? new Anthropic({ apiKey }) : new Anthropic();
  }

  async generateQuestions(ctx: GenerationContext): Promise<AiResult<QuestionInput[]>> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: questionJsonSchema },
      },
      system: GENERATOR_SYSTEM,
      messages: [{ role: "user", content: buildGenerationPrompt(ctx) }],
    });

    const raw = extractText(response);
    const parsed = JSON.parse(raw) as { questions: unknown[] };

    // Validação estrita: uma questão malformada é descartada, não corrompe o banco.
    const questions: QuestionInput[] = [];
    for (const q of parsed.questions ?? []) {
      const result = questionInputSchema.safeParse({
        ...(q as object),
        sourceType: "AI_GENERATED",
        // Gerada por IA entra como rascunho — revisão humana antes de publicar.
        status: "IN_REVIEW",
        examProfileSlug: ctx.examProfile ? undefined : undefined,
      });
      if (result.success) questions.push(result.data);
    }

    return { data: questions, usage: usageOf(response, this.name) };
  }

  async tutor(ctx: TutorContext): Promise<AiResult<string>> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: TUTOR_SYSTEM,
      messages: [{ role: "user", content: buildTutorPrompt(ctx) }],
    });
    return { data: extractText(response), usage: usageOf(response, this.name) };
  }

  async gradeDiscursive(ctx: DiscursiveGradingContext): Promise<AiResult<DiscursiveGrade>> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: gradeJsonSchema } },
      system: GRADER_SYSTEM,
      messages: [{ role: "user", content: buildGradingPrompt(ctx) }],
    });

    const parsed = JSON.parse(extractText(response)) as Omit<DiscursiveGrade, "maxScore">;
    return {
      data: { ...parsed, maxScore: ctx.maxScore },
      usage: usageOf(response, this.name),
    };
  }
}

function extractText(response: Anthropic.Message): string {
  const parts: string[] = [];
  for (const block of response.content) {
    if (block.type === "text") parts.push(block.text);
  }
  return parts.join("").trim();
}

function usageOf(response: Anthropic.Message, provider: string) {
  return {
    provider,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
