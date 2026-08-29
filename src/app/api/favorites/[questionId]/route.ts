import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { handleError, ok } from "@/lib/api";

export async function PUT(_request: Request, ctx: { params: Promise<{ questionId: string }> }) {
  try {
    const user = await requireUser();
    const { questionId } = await ctx.params;
    await prisma.favorite.upsert({
      where: { userId_questionId: { userId: user.id, questionId } },
      create: { userId: user.id, questionId },
      update: {},
    });
    return ok({ favorited: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ questionId: string }> }) {
  try {
    const user = await requireUser();
    const { questionId } = await ctx.params;
    await prisma.favorite.deleteMany({ where: { userId: user.id, questionId } });
    return ok({ favorited: false });
  } catch (err) {
    return handleError(err);
  }
}
