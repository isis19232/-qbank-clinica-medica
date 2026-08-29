import { requireUser } from "@/lib/auth/session";
import { simulationSchema } from "@/lib/domain/schemas";
import { createSimulation } from "@/lib/services/exams";
import { handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, simulationSchema);
    return ok(await createSimulation(user.id, input), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
