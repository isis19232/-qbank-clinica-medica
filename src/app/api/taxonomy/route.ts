import { getTaxonomy } from "@/lib/services/questions";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    return ok(await getTaxonomy());
  } catch (err) {
    return handleError(err);
  }
}
