import { getSessionUser } from "@/lib/auth/session";
import { questionFilterSchema } from "@/lib/domain/schemas";
import { listQuestions } from "@/lib/services/questions";
import { handleError, ok, searchParamsToObject } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const raw = searchParamsToObject(request.url);
    const filter = questionFilterSchema.parse({
      ...raw,
      difficulty: raw.difficulty ? [raw.difficulty].flat() : undefined,
      reasoningType: raw.reasoningType ? [raw.reasoningType].flat() : undefined,
      page: raw.page ? Number(raw.page) : 1,
      perPage: raw.perPage ? Number(raw.perPage) : 20,
    });

    const user = await getSessionUser();
    return ok(await listQuestions(filter, user?.id));
  } catch (err) {
    return handleError(err);
  }
}
