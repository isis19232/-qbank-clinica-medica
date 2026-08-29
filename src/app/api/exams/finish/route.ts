import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { finishSimulation } from "@/lib/services/exams";
import { fail, handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { examAttemptId } = await parseBody(request, z.object({ examAttemptId: z.string().min(1) }));
    const result = await finishSimulation(user.id, examAttemptId);
    if (!result) return fail("Tentativa de simulado não encontrada.", 404);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
