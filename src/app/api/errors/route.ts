import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { errorTypeUpdateSchema, explanationSchema, parseJson } from "@/lib/domain/schemas";
import { ERROR_TYPE_ADVICE } from "@/lib/engines/error-classifier";
import type { ErrorType } from "@/lib/domain/enums";
import { fail, handleError, ok, parseBody } from "@/lib/api";

/** Caderno de erros: listagem agrupada e reclassificação manual. */

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const showResolved = new URL(request.url).searchParams.get("resolved") === "true";

    const entries = await prisma.errorNotebookEntry.findMany({
      where: { userId: user.id, ...(showResolved ? {} : { resolved: false }) },
      orderBy: [{ occurrences: "desc" }, { updatedAt: "desc" }],
      include: {
        question: {
          select: {
            id: true,
            code: true,
            prompt: true,
            difficulty: true,
            explanation: true,
            specialty: { select: { slug: true, name: true } },
            topic: { select: { slug: true, name: true } },
          },
        },
      },
    });

    const byErrorType = new Map<string, number>();
    for (const e of entries) byErrorType.set(e.errorType, (byErrorType.get(e.errorType) ?? 0) + 1);

    return ok({
      total: entries.length,
      byErrorType: [...byErrorType.entries()]
        .map(([errorType, count]) => ({
          errorType,
          count,
          advice: ERROR_TYPE_ADVICE[errorType as ErrorType] ?? "",
        }))
        .sort((a, b) => b.count - a.count),
      entries: entries.map((e) => ({
        id: e.id,
        questionId: e.question.id,
        code: e.question.code,
        prompt: e.question.prompt,
        difficulty: e.question.difficulty,
        specialty: e.question.specialty,
        topic: e.question.topic,
        selectedLabel: e.selectedLabel,
        correctLabel: e.correctLabel,
        errorType: e.errorType,
        classifiedBy: e.classifiedBy,
        occurrences: e.occurrences,
        resolved: e.resolved,
        note: e.note,
        clinicalPearl: parseJson(e.question.explanation, explanationSchema, null as never)?.clinicalPearl ?? null,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, errorTypeUpdateSchema);

    const entry = await prisma.errorNotebookEntry.findFirst({
      where: { id: input.entryId, userId: user.id },
    });
    if (!entry) return fail("Registro não encontrado.", 404);

    const updated = await prisma.errorNotebookEntry.update({
      where: { id: entry.id },
      data: { errorType: input.errorType, note: input.note ?? entry.note, classifiedBy: "USER" },
    });

    return ok({ id: updated.id, errorType: updated.errorType, classifiedBy: updated.classifiedBy });
  } catch (err) {
    return handleError(err);
  }
}
