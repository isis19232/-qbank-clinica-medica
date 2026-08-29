import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/domain/schemas";
import { fail, handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, registerSchema);
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("Já existe uma conta com este e-mail.", 409);

    const defaultProfile = await prisma.examProfile.findUnique({
      where: { slug: "internato-clinica-medica" },
      select: { id: true },
    });

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name.trim(),
        passwordHash: await hashPassword(body.password),
        targetExamId: defaultProfile?.id ?? null,
      },
    });

    await createSession(user.id, request.headers.get("user-agent") ?? undefined);
    return ok({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
