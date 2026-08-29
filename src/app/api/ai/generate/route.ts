import { requireUser } from "@/lib/auth/session";
import { generateQuestionsSchema } from "@/lib/domain/schemas";
import { generateQuestions } from "@/lib/services/generation";
import { handleError, ok, parseBody } from "@/lib/api";

/** Geração pode levar minutos com raciocínio adaptativo. */
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, generateQuestionsSchema);
    return ok(await generateQuestions(user.id, input), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
