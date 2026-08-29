import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { buildAdaptiveBlock } from "@/lib/services/study";
import { handleError, ok, parseBody } from "@/lib/api";

const schema = z.object({
  count: z.number().int().min(1).max(60).default(10),
  specialty: z.string().optional(),
  examProfile: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(request, schema);
    return ok(
      await buildAdaptiveBlock(user.id, input.count, {
        specialtySlug: input.specialty,
        examProfileSlug: input.examProfile,
      }),
    );
  } catch (err) {
    return handleError(err);
  }
}
