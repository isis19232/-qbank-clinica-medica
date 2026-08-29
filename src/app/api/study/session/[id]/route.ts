import { requireUser } from "@/lib/auth/session";
import { studySessionSummary } from "@/lib/services/study";
import { fail, handleError, ok } from "@/lib/api";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const summary = await studySessionSummary(user.id, id);
    if (!summary) return fail("Sessão de estudo não encontrada.", 404);
    return ok(summary);
  } catch (err) {
    return handleError(err);
  }
}
