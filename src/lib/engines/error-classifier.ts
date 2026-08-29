import type { Confidence, ErrorType, ReasoningType } from "@/lib/domain/enums";

/**
 * Classificação automática do tipo de erro.
 *
 * Heurística explícita e auditável — o usuário pode sempre sobrescrever no
 * caderno de erros (campo `classifiedBy: USER`). A ideia é acertar o rótulo na
 * maioria dos casos sem gastar chamada de IA, e deixar o ajuste fino para quem
 * viveu o erro.
 */

export interface ErrorSignals {
  reasoningType: ReasoningType;
  confidence: Confidence;
  responseTimeMs: number;
  /** Tempo mediano dos demais usuários nesta questão, se houver. */
  medianTimeMs: number | null;
  /** A alternativa escolhida é a mais escolhida entre quem erra? */
  isDominantDistractor: boolean;
  /** A questão envolve conta explícita (escore, fração, relação). */
  hasCalculation: boolean;
  /** A questão cita diretriz nomeada. */
  hasGuideline: boolean;
  /** Já errou esta mesma questão antes. */
  isRepeatError: boolean;
}

/** Abaixo disso, a leitura da vinheta não pode ter acontecido de fato. */
const RUSHED_MS = 25_000;

export function classifyError(s: ErrorSignals): ErrorType {
  // Ordem importa: as regras mais específicas vêm primeiro.

  // Respondeu rápido demais para uma vinheta longa → leitura apressada.
  if (s.responseTimeMs > 0 && s.responseTimeMs < RUSHED_MS) return "MISREAD_QUESTION";
  if (s.medianTimeMs && s.responseTimeMs > 0 && s.responseTimeMs < s.medianTimeMs * 0.35) {
    return "MISREAD_QUESTION";
  }

  // Errou com convicção numa questão de cálculo → provavelmente a conta.
  if (s.hasCalculation && s.confidence === "CONFIDENT") return "CALCULATION_ERROR";

  // Chute puro → não sabia mesmo.
  if (s.confidence === "GUESS" && !s.isRepeatError) return "KNOWLEDGE_GAP";

  // Caiu no distrator campeão com confiança → armadilha bem construída.
  if (s.isDominantDistractor && s.confidence !== "GUESS") return "DISTRACTOR_CONFUSION";

  // Erro repetido numa questão de diretriz → decorou a versão errada.
  if (s.hasGuideline && s.isRepeatError) return "GUIDELINE_ERROR";

  switch (s.reasoningType) {
    case "DIAGNOSIS":
    case "DIFFERENTIAL":
    case "CLASSIFICATION":
      return "DIAGNOSTIC_REASONING";
    case "INITIAL_MANAGEMENT":
    case "TREATMENT_SELECTION":
    case "NEXT_STEP":
    case "CONTRAINDICATION":
      return s.hasGuideline ? "GUIDELINE_ERROR" : "THERAPEUTIC_REASONING";
    case "DATA_INTERPRETATION":
      return s.hasCalculation ? "CALCULATION_ERROR" : "MISINTERPRETATION";
    case "PATHOPHYSIOLOGY":
      return "KNOWLEDGE_GAP";
    case "ETHICS_COMMUNICATION":
      return "MISINTERPRETATION";
    default:
      return "KNOWLEDGE_GAP";
  }
}

/** Sugestão acionável exibida no caderno de erros. */
export const ERROR_TYPE_ADVICE: Record<ErrorType, string> = {
  KNOWLEDGE_GAP:
    "Volte ao conteúdo antes de resolver mais questões desse tópico. Questão não substitui a primeira leitura.",
  MISINTERPRETATION:
    "Antes de olhar as alternativas, escreva em uma frase o que o caso está mostrando. Só depois compare.",
  DIAGNOSTIC_REASONING:
    "Liste os três diferenciais e o achado que elimina cada um. O erro costuma estar no achado que você ignorou.",
  THERAPEUTIC_REASONING:
    "Separe 'qual é o tratamento' de 'qual é o próximo passo agora'. A prova quase sempre pergunta o segundo.",
  MISREAD_QUESTION:
    "Leia a pergunta antes da vinheta. Sublinhe o verbo: diagnóstico, conduta, mecanismo ou classificação.",
  DISTRACTOR_CONFUSION:
    "Você caiu na alternativa que a maioria erra. Reveja o achado específico que separa ela da correta.",
  CALCULATION_ERROR:
    "Refaça a conta no papel com as unidades explícitas. Confira o valor de referência antes de interpretar.",
  GUIDELINE_ERROR:
    "Confirme a versão da diretriz. Limiares e metas mudam entre edições — anote sociedade e ano.",
};
