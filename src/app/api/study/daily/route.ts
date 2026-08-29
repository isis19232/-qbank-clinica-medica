import { requireUser } from "@/lib/auth/session";
import { dailyPlanSchema } from "@/lib/domain/schemas";
import { buildDailyPlan } from "@/lib/services/study";
import { handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, dailyPlanSchema);
    return ok(
      await buildDailyPlan(user.id, {
        minutes: input.minutes,
        questionCount: input.questionCount,
        specialtySlug: input.specialty,
        examProfileSlug: input.examProfile,
      }),
    );
  } catch (err) {
    return handleError(err);
  }
}
