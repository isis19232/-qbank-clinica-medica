import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { UnauthorizedError } from "@/lib/auth/session";
import { AiUnavailableError } from "@/lib/ai";

/** Helpers de resposta e tratamento de erro compartilhados pelas rotas. */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Converte exceções em respostas HTTP. Erros inesperados nunca vazam a
 * mensagem original ao cliente — vão para o log do servidor.
 */
export function handleError(err: unknown) {
  if (err instanceof UnauthorizedError) return fail("Não autenticado.", 401);
  if (err instanceof AiUnavailableError) return fail(err.message, 503);
  if (err instanceof ZodError) {
    return fail("Dados inválidos.", 422, {
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  console.error("[api]", err);
  return fail("Erro interno do servidor.", 500);
}

/** Faz parse do corpo JSON validando contra um schema Zod. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const raw = await request.json().catch(() => {
    throw new Error("Corpo da requisição inválido.");
  });
  return schema.parse(raw);
}

/** Lê query params repetidos como array (ex.: ?difficulty=EASY&difficulty=HARD). */
export function searchParamsToObject(url: string): Record<string, string | string[]> {
  const params = new URL(url).searchParams;
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    out[key] = values.length > 1 ? values : values[0]!;
  }
  return out;
}
