import { requireUser } from "@/lib/auth/session";
import { reviewActionSchema } from "@/lib/domain/schemas";
import { reviewQuestion } from "@/lib/services/questions";
import { fail, handleError, ok, parseBody } from "@/lib/api";

/** Aprovação/rejeição de questões em revisão — restrito a autores/admins. */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (user.role !== "AUTHOR" && user.role !== "ADMIN") {
      return fail("Sem permissão para revisar questões.", 403);
    }

    const { id } = await ctx.params;
    const input = await parseBody(request, reviewActionSchema);

    const updated = await reviewQuestion(id, input.action);
    if (!updated) return fail("Questão não encontrada.", 404);

    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}
