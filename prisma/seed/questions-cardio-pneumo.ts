import type { QuestionInput } from "@/lib/domain/schemas";

/**
 * Questões ORIGINAIS de Cardiologia e Pneumologia.
 *
 * Escritas para esta plataforma. Nenhum enunciado, alternativa ou explicação
 * foi copiado de prova real ou de banco comercial. O material de referência
 * fornecido pela usuária foi usado apenas para calibrar estilo e dificuldade.
 */
export const CARDIO_PNEUMO_QUESTIONS: QuestionInput[] = [
  {
    code: "CM-CARD-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "cardiologia",
    topicSlug: "sindromes-coronarianas",
    subtopicSlug: "iamcsst",
    stem:
      "Mulher de 63 anos, hipertensa e tabagista, chega à unidade de pronto atendimento de um município do interior com dor precordial em aperto iniciada há 1 hora e 40 minutos, associada a sudorese e náuseas. Ao exame, encontra-se ansiosa, com pressão arterial de 142×88 mmHg, frequência cardíaca de 96 bpm, frequência respiratória de 20 irpm e saturação de 96% em ar ambiente. Ausculta cardíaca e pulmonar sem alterações, sem turgência jugular, pulsos simétricos. O eletrocardiograma realizado na admissão mostra supradesnivelamento do segmento ST de 3 mm em D2, D3 e aVF, com infradesnivelamento recíproco em D1 e aVL. O hospital com laboratório de hemodinâmica mais próximo fica a 3 horas de transporte terrestre, sem alternativa aérea disponível no momento. Não há história de sangramento, AVC prévio, cirurgia recente ou uso de anticoagulante.",
    prompt: "Considerando o cenário assistencial descrito, a conduta de reperfusão mais adequada é:",
    labData: [],
    media: [
      {
        kind: "ECG",
        caption: "ECG de 12 derivações na admissão",
        alt: "Ritmo sinusal, 96 bpm. Supradesnivelamento de ST de 3 mm em D2, D3 e aVF com infradesnivelamento recíproco em D1 e aVL — padrão de infarto de parede inferior.",
      },
    ],
    guidelineReference: [
      { society: "Sociedade Brasileira de Cardiologia", title: "Diretriz de Infarto Agudo do Miocárdio com Supradesnível do Segmento ST", year: null },
    ],
    keywords: ["IAM com supra de ST", "fibrinólise", "tempo porta-balão", "parede inferior"],
    tags: ["emergencia", "reperfusao"],
    explanation: {
      answerSummary: "Fibrinólise imediata no local, seguida de transferência para estratégia fármaco-invasiva.",
      whyCorrect:
        "O ECG fecha IAM com supradesnivelamento de ST de parede inferior, dentro da janela de reperfusão. A decisão não é sobre qual método é superior em abstrato — angioplastia primária é — e sim sobre o que é alcançável neste cenário. O tempo estimado até o primeiro dispositivo seria de pelo menos 3 horas de transporte somadas ao tempo intra-hospitalar, ultrapassando com folga o limite aceitável de atraso da transferência. Quando a angioplastia primária não pode ser realizada em tempo hábil e não há contraindicação, o fibrinolítico deve ser administrado onde o paciente está, o mais cedo possível. A transferência não é cancelada: ela passa a ser para coronariografia dentro de 2 a 24 horas, caracterizando a estratégia fármaco-invasiva.",
      keyClues: [
        "Supra de ST em parede inferior com imagem recíproca — diagnóstico eletrocardiográfico estabelecido",
        "Início dos sintomas há menos de 2 horas — janela ideal para fibrinólise",
        "Ausência de qualquer contraindicação a trombolítico",
        "Serviço de hemodinâmica a 3 horas de distância — atraso proibitivo para angioplastia primária",
      ],
      clinicalPearl:
        "Em IAM com supra de ST, a pergunta não é 'trombólise ou angioplastia'. É 'consigo abrir a artéria com balão dentro do tempo permitido?'. Se não, trombolisa agora e transfere depois.",
      commonTrap:
        "Transferir sem trombolisar porque 'angioplastia primária é melhor'. A superioridade da angioplastia depende de ela acontecer rápido — perdido o tempo, o paciente fica sem nenhuma reperfusão durante horas.",
      managementSteps: [
        "Confirmar ausência de contraindicações absolutas ao fibrinolítico",
        "Administrar o fibrinolítico o quanto antes, sem aguardar transporte",
        "Associar antiagregação e anticoagulação conforme o protocolo do serviço",
        "Transferir para coronariografia entre 2 e 24 horas (estratégia fármaco-invasiva)",
        "Avaliar critérios de reperfusão; se falha, angioplastia de resgate imediata",
      ],
    },
    alternatives: [
      { label: "A", text: "Transferir imediatamente para angioplastia primária, sem terapia de reperfusão no local.", isCorrect: false, rationale: "Deixaria o paciente sem reperfusão por mais de 3 horas. O benefício da angioplastia primária desaparece quando o atraso da transferência é grande." },
      { label: "B", text: "Administrar fibrinolítico agora e transferir para coronariografia em 2 a 24 horas.", isCorrect: true, rationale: "Correta. Sem acesso oportuno à hemodinâmica e sem contraindicação, a reperfusão farmacológica imediata seguida de transferência é a estratégia fármaco-invasiva recomendada." },
      { label: "C", text: "Iniciar antiagregação dupla e anticoagulação plena, reservando reperfusão para o caso de piora clínica.", isCorrect: false, rationale: "Antiagregação e anticoagulação são adjuvantes, não reperfusão. Aguardar piora significa aceitar a perda progressiva de miocárdio viável." },
      { label: "D", text: "Solicitar troponina seriada e repetir o ECG em 3 horas antes de definir a reperfusão.", isCorrect: false, rationale: "O supradesnivelamento de ST já é critério suficiente. Esperar marcador só consome a janela terapêutica." },
    ],
  },
  {
    code: "CM-CARD-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "TREATMENT_SELECTION",
    specialtySlug: "cardiologia",
    topicSlug: "insuficiencia-cardiaca",
    subtopicSlug: "icfer",
    stem:
      "Homem de 59 anos, com miocardiopatia dilatada de etiologia isquêmica e fração de ejeção de 30%, retorna ao ambulatório para reavaliação. Está em uso regular e otimizado há 4 meses de enalapril 20 mg duas vezes ao dia, carvedilol 25 mg duas vezes ao dia e espironolactona 25 mg ao dia. Refere dispneia aos esforços moderados, como subir um lance de escadas, sem ortopneia ou edema. Ao exame físico, encontra-se em bom estado geral, com pressão arterial de 118×72 mmHg, frequência cardíaca de 74 bpm em ritmo sinusal, sem estase jugular, ausculta pulmonar limpa e sem edema de membros inferiores. Não é diabético.",
    prompt: "Considerando as recomendações atuais para o tratamento farmacológico da insuficiência cardíaca com fração de ejeção reduzida, a conduta mais apropriada é:",
    labData: [
      { exam: "Creatinina", result: "1,2 mg/dL", reference: "0,7–1,3 mg/dL" },
      { exam: "Taxa de filtração glomerular estimada", result: "68 mL/min/1,73 m²", reference: "> 60 mL/min/1,73 m²" },
      { exam: "Potássio", result: "4,4 mEq/L", reference: "3,5–5,0 mEq/L" },
      { exam: "NT-proBNP", result: "980 pg/mL", reference: "< 125 pg/mL" },
      { exam: "Hemoglobina", result: "13,8 g/dL", reference: "13,5–17,5 g/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Cardiologia", title: "Diretriz Brasileira de Insuficiência Cardíaca Crônica e Aguda", year: null },
      { society: "European Society of Cardiology", title: "Guidelines for the diagnosis and treatment of acute and chronic heart failure", year: null },
    ],
    keywords: ["ICFEr", "quatro pilares", "iSGLT2", "sacubitril-valsartana"],
    tags: ["terapia-modificadora"],
    explanation: {
      answerSummary: "Acrescentar inibidor de SGLT2, completando o quarto pilar do tratamento.",
      whyCorrect:
        "O paciente está com três das quatro classes que reduzem mortalidade na ICFEr — inibidor da ECA, betabloqueador e antagonista mineralocorticoide — em doses otimizadas, e permanece sintomático. A quarta classe é o inibidor de SGLT2, cujo benefício em ICFEr independe da presença de diabetes: reduz mortalidade cardiovascular e hospitalização por insuficiência cardíaca. Função renal, potássio e pressão arterial permitem a introdução com segurança. Trocar o inibidor da ECA por sacubitril-valsartana também é uma intensificação legítima e recomendada, mas as duas medidas não competem: o iSGLT2 é a classe inteiramente ausente, e adicioná-lo é o passo com maior ganho incremental neste momento.",
      keyClues: [
        "FEVE 30% com sintomas persistentes apesar de terapia tripla otimizada",
        "Três pilares presentes, um ausente — o inibidor de SGLT2",
        "TFG 68 mL/min/1,73 m², potássio normal e PA 118×72 mmHg: sem barreira à introdução",
        "Ausência de diabetes não retira a indicação",
      ],
      clinicalPearl:
        "Os quatro pilares da ICFEr são IECA/BRA ou sacubitril-valsartana, betabloqueador, antagonista mineralocorticoide e inibidor de SGLT2. Antes de subir dose, pergunte qual pilar está faltando.",
      commonTrap:
        "Reservar o inibidor de SGLT2 para diabéticos. O benefício na ICFEr é independente do status glicêmico — a indicação aqui é cardiológica, não metabólica.",
      managementSteps: [
        "Introduzir inibidor de SGLT2 em dose única diária",
        "Antecipar queda transitória e reversível da TFG nas primeiras semanas",
        "Reavaliar função renal e volemia em 2 a 4 semanas",
        "Considerar, em seguida, a substituição do IECA por sacubitril-valsartana",
        "Se permanecer sintomático com FEVE ≤ 35% após 3 meses de terapia otimizada, avaliar CDI",
      ],
    },
    alternatives: [
      { label: "A", text: "Aumentar a dose de espironolactona para 50 mg ao dia.", isCorrect: false, rationale: "A dose de 25 mg é a que sustenta o benefício demonstrado. Dobrar aumenta risco de hipercalemia sem ganho estabelecido, e não corrige a lacuna terapêutica." },
      { label: "B", text: "Associar inibidor de SGLT2.", isCorrect: true, rationale: "Correta. É a única das quatro classes modificadoras de prognóstico ainda ausente, e não há contraindicação clínica ou laboratorial." },
      { label: "C", text: "Associar digoxina para controle sintomático.", isCorrect: false, rationale: "Digoxina pode reduzir hospitalizações, mas não mortalidade, e é considerada após as classes modificadoras de prognóstico estarem completas." },
      { label: "D", text: "Associar furosemida em dose fixa diária.", isCorrect: false, rationale: "Diurético de alça trata congestão. O paciente está euvolêmico — sem estase, sem edema, ausculta limpa — e diurético não altera prognóstico." },
    ],
  },
  {
    code: "CM-CARD-0003",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "VERY_HARD",
    clinicalReasoningType: "NEXT_STEP",
    specialtySlug: "cardiologia",
    topicSlug: "arritmias",
    subtopicSlug: "fibrilacao-atrial",
    stem:
      "Mulher de 71 anos, hipertensa e com diabetes mellitus tipo 2, comparece ao ambulatório para consulta de rotina. Assintomática, nega palpitações, dispneia ou síncope. Traz relatório de um monitor cardíaco implantável colocado há 8 meses após investigação de síncope de origem indeterminada — o dispositivo registrou três episódios de taquiarritmia atrial de alta frequência, com duração de 12 minutos, 40 minutos e 3 horas, todos com eletrogramas revisados e confirmados como fibrilação atrial. Ao exame físico, encontra-se em bom estado geral, com pressão arterial de 134×80 mmHg, frequência cardíaca de 76 bpm em ritmo regular, ausculta cardíaca sem sopros e sem sinais de insuficiência cardíaca. Não há história de AVC, AIT, insuficiência cardíaca, doença vascular periférica ou sangramento prévio.",
    prompt: "Considerando o achado do dispositivo e o perfil de risco da paciente, a conduta mais adequada é:",
    labData: [
      { exam: "Creatinina", result: "0,9 mg/dL", reference: "0,6–1,2 mg/dL" },
      { exam: "Hemoglobina", result: "13,1 g/dL", reference: "12,0–16,0 g/dL" },
      { exam: "Plaquetas", result: "232.000/mm³", reference: "150.000–450.000/mm³" },
      { exam: "HbA1c", result: "7,1%", reference: "< 5,7%" },
    ],
    media: [],
    guidelineReference: [
      { society: "European Society of Cardiology", title: "Guidelines for the management of atrial fibrillation", year: null },
      { society: "Sociedade Brasileira de Cardiologia", title: "Diretriz de Fibrilação Atrial", year: null },
    ],
    keywords: ["fibrilação atrial subclínica", "CHA2DS2-VASc", "anticoagulação", "monitor implantável"],
    tags: ["escore-risco"],
    explanation: {
      answerSummary: "Iniciar anticoagulante oral direto, após cálculo do CHA₂DS₂-VASc.",
      whyCorrect:
        "O escore CHA₂DS₂-VASc soma 4 pontos: hipertensão (1), diabetes (1), idade entre 65 e 74 anos (1) e sexo feminino (1). Com 4 pontos, a anticoagulação está indicada. A particularidade do caso é que a fibrilação atrial é subclínica, detectada por dispositivo — mas episódios documentados com eletrograma revisado, um deles de 3 horas, não são mais 'ruído de dispositivo': ultrapassam com folga o limiar de duração a partir do qual o risco embólico se aproxima do da FA clínica. Sem histórico de sangramento e com função renal preservada, o anticoagulante oral direto é a escolha preferencial sobre a varfarina.",
      keyClues: [
        "CHA₂DS₂-VASc = 4 (HAS 1 + DM 1 + idade 65–74 anos 1 + sexo feminino 1)",
        "Episódios de FA confirmados por revisão de eletrograma, não apenas contagem automática",
        "Episódio mais longo de 3 horas — muito além do limiar de relevância clínica",
        "Função renal preservada e ausência de sangramento prévio: DOAC seguro",
      ],
      clinicalPearl:
        "FA assintomática detectada por dispositivo indica anticoagulação pelas mesmas regras da FA sintomática, uma vez confirmado o eletrograma e ultrapassada a duração de relevância. O AVC cardioembólico não avisa antes de acontecer.",
      commonTrap:
        "Deixar de anticoagular porque a paciente é assintomática e o ritmo está sinusal na consulta. A indicação vem do escore de risco somado à FA documentada, nunca do ritmo do momento nem da presença de sintomas.",
      managementSteps: [
        "Calcular CHA₂DS₂-VASc e revisar fatores de risco de sangramento modificáveis",
        "Iniciar anticoagulante oral direto com dose ajustada para idade, peso e função renal",
        "Manter o monitoramento do dispositivo para avaliar carga arrítmica",
        "Reforçar controle pressórico e glicêmico",
      ],
    },
    alternatives: [
      { label: "A", text: "Iniciar ácido acetilsalicílico 100 mg ao dia como profilaxia de eventos embólicos.", isCorrect: false, rationale: "Antiagregação isolada não previne cardioembolia na FA e expõe a sangramento. Foi abandonada como alternativa à anticoagulação." },
      { label: "B", text: "Iniciar anticoagulante oral direto.", isCorrect: true, rationale: "Correta. CHA₂DS₂-VASc de 4 pontos com FA documentada e confirmada indica anticoagulação, e o DOAC é a primeira escolha na ausência de valvopatia mitral reumática ou prótese mecânica." },
      { label: "C", text: "Manter observação com nova avaliação do dispositivo em 6 meses, dado o caráter assintomático.", isCorrect: false, rationale: "A ausência de sintomas não reduz o risco embólico. Postergar a anticoagulação em paciente de risco alto com FA já documentada não tem respaldo." },
      { label: "D", text: "Solicitar Holter de 24 horas para confirmar a arritmia antes de qualquer decisão.", isCorrect: false, rationale: "O monitor implantável tem sensibilidade muito superior à do Holter, e os eletrogramas já foram revisados. Um Holter negativo não excluiria nada." },
    ],
  },
  {
    code: "CM-CARD-0004",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "EASY",
    clinicalReasoningType: "DIAGNOSIS",
    specialtySlug: "cardiologia",
    topicSlug: "doenca-pericardica",
    subtopicSlug: "tamponamento",
    stem:
      "Homem de 44 anos, em investigação ambulatorial de emagrecimento, procura a emergência com dispneia progressiva há 5 dias, hoje em repouso. Refere desconforto torácico impreciso e sensação de mal-estar. Ao exame físico, encontra-se ansioso, taquipneico, com pressão arterial de 88×62 mmHg, frequência cardíaca de 124 bpm, frequência respiratória de 28 irpm e saturação de 94% em ar ambiente. Apresenta turgência jugular a 45 graus, bulhas cardíacas hipofonéticas e ausculta pulmonar sem ruídos adventícios, com boa expansibilidade bilateral. A pressão arterial sistólica cai 18 mmHg durante a inspiração. As extremidades estão frias e o enchimento capilar é de 4 segundos.",
    prompt: "A principal hipótese diagnóstica é:",
    labData: [
      { exam: "Hemoglobina", result: "11,9 g/dL", reference: "13,5–17,5 g/dL" },
      { exam: "Creatinina", result: "1,3 mg/dL", reference: "0,7–1,3 mg/dL" },
      { exam: "Lactato arterial", result: "3,1 mmol/L", reference: "< 2,0 mmol/L" },
    ],
    media: [
      {
        kind: "ECG",
        caption: "ECG de 12 derivações na admissão",
        alt: "Taquicardia sinusal a 124 bpm com complexos QRS de baixa voltagem difusa e variação cíclica da amplitude do QRS batimento a batimento.",
      },
    ],
    guidelineReference: [
      { society: "European Society of Cardiology", title: "Guidelines on the diagnosis and management of pericardial diseases", year: null },
    ],
    keywords: ["tamponamento cardíaco", "pulso paradoxal", "tríade de Beck", "alternância elétrica"],
    tags: ["emergencia"],
    explanation: {
      answerSummary: "Tamponamento cardíaco.",
      whyCorrect:
        "A tríade de Beck está completa: hipotensão, turgência jugular e bulhas hipofonéticas. A ela somam-se dois achados que aumentam muito a especificidade — pulso paradoxal, definido como queda inspiratória da pressão sistólica maior que 10 mmHg (aqui 18 mmHg), e alternância elétrica com baixa voltagem no ECG, que traduz o coração oscilando dentro de um saco cheio de líquido. A ausculta pulmonar limpa é o dado que separa este quadro de causas pulmonares de choque com jugular ingurgitada. O emagrecimento em investigação sugere derrame de etiologia neoplásica, causa frequente de tamponamento de instalação subaguda.",
      keyClues: [
        "Tríade de Beck: hipotensão, estase jugular e bulhas hipofonéticas",
        "Pulso paradoxal de 18 mmHg",
        "Baixa voltagem com alternância elétrica no ECG",
        "Ausculta pulmonar limpa apesar de dispneia intensa e choque",
      ],
      clinicalPearl:
        "Choque com jugular ingurgitada e pulmão limpo restringe o diferencial a poucas hipóteses: tamponamento, tromboembolismo pulmonar maciço, infarto de ventrículo direito e pneumotórax hipertensivo. O exame físico separa as quatro.",
      commonTrap:
        "Interpretar a hipotensão com taquicardia como choque hipovolêmico ou séptico e prescrever volume como conduta única. Volume pode dar tempo, mas o tratamento é a drenagem do líquido pericárdico.",
      managementSteps: [
        "Ecocardiograma à beira do leito para confirmar derrame e sinais de repercussão hemodinâmica",
        "Pericardiocentese, idealmente guiada por ecocardiograma",
        "Evitar ventilação com pressão positiva antes da drenagem, pelo risco de colapso hemodinâmico",
        "Enviar o líquido para análise citológica, bioquímica e microbiológica",
      ],
    },
    alternatives: [
      { label: "A", text: "Tamponamento cardíaco.", isCorrect: true, rationale: "Correta. Tríade de Beck, pulso paradoxal e alternância elétrica com baixa voltagem compõem um quadro característico." },
      { label: "B", text: "Tromboembolismo pulmonar maciço.", isCorrect: false, rationale: "Também cursa com choque obstrutivo e jugular ingurgitada, mas não explica bulhas hipofonéticas nem alternância elétrica, e a hipoxemia costuma ser mais acentuada." },
      { label: "C", text: "Insuficiência cardíaca descompensada com congestão sistêmica.", isCorrect: false, rationale: "Esperaria-se congestão pulmonar à ausculta, edema periférico e evolução mais arrastada. Pulso paradoxal não é achado de IC descompensada simples." },
      { label: "D", text: "Pneumotórax hipertensivo.", isCorrect: false, rationale: "Cursaria com assimetria de expansibilidade, timpanismo e abolição do murmúrio de um lado — a ausculta descrita é simétrica e sem alterações." },
    ],
  },
  {
    code: "CM-PNEU-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "CLASSIFICATION",
    specialtySlug: "pneumologia",
    topicSlug: "pneumonias",
    subtopicSlug: "pac",
    stem:
      "Homem de 74 anos, com hipertensão arterial e doença renal crônica estágio 3, é levado à emergência por familiares com tosse produtiva, febre e prostração há 3 dias. Os familiares relatam que ele está mais confuso desde ontem, sem reconhecer o ambiente. Ao exame físico, encontra-se desorientado no tempo e no espaço, com pressão arterial de 96×58 mmHg, frequência cardíaca de 106 bpm, frequência respiratória de 32 irpm, temperatura de 38,4 °C e saturação de 91% em ar ambiente. Apresenta crepitações em base pulmonar direita e macicez à percussão no mesmo local. A radiografia de tórax evidencia consolidação em lobo inferior direito, sem derrame pleural significativo.",
    prompt: "Considerando a estratificação de gravidade pelo escore CURB-65, a pontuação e a conduta indicada são, respectivamente:",
    labData: [
      { exam: "Ureia", result: "68 mg/dL", reference: "10–50 mg/dL" },
      { exam: "Creatinina", result: "1,9 mg/dL (basal 1,6)", reference: "0,7–1,3 mg/dL" },
      { exam: "Leucócitos", result: "18.400/mm³ (12% bastões)", reference: "4.000–11.000/mm³" },
      { exam: "Lactato arterial", result: "2,8 mmol/L", reference: "< 2,0 mmol/L" },
      { exam: "Proteína C reativa", result: "218 mg/L", reference: "< 5 mg/L" },
    ],
    media: [
      {
        kind: "XRAY",
        caption: "Radiografia de tórax em incidência posteroanterior",
        alt: "Consolidação homogênea ocupando o lobo inferior direito, com broncogramas aéreos. Seios costofrênicos livres. Área cardíaca dentro dos limites da normalidade.",
      },
    ],
    guidelineReference: [
      { society: "Sociedade Brasileira de Pneumologia e Tisiologia", title: "Recomendações para o manejo da pneumonia adquirida na comunidade", year: null },
    ],
    keywords: ["CURB-65", "pneumonia adquirida na comunidade", "estratificação de gravidade"],
    tags: ["escore-risco", "emergencia"],
    explanation: {
      answerSummary: "CURB-65 igual a 5; internação com avaliação para terapia intensiva.",
      whyCorrect:
        "O CURB-65 atribui um ponto a cada item presente, e neste caso os cinco estão presentes. Confusão mental de início recente, relatada pelos familiares. Ureia de 68 mg/dL, acima do limiar de 42 mg/dL. Frequência respiratória de 32 irpm, igual ou superior a 30. Pressão arterial diastólica de 58 mmHg — o critério de pressão é satisfeito tanto por sistólica abaixo de 90 mmHg quanto por diastólica igual ou inferior a 60 mmHg, e é a diastólica que pontua aqui. Idade de 74 anos, igual ou superior a 65. Escore de 3 ou mais caracteriza pneumonia grave: a conduta é internação hospitalar com avaliação de critérios para suporte intensivo, e escores de 4 e 5 reforçam essa indicação com mortalidade progressivamente maior.",
      keyClues: [
        "Confusão mental de início recente relatada por familiares",
        "Ureia de 68 mg/dL, acima do limiar de 42 mg/dL",
        "Frequência respiratória de 32 irpm",
        "Pressão diastólica de 58 mmHg, igual ou inferior a 60 mmHg",
        "Idade de 74 anos",
      ],
      clinicalPearl:
        "No CURB-65, a pressão pontua tanto pela sistólica < 90 quanto pela diastólica ≤ 60 mmHg. A diastólica é o critério mais esquecido e frequentemente muda a classificação.",
      commonTrap:
        "Ler apenas a sistólica ao avaliar o componente de pressão arterial e subestimar o escore, mandando para casa um paciente com pneumonia grave.",
      managementSteps: [
        "Internação hospitalar com avaliação de critérios para terapia intensiva",
        "Coleta de culturas antes do antimicrobiano, sem atrasar a primeira dose",
        "Antibioticoterapia empírica para pneumonia grave conforme o protocolo institucional",
        "Suporte de oxigênio e ressuscitação volêmica criteriosa, considerando a doença renal crônica",
      ],
    },
    alternatives: [
      { label: "A", text: "CURB-65 igual a 1; tratamento ambulatorial com antibiótico oral.", isCorrect: false, rationale: "Subestima grosseiramente a gravidade. Ao menos quatro critérios estão inequivocamente presentes." },
      { label: "B", text: "CURB-65 igual a 2; internação em enfermaria sem necessidade de avaliação adicional.", isCorrect: false, rationale: "Ainda subestima o escore e dispensa a avaliação de suporte intensivo, que é obrigatória neste grau de gravidade." },
      { label: "C", text: "CURB-65 igual ou maior que 3; internação hospitalar com avaliação para terapia intensiva.", isCorrect: true, rationale: "Correta. Confusão, ureia elevada, taquipneia ≥ 30 irpm, diastólica ≤ 60 mmHg e idade ≥ 65 anos configuram pneumonia grave." },
      { label: "D", text: "CURB-65 não se aplica a portadores de doença renal crônica; usar apenas critérios clínicos.", isCorrect: false, rationale: "O escore é aplicável. A doença renal crônica exige apenas interpretar a ureia junto ao basal do paciente, não descartar a ferramenta." },
    ],
  },
  {
    code: "CM-PNEU-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "DATA_INTERPRETATION",
    specialtySlug: "pneumologia",
    topicSlug: "derrame-pleural",
    subtopicSlug: "derrame-parapneumonico",
    stem:
      "Mulher de 52 anos, diabética, internada há 4 dias por pneumonia adquirida na comunidade em uso de ceftriaxona e azitromicina, evolui com persistência de febre e piora da dor torácica à direita. Ao exame físico, encontra-se em regular estado geral, com temperatura de 38,3 °C, pressão arterial de 118×70 mmHg, frequência cardíaca de 98 bpm, frequência respiratória de 24 irpm e saturação de 93% em ar ambiente. Apresenta redução da expansibilidade e abolição do murmúrio vesicular no terço inferior do hemitórax direito, com macicez à percussão. A ultrassonografia de tórax mostra derrame pleural à direita com septações e volume estimado em 700 mL. Realizada toracocentese diagnóstica, com os resultados abaixo.",
    prompt: "Considerando a análise do líquido pleural, a conduta mais adequada é:",
    labData: [
      { exam: "Aspecto", result: "Turvo", reference: "—" },
      { exam: "pH do líquido pleural", result: "7,05", reference: "> 7,30" },
      { exam: "Glicose do líquido pleural", result: "38 mg/dL", reference: "próxima à sérica" },
      { exam: "LDH pleural", result: "1.480 U/L", reference: "—" },
      { exam: "LDH sérico", result: "310 U/L", reference: "< 250 U/L" },
      { exam: "Proteína pleural / sérica", result: "0,68", reference: "≤ 0,5 (transudato)" },
      { exam: "Bacterioscopia (Gram)", result: "Ausência de bactérias", reference: "—" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Pneumologia e Tisiologia", title: "Recomendações sobre derrame pleural", year: null },
    ],
    keywords: ["derrame parapneumônico complicado", "critérios de Light", "drenagem torácica", "pH pleural"],
    tags: ["procedimento"],
    explanation: {
      answerSummary: "Drenagem pleural, mantendo a antibioticoterapia.",
      whyCorrect:
        "Os critérios de Light confirmam exsudato: a relação proteína pleural/sérica é 0,68, acima de 0,5, e a relação LDH pleural/sérico é 4,8, acima de 0,6. Dentro dos exsudatos, três achados definem derrame parapneumônico complicado e indicam drenagem: pH abaixo de 7,20 — aqui 7,05 —, glicose abaixo de 60 mg/dL — aqui 38 — e presença de septações à ultrassonografia. Gram negativo não afasta nada: a maioria dos derrames complicados tem bacterioscopia negativa, sobretudo sob antibiótico. Derrame complicado não resolve com antimicrobiano isolado, porque o antibiótico penetra mal em coleção septada e ácida.",
      keyClues: [
        "Relação proteína pleural/sérica de 0,68 e LDH pleural/sérico de 4,8 — exsudato pelos critérios de Light",
        "pH pleural de 7,05, bem abaixo do limiar de 7,20",
        "Glicose pleural de 38 mg/dL",
        "Septações à ultrassonografia",
        "Febre persistente sob antibiótico adequado há 4 dias",
      ],
      clinicalPearl:
        "Três gatilhos independentes de drenagem em derrame parapneumônico: pH < 7,20, glicose < 60 mg/dL e presença de pus, septações ou germe identificado. Um só já basta.",
      commonTrap:
        "Concluir que o Gram negativo exclui infecção pleural e apenas trocar o antibiótico. A bacterioscopia é pouco sensível, e o problema aqui é mecânico além de microbiológico.",
      managementSteps: [
        "Instalar dreno torácico e enviar material para cultura",
        "Manter cobertura antimicrobiana, ajustando conforme o resultado das culturas",
        "Reavaliar com imagem a expansão pulmonar após a drenagem",
        "Considerar fibrinolítico intrapleural ou abordagem cirúrgica se a drenagem for insuficiente",
      ],
    },
    alternatives: [
      { label: "A", text: "Manter o antibiótico atual e repetir a toracocentese em 48 horas.", isCorrect: false, rationale: "Adia a drenagem de um derrame já complicado, favorecendo a organização da coleção e o encarceramento pulmonar." },
      { label: "B", text: "Realizar drenagem pleural e manter a antibioticoterapia.", isCorrect: true, rationale: "Correta. pH < 7,20, glicose < 60 mg/dL e septações são critérios independentes de drenagem em derrame parapneumônico." },
      { label: "C", text: "Trocar o esquema antimicrobiano para piperacilina-tazobactam sem drenagem.", isCorrect: false, rationale: "Ampliar espectro não resolve coleção septada. A falha terapêutica aqui tem componente mecânico." },
      { label: "D", text: "Iniciar corticoide sistêmico para reduzir a inflamação pleural.", isCorrect: false, rationale: "Não há indicação de corticoide no derrame parapneumônico, e ele pode mascarar a evolução do quadro infeccioso." },
    ],
  },
  {
    code: "CM-PNEU-0003",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "pneumologia",
    topicSlug: "asma",
    stem:
      "Mulher de 28 anos, com asma diagnosticada na adolescência, procura a emergência com dispneia e sibilância progressivas há 8 horas, iniciadas após quadro gripal. Refere que usou salbutamol inalatório em casa três vezes, com alívio parcial e breve. Ao exame físico, encontra-se ansiosa, falando frases entrecortadas, com pressão arterial de 128×78 mmHg, frequência cardíaca de 118 bpm, frequência respiratória de 28 irpm e saturação de 92% em ar ambiente. Apresenta uso de musculatura acessória cervical, tiragem intercostal e sibilos expiratórios difusos, com murmúrio vesicular audível em todos os campos. Está alerta e orientada.",
    prompt: "Considerando a gravidade da crise, a conduta inicial mais adequada consiste em:",
    labData: [
      { exam: "Pico de fluxo expiratório", result: "48% do previsto", reference: "> 80% do previsto" },
      { exam: "Gasometria arterial — pH", result: "7,46", reference: "7,35–7,45" },
      { exam: "Gasometria arterial — pCO₂", result: "32 mmHg", reference: "35–45 mmHg" },
      { exam: "Gasometria arterial — PaO₂", result: "68 mmHg", reference: "80–100 mmHg" },
    ],
    media: [],
    guidelineReference: [
      { society: "Global Initiative for Asthma", title: "Global Strategy for Asthma Management and Prevention", year: null },
      { society: "Sociedade Brasileira de Pneumologia e Tisiologia", title: "Diretrizes para o manejo da asma", year: null },
    ],
    keywords: ["exacerbação de asma", "beta-2 de curta duração", "corticoide sistêmico", "brometo de ipratrópio"],
    tags: ["emergencia"],
    explanation: {
      answerSummary: "Beta-2-agonista de curta duração inalatório em doses repetidas, associado a brometo de ipratrópio, corticoide sistêmico precoce e oxigênio suplementar titulado.",
      whyCorrect:
        "Trata-se de exacerbação moderada a grave: fala entrecortada, uso de musculatura acessória, frequência respiratória de 28 irpm, saturação de 92% e pico de fluxo em 48% do previsto. O tratamento tem quatro componentes simultâneos e não sequenciais. O broncodilatador de curta duração é a base, administrado em doses repetidas na primeira hora. O ipratrópio associado reduz internações nas crises moderadas a graves. O corticoide sistêmico deve ser administrado na primeira hora — ele não age agora, age nas próximas horas, e por isso atrasar sua prescrição é o erro mais custoso. O oxigênio é titulado para saturação alvo, não em fluxo máximo.",
      keyClues: [
        "Fala em frases entrecortadas e uso de musculatura acessória",
        "Pico de fluxo em 48% do previsto",
        "Saturação de 92% em ar ambiente",
        "Alcalose respiratória com pCO₂ de 32 mmHg — esperada; normalização da pCO₂ seria sinal de alarme",
      ],
      clinicalPearl:
        "Numa crise asmática grave, pCO₂ normal ou elevada não é tranquilizadora: significa que a paciente está fatigando. O esperado na crise é hipocapnia.",
      commonTrap:
        "Deixar o corticoide sistêmico para 'depois de ver a resposta ao broncodilatador'. Como seu efeito começa em horas, o atraso na primeira dose se paga com internação.",
      managementSteps: [
        "Oxigênio titulado para saturação alvo de 93% a 95%",
        "Salbutamol inalatório em doses repetidas na primeira hora",
        "Brometo de ipratrópio associado nas crises moderadas a graves",
        "Corticoide sistêmico na primeira hora do atendimento",
        "Reavaliar resposta com pico de fluxo e exame clínico após a primeira hora",
      ],
    },
    alternatives: [
      { label: "A", text: "Beta-2-agonista de curta duração em doses repetidas, ipratrópio associado, corticoide sistêmico precoce e oxigênio titulado.", isCorrect: true, rationale: "Correta. Reúne os quatro componentes do tratamento inicial da exacerbação moderada a grave, administrados em conjunto." },
      { label: "B", text: "Apenas beta-2-agonista de curta duração em doses repetidas, reservando corticoide para a ausência de resposta em 2 horas.", isCorrect: false, rationale: "Atrasa o corticoide sistêmico justamente quando ele mais reduz recaída e internação." },
      { label: "C", text: "Antibioticoterapia empírica, corticoide inalatório em dose dobrada e oxigênio em alto fluxo.", isCorrect: false, rationale: "Não há indicação de antibiótico (quadro viral, sem consolidação), corticoide inalatório não substitui o sistêmico na crise, e o oxigênio deve ser titulado." },
      { label: "D", text: "Sulfato de magnésio intravenoso como primeira medida, seguido de reavaliação clínica.", isCorrect: false, rationale: "O magnésio é adjuvante reservado para crises graves refratárias ao tratamento inicial, não medida de primeira linha." },
    ],
  },
];
