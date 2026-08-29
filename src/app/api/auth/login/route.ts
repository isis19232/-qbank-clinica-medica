import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/domain/schemas";
import { fail, handleError, ok, parseBody } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, loginSchema);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });

    // Mensagem idêntica para e-mail inexistente e senha errada — não revela
    // quais e-mails têm conta.
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return fail("E-mail ou senha incorretos.", 401);
    }

    await createSession(user.id, request.headers.get("user-agent") ?? undefined);
    return ok({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return handleError(err);
  }
}
