import type { QuestionInput } from "@/lib/domain/schemas";

/** Questões ORIGINAIS de Neurologia, Nefrologia e Endocrinologia. */
export const NEURO_NEFRO_ENDO_QUESTIONS: QuestionInput[] = [
  {
    code: "CM-NEUR-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "NEXT_STEP",
    specialtySlug: "neurologia",
    topicSlug: "avc",
    subtopicSlug: "avc-isquemico",
    stem:
      "Homem de 68 anos, hipertenso e com fibrilação atrial em uso irregular de anticoagulante oral, é trazido pelo SAMU com hemiparesia direita e afasia de expressão. A esposa informa que ele estava assintomático ao deitar-se às 22h30 e foi encontrado com o déficit às 6h00, ao acordar. São 7h20 no momento da avaliação. Ao exame físico, encontra-se alerta, com pressão arterial de 178×96 mmHg, frequência cardíaca de 92 bpm irregular, frequência respiratória de 18 irpm, saturação de 97% em ar ambiente e glicemia capilar de 118 mg/dL. Apresenta desvio do olhar conjugado para a esquerda, apagamento do sulco nasolabial direito, força grau 2 em membros direitos e afasia de expressão. NIHSS de 14. A tomografia de crânio sem contraste não evidencia hemorragia nem hipodensidade estabelecida (ASPECTS 9).",
    prompt: "Considerando o horário indeterminado de início dos sintomas, a conduta mais adequada é:",
    labData: [
      { exam: "Glicemia capilar", result: "118 mg/dL", reference: "70–99 mg/dL (jejum)" },
      { exam: "INR", result: "1,1", reference: "< 1,2" },
      { exam: "Plaquetas", result: "196.000/mm³", reference: "150.000–450.000/mm³" },
      { exam: "Creatinina", result: "1,1 mg/dL", reference: "0,7–1,3 mg/dL" },
    ],
    media: [
      {
        kind: "CT",
        caption: "Tomografia de crânio sem contraste na admissão",
        alt: "Ausência de sangramento intracraniano. Sem hipodensidade estabelecida em território de artéria cerebral média esquerda. ASPECTS 9. Sinal da artéria cerebral média hiperdensa à esquerda.",
      },
    ],
    guidelineReference: [
      { society: "American Heart Association / American Stroke Association", title: "Guidelines for the Early Management of Patients With Acute Ischemic Stroke", year: null },
      { society: "Sociedade Brasileira de Doenças Cerebrovasculares", title: "Diretrizes para o tratamento do AVC isquêmico agudo", year: null },
    ],
    keywords: ["AVC de horário indeterminado", "wake-up stroke", "trombectomia mecânica", "mismatch", "NIHSS"],
    tags: ["emergencia", "neuroimagem"],
    explanation: {
      answerSummary: "Realizar neuroimagem avançada (angiotomografia com estudo de perfusão ou ressonância com difusão e FLAIR) para selecionar reperfusão.",
      whyCorrect:
        "O último horário em que o paciente foi visto bem é 22h30, o que coloca a janela cronológica em quase 9 horas — fora do intervalo em que a trombólise é indicada apenas pelo relógio. Mas 'fora da janela pelo tempo' não é o mesmo que 'sem indicação de reperfusão'. Em AVC de horário indeterminado, a seleção deixa de ser cronológica e passa a ser tecidual: a decisão depende de demonstrar tecido isquêmico ainda viável. A tomografia simples com ASPECTS 9 e o sinal da artéria cerebral média hiperdensa indicam oclusão de grande vaso com pouco core estabelecido — exatamente o perfil que se beneficia de trombectomia mecânica, cuja janela se estende até 24 horas em pacientes selecionados por imagem. O passo imediato, portanto, é a neuroimagem que permite essa seleção.",
      keyClues: [
        "Último horário visto bem às 22h30 — janela cronológica excedida",
        "NIHSS 14 com desvio conjugado do olhar e afasia — sugere oclusão de grande vaso",
        "ASPECTS 9: core isquêmico ainda pequeno",
        "Sinal da artéria cerebral média hiperdensa",
        "Fibrilação atrial com anticoagulação irregular — mecanismo cardioembólico provável",
      ],
      clinicalPearl:
        "No AVC ao despertar, o relógio começa no último horário em que o paciente foi visto bem, não na hora em que acordou. E relógio fora da janela não fecha a porta: a imagem de perfusão reabre a decisão até 24 horas.",
      commonTrap:
        "Descartar qualquer reperfusão só porque o horário de início é desconhecido, e mandar o paciente para a enfermaria com antiagregante. Perde-se a chance de trombectomia em um caso com core pequeno e grande vaso ocluído.",
      managementSteps: [
        "Manter pressão arterial abaixo de 185×110 mmHg se a reperfusão for cogitada",
        "Angiotomografia de crânio e vasos cervicais com estudo de perfusão, ou RM com difusão e FLAIR",
        "Acionar o serviço de neurointervenção diante de oclusão de grande vaso com mismatch favorável",
        "Não iniciar antiagregante antes de definida a estratégia de reperfusão",
      ],
    },
    alternatives: [
      { label: "A", text: "Iniciar trombólise endovenosa imediatamente, contando a janela a partir do horário em que acordou.", isCorrect: false, rationale: "A janela conta do último horário visto bem, não do despertar. Trombolisar sem seleção por imagem neste cenário expõe a risco hemorrágico sem benefício demonstrado." },
      { label: "B", text: "Realizar neuroimagem avançada com estudo de perfusão ou RM com difusão e FLAIR para selecionar reperfusão.", isCorrect: true, rationale: "Correta. Com horário indeterminado, a seleção passa a ser tecidual, e o perfil clínico-radiológico sugere oclusão de grande vaso com core pequeno." },
      { label: "C", text: "Iniciar ácido acetilsalicílico e encaminhar à enfermaria, pois a janela terapêutica foi perdida.", isCorrect: false, rationale: "Abandona precocemente a possibilidade de trombectomia, que se estende até 24 horas em pacientes selecionados por imagem." },
      { label: "D", text: "Reintroduzir imediatamente o anticoagulante oral em dose plena para prevenir novo evento cardioembólico.", isCorrect: false, rationale: "Anticoagulação plena na fase hiperaguda do AVC isquêmico extenso aumenta o risco de transformação hemorrágica e não é conduta inicial." },
    ],
  },
  {
    code: "CM-NEUR-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "DIAGNOSIS",
    specialtySlug: "neurologia",
    topicSlug: "infeccoes-snc",
    subtopicSlug: "meningites",
    stem:
      "Mulher de 34 anos, previamente hígida, procura a emergência com cefaleia holocraniana intensa, febre de 39 °C e vômitos há 18 horas. Ao exame físico, encontra-se sonolenta, porém despertável e orientada quando estimulada, com pressão arterial de 108×64 mmHg, frequência cardíaca de 112 bpm, frequência respiratória de 22 irpm e saturação de 97% em ar ambiente. Apresenta rigidez de nuca evidente, sinal de Brudzinski positivo, pupilas isocóricas e fotorreagentes, sem déficits focais. Observam-se lesões petequiais esparsas em tronco e membros inferiores, surgidas nas últimas horas. A punção lombar foi realizada e os resultados constam abaixo.",
    prompt: "Considerando o quadro clínico e a análise do líquido cefalorraquidiano, o diagnóstico mais provável é:",
    labData: [
      { exam: "Aspecto do líquor", result: "Turvo", reference: "Límpido" },
      { exam: "Celularidade", result: "2.800 células/mm³", reference: "< 5 células/mm³" },
      { exam: "Predomínio celular", result: "94% neutrófilos", reference: "—" },
      { exam: "Proteínas no líquor", result: "210 mg/dL", reference: "15–45 mg/dL" },
      { exam: "Glicose no líquor", result: "18 mg/dL", reference: "50–80 mg/dL (glicemia 104)" },
      { exam: "Lactato no líquor", result: "6,8 mmol/L", reference: "< 3,5 mmol/L" },
    ],
    media: [],
    guidelineReference: [
      { society: "Ministério da Saúde", title: "Guia de Vigilância em Saúde — meningites", year: null },
      { society: "Infectious Diseases Society of America", title: "Practice Guidelines for the Management of Bacterial Meningitis", year: null },
    ],
    keywords: ["meningite bacteriana", "meningococcemia", "petéquias", "hipoglicorraquia"],
    tags: ["emergencia", "notificacao-compulsoria"],
    explanation: {
      answerSummary: "Meningite bacteriana, com forte suspeita de etiologia meningocócica.",
      whyCorrect:
        "O líquor tem a assinatura completa de meningite bacteriana: pleocitose intensa com predomínio neutrofílico, proteína muito elevada, hipoglicorraquia acentuada e lactato alto. A combinação desses quatro achados torna etiologia viral improvável. O que aponta especificamente para Neisseria meningitidis é o exantema petequial de instalação rápida em paciente jovem previamente hígida — a púrpura da meningococcemia. O reconhecimento tem consequência imediata: além do antimicrobiano, exige notificação compulsória e quimioprofilaxia dos contatos próximos.",
      keyClues: [
        "Pleocitose de 2.800 células/mm³ com 94% de neutrófilos",
        "Glicose no líquor de 18 mg/dL com glicemia de 104 mg/dL — relação muito reduzida",
        "Proteína de 210 mg/dL e lactato de 6,8 mmol/L",
        "Petéquias de surgimento agudo em tronco e membros",
      ],
      clinicalPearl:
        "Meningite com petéquias em adulto jovem é meningococo até prova em contrário. O diagnóstico não termina no antibiótico: notificação e quimioprofilaxia dos contatos fazem parte da conduta.",
      commonTrap:
        "Atrasar a primeira dose do antimicrobiano aguardando resultado de exames ou tomografia. Em meningite bacteriana, cada hora de atraso piora o desfecho — colhe-se hemocultura e trata-se empiricamente.",
      managementSteps: [
        "Antibioticoterapia empírica imediata, sem aguardar resultado de cultura",
        "Dexametasona conforme protocolo institucional, idealmente antes ou junto à primeira dose",
        "Isolamento respiratório por gotículas nas primeiras 24 horas de tratamento",
        "Notificação compulsória imediata e quimioprofilaxia dos contatos próximos",
      ],
    },
    alternatives: [
      { label: "A", text: "Meningite viral.", isCorrect: false, rationale: "Cursa com pleocitose linfocitária, glicose normal e proteína pouco elevada. Nada disso se aplica aqui." },
      { label: "B", text: "Meningite bacteriana, provavelmente meningocócica.", isCorrect: true, rationale: "Correta. Líquor purulento com hipoglicorraquia acentuada e exantema petequial agudo em jovem previamente hígida." },
      { label: "C", text: "Meningite tuberculosa.", isCorrect: false, rationale: "Tem curso subagudo, líquor com predomínio linfocitário e hipoglicorraquia mais moderada. Não explica as petéquias." },
      { label: "D", text: "Hemorragia subaracnóidea.", isCorrect: false, rationale: "Cursa com líquor hemorrágico ou xantocrômico, sem pleocitose neutrofílica intensa nem hipoglicorraquia, e não explica febre alta com petéquias." },
    ],
  },
  {
    code: "CM-NEFR-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "DIAGNOSIS",
    specialtySlug: "nefrologia",
    topicSlug: "injuria-renal-aguda",
    subtopicSlug: "nefrite-intersticial",
    stem:
      "Homem de 61 anos, internado há 12 dias por osteomielite de calcâneo em uso de oxacilina intravenosa, é avaliado por elevação progressiva da creatinina notada nos últimos 4 dias. Refere-se assintomático do ponto de vista urinário, com diurese preservada e sem dor lombar. Não houve episódios de hipotensão, sangramento ou uso de contraste iodado durante a internação. Ao exame físico, encontra-se em bom estado geral, afebril nas últimas 24 horas, com pressão arterial de 132×80 mmHg, frequência cardíaca de 84 bpm, mucosas úmidas, turgor cutâneo preservado e sem edema. Observa-se exantema maculopapular discreto em tronco, surgido há 3 dias, que o paciente atribuía a calor.",
    prompt: "Considerando o contexto clínico e os achados laboratoriais, o mecanismo mais provável da injúria renal aguda é:",
    labData: [
      { exam: "Creatinina", result: "2,8 mg/dL (basal 0,9 mg/dL)", reference: "0,7–1,3 mg/dL" },
      { exam: "Ureia", result: "72 mg/dL", reference: "10–50 mg/dL" },
      { exam: "Sódio urinário", result: "58 mEq/L", reference: "—" },
      { exam: "Fração de excreção de sódio", result: "2,4%", reference: "1–2%" },
      { exam: "Urina tipo 1", result: "Leucocitúria sem bacteriúria; cilindros leucocitários; proteinúria discreta", reference: "—" },
      { exam: "Eosinófilos no sangue periférico", result: "8%", reference: "1–4%" },
      { exam: "Urocultura", result: "Negativa", reference: "—" },
    ],
    media: [],
    guidelineReference: [
      { society: "KDIGO", title: "Clinical Practice Guideline for Acute Kidney Injury", year: null },
    ],
    keywords: ["nefrite intersticial aguda", "reação medicamentosa", "cilindros leucocitários", "eosinofilia"],
    tags: ["farmacologia"],
    explanation: {
      answerSummary: "Nefrite intersticial aguda induzida por medicamento.",
      whyCorrect:
        "A tríade clássica não precisa estar completa, mas aqui vêm três peças convergentes: exposição a um fármaco reconhecidamente associado (penicilina semissintética), exantema maculopapular e eosinofilia periférica. O sedimento urinário fecha o raciocínio — leucocitúria estéril com cilindros leucocitários indica inflamação do interstício, não infecção nem lesão glomerular. A fração de excreção de sódio de 2,4% e o sódio urinário de 58 mEq/L afastam causa pré-renal, na qual o rim retém sódio avidamente. E não há evento isquêmico, nefrotóxico ou obstrutivo que sustente necrose tubular aguda. O intervalo de 7 a 10 dias entre o início do antimicrobiano e a alta da creatinina é o padrão temporal esperado.",
      keyClues: [
        "Leucocitúria estéril com cilindros leucocitários e urocultura negativa",
        "Exantema maculopapular surgido durante a antibioticoterapia",
        "Eosinofilia periférica de 8%",
        "FeNa de 2,4% e sódio urinário de 58 mEq/L — padrão não pré-renal",
        "Ausência de hipotensão, sangramento ou exposição a contraste",
      ],
      clinicalPearl:
        "Leucocitúria com urocultura negativa em paciente sob antibiótico deve levantar nefrite intersticial antes de fazer pensar em ITU tratada. Cilindro leucocitário localiza a inflamação no rim.",
      commonTrap:
        "Interpretar a leucocitúria como infecção urinária e ampliar o antimicrobiano — o que mantém, ou piora, exatamente o agente causal.",
      managementSteps: [
        "Suspender o fármaco suspeito, medida terapêutica central",
        "Revisar toda a prescrição em busca de outros nefrotóxicos",
        "Monitorar creatinina e diurese após a suspensão",
        "Considerar corticoterapia e biópsia renal se não houver recuperação após a retirada do agente",
      ],
    },
    alternatives: [
      { label: "A", text: "Injúria renal aguda pré-renal por hipoperfusão.", isCorrect: false, rationale: "Incompatível com FeNa de 2,4% e sódio urinário de 58 mEq/L; além disso, o paciente está euvolêmico e não houve instabilidade hemodinâmica." },
      { label: "B", text: "Necrose tubular aguda isquêmica.", isCorrect: false, rationale: "Exigiria um insulto hipotensivo ou nefrotóxico, e cursaria com cilindros granulosos pigmentares, não leucocitários com eosinofilia e exantema." },
      { label: "C", text: "Nefrite intersticial aguda induzida por medicamento.", isCorrect: true, rationale: "Correta. Exposição farmacológica compatível, exantema, eosinofilia e leucocitúria estéril com cilindros leucocitários." },
      { label: "D", text: "Glomerulonefrite rapidamente progressiva.", isCorrect: false, rationale: "Cursaria com sedimento nefrítico — hematúria dismórfica e cilindros hemáticos — e proteinúria significativa, ausentes neste caso." },
    ],
  },
  {
    code: "CM-NEFR-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "VERY_HARD",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "nefrologia",
    topicSlug: "disturbios-hidroeletroliticos",
    subtopicSlug: "hiponatremia",
    stem:
      "Mulher de 76 anos, com hipertensão arterial em uso de hidroclorotiazida, é levada à emergência por familiares com confusão mental progressiva há 2 dias e um episódio de crise convulsiva tônico-clônica generalizada presenciado há 40 minutos, já resolvido. Os familiares relatam que ela vinha se queixando de náuseas e fraqueza há cerca de uma semana, sem vômitos ou diarreia. Ao exame físico, encontra-se sonolenta, respondendo apenas a estímulo vigoroso, com pressão arterial de 138×82 mmHg, frequência cardíaca de 88 bpm, frequência respiratória de 16 irpm e saturação de 96% em ar ambiente. Mucosas úmidas, turgor cutâneo preservado, sem edema periférico e sem turgência jugular. Pupilas isocóricas e fotorreagentes, sem déficits focais.",
    prompt: "Considerando o quadro clínico e os achados laboratoriais, a conduta inicial mais adequada é:",
    labData: [
      { exam: "Sódio sérico", result: "112 mEq/L", reference: "135–145 mEq/L" },
      { exam: "Potássio", result: "3,4 mEq/L", reference: "3,5–5,0 mEq/L" },
      { exam: "Osmolalidade sérica", result: "238 mOsm/kg", reference: "275–295 mOsm/kg" },
      { exam: "Osmolalidade urinária", result: "480 mOsm/kg", reference: "—" },
      { exam: "Sódio urinário", result: "62 mEq/L", reference: "—" },
      { exam: "Glicemia", result: "96 mg/dL", reference: "70–99 mg/dL" },
      { exam: "TSH", result: "2,1 mUI/L", reference: "0,4–4,5 mUI/L" },
      { exam: "Cortisol matinal", result: "16 µg/dL", reference: "7–25 µg/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "European Society of Endocrinology / ERA-EDTA / ESICM", title: "Clinical practice guideline on diagnosis and treatment of hyponatraemia", year: null },
    ],
    keywords: ["hiponatremia grave sintomática", "salina hipertônica", "síndrome de desmielinização osmótica", "tiazídico"],
    tags: ["emergencia", "correcao-eletrolitica"],
    explanation: {
      answerSummary: "Salina hipertônica a 3% em bolus, com alvo de elevar o sódio em 4 a 6 mEq/L nas primeiras horas e limite de 8 mEq/L em 24 horas.",
      whyCorrect:
        "Há hiponatremia hipotônica grave — sódio de 112 mEq/L com osmolalidade sérica de 238 mOsm/kg — e, o que define a urgência, sintomas neurológicos graves: convulsão e rebaixamento do nível de consciência. Nessa situação a conduta independe da causa e da volemia: salina hipertônica em bolus, para reduzir rapidamente o edema cerebral. O objetivo do bolus não é normalizar o sódio, e sim tirar a paciente da zona de risco de herniação — uma elevação de 4 a 6 mEq/L costuma cessar as convulsões. O limite absoluto é não ultrapassar 8 mEq/L em 24 horas, sob pena de síndrome de desmielinização osmótica, risco aumentado nesta paciente por idade avançada, hipocalemia e uso de tiazídico. Investigar a etiologia — provável combinação de tiazídico com SIADH, dada a urina concentrada em contexto hipotônico — é obrigatório, mas em paralelo, nunca antes.",
      keyClues: [
        "Sódio de 112 mEq/L com osmolalidade sérica de 238 mOsm/kg — hiponatremia hipotônica verdadeira",
        "Convulsão e rebaixamento de consciência: sintomatologia neurológica grave",
        "Osmolalidade urinária de 480 mOsm/kg — urina inapropriadamente concentrada",
        "Euvolemia clínica; TSH e cortisol normais afastam causas endócrinas",
        "Uso de tiazídico, hipocalemia e idade avançada: fatores de risco para desmielinização osmótica",
      ],
      clinicalPearl:
        "Hiponatremia com convulsão é emergência, e o bolus de salina hipertônica vem antes de qualquer investigação etiológica. Mas o teto de 8 mEq/L em 24 horas continua valendo — corrigir rápido demais troca uma emergência por uma sequela irreversível.",
      commonTrap:
        "Corrigir de forma agressiva e sustentada até normalizar o sódio, ultrapassando o limite diário. Também é erro comum usar salina isotônica em paciente com urina muito concentrada: ela pode paradoxalmente agravar a hiponatremia.",
      managementSteps: [
        "Bolus de salina hipertônica a 3%, repetível conforme resposta neurológica",
        "Sódio sérico seriado a cada 2 a 4 horas nas primeiras horas",
        "Elevação alvo de 4 a 6 mEq/L nas primeiras horas; teto de 8 mEq/L em 24 horas",
        "Suspender o tiazídico e repor potássio, cuja correção também eleva o sódio",
        "Investigar SIADH e demais causas após a estabilização neurológica",
      ],
    },
    alternatives: [
      { label: "A", text: "Restrição hídrica isolada, com reavaliação do sódio em 24 horas.", isCorrect: false, rationale: "Estratégia adequada à hiponatremia crônica assintomática, mas lenta demais diante de convulsão e rebaixamento de consciência." },
      { label: "B", text: "Infusão contínua de salina isotônica a 0,9% até normalização do sódio.", isCorrect: false, rationale: "Não corrige com rapidez suficiente e, com urina fortemente concentrada, pode agravar a hiponatremia por retenção de água livre." },
      { label: "C", text: "Salina hipertônica a 3% em bolus, com alvo de 4 a 6 mEq/L nas primeiras horas e teto de 8 mEq/L em 24 horas.", isCorrect: true, rationale: "Correta. Hiponatremia grave com sintomas neurológicos exige correção rápida inicial, respeitando o limite diário que previne desmielinização osmótica." },
      { label: "D", text: "Furosemida intravenosa associada a reposição de potássio, sem uso de solução hipertônica.", isCorrect: false, rationale: "Furosemida é adjuvante em cenários selecionados, não terapia inicial da hiponatremia sintomática grave, e sozinha não eleva o sódio com a rapidez necessária." },
    ],
  },
  {
    code: "CM-ENDO-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "endocrinologia",
    topicSlug: "diabetes",
    subtopicSlug: "cetoacidose",
    stem:
      "Homem de 23 anos, com diabetes mellitus tipo 1 diagnosticado aos 14 anos, é levado à emergência com náuseas, vômitos e dor abdominal difusa há 12 horas. Relata que interrompeu a insulina há 2 dias por dificuldade de acesso à medicação. Ao exame físico, encontra-se desidratado, com pressão arterial de 100×62 mmHg, frequência cardíaca de 118 bpm, frequência respiratória de 28 irpm com padrão profundo e regular, temperatura de 36,8 °C e saturação de 98% em ar ambiente. Apresenta hálito cetônico, mucosas secas, abdome doloroso à palpação difusa sem sinais de irritação peritoneal, e está alerta e orientado.",
    prompt: "Após a coleta dos exames abaixo, a primeira medida terapêutica a ser instituída é:",
    labData: [
      { exam: "Glicemia", result: "486 mg/dL", reference: "70–99 mg/dL" },
      { exam: "pH arterial", result: "7,08", reference: "7,35–7,45" },
      { exam: "Bicarbonato", result: "8 mEq/L", reference: "22–26 mEq/L" },
      { exam: "Ânion gap", result: "28 mEq/L", reference: "8–12 mEq/L" },
      { exam: "Cetonemia (beta-hidroxibutirato)", result: "5,8 mmol/L", reference: "< 0,6 mmol/L" },
      { exam: "Sódio", result: "132 mEq/L", reference: "135–145 mEq/L" },
      { exam: "Potássio", result: "3,0 mEq/L", reference: "3,5–5,0 mEq/L" },
      { exam: "Creatinina", result: "1,4 mg/dL", reference: "0,7–1,3 mg/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Diabetes", title: "Diretriz da Sociedade Brasileira de Diabetes — crises hiperglicêmicas agudas", year: null },
    ],
    keywords: ["cetoacidose diabética", "hipocalemia", "reposição de potássio", "insulinoterapia"],
    tags: ["emergencia", "correcao-eletrolitica"],
    explanation: {
      answerSummary: "Iniciar hidratação com cristaloide e repor potássio antes de iniciar a insulina.",
      whyCorrect:
        "O diagnóstico de cetoacidose diabética está estabelecido: hiperglicemia, acidose metabólica com ânion gap elevado e cetonemia. O detalhe que define a conduta é o potássio de 3,0 mEq/L. Na cetoacidose, o potássio sérico costuma estar normal ou alto apesar de um déficit corporal total grande, porque a acidose e a falta de insulina o deslocam para fora das células. Encontrar potássio já baixo antes de qualquer tratamento significa depleção corporal severa. Como a insulina empurra potássio para dentro da célula, administrá-la agora pode precipitar hipocalemia grave, com arritmia e fraqueza muscular respiratória. A regra é clara: com potássio abaixo de 3,3 mEq/L, adia-se a insulina, hidrata-se e repõe-se potássio até ultrapassar esse limiar.",
      keyClues: [
        "Potássio de 3,0 mEq/L — abaixo do limiar de 3,3 mEq/L",
        "pH 7,08 com bicarbonato de 8 mEq/L e ânion gap de 28 mEq/L",
        "Cetonemia de 5,8 mmol/L confirmando cetoacidose",
        "Sinais de desidratação com taquicardia e hipotensão limítrofe",
      ],
      clinicalPearl:
        "Na cetoacidose diabética, o potássio manda no cronograma. Abaixo de 3,3 mEq/L, repõe-se potássio antes da insulina; acima de 5,2, adia-se a reposição; entre os dois, insulina e potássio caminham juntos.",
      commonTrap:
        "Iniciar a insulina imediatamente porque a glicemia está muito alta. A glicemia não é o que mata na cetoacidose — a hipocalemia induzida pela insulina pode ser.",
      managementSteps: [
        "Hidratação com cristaloide isotônico, ajustada ao estado volêmico",
        "Repor potássio até que ultrapasse 3,3 mEq/L antes de iniciar a insulina",
        "Iniciar insulina regular intravenosa em infusão contínua após atingido o limiar de potássio",
        "Monitorar glicemia horária e eletrólitos a cada 2 a 4 horas",
        "Acrescentar glicose à hidratação quando a glicemia atingir cerca de 200 mg/dL, mantendo a insulina até fechar o ânion gap",
      ],
    },
    alternatives: [
      { label: "A", text: "Iniciar insulina regular intravenosa em infusão contínua imediatamente.", isCorrect: false, rationale: "Com potássio de 3,0 mEq/L, a insulina desloca potássio para o intracelular e pode precipitar hipocalemia grave com arritmia." },
      { label: "B", text: "Administrar bicarbonato de sódio intravenoso para corrigir a acidose.", isCorrect: false, rationale: "O bicarbonato é reservado a pH muito baixo em situações selecionadas e pode agravar a hipocalemia. A acidose da cetoacidose se resolve com hidratação e insulina." },
      { label: "C", text: "Hidratar com cristaloide e repor potássio antes de iniciar a insulina.", isCorrect: true, rationale: "Correta. Potássio abaixo de 3,3 mEq/L contraindica o início imediato da insulina; hidratação e reposição vêm primeiro." },
      { label: "D", text: "Administrar insulina subcutânea de ação rápida em esquema de correção e reavaliar em 2 horas.", isCorrect: false, rationale: "Além de manter o problema do potássio, a via subcutânea é inadequada na cetoacidose grave com instabilidade e má perfusão periférica." },
    ],
  },
  {
    code: "CM-ENDO-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "DIAGNOSIS",
    specialtySlug: "endocrinologia",
    topicSlug: "tireoide",
    stem:
      "Mulher de 46 anos procura o ambulatório com palpitações, perda de 5 kg em 2 meses, intolerância ao calor e irritabilidade. Refere que os sintomas começaram há cerca de 6 semanas, precedidos por dor cervical anterior intensa e febre baixa por aproximadamente 10 dias, já resolvidas. Nega uso de amiodarona, iodo ou hormônio tireoidiano. Ao exame físico, encontra-se ansiosa, com pressão arterial de 138×72 mmHg, frequência cardíaca de 104 bpm, tremor fino de extremidades e pele quente e úmida. A tireoide está discretamente aumentada, firme e ainda dolorosa à palpação, sem sopro. Não há exoftalmia, retração palpebral nem mixedema pré-tibial.",
    prompt: "Considerando o quadro clínico e os achados laboratoriais, a principal hipótese diagnóstica é:",
    labData: [
      { exam: "TSH", result: "< 0,01 mUI/L", reference: "0,4–4,5 mUI/L" },
      { exam: "T4 livre", result: "3,1 ng/dL", reference: "0,8–1,8 ng/dL" },
      { exam: "T3 total", result: "198 ng/dL", reference: "80–200 ng/dL" },
      { exam: "Anticorpo anti-receptor de TSH (TRAb)", result: "Negativo", reference: "Negativo" },
      { exam: "VHS", result: "78 mm/h", reference: "< 20 mm/h" },
      { exam: "Proteína C reativa", result: "42 mg/L", reference: "< 5 mg/L" },
      { exam: "Captação de iodo radioativo em 24 h", result: "2%", reference: "15–35%" },
    ],
    media: [],
    guidelineReference: [
      { society: "American Thyroid Association", title: "Guidelines for Diagnosis and Management of Hyperthyroidism and Other Causes of Thyrotoxicosis", year: null },
    ],
    keywords: ["tireoidite subaguda", "tireoidite de De Quervain", "captação baixa", "tireotoxicose"],
    tags: [],
    explanation: {
      answerSummary: "Tireoidite subaguda granulomatosa (de De Quervain).",
      whyCorrect:
        "O achado que resolve o caso é a captação de iodo radioativo de 2% em vigência de tireotoxicose franca. Ela separa dois grandes grupos: nas tireotoxicoses por hiperprodução — doença de Graves, bócio multinodular tóxico, adenoma tóxico — a glândula está sintetizando hormônio e capta avidamente. Na tireotoxicose por destruição, o hormônio pré-formado vaza da glândula lesada e a captação é baixa. Dentro do grupo de captação baixa, a dor cervical anterior precedida por quadro viral, a tireoide dolorosa à palpação e as provas inflamatórias muito elevadas apontam para tireoidite subaguda granulomatosa. O TRAb negativo e a ausência de sinais orbitários afastam Graves.",
      keyClues: [
        "Captação de iodo radioativo de apenas 2% com tireotoxicose franca",
        "Dor cervical anterior precedida de pródromo viral",
        "Tireoide dolorosa à palpação",
        "VHS de 78 mm/h e PCR de 42 mg/L",
        "TRAb negativo e ausência de oftalmopatia",
      ],
      clinicalPearl:
        "Tireotoxicose com captação baixa não se trata com antitireoidiano: não há síntese excessiva para bloquear. O tratamento é sintomático, e a fase seguinte costuma ser de hipotireoidismo transitório.",
      commonTrap:
        "Prescrever metimazol assim que se vê TSH suprimido com T4 livre alto. Sem checar a captação, trata-se o mecanismo errado — e a droga não tem onde agir.",
      managementSteps: [
        "Anti-inflamatório não esteroidal para a dor; corticoide nos casos mais intensos ou refratários",
        "Betabloqueador para controle sintomático adrenérgico",
        "Não prescrever antitireoidiano — não há hiperprodução hormonal",
        "Acompanhar a função tireoidiana pelo risco de hipotireoidismo transitório na fase seguinte",
      ],
    },
    alternatives: [
      { label: "A", text: "Doença de Graves.", isCorrect: false, rationale: "Cursaria com captação elevada, TRAb positivo e frequentemente sinais orbitários — o oposto do encontrado." },
      { label: "B", text: "Bócio multinodular tóxico.", isCorrect: false, rationale: "Também apresenta captação aumentada, com padrão heterogêneo, e não causa dor cervical nem elevação marcante de provas inflamatórias." },
      { label: "C", text: "Tireoidite subaguda granulomatosa.", isCorrect: true, rationale: "Correta. Tireotoxicose com captação suprimida, dor cervical após pródromo viral e provas inflamatórias muito elevadas." },
      { label: "D", text: "Tireotoxicose factícia por uso de hormônio tireoidiano exógeno.", isCorrect: false, rationale: "Também cursa com captação baixa, mas não causa dor cervical, tireoide palpável dolorosa nem elevação de VHS e PCR, e a paciente nega uso." },
    ],
  },
];
