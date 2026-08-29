import type { QuestionInput } from "@/lib/domain/schemas";
import type {
  AiProvider,
  AiResult,
  DiscursiveGrade,
  DiscursiveGradingContext,
  GenerationContext,
  TutorContext,
} from "./types";

/**
 * Provider offline. Ativo quando não há credencial da Anthropic configurada.
 *
 * Ele **não gera conteúdo médico**. Recusar-se a inventar é o comportamento
 * correto aqui: uma questão clínica plausível-porém-falsa é pior que nenhuma
 * questão. O que ele faz é manter a aplicação inteira funcional (rotas, jobs,
 * UI, testes) e explicar ao usuário o que falta configurar.
 */
export class OfflineProvider implements AiProvider {
  readonly name = "offline";
  readonly available = false;

  async generateQuestions(_ctx: GenerationContext): Promise<AiResult<QuestionInput[]>> {
    throw new AiUnavailableError(
      "A geração de questões exige a camada de IA. Configure ANTHROPIC_API_KEY no ambiente.",
    );
  }

  async tutor(ctx: TutorContext): Promise<AiResult<string>> {
    // O tutor tem um degradê útil: devolve o que o banco já sabe, sem inventar nada.
    const exp = ctx.explanation as Record<string, unknown> | null;
    const lines = [
      "**Tutor de IA indisponível** — `ANTHROPIC_API_KEY` não está configurada.",
      "",
      "Enquanto isso, o que o banco de questões já registra sobre este caso:",
      "",
    ];

    if (exp) {
      if (typeof exp.whyCorrect === "string") lines.push(`**Por que a resposta está certa**\n${exp.whyCorrect}`, "");
      if (Array.isArray(exp.keyClues)) {
        lines.push("**Pistas-chave**", ...exp.keyClues.map((c) => `- ${String(c)}`), "");
      }
      if (typeof exp.clinicalPearl === "string") lines.push(`**Pérola clínica**\n${exp.clinicalPearl}`, "");
      if (typeof exp.commonTrap === "string") lines.push(`**Armadilha comum**\n${exp.commonTrap}`, "");
    }

    if (ctx.action === "WHY_WRONG" && ctx.alternativeLabel) {
      const alt = ctx.alternatives.find((a) => a.label === ctx.alternativeLabel);
      if (alt) lines.push(`**Sobre a alternativa ${alt.label}**\n${alt.rationale}`, "");
    }

    return {
      data: lines.join("\n").trim(),
      usage: { provider: this.name, model: "none", inputTokens: 0, outputTokens: 0 },
    };
  }

  /**
   * Correção discursiva por sobreposição léxica. É um apoio, não uma nota:
   * `overallFeedback` deixa explícito que a conferência final é do estudante.
   */
  async gradeDiscursive(ctx: DiscursiveGradingContext): Promise<AiResult<DiscursiveGrade>> {
    const answer = normalize(ctx.studentAnswer);
    const perCriterion = ctx.subQuestions.flatMap((sq) =>
      sq.criteria.map((c) => {
        const terms = [c.keyPoint, ...extractTerms(c.keyPoint)].map(normalize);
        const hit = terms.some((t) => t.length > 4 && answer.includes(t));
        return {
          keyPoint: c.keyPoint,
          awarded: hit ? c.points : 0,
          possible: c.points,
          comment: hit
            ? "Termo-chave identificado na resposta."
            : "Termo-chave não localizado. Confira se você abordou este ponto com outras palavras.",
        };
      }),
    );

    const score = perCriterion.reduce((s, c) => s + c.awarded, 0);
    return {
      data: {
        score,
        maxScore: ctx.maxScore,
        perCriterion,
        overallFeedback:
          "Correção automática por correspondência de termos (IA indisponível). " +
          "Ela detecta palavras-chave, não raciocínio — compare sua resposta com a resposta-modelo " +
          "e ajuste a nota você mesmo. Configure ANTHROPIC_API_KEY para correção com análise real.",
      },
      usage: { provider: this.name, model: "none", inputTokens: 0, outputTokens: 0 },
    };
  }
}

export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/** Extrai substantivos candidatos de um critério, para casar com sinônimos parciais. */
function extractTerms(keyPoint: string): string[] {
  return keyPoint
    .split(/[\s,;:()/]+/)
    .filter((w) => w.length > 5)
    .slice(0, 6);
}
