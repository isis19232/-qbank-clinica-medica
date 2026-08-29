import { AnthropicProvider } from "./anthropic-provider";
import { OfflineProvider } from "./offline-provider";
import type { AiProvider } from "./types";

let cached: AiProvider | null = null;

/**
 * Resolve o provider de IA. Sem credencial, cai no provider offline — a
 * aplicação continua inteiramente utilizável, apenas sem geração/tutor por IA.
 */
export function getAiProvider(): AiProvider {
  if (cached) return cached;
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  cached = hasKey ? new AnthropicProvider() : new OfflineProvider();
  return cached;
}

/** Somente para testes. */
export function __setAiProvider(provider: AiProvider | null): void {
  cached = provider;
}

export { AiUnavailableError } from "./offline-provider";
export type { AiProvider } from "./types";
