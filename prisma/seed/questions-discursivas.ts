import type { QuestionInput } from "@/lib/domain/schemas";

/**
 * Questões ORIGINAIS discursivas.
 *
 * Estrutura espelhada do formato observado no material de referência: vinheta
 * completa, dois sub-itens (interpretação e conduta/complicação) e rubrica com
 * pontos discretos — sem reproduzir enunciado ou gabarito de prova alguma.
 */
export const DISCURSIVE_QUESTIONS: QuestionInput[] = [
  {
    code: "CM-DISC-0001",
    type: "DISCURSIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "DATA_INTERPRETATION",
    specialtySlug: "nefrologia",
    topicSlug: "disturbios-acido-base",
    stem:
      "Mulher de 38 anos, com lúpus eritematoso sistêmico em uso de hidroxicloroquina e prednisona 10 mg ao dia, procura o ambulatório com fraqueza muscular progressiva há 6 semanas, cãibras e poliúria. Nega vômitos, diarreia ou uso de diuréticos. Relata secura ocular e xerostomia importantes há cerca de dois anos, que atribuía ao lúpus. Ao exame físico, encontra-se em bom estado geral, com pressão arterial de 118×74 mmHg, frequência cardíaca de 82 bpm, frequência respiratória de 16 irpm, mucosas úmidas e sem edema. A força muscular é grau 4 proximal simetricamente em membros superiores e inferiores, com reflexos hipoativos. Não há déficit sensitivo nem sinais de irritação meníngea. O restante do exame não apresenta alterações relevantes.",
    prompt:
      "Analise os achados laboratoriais e responda aos itens A e B.",
    labData: [
      { exam: "pH arterial", result: "7,28", reference: "7,35–7,45" },
      { exam: "pCO₂", result: "31 mmHg", reference: "35–45 mmHg" },
      { exam: "Bicarbonato", result: "14 mEq/L", reference: "22–26 mEq/L" },
      { exam: "Sódio", result: "138 mEq/L", reference: "135–145 mEq/L" },
      { exam: "Potássio", result: "2,6 mEq/L", reference: "3,5–5,0 mEq/L" },
      { exam: "Cloro", result: "116 mEq/L", reference: "98–107 mEq/L" },
      { exam: "Creatinina", result: "1,0 mg/dL", reference: "0,6–1,2 mg/dL" },
      { exam: "pH urinário", result: "6,8 (em vigência de acidemia)", reference: "—" },
      { exam: "Glicose urinária", result: "Ausente", reference: "Ausente" },
      { exam: "Anticorpo anti-Ro/SSA", result: "Positivo", reference: "Negativo" },
    ],
    media: [],
    guidelineReference: [
      { society: "KDIGO", title: "Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease", year: null },
    ],
    keywords: ["acidose tubular renal distal", "ânion gap", "hipocalemia", "síndrome de Sjögren"],
    tags: ["disturbio-acido-base"],
    explanation: {
      answerSummary: "Acidose metabólica hiperclorêmica com ânion gap normal, compatível com acidose tubular renal tipo 1 (distal), provavelmente associada a síndrome de Sjögren.",
      whyCorrect:
        "O ânion gap sérico é 138 − (116 + 14) = 8 mEq/L, dentro da normalidade, o que caracteriza acidose metabólica hiperclorêmica. Entre as causas de ânion gap normal, a perda digestiva de bicarbonato está afastada pela ausência de diarreia. Restam as acidoses tubulares renais, e o dado que define o tipo é o pH urinário de 6,8 em vigência de acidemia sistêmica: um túbulo distal íntegro acidificaria a urina abaixo de 5,5. A incapacidade de fazê-lo caracteriza acidose tubular renal tipo 1. A hipocalemia acentuada é coerente com o tipo 1, e a ausência de glicosúria com função renal normal afasta a síndrome de Fanconi, que acompanharia o tipo 2. O contexto de anti-Ro positivo com secura ocular e oral aponta síndrome de Sjögren como causa subjacente — associação clássica e a mais frequente das acidoses tubulares distais adquiridas do adulto.",
      keyClues: [
        "Ânion gap de 8 mEq/L com cloro de 116 mEq/L",
        "pH urinário de 6,8 apesar de acidemia sistêmica",
        "Hipocalemia de 2,6 mEq/L",
        "Ausência de glicosúria e função renal normal",
        "Anti-Ro positivo com sintomas de secura — Sjögren",
      ],
      clinicalPearl:
        "Em acidose metabólica com ânion gap normal, o pH urinário é o exame que separa o túbulo do intestino. Urina que não acidifica diante de acidemia é acidose tubular renal distal.",
      commonTrap:
        "Repor bicarbonato antes de corrigir o potássio. Na acidose tubular tipo 1, a alcalinização desloca potássio para o intracelular e pode agravar perigosamente uma hipocalemia já grave.",
      managementSteps: [
        "Repor potássio antes de iniciar a alcalinização",
        "Repor álcali com citrato de potássio, que corrige os dois distúrbios simultaneamente",
        "Investigar a causa subjacente com pesquisa de Sjögren",
        "Rastrear nefrocalcinose e nefrolitíase, complicações do tipo 1",
      ],
    },
    alternatives: [],
    rubric: {
      maxScore: 10,
      modelAnswer:
        "A) O ânion gap sérico é 138 − (116 + 14) = 8 mEq/L, portanto normal. Trata-se de acidose metabólica hiperclorêmica com ânion gap normal, parcialmente compensada por hiperventilação (pCO₂ de 31 mmHg, coerente com a compensação esperada). A ausência de diarreia afasta perda gastrointestinal de bicarbonato. O pH urinário de 6,8 em vigência de acidemia demonstra incapacidade de acidificação distal e caracteriza acidose tubular renal tipo 1. A hipocalemia acentuada é compatível, e a ausência de glicosúria com creatinina normal afasta acidose tubular tipo 2 com síndrome de Fanconi. A etiologia mais provável é síndrome de Sjögren, sugerida por xeroftalmia, xerostomia e anti-Ro positivo — a causa adquirida mais comum de acidose tubular distal no adulto.\n\nB) A reposição de potássio deve preceder a alcalinização. Ao corrigir a acidose com bicarbonato ou citrato, o potássio se desloca para o compartimento intracelular, e em uma paciente já com 2,6 mEq/L isso pode precipitar hipocalemia grave, com arritmias e fraqueza da musculatura respiratória. A conduta é repor potássio primeiro e, em seguida, usar preferencialmente citrato de potássio, que corrige simultaneamente a acidose e a depleção de potássio. Deve-se ainda investigar formalmente a síndrome de Sjögren e rastrear nefrocalcinose e nefrolitíase, complicações características do tipo 1.",
      subQuestions: [
        {
          label: "A",
          prompt:
            "Calcule o ânion gap, classifique o distúrbio ácido-base e indique o diagnóstico mais provável, justificando com os achados urinários e a provável causa subjacente.",
          criteria: [
            { keyPoint: "Calcula o ânion gap corretamente como aproximadamente 8 mEq/L", points: 1.5, acceptedTerms: ["ânion gap", "anion gap", "8 mEq/L", "AG normal"] },
            { keyPoint: "Classifica como acidose metabólica hiperclorêmica com ânion gap normal", points: 1.5, acceptedTerms: ["hiperclorêmica", "ânion gap normal", "acidose metabólica"] },
            { keyPoint: "Reconhece a compensação respiratória adequada pela pCO₂ reduzida", points: 1, acceptedTerms: ["compensação respiratória", "hiperventilação", "pCO2 31"] },
            { keyPoint: "Identifica acidose tubular renal tipo 1 (distal) pelo pH urinário inapropriadamente alto", points: 2, acceptedTerms: ["acidose tubular renal tipo 1", "ATR distal", "ATR tipo 1", "pH urinário"] },
            { keyPoint: "Aponta síndrome de Sjögren como causa subjacente provável", points: 1, acceptedTerms: ["Sjögren", "Sjogren", "anti-Ro", "SSA"] },
          ],
        },
        {
          label: "B",
          prompt:
            "Qual a sequência correta de correção dos distúrbios e por que a ordem importa? Cite ainda duas complicações a serem rastreadas.",
          criteria: [
            { keyPoint: "Indica repor potássio antes de iniciar a alcalinização", points: 1.5, acceptedTerms: ["repor potássio", "potássio antes", "corrigir hipocalemia primeiro"] },
            { keyPoint: "Justifica pelo deslocamento intracelular de potássio induzido pela correção da acidose", points: 1, acceptedTerms: ["deslocamento intracelular", "shift", "hipocalemia grave", "arritmia"] },
            { keyPoint: "Cita nefrocalcinose e/ou nefrolitíase como complicações a rastrear", points: 0.5, acceptedTerms: ["nefrocalcinose", "nefrolitíase", "cálculo renal"] },
          ],
        },
      ],
    },
  },
  {
    code: "CM-DISC-0002",
    type: "DISCURSIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "VERY_HARD",
    clinicalReasoningType: "PATHOPHYSIOLOGY",
    specialtySlug: "cardiologia",
    topicSlug: "insuficiencia-cardiaca",
    subtopicSlug: "ic-descompensada",
    stem:
      "Homem de 66 anos, com hipertensão arterial de longa data e diabetes mellitus tipo 2, procura a emergência com dispneia progressiva há 5 dias, hoje aos mínimos esforços, associada a ortopneia e dispneia paroxística noturna. Refere aumento de 4 kg no peso nas últimas duas semanas e edema de membros inferiores. Nega dor torácica, febre ou tosse produtiva. Ao exame físico, encontra-se em regular estado geral, sentado, com pressão arterial de 168×96 mmHg, frequência cardíaca de 104 bpm, frequência respiratória de 28 irpm, temperatura de 36,5 °C e saturação de 90% em ar ambiente. Apresenta turgência jugular a 45 graus, refluxo hepatojugular positivo, estertores crepitantes em ambas as bases pulmonares até terço médio, terceira bulha audível, hepatomegalia dolorosa a 3 cm do rebordo costal e edema de membros inferiores +3/+4, com extremidades quentes e bem perfundidas. O ecocardiograma realizado na emergência mostra fração de ejeção de 34% com hipocinesia difusa.",
    prompt: "Analise o caso e responda aos itens A e B.",
    labData: [
      { exam: "NT-proBNP", result: "4.860 pg/mL", reference: "< 125 pg/mL" },
      { exam: "Troponina ultrassensível", result: "Discretamente elevada, sem curva ascendente", reference: "—" },
      { exam: "Creatinina", result: "1,5 mg/dL (basal 1,2 mg/dL)", reference: "0,7–1,3 mg/dL" },
      { exam: "Sódio", result: "134 mEq/L", reference: "135–145 mEq/L" },
      { exam: "Potássio", result: "4,2 mEq/L", reference: "3,5–5,0 mEq/L" },
      { exam: "Hemoglobina", result: "12,4 g/dL", reference: "13,5–17,5 g/dL" },
      { exam: "Lactato arterial", result: "1,4 mmol/L", reference: "< 2,0 mmol/L" },
    ],
    media: [
      {
        kind: "XRAY",
        caption: "Radiografia de tórax em incidência anteroposterior",
        alt: "Aumento da área cardíaca, redistribuição de fluxo para os ápices, linhas B de Kerley e velamento discreto dos seios costofrênicos bilateralmente.",
      },
    ],
    guidelineReference: [
      { society: "Sociedade Brasileira de Cardiologia", title: "Diretriz Brasileira de Insuficiência Cardíaca Crônica e Aguda", year: null },
      { society: "European Society of Cardiology", title: "Guidelines for the diagnosis and treatment of acute and chronic heart failure", year: null },
    ],
    keywords: ["insuficiência cardíaca descompensada", "perfil hemodinâmico", "quente e úmido", "diurético de alça", "vasodilatador"],
    tags: ["emergencia"],
    explanation: {
      answerSummary: "Insuficiência cardíaca agudamente descompensada, perfil hemodinâmico B (quente e úmido), com tratamento baseado em diurético de alça intravenoso e vasodilatador.",
      whyCorrect:
        "A classificação hemodinâmica à beira do leito organiza a conduta a partir de duas perguntas. A primeira é sobre congestão: ortopneia, dispneia paroxística noturna, turgência jugular, refluxo hepatojugular, terceira bulha, estertores, hepatomegalia e edema respondem inequivocamente que o paciente está úmido. A segunda é sobre perfusão: extremidades quentes e bem perfundidas, pressão arterial elevada, lactato normal e ausência de rebaixamento de consciência indicam que está quente. A combinação define o perfil B, o mais frequente na descompensação. O tratamento decorre diretamente disso: diurético de alça intravenoso para a congestão e vasodilatador para reduzir a pós-carga, aproveitando a pressão arterial elevada. Inotrópico não tem lugar aqui e é potencialmente deletério — ele se destina ao perfil C, com baixo débito, e em paciente bem perfundido aumenta consumo de oxigênio e risco de arritmia sem benefício.",
      keyClues: [
        "Congestão sistêmica e pulmonar completa ao exame físico",
        "Extremidades quentes, pressão arterial elevada e lactato normal — perfusão preservada",
        "NT-proBNP de 4.860 pg/mL",
        "FEVE de 34% com hipocinesia difusa",
        "Troponina discretamente elevada sem curva — sofrimento miocárdico secundário, não infarto",
      ],
      clinicalPearl:
        "Duas perguntas à beira do leito definem o tratamento da IC descompensada: está congesto? está perfundido? Quente e úmido pede diurético e vasodilatador, nunca inotrópico.",
      commonTrap:
        "Prescrever inotrópico para 'ajudar o coração fraco' diante de uma fração de ejeção baixa. A FEVE não determina o perfil hemodinâmico — a perfusão clínica determina.",
      managementSteps: [
        "Diurético de alça intravenoso, em dose ajustada ao uso domiciliar prévio",
        "Vasodilatador para redução da pós-carga, aproveitando a pressão elevada",
        "Oxigênio suplementar e considerar ventilação não invasiva se houver desconforto importante",
        "Monitorar diurese, peso diário, função renal e eletrólitos",
        "Investigar o fator precipitante e otimizar a terapia modificadora após a compensação",
      ],
    },
    alternatives: [],
    rubric: {
      maxScore: 10,
      modelAnswer:
        "A) O paciente apresenta insuficiência cardíaca agudamente descompensada com perfil hemodinâmico B, isto é, quente e úmido. A congestão é demonstrada por ortopneia, dispneia paroxística noturna, turgência jugular a 45 graus, refluxo hepatojugular positivo, terceira bulha, estertores crepitantes bibasais, hepatomegalia dolorosa e edema +3/+4, com NT-proBNP de 4.860 pg/mL e radiografia com congestão pulmonar. A perfusão está preservada, conforme indicam extremidades quentes e bem perfundidas, pressão arterial de 168×96 mmHg, lactato de 1,4 mmol/L e nível de consciência normal. Fisiopatologicamente, a elevação das pressões de enchimento transmite-se ao capilar pulmonar e gera edema intersticial e alveolar; a congestão venosa sistêmica explica a hepatomegalia dolorosa e o edema periférico, e a congestão venosa renal contribui para a elevação da creatinina — mecanismo relevante da síndrome cardiorrenal, em que o principal determinante é a congestão venosa, não apenas a queda do débito.\n\nB) O tratamento consiste em diurético de alça por via intravenosa, com dose orientada pelo uso prévio, associado a vasodilatador para redução da pós-carga, aproveitando a pressão arterial elevada. Devem-se acrescentar oxigênio suplementar e, se houver desconforto respiratório importante, ventilação não invasiva. O inotrópico está contraindicado neste perfil: destina-se ao perfil C, com hipoperfusão, e em paciente quente e bem perfundido aumenta o consumo miocárdico de oxigênio e o risco de arritmia sem benefício demonstrado. A fração de ejeção reduzida não justifica seu uso — quem define a indicação é a perfusão clínica, não a FEVE. Após a compensação, deve-se investigar o fator precipitante e otimizar as quatro classes modificadoras de prognóstico.",
      subQuestions: [
        {
          label: "A",
          prompt:
            "Classifique o perfil hemodinâmico do paciente, justificando com os achados de exame físico, e explique o mecanismo fisiopatológico da congestão e da alteração da função renal.",
          criteria: [
            { keyPoint: "Classifica como perfil B (quente e úmido)", points: 2, acceptedTerms: ["perfil B", "quente e úmido", "quente-úmido"] },
            { keyPoint: "Justifica a congestão com achados específicos do exame físico", points: 1.5, acceptedTerms: ["turgência jugular", "estertores", "terceira bulha", "refluxo hepatojugular", "edema"] },
            { keyPoint: "Justifica a perfusão preservada por extremidades quentes, pressão elevada e lactato normal", points: 1.5, acceptedTerms: ["extremidades quentes", "bem perfundido", "lactato normal", "perfusão preservada"] },
            { keyPoint: "Explica a congestão venosa renal como mecanismo da síndrome cardiorrenal", points: 1, acceptedTerms: ["congestão venosa renal", "síndrome cardiorrenal", "pressão venosa central"] },
          ],
        },
        {
          label: "B",
          prompt:
            "Indique o tratamento inicial correspondente ao perfil identificado e explique por que o inotrópico não está indicado neste caso.",
          criteria: [
            { keyPoint: "Indica diurético de alça intravenoso", points: 1.5, acceptedTerms: ["diurético de alça", "furosemida", "diurético intravenoso"] },
            { keyPoint: "Indica vasodilatador para redução da pós-carga", points: 1, acceptedTerms: ["vasodilatador", "nitrato", "nitroglicerina", "nitroprussiato", "pós-carga"] },
            { keyPoint: "Explica que o inotrópico é reservado ao perfil C, com hipoperfusão", points: 1.5, acceptedTerms: ["perfil C", "hipoperfusão", "baixo débito", "frio e úmido"] },
          ],
        },
      ],
    },
  },
];
