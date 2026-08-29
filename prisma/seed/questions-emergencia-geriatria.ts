import type { QuestionInput } from "@/lib/domain/schemas";

/** Questões ORIGINAIS de Emergência, Terapia Intensiva, Geriatria, Paliativos e Farmacologia. */
export const EMERGENCIA_GERIATRIA_QUESTIONS: QuestionInput[] = [
  {
    code: "CM-EMER-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "NEXT_STEP",
    specialtySlug: "emergencia",
    topicSlug: "tromboembolismo",
    subtopicSlug: "tep",
    stem:
      "Mulher de 44 anos, em uso de anticoncepcional oral combinado e tabagista, procura a emergência com dispneia súbita e dor torácica pleurítica à direita iniciadas há 4 horas. Retornou há 3 dias de voo internacional de 11 horas. Nega tosse produtiva, febre ou trauma. Ao exame físico, encontra-se ansiosa, com pressão arterial de 118×74 mmHg, frequência cardíaca de 112 bpm, frequência respiratória de 26 irpm, temperatura de 36,9 °C e saturação de 91% em ar ambiente. A ausculta pulmonar é limpa e simétrica, sem sinais de esforço respiratório importante. As panturrilhas são simétricas, sem empastamento ou dor à palpação.",
    prompt: "Considerando a probabilidade pré-teste e os achados iniciais, a conduta diagnóstica mais adequada é:",
    labData: [
      { exam: "Gasometria arterial — pH", result: "7,48", reference: "7,35–7,45" },
      { exam: "Gasometria arterial — pCO₂", result: "30 mmHg", reference: "35–45 mmHg" },
      { exam: "Gasometria arterial — PaO₂", result: "62 mmHg", reference: "80–100 mmHg" },
      { exam: "Troponina ultrassensível", result: "Dentro do valor de referência", reference: "—" },
      { exam: "Creatinina", result: "0,8 mg/dL", reference: "0,6–1,2 mg/dL" },
    ],
    media: [
      {
        kind: "ECG",
        caption: "ECG de 12 derivações na admissão",
        alt: "Taquicardia sinusal a 112 bpm. Ausência de alterações isquêmicas do segmento ST. Inversão de onda T em V1 a V3.",
      },
      {
        kind: "XRAY",
        caption: "Radiografia de tórax",
        alt: "Campos pulmonares sem consolidações, sem derrame pleural e sem pneumotórax. Área cardíaca normal.",
      },
    ],
    guidelineReference: [
      { society: "European Society of Cardiology", title: "Guidelines for the diagnosis and management of acute pulmonary embolism", year: null },
    ],
    keywords: ["tromboembolismo pulmonar", "escore de Wells", "angiotomografia", "D-dímero"],
    tags: ["escore-risco", "emergencia"],
    explanation: {
      answerSummary: "Solicitar angiotomografia de tórax, dada a alta probabilidade pré-teste.",
      whyCorrect:
        "Aplicando o escore de Wells para tromboembolismo pulmonar, dois itens são atendidos: frequência cardíaca acima de 100 bpm (1,5 ponto) e diagnóstico alternativo menos provável que TEP (3 pontos), somando 4,5 pontos. Pelo modelo dicotômico, escore acima de 4 classifica como TEP provável — e aí a regra muda. Em probabilidade alta, o D-dímero perde utilidade: um resultado negativo não tem valor preditivo suficiente para excluir o diagnóstico e um positivo não acrescenta nada, de modo que o exame só consome tempo. A conduta é ir direto à imagem. A função renal preservada permite o contraste. Todo o restante do quadro é coerente: hipoxemia com hipocapnia e alcalose respiratória, radiografia normal apesar de dispneia importante — a dissociação clássica —, e sobrecarga de câmaras direitas sugerida pela inversão de T em precordiais direitas.",
      keyClues: [
        "Wells de 4,5 pontos: taquicardia acima de 100 bpm e ausência de diagnóstico alternativo mais provável",
        "Fatores de risco somados: anticoncepcional combinado, tabagismo e imobilidade prolongada em voo",
        "Hipoxemia com hipocapnia e alcalose respiratória",
        "Radiografia de tórax normal apesar de dispneia e hipoxemia significativas",
        "Inversão de T em V1–V3, sugestiva de sobrecarga de ventrículo direito",
      ],
      clinicalPearl:
        "O D-dímero serve para excluir TEP em probabilidade baixa ou intermediária. Em probabilidade alta, ele não exclui nada — vá direto para a angiotomografia.",
      commonTrap:
        "Pedir D-dímero em todo paciente com suspeita de TEP. Em probabilidade alta, um resultado negativo cria falsa segurança e atrasa o diagnóstico.",
      managementSteps: [
        "Estratificar a probabilidade pré-teste com escore validado",
        "Angiotomografia de tórax como exame de escolha na probabilidade alta",
        "Considerar anticoagulação empírica se houver previsão de atraso significativo da imagem e risco de sangramento baixo",
        "Após confirmado, estratificar a gravidade com marcadores de disfunção de ventrículo direito",
      ],
    },
    alternatives: [
      { label: "A", text: "Solicitar D-dímero e, se negativo, excluir tromboembolismo pulmonar.", isCorrect: false, rationale: "Estratégia válida apenas em probabilidade baixa ou intermediária. Com Wells de 4,5, um D-dímero negativo não exclui o diagnóstico." },
      { label: "B", text: "Solicitar angiotomografia de tórax.", isCorrect: true, rationale: "Correta. Probabilidade pré-teste alta com função renal preservada indica ir diretamente à imagem confirmatória." },
      { label: "C", text: "Solicitar ultrassonografia Doppler de membros inferiores como primeiro exame.", isCorrect: false, rationale: "Sem sinais clínicos de trombose nos membros, o rendimento é baixo, e um resultado negativo não descarta TEP." },
      { label: "D", text: "Solicitar cintilografia de ventilação-perfusão como exame de primeira escolha.", isCorrect: false, rationale: "É alternativa útil quando há contraindicação ao contraste ou radiografia normal em populações selecionadas, mas não é a primeira escolha com função renal normal e disponibilidade de tomografia." },
    ],
  },
  {
    code: "CM-EMER-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "emergencia",
    topicSlug: "parada-cardiorrespiratoria",
    subtopicSlug: "ritmos-chocaveis",
    stem:
      "Homem de 54 anos apresenta colapso súbito na sala de espera da emergência, presenciado pela equipe. Ao ser avaliado, encontra-se irresponsivo, sem respiração eficaz e sem pulso central palpável. As compressões torácicas de alta qualidade são iniciadas imediatamente e o monitor-desfibrilador é acoplado, mostrando fibrilação ventricular. É realizada desfibrilação com choque bifásico, seguida de retomada imediata das compressões. Após 2 minutos de reanimação, a checagem de ritmo mostra manutenção da fibrilação ventricular, e um segundo choque é aplicado. A adrenalina foi administrada após o segundo choque. Novo ciclo de 2 minutos é completado e a checagem de ritmo revela persistência da fibrilação ventricular. Um terceiro choque é aplicado. O paciente está com via aérea avançada instalada e acesso venoso periférico funcionante.",
    prompt: "Neste momento, a conduta sequencial mais adequada consiste em:",
    labData: [],
    media: [
      {
        kind: "ECG",
        caption: "Traçado do monitor na terceira checagem de ritmo",
        alt: "Atividade elétrica caótica, de amplitude e frequência irregulares, sem complexos QRS identificáveis — padrão de fibrilação ventricular.",
      },
    ],
    guidelineReference: [
      { society: "American Heart Association", title: "Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care", year: null },
      { society: "Sociedade Brasileira de Cardiologia", title: "Diretriz de Ressuscitação Cardiopulmonar e Cuidados Cardiovasculares de Emergência", year: null },
    ],
    keywords: ["fibrilação ventricular refratária", "amiodarona", "ACLS", "causas reversíveis"],
    tags: ["emergencia", "acls"],
    explanation: {
      answerSummary: "Retomar as compressões imediatamente, administrar amiodarona em bolus e manter a busca ativa por causas reversíveis, com adrenalina a cada 3 a 5 minutos.",
      whyCorrect:
        "A fibrilação ventricular que persiste após três choques caracteriza ritmo chocável refratário, e é exatamente nesse ponto que o antiarrítmico entra no algoritmo. A amiodarona é administrada em bolus após o terceiro choque, com possibilidade de uma segunda dose reduzida em novo ciclo refratário; a lidocaína é a alternativa aceitável. Três pontos organizam a conduta e são o que a questão testa. Primeiro, a compressão é retomada imediatamente após cada choque, sem checagem de pulso — a pausa custa pressão de perfusão coronariana. Segundo, a adrenalina segue seu próprio relógio, a cada 3 a 5 minutos, independentemente do antiarrítmico. Terceiro, a busca por causas reversíveis não é etapa final: em fibrilação refratária, hipocalemia, hipomagnesemia, isquemia coronariana aguda e intoxicações precisam ser ativamente considerados durante a reanimação, não depois dela.",
      keyClues: [
        "Fibrilação ventricular persistente após três choques — ritmo chocável refratário",
        "Adrenalina já administrada, mantendo o intervalo de 3 a 5 minutos",
        "Via aérea avançada e acesso venoso já estabelecidos",
        "Parada presenciada com desfibrilação precoce — cenário de melhor prognóstico",
      ],
      clinicalPearl:
        "Antiarrítmico em parada entra na fibrilação ventricular refratária, após o terceiro choque. Antes disso, o que muda desfecho é compressão de qualidade e desfibrilação precoce.",
      commonTrap:
        "Interromper as compressões para checar pulso logo após o choque ou para administrar a medicação. A droga corre com a reanimação em andamento — a pausa é o que se paga caro.",
      managementSteps: [
        "Retomar as compressões imediatamente após cada choque, sem checagem de pulso",
        "Amiodarona em bolus após o terceiro choque, com segunda dose reduzida se persistir",
        "Adrenalina a cada 3 a 5 minutos, em ciclo independente",
        "Investigar ativamente as causas reversíveis durante a reanimação",
        "Minimizar interrupções e revezar o compressor a cada 2 minutos",
      ],
    },
    alternatives: [
      { label: "A", text: "Retomar as compressões, administrar amiodarona em bolus e manter a busca por causas reversíveis, com adrenalina a cada 3 a 5 minutos.", isCorrect: true, rationale: "Correta. Corresponde ao manejo da fibrilação ventricular refratária após o terceiro choque, com retomada imediata das compressões." },
      { label: "B", text: "Interromper as compressões para checar pulso e, se ausente, administrar bicarbonato de sódio em bolus.", isCorrect: false, rationale: "A checagem de pulso pós-choque é desnecessária e prejudicial, e o bicarbonato não tem indicação de rotina em parada." },
      { label: "C", text: "Realizar cardioversão sincronizada e administrar atropina.", isCorrect: false, rationale: "Fibrilação ventricular não permite sincronização, e a atropina não tem papel em ritmos chocáveis." },
      { label: "D", text: "Suspender a adrenalina e administrar apenas amiodarona, para evitar efeito pró-arrítmico aditivo.", isCorrect: false, rationale: "A adrenalina mantém seu intervalo regular durante toda a reanimação; não é suspensa pela introdução do antiarrítmico." },
    ],
  },
  {
    code: "CM-GERI-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "DIFFERENTIAL",
    specialtySlug: "geriatria",
    topicSlug: "delirium",
    stem:
      "Mulher de 83 anos, com hipertensão arterial, osteoartrite e comprometimento cognitivo leve conhecido, é internada há 2 dias no pós-operatório de artroplastia de quadril. A equipe de enfermagem relata que, no início da noite, a paciente ficou agitada, tentando retirar o cateter vesical, sem reconhecer os familiares presentes e com fala desconexa. Pela manhã, encontrava-se sonolenta, mas colaborativa e orientada quanto ao ambiente. Está em uso de morfina para analgesia, dipirona, omeprazol e recebeu escopolamina para cólica abdominal. Ao exame físico, apresenta pressão arterial de 138×80 mmHg, frequência cardíaca de 92 bpm, frequência respiratória de 18 irpm, temperatura de 36,7 °C e saturação de 95% em ar ambiente. O exame neurológico não mostra déficits focais, e a atenção está flutuante ao longo da avaliação. Está com cateter vesical de demora desde o procedimento.",
    prompt: "Considerando a apresentação clínica, o diagnóstico mais provável e a conduta inicial são, respectivamente:",
    labData: [
      { exam: "Hemoglobina", result: "10,2 g/dL", reference: "12,0–16,0 g/dL" },
      { exam: "Leucócitos", result: "9.100/mm³", reference: "4.000–11.000/mm³" },
      { exam: "Sódio", result: "137 mEq/L", reference: "135–145 mEq/L" },
      { exam: "Creatinina", result: "1,0 mg/dL", reference: "0,6–1,2 mg/dL" },
      { exam: "Glicemia", result: "104 mg/dL", reference: "70–99 mg/dL" },
      { exam: "Urina tipo 1", result: "Sem piúria, nitrito negativo", reference: "—" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Geriatria e Gerontologia", title: "Recomendações sobre delirium em idosos hospitalizados", year: null },
    ],
    keywords: ["delirium", "flutuação", "medidas não farmacológicas", "medicamentos anticolinérgicos"],
    tags: ["sindrome-geriatrica"],
    explanation: {
      answerSummary: "Delirium hiperativo-hipoativo misto; identificar e remover os fatores precipitantes, com medidas não farmacológicas como primeira linha.",
      whyCorrect:
        "Os quatro elementos do delirium estão presentes: início agudo, curso flutuante — agitada à noite, sonolenta e orientada pela manhã —, alteração da atenção e desorganização do pensamento. O comprometimento cognitivo leve prévio não é diagnóstico alternativo: é justamente o principal fator predisponente. Os precipitantes estão explicitados no caso e são modificáveis — escopolamina, um anticolinérgico de alto risco em idosos, opioide, cateter vesical de demora, dor e privação de sono no ambiente hospitalar. A conduta de primeira linha é remover essas causas e aplicar medidas não farmacológicas: reorientação, higiene do sono, mobilização precoce, retirada de dispositivos desnecessários, correção sensorial com óculos e aparelho auditivo. Antipsicótico fica reservado para agitação que ameaça a segurança do paciente ou da equipe, em dose mínima e por tempo curto — nunca como primeira medida nem como profilaxia.",
      keyClues: [
        "Início agudo no pós-operatório com curso flutuante ao longo do dia",
        "Atenção flutuante durante a própria avaliação",
        "Uso de escopolamina, anticolinérgico de alto risco em idosos",
        "Cateter vesical de demora e opioide como precipitantes adicionais",
        "Comprometimento cognitivo prévio como fator predisponente",
      ],
      clinicalPearl:
        "Flutuação ao longo do dia é o que separa delirium de demência. Demência não melhora de manhã.",
      commonTrap:
        "Prescrever antipsicótico ou benzodiazepínico para 'acalmar' antes de procurar a causa. Benzodiazepínico piora o delirium, exceto na abstinência alcoólica.",
      managementSteps: [
        "Suspender a escopolamina e revisar todos os medicamentos com carga anticolinérgica",
        "Reavaliar a analgesia — dor mal controlada também precipita delirium",
        "Retirar o cateter vesical assim que possível",
        "Reorientação, mobilização precoce, higiene do sono e correção sensorial",
        "Reservar antipsicótico em dose mínima para agitação com risco de segurança",
      ],
    },
    alternatives: [
      { label: "A", text: "Progressão da demência de base; iniciar inibidor da colinesterase.", isCorrect: false, rationale: "Demência tem curso progressivo em meses a anos, sem flutuação diurna aguda. Inibidor da colinesterase não trata delirium." },
      { label: "B", text: "Delirium; identificar e remover fatores precipitantes, com medidas não farmacológicas como primeira linha.", isCorrect: true, rationale: "Correta. Início agudo, curso flutuante e alteração da atenção definem delirium, e o tratamento começa pela remoção dos precipitantes." },
      { label: "C", text: "Depressão maior de início tardio; iniciar antidepressivo inibidor seletivo da recaptação de serotonina.", isCorrect: false, rationale: "Depressão não cursa com alteração aguda da atenção nem com flutuação diurna desse tipo, e o início é insidioso." },
      { label: "D", text: "Delirium; iniciar benzodiazepínico em dose baixa para controle da agitação noturna.", isCorrect: false, rationale: "O diagnóstico está certo, mas benzodiazepínico agrava o delirium e é reservado à abstinência alcoólica ou a sedativos." },
    ],
  },
  {
    code: "CM-PALI-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "ETHICS_COMMUNICATION",
    specialtySlug: "cuidados-paliativos",
    topicSlug: "dor-oncologica",
    stem:
      "Homem de 71 anos, com câncer de pulmão metastático para osso em progressão após segunda linha de tratamento, é atendido no ambulatório por dor em coluna torácica de intensidade 8 em 10 na escala visual analógica. Está em uso regular de morfina de liberação prolongada 30 mg a cada 12 horas há 3 semanas, com doses de resgate de morfina de liberação imediata que vem utilizando 5 a 6 vezes por dia, com alívio parcial. Refere constipação importante, sem náuseas ou sonolência excessiva. Ao exame físico, encontra-se lúcido e orientado, com pressão arterial de 122×74 mmHg, frequência cardíaca de 84 bpm, frequência respiratória de 16 irpm e saturação de 96% em ar ambiente. A escala de performance de Karnofsky é de 60%. Apresenta dor à percussão de processos espinhosos torácicos, sem déficit motor, sem alteração de reflexos e sem nível sensitivo.",
    prompt: "Considerando os princípios do manejo da dor oncológica, a conduta mais adequada é:",
    labData: [
      { exam: "Creatinina", result: "1,0 mg/dL", reference: "0,7–1,3 mg/dL" },
      { exam: "Cálcio total", result: "9,8 mg/dL", reference: "8,5–10,2 mg/dL" },
      { exam: "Hemoglobina", result: "11,1 g/dL", reference: "13,5–17,5 g/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "Organização Mundial da Saúde", title: "Guidelines for the pharmacological and radiotherapeutic management of cancer pain in adults", year: null },
      { society: "Academia Nacional de Cuidados Paliativos", title: "Manual de cuidados paliativos", year: null },
    ],
    keywords: ["dor oncológica", "titulação de opioide", "dose de resgate", "profilaxia de constipação"],
    tags: ["cuidados-paliativos"],
    explanation: {
      answerSummary: "Aumentar a dose basal de morfina com base no consumo de resgates, ajustar proporcionalmente a dose de resgate e prescrever laxante em esquema regular.",
      whyCorrect:
        "O paciente está com dor mal controlada e usando de 5 a 6 resgates diários — sinal inequívoco de que a dose basal é insuficiente. O princípio da titulação é somar o consumo total de resgates das últimas 24 horas à dose basal e redistribuir o novo total; a dose de resgate é então recalculada como uma fração da nova dose diária, tipicamente entre um sexto e um décimo. Não há teto de dose para a morfina na dor oncológica: o limite é o efeito adverso, e este paciente não tem sedação nem depressão respiratória. O segundo componente da resposta é a constipação, que não é efeito adverso a ser observado — é praticamente universal com opioide e não desenvolve tolerância, de modo que o laxante deve ser prescrito em esquema regular, não conforme necessidade. Vale ainda considerar radioterapia antálgica para metástase óssea localizada e reavaliar o risco de compressão medular, ausente no exame atual.",
      keyClues: [
        "Cinco a seis resgates diários — dose basal claramente subdosada",
        "Dor de 8 em 10 apesar do uso regular de opioide",
        "Ausência de sedação ou depressão respiratória: há margem para titular",
        "Constipação importante sem profilaxia adequada",
        "Exame neurológico sem sinais de compressão medular",
      ],
      clinicalPearl:
        "Conte os resgates: eles são o instrumento de medida da dose basal. E laxante com opioide é prescrição fixa, não 'se necessário' — a constipação não desenvolve tolerância.",
      commonTrap:
        "Trocar de opioide ou associar um segundo opioide antes de titular adequadamente o primeiro. A rotação tem indicações específicas, e dose insuficiente não é uma delas.",
      managementSteps: [
        "Somar o consumo de resgates das últimas 24 horas à dose basal e redistribuir",
        "Recalcular a dose de resgate como um sexto a um décimo da nova dose diária total",
        "Prescrever laxante em esquema regular, com ajuste conforme resposta",
        "Avaliar radioterapia antálgica para a metástase óssea sintomática",
        "Reavaliar dor e efeitos adversos em intervalo curto",
      ],
    },
    alternatives: [
      { label: "A", text: "Manter a dose atual e associar anti-inflamatório não esteroidal em uso contínuo, pelo componente ósseo da dor.", isCorrect: false, rationale: "O anti-inflamatório pode ser adjuvante útil, mas não substitui a titulação do opioide, e o uso contínuo em idoso com neoplasia avançada traz risco gastrointestinal e renal relevante." },
      { label: "B", text: "Aumentar a dose basal de morfina conforme o consumo de resgates, ajustar a dose de resgate e prescrever laxante regular.", isCorrect: true, rationale: "Correta. Titulação guiada pelo consumo de resgates com profilaxia obrigatória da constipação." },
      { label: "C", text: "Suspender a morfina e iniciar metadona em dose fixa, pela suspeita de dor neuropática.", isCorrect: false, rationale: "Não há descrição de dor neuropática, e a rotação para metadona exige indicação específica e conversão cuidadosa — não é o passo diante de dose simplesmente insuficiente." },
      { label: "D", text: "Manter a dose atual pelo risco de depressão respiratória e encaminhar para bloqueio anestésico.", isCorrect: false, rationale: "Não há sinais de toxicidade opioide que justifiquem limitar a titulação, e o bloqueio é medida de exceção após otimização farmacológica adequada." },
    ],
  },
  {
    code: "CM-FARM-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "VERY_HARD",
    clinicalReasoningType: "CONTRAINDICATION",
    specialtySlug: "farmacologia-clinica",
    topicSlug: "interacoes-medicamentosas",
    stem:
      "Homem de 74 anos, com fibrilação atrial permanente em uso de varfarina com INR estável entre 2 e 3 nos últimos 18 meses, hipertensão em uso de anlodipino e dislipidemia em uso de sinvastatina 40 mg, é atendido no pronto-socorro por celulite em perna direita. O plantonista considera iniciar antimicrobiano oral em regime ambulatorial. O paciente refere boa adesão ao tratamento e nega alergias. Ao exame físico, encontra-se em bom estado geral, afebril, com pressão arterial de 132×78 mmHg e frequência cardíaca de 76 bpm. A perna direita apresenta área de eritema quente e dolorosa de cerca de 10 cm, com bordas mal definidas, sem flutuação, sem crepitação e sem necrose. Não há sinais de toxicidade sistêmica.",
    prompt: "Considerando o perfil de interações medicamentosas, a escolha antimicrobiana que exige maior cautela e a razão correspondente são:",
    labData: [
      { exam: "INR", result: "2,4", reference: "2,0–3,0 (alvo terapêutico)" },
      { exam: "Creatinina", result: "1,2 mg/dL", reference: "0,7–1,3 mg/dL" },
      { exam: "Leucócitos", result: "11.800/mm³", reference: "4.000–11.000/mm³" },
      { exam: "TGP (ALT)", result: "32 U/L", reference: "< 41 U/L" },
      { exam: "Creatinoquinase (CK)", result: "128 U/L", reference: "< 190 U/L" },
    ],
    media: [],
    guidelineReference: [
      { society: "Infectious Diseases Society of America", title: "Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections", year: null },
    ],
    keywords: ["sulfametoxazol-trimetoprima", "varfarina", "CYP2C9", "rabdomiólise", "interação medicamentosa"],
    tags: ["farmacologia", "seguranca-medicamentosa"],
    explanation: {
      answerSummary: "Sulfametoxazol-trimetoprima, por inibir o metabolismo da varfarina pelo CYP2C9 e elevar o INR de forma acentuada.",
      whyCorrect:
        "A varfarina é metabolizada principalmente pela isoenzima CYP2C9, e o sulfametoxazol é um inibidor potente dessa via. A combinação está entre as interações mais consistentemente associadas a sangramento em pacientes ambulatoriais, com elevações do INR que aparecem em poucos dias. Some-se a isso o deslocamento da varfarina de sua ligação a proteínas plasmáticas e a redução da flora intestinal produtora de vitamina K, e o efeito é aditivo em três frentes. O paciente reúne todos os agravantes: idade avançada, anticoagulação estável que será perturbada e ausência de monitorização prevista em regime ambulatorial. Há ainda uma segunda interação relevante no caso, com o macrolídeo: claritromicina inibe o CYP3A4 e eleva a exposição à sinvastatina, com risco de rabdomiólise, além de também potencializar a varfarina. Entre as opções, porém, é a sulfametoxazol-trimetoprima que combina a interação de maior magnitude com o desfecho mais grave e imediato.",
      keyClues: [
        "Varfarina com INR estável — qualquer inibidor do CYP2C9 desestabiliza",
        "Sulfametoxazol como inibidor potente do CYP2C9",
        "Mecanismo aditivo: inibição enzimática, deslocamento proteico e redução da vitamina K intestinal",
        "Idade avançada e regime ambulatorial sem monitorização programada",
        "Sinvastatina em uso — alerta paralelo para inibidores do CYP3A4",
      ],
      clinicalPearl:
        "Antes de prescrever antimicrobiano a quem usa varfarina, verifique a via metabólica. Sulfametoxazol-trimetoprima e azólicos inibem o CYP2C9; macrolídeos inibem o CYP3A4 e ainda ameaçam a estatina.",
      commonTrap:
        "Escolher o antimicrobiano apenas pelo espectro e pela via de administração, sem revisar a lista de medicamentos em uso. A interação aparece dias depois, já em casa.",
      managementSteps: [
        "Preferir antimicrobiano com menor potencial de interação para cobertura de estreptococo e estafilococo",
        "Se a sulfametoxazol-trimetoprima for indispensável, programar controle de INR em 3 a 5 dias",
        "Orientar sinais de sangramento e quando retornar imediatamente",
        "Revisar a estatina diante de prescrição de inibidor do CYP3A4",
      ],
    },
    alternatives: [
      { label: "A", text: "Cefalexina, por reduzir a absorção intestinal da varfarina.", isCorrect: false, rationale: "A cefalexina tem baixo potencial de interação com a varfarina e não interfere significativamente em sua absorção." },
      { label: "B", text: "Sulfametoxazol-trimetoprima, por inibir o metabolismo da varfarina pelo CYP2C9 e elevar o INR.", isCorrect: true, rationale: "Correta. É uma das interações mais bem documentadas com a varfarina, por mecanismo aditivo e com risco concreto de sangramento." },
      { label: "C", text: "Clindamicina, por induzir o metabolismo hepático da varfarina e reduzir sua eficácia.", isCorrect: false, rationale: "A clindamicina não é indutora enzimática relevante, e o risco descrito na alternativa está invertido." },
      { label: "D", text: "Amoxicilina com clavulanato, por antagonismo direto sobre os fatores da coagulação vitamina K-dependentes.", isCorrect: false, rationale: "Não existe antagonismo direto. Pode haver leve alteração do INR por efeito sobre a flora intestinal, de magnitude muito menor." },
    ],
  },
  {
    code: "CM-INTE-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "VERY_HARD",
    clinicalReasoningType: "DATA_INTERPRETATION",
    specialtySlug: "terapia-intensiva",
    topicSlug: "ventilacao-mecanica",
    stem:
      "Homem de 48 anos, obeso, internado em terapia intensiva há 3 dias por pneumonia grave, encontra-se em ventilação mecânica invasiva sob sedação e bloqueio neuromuscular. A radiografia de tórax mostra infiltrados alveolares bilaterais difusos, e o ecocardiograma não evidencia disfunção ventricular ou sinais de sobrecarga de volume. Os parâmetros ventilatórios atuais são volume corrente de 520 mL para peso predito de 68 kg, frequência respiratória de 22 irpm, PEEP de 8 cmH₂O e FiO₂ de 0,8. As pressões observadas são pressão de platô de 34 cmH₂O e pressão de pico de 41 cmH₂O.",
    prompt: "Considerando o diagnóstico e a estratégia ventilatória, o ajuste mais adequado é:",
    labData: [
      { exam: "Gasometria arterial — pH", result: "7,31", reference: "7,35–7,45" },
      { exam: "Gasometria arterial — pCO₂", result: "52 mmHg", reference: "35–45 mmHg" },
      { exam: "Gasometria arterial — PaO₂", result: "68 mmHg", reference: "80–100 mmHg" },
      { exam: "Relação PaO₂/FiO₂", result: "85", reference: "> 300" },
      { exam: "Bicarbonato", result: "25 mEq/L", reference: "22–26 mEq/L" },
      { exam: "Lactato arterial", result: "1,8 mmol/L", reference: "< 2,0 mmol/L" },
    ],
    media: [
      {
        kind: "XRAY",
        caption: "Radiografia de tórax em incidência anteroposterior no leito",
        alt: "Infiltrados alveolares bilaterais e difusos, poupando parcialmente os ápices. Sem derrame pleural volumoso. Área cardíaca de dimensões normais.",
      },
    ],
    guidelineReference: [
      { society: "American Thoracic Society / European Society of Intensive Care Medicine / Society of Critical Care Medicine", title: "Clinical Practice Guideline: Mechanical Ventilation in Adult Patients with ARDS", year: null },
      { society: "Associação de Medicina Intensiva Brasileira", title: "Recomendações brasileiras de ventilação mecânica", year: null },
    ],
    keywords: ["SDRA", "ventilação protetora", "volume corrente por peso predito", "pressão de platô", "hipercapnia permissiva"],
    tags: ["terapia-intensiva"],
    explanation: {
      answerSummary: "Reduzir o volume corrente para cerca de 6 mL/kg de peso predito e ajustar a PEEP, tolerando a hipercapnia enquanto o pH permanecer aceitável.",
      whyCorrect:
        "O quadro preenche critérios de síndrome do desconforto respiratório agudo grave: início agudo, infiltrados bilaterais, ausência de origem cardiogênica e relação PaO₂/FiO₂ de 85 com PEEP de pelo menos 5 cmH₂O. O erro na prescrição atual é o volume corrente: 520 mL para peso predito de 68 kg equivale a 7,6 mL/kg, acima do alvo protetor, e a pressão de platô de 34 cmH₂O confirma que essa oferta é excessiva — o limite recomendado é de 30 cmH₂O. A redução para cerca de 6 mL/kg, com ajuste de PEEP conforme a estratégia adotada, é a única intervenção ventilatória com redução consistente de mortalidade na SDRA. A hipercapnia resultante é esperada e aceita: com pH de 7,31 e sem instabilidade hemodinâmica, a hipercapnia permissiva é preferível ao volutrauma. Cabe lembrar que o peso predito se calcula pela altura, não pelo peso real — em obesos, usar o peso aferido leva sistematicamente a volumes lesivos.",
      keyClues: [
        "PaO₂/FiO₂ de 85 com infiltrados bilaterais e sem origem cardiogênica — SDRA grave",
        "Volume corrente de 7,6 mL/kg de peso predito, acima do alvo protetor",
        "Pressão de platô de 34 cmH₂O, acima do limite de 30 cmH₂O",
        "pH de 7,31 sem instabilidade hemodinâmica — hipercapnia tolerável",
        "Obesidade: peso predito deve vir da altura, nunca do peso aferido",
      ],
      clinicalPearl:
        "Em SDRA, o volume corrente se calcula pelo peso predito derivado da altura. Em pacientes obesos, usar o peso real é o erro que transforma ventilação protetora em volutrauma.",
      commonTrap:
        "Corrigir a acidose respiratória aumentando o volume corrente ou a frequência de forma agressiva. A hipercapnia permissiva é parte da estratégia, não uma falha a ser corrigida.",
      managementSteps: [
        "Ajustar o volume corrente para 6 mL/kg de peso predito, com margem de 4 a 8 mL/kg",
        "Manter a pressão de platô abaixo de 30 cmH₂O e a driving pressure em faixa segura",
        "Titular a PEEP conforme a estratégia institucional para SDRA moderada a grave",
        "Tolerar hipercapnia enquanto o pH permanecer acima de aproximadamente 7,20",
        "Considerar posição prona diante de PaO₂/FiO₂ persistentemente abaixo de 150",
      ],
    },
    alternatives: [
      { label: "A", text: "Aumentar o volume corrente para corrigir a acidose respiratória e reduzir a FiO₂.", isCorrect: false, rationale: "Aumentar o volume corrente numa pressão de platô já elevada agrava a lesão induzida pela ventilação. A hipercapnia neste contexto é tolerada." },
      { label: "B", text: "Reduzir o volume corrente para cerca de 6 mL/kg de peso predito e ajustar a PEEP, tolerando a hipercapnia.", isCorrect: true, rationale: "Correta. É a estratégia protetora com benefício de mortalidade estabelecido na SDRA." },
      { label: "C", text: "Manter os parâmetros atuais e iniciar bicarbonato de sódio para corrigir o pH.", isCorrect: false, rationale: "Bicarbonato não corrige a causa, gera mais CO₂ e mantém o paciente sob ventilação lesiva." },
      { label: "D", text: "Reduzir a PEEP para 4 cmH₂O para diminuir a pressão de platô, mantendo o volume corrente atual.", isCorrect: false, rationale: "Reduzir a PEEP na SDRA promove colapso alveolar cíclico e piora a oxigenação. O ajuste correto é no volume corrente." },
    ],
  },
];
