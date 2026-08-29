import { examXray } from "@/lib/services/xray";
import { fail, handleError, ok } from "@/lib/api";

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const report = await examXray(slug);
    if (!report) return fail("Perfil de prova não encontrado.", 404);
    return ok(report);
  } catch (err) {
    return handleError(err);
  }
}
