import { listExamProfiles } from "@/lib/services/xray";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    return ok(await listExamProfiles());
  } catch (err) {
    return handleError(err);
  }
}
