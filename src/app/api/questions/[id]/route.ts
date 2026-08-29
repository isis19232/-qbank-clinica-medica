import { getSessionUser } from "@/lib/auth/session";
import { getQuestion } from "@/lib/services/questions";
import { fail, handleError, ok } from "@/lib/api";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const user = await getSessionUser();
    const question = await getQuestion(id, user?.id);
    if (!question) return fail("Questão não encontrada.", 404);

    // Sem sessão, a resposta correta e as justificativas não são expostas —
    // caso contrário bastaria abrir a API para ver o gabarito.
    if (!user) {
      return ok({
        ...question,
        alternatives: question.alternatives.map((a) => ({
          id: a.id,
          label: a.label,
          text: a.text,
          isCorrect: false,
          rationale: "",
        })),
        explanation: null,
        rubric: null,
      });
    }

    return ok(question);
  } catch (err) {
    return handleError(err);
  }
}
