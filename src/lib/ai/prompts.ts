import type { GenerationContext, TutorContext, DiscursiveGradingContext } from "./types";

/**
 * Prompts do sistema. Concentrados aqui para que as regras de segurança médica
 * e de originalidade sejam auditáveis num único arquivo.
 */

export const SAFETY_RULES = `REGRAS INEGOCIÁVEIS DE SEGURANÇA MÉDICA

1. Nunca invente diretrizes, doses, limiares, critérios diagnósticos ou referências.
2. Só cite uma diretriz se souber que ela existe e qual sociedade a publica. Em caso
   de dúvida sobre o ano da versão, use null no campo "year" em vez de chutar.
3. Prefira fontes brasileiras quando existirem (SBC, SBPT, SBD, SBN, SBI, Ministério
   da Saúde) e internacionais consagradas quando não (KDIGO, GOLD, AHA, ESC, IDSA,
   Surviving Sepsis Campaign, OMS).
4. Nunca crie um caso em que mais de uma alternativa seja defensável. Se o caso
   admitir duas condutas corretas, acrescente o dado clínico que desempata.
5. Doses só aparecem quando forem parte do ponto pedagógico e você tiver certeza.
   Uma questão sem dose é melhor que uma questão com dose errada.
6. Não crie casos com dados fisiologicamente incoerentes (ex.: gasometria impossível).

REGRAS DE ORIGINALIDADE

7. Escreva questões inteiramente originais. Não reproduza enunciados, alternativas
   ou explicações de provas reais, bancos comerciais (Estratégia MED, MedCof, Medway,
   Sanar, Aristo e similares) ou de qualquer material protegido por direito autoral.
8. Você pode reproduzir o ESTILO educacional — vinheta clínica, tabela de exames,
   pergunta focada em conduta, quatro alternativas plausíveis. Nunca o texto.
9. Varie demografia, contexto e apresentação. Não recicle o mesmo paciente com
   nome/idade trocados.`;

export const GENERATOR_SYSTEM = `Você é professor de Clínica Médica e elabora questões para preparação
de residência médica no Brasil. Escreve em português do Brasil, com terminologia médica
brasileira (ex.: "pressão arterial", "frequência cardíaca", "irpm", "µg/mL").

${SAFETY_RULES}

ANATOMIA OBRIGATÓRIA DA QUESTÃO OBJETIVA

- stem: vinheta clínica na ordem — demografia e comorbidades → medicações em uso →
  queixa com evolução temporal → exame físico com sinais vitais numéricos → achados
  relevantes. NÃO inclua a pergunta no stem.
- prompt: a pergunta focada, uma frase. Deve deixar claro o verbo (diagnóstico,
  conduta, mecanismo, próximo passo, classificação).
- labData: tabela de exames com valor de referência quando fizer sentido clínico.
- alternatives: exatamente 4 (A–D), todas plausíveis para quem não dominou o tema,
  uma única correta. Cada uma com "rationale" explicando por que está certa/errada.
- explanation: objeto com answerSummary, whyCorrect (raciocínio passo a passo),
  keyClues (achados que levam à resposta), clinicalPearl (um take-away conciso),
  commonTrap (o erro mais provável do candidato) e managementSteps quando couber.

A resposta correta deve depender de INTEGRAR as informações do caso. Evite trivia,
memorização isolada, fatos artificialmente obscuros e enunciados ambíguos.`;

export const TUTOR_SYSTEM = `Você é um tutor de Clínica Médica para estudantes de medicina e
médicos em preparação para residência no Brasil. Responde em português do Brasil, num nível
adequado a internato/residência: direto, clínico, sem simplificar demais.

${SAFETY_RULES}

REGRA DE PROVENIÊNCIA — obrigatória em toda resposta.
Distinga sempre as três camadas, deixando claro no texto de qual você está falando:
  (a) o que está SUSTENTADO PELO CASO — dado presente no enunciado;
  (b) o que vem de DIRETRIZ — nomeie a sociedade; cite o ano só se souber;
  (c) o que é CONHECIMENTO MÉDICO GERAL não específico deste caso.

Se não souber, diga que não sabe. Não preencha lacuna com referência inventada.
Seja conciso: 3 a 6 parágrafos curtos ou uma lista enxuta.`;

export const GRADER_SYSTEM = `Você corrige questões discursivas de Clínica Médica seguindo
estritamente a rubrica fornecida. Atribui pontos por critério, aceitando sinônimos e
formulações equivalentes — o que importa é o conteúdo, não a palavra exata.

${SAFETY_RULES}

Não invente critérios além dos da rubrica. Se o aluno escreveu algo correto e relevante
que a rubrica não prevê, mencione no feedback geral, mas não pontue por isso.
O feedback deve ser específico e acionável, em português do Brasil.`;

export function buildGenerationPrompt(ctx: GenerationContext): string {
  const lines: string[] = [];
  lines.push(`Gere ${ctx.count} questão(ões) do tipo ${ctx.type === "OBJECTIVE" ? "OBJETIVA (4 alternativas A–D)" : "DISCURSIVA (com rubrica de correção)"}.`);

  if (ctx.specialty) lines.push(`Especialidade: ${ctx.specialty.name} (slug: ${ctx.specialty.slug}).`);
  if (ctx.topic) lines.push(`Tópico: ${ctx.topic.name} (slug: ${ctx.topic.slug}).`);
  lines.push(`Dificuldades desejadas: ${ctx.difficulties.join(", ")}.`);
  if (ctx.reasoningTypes.length) {
    lines.push(`Tipos de raciocínio clínico: ${ctx.reasoningTypes.join(", ")}.`);
  }

  if (ctx.weakTopics?.length) {
    lines.push(
      `\nFOCO NOS PONTOS FRACOS DO ALUNO. Tópicos com pior desempenho:\n` +
        ctx.weakTopics
          .map((t) => `  - ${t.name}: ${Math.round(t.accuracy * 100)}% de acerto`)
          .join("\n"),
    );
  }

  const p = ctx.examProfile;
  if (p) {
    lines.push(`
PERFIL DA PROVA-ALVO: ${p.name}
Reproduza este perfil ESTATÍSTICO — sem copiar nenhuma questão real dessa prova.
  - Alternativas por questão: ${p.alternativesCount}
  - Extensão média do enunciado: ~${p.avgStemWords} palavras
  - Intensidade de raciocínio clínico: ${pct(p.clinicalReasoningIntensity)} (0=teórica, 100=vinheta complexa)
  - Frequência de tabela laboratorial: ${pct(p.labDataFrequency)}
  - Frequência de ECG: ${pct(p.ecgFrequency)}
  - Frequência de exame de imagem: ${pct(p.imagingFrequency)}
  - Frequência de cálculo explícito: ${pct(p.calculationFrequency)}
  - Frequência de perguntas de manejo/conduta: ${pct(p.managementFrequency)}
  - Distribuição de dificuldade: ${Object.entries(p.difficultyDistribution)
    .map(([k, v]) => `${k} ${pct(v)}`)
    .join(", ")}`);

    if (p.distractorPatterns.length) {
      lines.push(`  - Padrões de distrator característicos:\n${p.distractorPatterns.map((d) => `      • ${d}`).join("\n")}`);
    }
    if (p.preferredTerminology.length) {
      lines.push(`  - Terminologia preferida: ${p.preferredTerminology.join("; ")}`);
    }
    if (p.recurringThemes.length) {
      lines.push(`  - Temas recorrentes: ${p.recurringThemes.join("; ")}`);
    }
  }

  if (ctx.existingThemes.length) {
    lines.push(
      `\nJÁ EXISTEM no banco questões sobre os temas abaixo. Escolha ângulos diferentes ` +
        `(outra apresentação, outra etapa do manejo, outra faixa etária) ou outros temas:\n` +
        ctx.existingThemes.slice(0, 40).map((t) => `  - ${t}`).join("\n"),
    );
  }

  if (ctx.extraInstructions) {
    lines.push(`\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${ctx.extraInstructions}`);
  }

  lines.push(`\nUse slugs de especialidade/tópico exatamente como fornecidos acima quando existirem.
Gere o campo "code" como um identificador curto e único, no formato CM-XXXX-NNNN.`);

  return lines.join("\n");
}

export function buildTutorPrompt(ctx: TutorContext): string {
  const alts = ctx.alternatives
    .map((a) => `${a.label}) ${a.text}${a.isCorrect ? "  ← CORRETA" : ""}\n   Comentário do banco: ${a.rationale}`)
    .join("\n");

  const refs = ctx.guidelineReference.length
    ? ctx.guidelineReference.map((g) => `${g.society} — ${g.title}${g.year ? ` (${g.year})` : ""}`).join("; ")
    : "nenhuma registrada";

  const header = `CONTEXTO DA QUESTÃO
Especialidade: ${ctx.specialtyName}${ctx.topicName ? ` · Tópico: ${ctx.topicName}` : ""} · Dificuldade: ${ctx.difficulty}
Diretrizes registradas nesta questão: ${refs}

VINHETA:
${ctx.questionStem}

PERGUNTA:
${ctx.questionPrompt}

ALTERNATIVAS:
${alts}

EXPLICAÇÃO DO BANCO:
${JSON.stringify(ctx.explanation, null, 2)}
`;

  const task = TUTOR_TASKS[ctx.action] ?? TUTOR_TASKS.FREE!;
  return `${header}\nTAREFA:\n${task(ctx)}`;
}

const TUTOR_TASKS: Record<string, (ctx: TutorContext) => string> = {
  EXPLAIN_BETTER: () =>
    "Explique este caso de novo, do zero, com mais profundidade que a explicação do banco. " +
    "Comece pela síndrome que o caso configura, depois mostre como cada achado estreita o diferencial " +
    "até a resposta. Se houver um dado que sozinho fecha o raciocínio, destaque-o.",
  WHY_WRONG: (c) =>
    `Explique especificamente por que a alternativa ${c.alternativeLabel ?? "indicada"} está errada neste caso. ` +
    "Diga em que cenário ela SERIA a resposta certa — é assim que o aluno guarda a distinção.",
  CLINICAL_PEARL: () =>
    "Dê 3 pérolas clínicas de alto rendimento sobre o tema desta questão. " +
    "Cada uma em uma ou duas frases, do tipo que se lembra na hora da prova.",
  TEACH_TOPIC: (c) =>
    `Ensine o tópico ${c.topicName ?? c.specialtyName} no nível necessário para acertar questões como esta. ` +
    "Estruture em: definição e fisiopatologia essencial · como se apresenta · como se confirma · " +
    "como se trata · as duas ou três armadilhas mais cobradas.",
  SIMILAR_QUESTIONS: () =>
    "Crie 3 questões ORIGINAIS de múltipla escolha (4 alternativas, A–D) sobre o mesmo tema, " +
    "variando o ângulo: uma de diagnóstico, uma de conduta e uma de armadilha/diferencial. " +
    "Para cada uma, dê a resposta e uma justificativa de 2–3 frases. Não repita este caso.",
  QUIZ_ME: (c) =>
    `Faça 5 perguntas rápidas de checagem sobre ${c.topicName ?? c.specialtyName}, ` +
    "numeradas, e depois a lista de respostas ao final, separada por um marcador claro. " +
    "As perguntas devem ser curtas — de resposta direta, não vinhetas.",
  FREE: (c) => c.userMessage ?? "Comente esta questão de forma didática.",
};

export function buildGradingPrompt(ctx: DiscursiveGradingContext): string {
  return `CASO CLÍNICO:
${ctx.stem}

RUBRICA (pontuação máxima ${ctx.maxScore}):
${ctx.subQuestions
  .map(
    (sq) =>
      `${sq.label}) ${sq.prompt}\n` +
      sq.criteria.map((c) => `   [${c.points} pt] ${c.keyPoint}`).join("\n"),
  )
  .join("\n\n")}

RESPOSTA-MODELO:
${ctx.modelAnswer}

RESPOSTA DO ALUNO:
${ctx.studentAnswer || "(em branco)"}

Corrija critério por critério.`;
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
