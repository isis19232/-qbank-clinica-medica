import { destroySession } from "@/lib/auth/session";
import { handleError, ok } from "@/lib/api";

export async function POST() {
  try {
    await destroySession();
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
