import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getAiProvider } from "@/lib/ai";
import { parseJson, rubricSchema } from "@/lib/domain/schemas";
import { fail, handleError, ok, parseBody } from "@/lib/api";

export const maxDuration = 120;

const schema = z.object({
  questionId: z.string().min(1),
  answer: z.string().max(12000),
});

/** Correção assistida de questão discursiva contra a rubrica cadastrada. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, schema);

    const question = await prisma.question.findUnique({ where: { id: input.questionId } });
    if (!question) return fail("Questão não encontrada.", 404);
    if (question.type !== "DISCURSIVE" || !question.rubric) {
      return fail("Esta questão não é discursiva ou não possui rubrica cadastrada.", 400);
    }

    const rubric = parseJson(question.rubric, rubricSchema, null as never);
    if (!rubric) return fail("Rubrica inválida.", 500);

    const provider = getAiProvider();
    const { data, usage } = await provider.gradeDiscursive({
      stem: question.stem,
      subQuestions: rubric.subQuestions,
      modelAnswer: rubric.modelAnswer,
      maxScore: rubric.maxScore,
      studentAnswer: input.answer,
    });

    await prisma.generationJob.create({
      data: {
        userId: user.id,
        kind: "DISCURSIVE_GRADING",
        status: "SUCCEEDED",
        params: JSON.stringify({ questionId: input.questionId }),
        result: JSON.stringify({ score: data.score, maxScore: data.maxScore }),
        provider: usage.provider,
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        finishedAt: new Date(),
      },
    });

    return ok({
      ...data,
      modelAnswer: rubric.modelAnswer,
      degraded: usage.provider === "offline",
    });
  } catch (err) {
    return handleError(err);
  }
}
