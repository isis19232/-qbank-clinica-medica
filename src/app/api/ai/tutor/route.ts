import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getAiProvider } from "@/lib/ai";
import { guidelineRefSchema, parseJson, tutorSchema } from "@/lib/domain/schemas";
import { fail, handleError, ok, parseBody } from "@/lib/api";
import { z } from "zod";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, tutorSchema);

    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
      include: {
        alternatives: { orderBy: { order: "asc" } },
        specialty: { select: { name: true } },
        topic: { select: { name: true } },
      },
    });
    if (!question) return fail("Questão não encontrada.", 404);

    const provider = getAiProvider();
    const { data, usage } = await provider.tutor({
      action: input.action,
      questionStem: question.stem,
      questionPrompt: question.prompt,
      alternatives: question.alternatives.map((a) => ({
        label: a.label,
        text: a.text,
        isCorrect: a.isCorrect,
        rationale: a.rationale,
      })),
      explanation: JSON.parse(question.explanation) as unknown,
      specialtyName: question.specialty.name,
      topicName: question.topic?.name ?? null,
      difficulty: question.difficulty,
      guidelineReference: parseJson(question.guidelineReference, z.array(guidelineRefSchema), []),
      alternativeLabel: input.alternativeLabel,
      userMessage: input.message,
    });

    await prisma.generationJob.create({
      data: {
        userId: user.id,
        kind: "TUTOR",
        status: "SUCCEEDED",
        params: JSON.stringify(input),
        provider: usage.provider,
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        finishedAt: new Date(),
      },
    });

    return ok({ content: data, provider: usage.provider, degraded: usage.provider === "offline" });
  } catch (err) {
    return handleError(err);
  }
}
