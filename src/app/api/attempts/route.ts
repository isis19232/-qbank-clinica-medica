import { requireUser } from "@/lib/auth/session";
import { answerSchema } from "@/lib/domain/schemas";
import { recordAnswer } from "@/lib/services/attempts";
import { handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, answerSchema);
    return ok(await recordAnswer(user.id, input));
  } catch (err) {
    return handleError(err);
  }
}
