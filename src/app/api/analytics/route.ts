import { requireUser } from "@/lib/auth/session";
import { dashboardData } from "@/lib/services/analytics";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await dashboardData(user.id));
  } catch (err) {
    return handleError(err);
  }
}
