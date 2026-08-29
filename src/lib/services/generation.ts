import { prisma } from "@/lib/db";
import { getAiProvider } from "@/lib/ai";
import type { GenerationContext } from "@/lib/ai/types";
import type { GenerateQuestionsInput, QuestionInput } from "@/lib/domain/schemas";
import { parseJson } from "@/lib/domain/schemas";
import { z } from "zod";
import { topicPerformance } from "./study";

/**
 * Geração de questões originais.
 *
 * Questões geradas entram como `AI_GENERATED` com status `IN_REVIEW`: nunca vão
 * direto para o banco publicado. Numa plataforma de educação médica, conteúdo
 * não revisado não pode ser indistinguível do revisado.
 */

export async function generateQuestions(userId: string, input: GenerateQuestionsInput) {
  const provider = getAiProvider();

  const job = await prisma.generationJob.create({
    data: {
      userId,
      kind: "QUESTION_GENERATION",
      status: "RUNNING",
      params: JSON.stringify(input),
      provider: provider.name,
    },
  });

  try {
    const ctx = await buildContext(userId, input);
    const { data: questions, usage } = await provider.generateQuestions(ctx);
    const saved = await persistQuestions(questions, input.examProfileSlug);

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        result: JSON.stringify({ codes: saved.map((q) => q.code) }),
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        finishedAt: new Date(),
      },
    });

    return {
      jobId: job.id,
      requested: input.count,
      generated: saved.length,
      /** Descartadas por falharem a validação de schema — não vão ao banco. */
      rejected: questions.length - saved.length,
      questions: saved,
      usage,
    };
  } catch (err) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
    throw err;
  }
}

async function buildContext(
  userId: string,
  input: GenerateQuestionsInput,
): Promise<GenerationContext> {
  const [specialty, topic, profile] = await Promise.all([
    input.specialtySlug
      ? prisma.specialty.findUnique({ where: { slug: input.specialtySlug }, select: { slug: true, name: true } })
      : null,
    input.topicSlug
      ? prisma.topic.findUnique({ where: { slug: input.topicSlug }, select: { slug: true, name: true } })
      : null,
    input.examProfileSlug
      ? prisma.examProfile.findUnique({ where: { slug: input.examProfileSlug } })
      : null,
  ]);

  let weakTopics: { name: string; accuracy: number }[] | undefined;
  if (input.targetWeakTopics) {
    const perf = await topicPerformance(userId);
    const slugs = [...perf.entries()]
      .filter(([, v]) => v.answered >= 3 && v.accuracy < 0.7)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .slice(0, 6);
    const topics = await prisma.topic.findMany({
      where: { slug: { in: slugs.map(([s]) => s) } },
      select: { slug: true, name: true },
    });
    const nameBySlug = new Map(topics.map((t) => [t.slug, t.name]));
    weakTopics = slugs.map(([slug, v]) => ({ name: nameBySlug.get(slug) ?? slug, accuracy: v.accuracy }));
  }

  // Temas já cobertos, para o gerador escolher ângulos diferentes.
  const existing = await prisma.question.findMany({
    where: {
      status: { in: ["PUBLISHED", "IN_REVIEW"] },
      ...(input.specialtySlug ? { specialty: { slug: input.specialtySlug } } : {}),
      ...(input.topicSlug ? { topic: { slug: input.topicSlug } } : {}),
    },
    select: { prompt: true, keywords: true },
    take: 60,
  });
  const existingThemes = existing.map((q) => {
    const kw = parseJson(q.keywords, z.array(z.string()), []);
    return kw.length ? kw.join(", ") : q.prompt.slice(0, 90);
  });

  return {
    count: input.count,
    type: input.type,
    difficulties: input.difficulty,
    reasoningTypes: input.reasoningTypes,
    specialty: specialty ?? undefined,
    topic: topic ?? undefined,
    weakTopics,
    examProfile: profile
      ? {
          name: profile.name,
          alternativesCount: profile.alternativesCount,
          avgStemWords: profile.avgStemWords,
          labDataFrequency: profile.labDataFrequency,
          ecgFrequency: profile.ecgFrequency,
          imagingFrequency: profile.imagingFrequency,
          calculationFrequency: profile.calculationFrequency,
          managementFrequency: profile.managementFrequency,
          clinicalReasoningIntensity: profile.clinicalReasoningIntensity,
          difficultyDistribution: {
            EASY: profile.easyShare,
            MEDIUM: profile.mediumShare,
            HARD: profile.hardShare,
            VERY_HARD: profile.veryHardShare,
          },
          distractorPatterns: parseJson(profile.distractorPatterns, z.array(z.string()), []),
          preferredTerminology: parseJson(profile.preferredTerminology, z.array(z.string()), []),
          recurringThemes: parseJson(profile.recurringThemes, z.array(z.string()), []),
        }
      : undefined,
    existingThemes,
    extraInstructions: input.extraInstructions,
  };
}

async function persistQuestions(questions: QuestionInput[], examProfileSlug?: string) {
  const profile = examProfileSlug
    ? await prisma.examProfile.findUnique({ where: { slug: examProfileSlug }, select: { id: true } })
    : null;

  const saved: { id: string; code: string; prompt: string; difficulty: string }[] = [];

  for (const q of questions) {
    const specialty = await prisma.specialty.findUnique({ where: { slug: q.specialtySlug } });
    if (!specialty) continue; // slug inválido: descarta em vez de inventar especialidade
    const topic = q.topicSlug ? await prisma.topic.findUnique({ where: { slug: q.topicSlug } }) : null;

    // Colisão de código é possível; sufixo garante unicidade sem perder a questão.
    const code = (await prisma.question.findUnique({ where: { code: q.code } }))
      ? `${q.code}-${Math.random().toString(36).slice(2, 6)}`
      : q.code;

    const created = await prisma.question.create({
      data: {
        code,
        type: q.type,
        status: "IN_REVIEW",
        sourceType: "AI_GENERATED",
        stem: q.stem,
        prompt: q.prompt,
        difficulty: q.difficulty,
        clinicalReasoningType: q.clinicalReasoningType,
        specialtyId: specialty.id,
        topicId: topic?.id ?? null,
        examProfileId: profile?.id ?? null,
        labData: q.labData.length ? JSON.stringify(q.labData) : null,
        media: q.media.length ? JSON.stringify(q.media) : null,
        guidelineReference: JSON.stringify(q.guidelineReference),
        keywords: JSON.stringify(q.keywords),
        explanation: JSON.stringify(q.explanation),
        rubric: q.rubric ? JSON.stringify(q.rubric) : null,
        alternatives: {
          create: q.alternatives.map((a, i) => ({
            label: a.label,
            text: a.text,
            isCorrect: a.isCorrect,
            rationale: a.rationale,
            order: i,
          })),
        },
        stats: { create: {} },
      },
      select: { id: true, code: true, prompt: true, difficulty: true },
    });

    saved.push(created);
  }

  return saved;
}
