import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { flashcardReviewSchema, flashcardSchema } from "@/lib/domain/schemas";
import { flashcardsFromQuestion, listDueFlashcards, reviewFlashcard } from "@/lib/services/flashcards";
import { fail, handleError, ok, parseBody } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const due = new URL(request.url).searchParams.get("due") !== "false";
    const cards = due
      ? await listDueFlashcards(user.id)
      : await prisma.flashcard.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return ok({ total: cards.length, cards });
  } catch (err) {
    return handleError(err);
  }
}

const createSchema = z.union([
  flashcardSchema,
  z.object({ fromQuestionId: z.string().min(1) }),
]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, createSchema);

    if ("fromQuestionId" in input) {
      const cards = await flashcardsFromQuestion(user.id, input.fromQuestionId);
      return ok({ created: cards.length, cards }, { status: 201 });
    }

    const card = await prisma.flashcard.create({
      data: {
        userId: user.id,
        front: input.front,
        back: input.back,
        topicLabel: input.topicLabel ?? null,
        difficulty: input.difficulty,
        questionId: input.questionId ?? null,
        source: input.source,
      },
    });
    return ok({ created: 1, cards: [card] }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, flashcardReviewSchema);
    const card = await reviewFlashcard(user.id, input.id, input.grade);
    if (!card) return fail("Flashcard não encontrado.", 404);
    return ok(card);
  } catch (err) {
    return handleError(err);
  }
}
