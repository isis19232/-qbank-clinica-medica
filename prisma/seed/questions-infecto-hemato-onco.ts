import type { QuestionInput } from "@/lib/domain/schemas";

/** Questões ORIGINAIS de Infectologia, Hematologia, Oncologia, Gastroenterologia e Reumatologia. */
export const INFECTO_HEMATO_ONCO_QUESTIONS: QuestionInput[] = [
  {
    code: "CM-INFE-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "infectologia",
    topicSlug: "sepse",
    subtopicSlug: "ressuscitacao-sepse",
    stem:
      "Mulher de 67 anos, com diabetes mellitus tipo 2 e doença renal crônica estágio 3, é trazida à emergência com febre, dor lombar à direita e vômitos há 2 dias. Ao exame físico, encontra-se prostrada, respondendo a comandos simples, com pressão arterial de 82×48 mmHg, frequência cardíaca de 124 bpm, frequência respiratória de 28 irpm, temperatura de 38,9 °C e saturação de 93% em ar ambiente. Apresenta Giordano fortemente positivo à direita, extremidades frias, enchimento capilar de 4 segundos e mucosas secas. Foram obtidos dois acessos venosos periféricos calibrosos e colhidas hemoculturas e urocultura.",
    prompt: "Considerando o quadro de choque séptico, a conduta inicial prioritária é:",
    labData: [
      { exam: "Lactato arterial", result: "4,6 mmol/L", reference: "< 2,0 mmol/L" },
      { exam: "Leucócitos", result: "22.100/mm³ (18% bastões)", reference: "4.000–11.000/mm³" },
      { exam: "Creatinina", result: "2,9 mg/dL (basal 1,5 mg/dL)", reference: "0,6–1,2 mg/dL" },
      { exam: "Urina tipo 1", result: "Piúria intensa, nitrito positivo, bacteriúria", reference: "—" },
      { exam: "Plaquetas", result: "88.000/mm³", reference: "150.000–450.000/mm³" },
    ],
    media: [],
    guidelineReference: [
      { society: "Surviving Sepsis Campaign", title: "International Guidelines for Management of Sepsis and Septic Shock", year: null },
      { society: "Instituto Latino-Americano de Sepse", title: "Protocolo de tratamento de sepse e choque séptico", year: null },
    ],
    keywords: ["choque séptico", "ressuscitação volêmica", "pacote de 1 hora", "lactato"],
    tags: ["emergencia", "pacote-sepse"],
    explanation: {
      answerSummary: "Ressuscitação volêmica com cristaloide e antimicrobiano de amplo espectro na primeira hora, simultaneamente.",
      whyCorrect:
        "Há hipotensão e hipoperfusão com lactato de 4,6 mmol/L em foco infeccioso evidente — pielonefrite. O pacote da primeira hora não é uma sequência de etapas a cumprir uma após a outra: culturas já foram colhidas, e agora volume e antimicrobiano correm juntos. A reposição inicial recomendada é de 30 mL/kg de cristaloide em pacientes com hipotensão ou lactato elevado. A doença renal crônica não é motivo para restringir essa reposição inicial: o rim já hipoperfundido é justamente o que mais sofre com a restrição — o que a comorbidade exige é reavaliação frequente da resposta, não redução preventiva do volume. Vasopressor entra se a hipotensão persistir após a reposição, ou concomitantemente em hipotensão profunda.",
      keyClues: [
        "Pressão arterial de 82×48 mmHg com lactato de 4,6 mmol/L",
        "Foco infeccioso definido: pielonefrite com Giordano positivo e urina alterada",
        "Sinais de má perfusão periférica — extremidades frias, enchimento capilar de 4 segundos",
        "Culturas já colhidas: nada mais atrasa o antimicrobiano",
      ],
      clinicalPearl:
        "No choque séptico, volume e antibiótico não se revezam — correm em paralelo na primeira hora. Cada hora de atraso do antimicrobiano custa sobrevida.",
      commonTrap:
        "Restringir a reposição volêmica por causa da doença renal crônica. A hipoperfusão sustentada agrava a lesão renal muito mais do que a reposição inicial adequada.",
      managementSteps: [
        "Cristaloide balanceado 30 mL/kg com reavaliação frequente da resposta",
        "Antimicrobiano de amplo espectro na primeira hora, ajustado à epidemiologia local",
        "Noradrenalina se a pressão arterial média permanecer abaixo de 65 mmHg após a reposição",
        "Lactato seriado como marcador de resposta à ressuscitação",
        "Imagem para investigar foco obstrutivo ou abscesso passível de drenagem",
      ],
    },
    alternatives: [
      { label: "A", text: "Iniciar noradrenalina antes da reposição volêmica, dada a hipotensão significativa.", isCorrect: false, rationale: "Vasoconstrição em paciente hipovolêmico eleva a pressão às custas de perfusão tecidual. A reposição vem primeiro ou, no máximo, junto." },
      { label: "B", text: "Ressuscitação com 30 mL/kg de cristaloide e antimicrobiano de amplo espectro na primeira hora.", isCorrect: true, rationale: "Correta. É o núcleo do pacote da primeira hora, com as duas medidas administradas simultaneamente." },
      { label: "C", text: "Restringir volume a 500 mL e priorizar hemodiálise precoce pela doença renal crônica.", isCorrect: false, rationale: "Restrição volêmica agrava a hipoperfusão. Diálise na fase aguda não tem indicação sem critério específico e não substitui a ressuscitação." },
      { label: "D", text: "Aguardar o resultado das hemoculturas para escolher o antimicrobiano dirigido.", isCorrect: false, rationale: "As culturas levam de 24 a 72 horas. A terapia empírica não pode esperar — cada hora de atraso aumenta a mortalidade." },
    ],
  },
  {
    code: "CM-INFE-0002",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "TREATMENT_SELECTION",
    specialtySlug: "infectologia",
    topicSlug: "antimicrobianos",
    stem:
      "Homem de 58 anos, internado há 9 dias em unidade de terapia intensiva por pancreatite aguda grave, em ventilação mecânica e nutrição parenteral por cateter venoso central, evolui com febre de 38,7 °C e leucocitose. Ao exame físico, encontra-se sedado, com pressão arterial de 106×64 mmHg em uso de noradrenalina em dose baixa, frequência cardíaca de 104 bpm e temperatura de 38,6 °C. O sítio de inserção do cateter venoso central apresenta hiperemia e secreção purulenta discreta. A radiografia de tórax não mostra novos infiltrados e o exame de urina é normal. Foram colhidas hemoculturas pareadas — periférica e do cateter — antes do início do antimicrobiano.",
    prompt: "Considerando o resultado das hemoculturas e o contexto clínico, a conduta mais adequada é:",
    labData: [
      { exam: "Hemocultura periférica", result: "Positiva para Staphylococcus aureus", reference: "—" },
      { exam: "Hemocultura do cateter", result: "Positiva para Staphylococcus aureus, com positivação 3 horas antes da periférica", reference: "—" },
      { exam: "Perfil de sensibilidade — oxacilina", result: "Resistente", reference: "—" },
      { exam: "Perfil de sensibilidade — vancomicina", result: "CIM 1 µg/mL — sensível", reference: "—" },
      { exam: "Perfil de sensibilidade — daptomicina", result: "Sensível", reference: "—" },
      { exam: "Leucócitos", result: "19.800/mm³", reference: "4.000–11.000/mm³" },
      { exam: "Creatinina", result: "1,1 mg/dL", reference: "0,7–1,3 mg/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "Infectious Diseases Society of America", title: "Clinical Practice Guidelines for the Diagnosis and Management of Intravascular Catheter-Related Infection", year: null },
      { society: "ANVISA", title: "Medidas de prevenção de infecção relacionada à assistência à saúde", year: null },
    ],
    keywords: ["infecção de corrente sanguínea relacionada a cateter", "MRSA", "remoção do cateter", "vancomicina"],
    tags: ["controle-infeccao"],
    explanation: {
      answerSummary: "Remover o cateter venoso central e iniciar vancomicina.",
      whyCorrect:
        "O diagnóstico de infecção de corrente sanguínea relacionada a cateter está estabelecido por dois critérios independentes: sinais inflamatórios no sítio de inserção e tempo diferencial de positivação superior a 2 horas entre a hemocultura do cateter e a periférica. O agente é Staphylococcus aureus resistente à oxacilina, o que define MRSA e indica vancomicina — a CIM de 1 µg/mL é favorável. O ponto que a questão testa é que o antimicrobiano sozinho não resolve: S. aureus é um dos agentes para os quais a remoção do cateter é obrigatória, e não opcional. Tentar salvar o dispositivo com lock terapêutico está indicado em agentes de menor virulência, jamais em S. aureus, Pseudomonas, fungos ou micobactérias.",
      keyClues: [
        "Tempo diferencial de positivação de 3 horas a favor do cateter",
        "Sinais flogísticos no sítio de inserção",
        "S. aureus resistente à oxacilina — MRSA",
        "CIM de vancomicina de 1 µg/mL, dentro da faixa de sensibilidade",
      ],
      clinicalPearl:
        "Em bacteriemia relacionada a cateter por S. aureus, Pseudomonas, Candida ou micobactéria, o cateter sai. Não há tentativa de salvamento com esses agentes.",
      commonTrap:
        "Iniciar vancomicina e manter o cateter porque 'o paciente precisa do acesso'. A fonte permanece, a bacteriemia persiste e o risco de endocardite e metástases sépticas aumenta.",
      managementSteps: [
        "Remover o cateter e enviar a ponta para cultura",
        "Iniciar vancomicina com monitorização de níveis séricos e função renal",
        "Repetir hemoculturas em 48 a 72 horas para documentar a limpeza da corrente sanguínea",
        "Ecocardiograma para avaliar endocardite — pesquisa obrigatória em bacteriemia por S. aureus",
        "Definir a duração do tratamento a partir da data da primeira hemocultura negativa",
      ],
    },
    alternatives: [
      { label: "A", text: "Manter o cateter e iniciar vancomicina sistêmica com lock terapêutico.", isCorrect: false, rationale: "A tentativa de salvamento do cateter é contraindicada em infecção por S. aureus, pelo risco de bacteriemia persistente e complicações metastáticas." },
      { label: "B", text: "Remover o cateter e iniciar vancomicina.", isCorrect: true, rationale: "Correta. S. aureus resistente à oxacilina exige remoção do dispositivo e cobertura para MRSA." },
      { label: "C", text: "Remover o cateter e iniciar oxacilina, por ser a droga de escolha para S. aureus.", isCorrect: false, rationale: "A remoção está certa, mas o antimicrobiano está errado: a cepa é resistente à oxacilina." },
      { label: "D", text: "Trocar o cateter por fio-guia no mesmo sítio e iniciar vancomicina.", isCorrect: false, rationale: "A troca por fio-guia mantém o trajeto colonizado e é contraindicada quando há infecção estabelecida do sítio de inserção." },
    ],
  },
  {
    code: "CM-HEMA-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "DATA_INTERPRETATION",
    specialtySlug: "hematologia",
    topicSlug: "anemias",
    subtopicSlug: "anemia-ferropriva",
    stem:
      "Mulher de 58 anos procura o ambulatório com fadiga progressiva e dispneia aos médios esforços há 4 meses. Nega sangramento visível, mas relata fezes escurecidas ocasionais nos últimos meses, que atribuía ao uso de sulfato ferroso comprado por conta própria. Está na pós-menopausa há 8 anos. Ao exame físico, encontra-se descorada +2/+4, com pressão arterial de 118×70 mmHg, frequência cardíaca de 92 bpm, sem linfonodomegalias, sem hepatoesplenomegalia e com toque retal sem massas palpáveis, mas com fezes escurecidas na luva.",
    prompt: "Considerando o hemograma e o perfil de ferro, a interpretação e a conduta mais adequadas são:",
    labData: [
      { exam: "Hemoglobina", result: "8,4 g/dL", reference: "12,0–16,0 g/dL" },
      { exam: "VCM", result: "72 fL", reference: "80–100 fL" },
      { exam: "HCM", result: "24 pg", reference: "27–33 pg" },
      { exam: "RDW", result: "18,5%", reference: "11,5–14,5%" },
      { exam: "Ferritina", result: "8 ng/mL", reference: "15–200 ng/mL" },
      { exam: "Saturação de transferrina", result: "7%", reference: "20–50%" },
      { exam: "Proteína C reativa", result: "3 mg/L", reference: "< 5 mg/L" },
      { exam: "Contagem de reticulócitos", result: "0,8%", reference: "0,5–1,5%" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Hematologia e Hemoterapia", title: "Diretrizes sobre anemia ferropriva", year: null },
    ],
    keywords: ["anemia ferropriva", "ferritina", "investigação de perda digestiva", "colonoscopia"],
    tags: ["rastreamento"],
    explanation: {
      answerSummary: "Anemia ferropriva por provável perda digestiva; repor ferro e investigar o trato gastrointestinal com endoscopia e colonoscopia.",
      whyCorrect:
        "O perfil é inequívoco: microcitose com hipocromia, RDW elevado indicando anisocitose, ferritina de 8 ng/mL e saturação de transferrina de 7%. A PCR normal é importante porque a ferritina é proteína de fase aguda — sem inflamação, o valor baixo é confiável e não precisa de correção interpretativa. O ponto central não é o diagnóstico da anemia, e sim a obrigação que ele impõe: mulher na pós-menopausa com anemia ferropriva tem perda digestiva até prova em contrário, ainda mais com relato de melena intermitente. Repor ferro sem investigar trata o número e ignora a causa, que nessa faixa etária inclui neoplasia colorretal. A investigação endoscópica alta e baixa é mandatória.",
      keyClues: [
        "VCM de 72 fL com HCM de 24 pg e RDW de 18,5%",
        "Ferritina de 8 ng/mL com saturação de transferrina de 7%",
        "PCR normal — a ferritina baixa é interpretável diretamente",
        "Mulher na pós-menopausa: sem perda menstrual como explicação",
        "Relato de fezes escurecidas e achado no toque retal",
      ],
      clinicalPearl:
        "Anemia ferropriva em homem adulto ou em mulher na pós-menopausa é indicação de investigação do trato gastrointestinal, alta e baixa. A reposição de ferro nunca encerra a investigação.",
      commonTrap:
        "Prescrever ferro, ver a hemoglobina subir e dar o caso por encerrado. A resposta ao ferro confirma a ferropenia — não exclui a neoplasia que a está causando.",
      managementSteps: [
        "Iniciar reposição de ferro oral, orientando administração longe de laticínios e antiácidos",
        "Solicitar endoscopia digestiva alta e colonoscopia",
        "Reavaliar hemoglobina e reticulócitos em 2 a 4 semanas para confirmar resposta",
        "Manter a reposição por 3 meses após a normalização da hemoglobina, para repor estoques",
      ],
    },
    alternatives: [
      { label: "A", text: "Anemia de doença crônica; investigar processo inflamatório sistêmico antes de repor ferro.", isCorrect: false, rationale: "Na anemia de doença crônica a ferritina é normal ou alta e a PCR costuma estar elevada. Aqui a ferritina é de 8 ng/mL com PCR normal." },
      { label: "B", text: "Anemia ferropriva; repor ferro e investigar o trato gastrointestinal com endoscopia e colonoscopia.", isCorrect: true, rationale: "Correta. Perfil ferropênico inequívoco em mulher na pós-menopausa exige investigação de perda digestiva além da reposição." },
      { label: "C", text: "Traço talassêmico; solicitar eletroforese de hemoglobina e dispensar reposição de ferro.", isCorrect: false, rationale: "No traço talassêmico o RDW costuma ser normal e o perfil de ferro é normal ou aumentado — incompatível com ferritina de 8 ng/mL." },
      { label: "D", text: "Anemia ferropriva; repor ferro por 3 meses e reavaliar, sem necessidade de investigação endoscópica.", isCorrect: false, rationale: "Deixa de investigar a causa da perda em paciente com risco de neoplasia colorretal e relato de melena." },
    ],
  },
  {
    code: "CM-ONCO-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "NEXT_STEP",
    specialtySlug: "oncologia",
    topicSlug: "emergencias-oncologicas",
    subtopicSlug: "compressao-medular",
    stem:
      "Homem de 69 anos, com adenocarcinoma de próstata metastático em uso de bloqueio androgênico, procura a emergência com dor lombar de piora progressiva há 3 semanas, que agora o desperta à noite e não alivia com analgésico comum. Nas últimas 36 horas notou dificuldade para subir escadas e sensação de formigamento nos pés. Ao exame físico, encontra-se lúcido, com pressão arterial de 142×84 mmHg, frequência cardíaca de 82 bpm e temperatura de 36,4 °C. Apresenta dor à percussão da coluna torácica baixa, força grau 4 proximal em membros inferiores simetricamente, reflexos patelares e aquileus exaltados, sinal de Babinski bilateral e hipoestesia com nível sensitivo em torno de T10. O tônus esfincteriano está preservado e não há retenção urinária.",
    prompt: "Diante da principal hipótese diagnóstica, a conduta imediata mais adequada é:",
    labData: [
      { exam: "Cálcio total", result: "9,6 mg/dL", reference: "8,5–10,2 mg/dL" },
      { exam: "Fosfatase alcalina", result: "412 U/L", reference: "40–130 U/L" },
      { exam: "PSA total", result: "88 ng/mL", reference: "< 4 ng/mL" },
      { exam: "Creatinina", result: "1,0 mg/dL", reference: "0,7–1,3 mg/dL" },
      { exam: "Hemoglobina", result: "10,8 g/dL", reference: "13,5–17,5 g/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "National Institute for Health and Care Excellence", title: "Metastatic spinal cord compression in adults", year: null },
    ],
    keywords: ["compressão medular metastática", "corticoterapia", "ressonância magnética de coluna", "emergência oncológica"],
    tags: ["emergencia"],
    explanation: {
      answerSummary: "Administrar corticoide em dose alta imediatamente e solicitar ressonância magnética de toda a coluna com urgência.",
      whyCorrect:
        "O quadro é de compressão medular metastática: dor axial progressiva de padrão noturno em paciente com neoplasia osteotrópica conhecida, associada a sinais de lesão de primeiro neurônio motor — hiperreflexia, Babinski bilateral — e nível sensitivo. Duas decisões precisam ser tomadas em paralelo, e a ordem entre elas define o prognóstico. O corticoide em dose alta é iniciado assim que a suspeita se estabelece, sem aguardar a imagem, porque reduz o edema vasogênico e pode preservar função enquanto o restante é organizado. A ressonância deve cobrir toda a coluna, não apenas o segmento suspeito, porque lesões sincrônicas em outros níveis são frequentes e mudam o planejamento terapêutico. O estado neurológico no momento do tratamento é o principal determinante do desfecho — deambular na chegada é o melhor preditor de deambular depois.",
      keyClues: [
        "Dor axial progressiva que desperta à noite em paciente com neoplasia osteotrópica",
        "Hiperreflexia e Babinski bilateral — síndrome de primeiro neurônio motor",
        "Nível sensitivo em torno de T10",
        "Déficit motor de instalação recente, ainda parcial e portanto reversível",
      ],
      clinicalPearl:
        "Em compressão medular metastática, corticoide não espera imagem, e a ressonância cobre toda a coluna. A função neurológica preservada no momento do tratamento é o que mais prediz o resultado final.",
      commonTrap:
        "Aguardar a ressonância para iniciar o corticoide, ou pedir imagem apenas do nível correspondente ao déficit sensitivo, deixando escapar lesões sincrônicas em outros segmentos.",
      managementSteps: [
        "Corticoide em dose alta imediatamente, ainda na suspeita clínica",
        "Ressonância magnética de toda a coluna com urgência",
        "Acionar radioterapia e avaliação neurocirúrgica em paralelo",
        "Analgesia adequada e precauções para prevenir lesão adicional durante a mobilização",
      ],
    },
    alternatives: [
      { label: "A", text: "Solicitar radiografia simples de coluna lombar e prescrever analgesia, com reavaliação ambulatorial em 48 horas.", isCorrect: false, rationale: "A radiografia simples tem sensibilidade insuficiente e a espera de 48 horas pode significar paraplegia definitiva." },
      { label: "B", text: "Iniciar corticoide em dose alta imediatamente e solicitar ressonância magnética de toda a coluna com urgência.", isCorrect: true, rationale: "Correta. Corticoide precede a imagem, e a ressonância deve abranger toda a coluna pela frequência de lesões sincrônicas." },
      { label: "C", text: "Solicitar cintilografia óssea para mapear as metástases antes de qualquer intervenção.", isCorrect: false, rationale: "A cintilografia mapeia doença óssea, mas não avalia o canal medular nem a compressão neural, e atrasa o tratamento." },
      { label: "D", text: "Iniciar radioterapia paliativa imediatamente, sem exame de imagem prévio.", isCorrect: false, rationale: "A radioterapia é parte do tratamento, mas exige definição precisa do nível e da extensão por ressonância antes do planejamento." },
    ],
  },
  {
    code: "CM-GAST-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "HARD",
    clinicalReasoningType: "INITIAL_MANAGEMENT",
    specialtySlug: "gastroenterologia",
    topicSlug: "cirrose",
    subtopicSlug: "pbe",
    stem:
      "Homem de 55 anos, com cirrose hepática por doença hepática associada ao álcool, é internado por aumento do volume abdominal e febre não aferida há 3 dias. Refere abstinência há 6 meses e uso irregular de espironolactona e furosemida. Ao exame físico, encontra-se ictérico, com pressão arterial de 96×58 mmHg, frequência cardíaca de 98 bpm, frequência respiratória de 20 irpm e temperatura de 38,1 °C. O abdome está distendido, com macicez móvel e desconforto difuso à palpação, sem descompressão brusca dolorosa. Apresenta flapping discreto e desorientação temporal leve. Realizada paracentese diagnóstica na admissão, com os resultados abaixo.",
    prompt: "Considerando a análise do líquido ascítico, a conduta terapêutica mais adequada é:",
    labData: [
      { exam: "Contagem de leucócitos no líquido ascítico", result: "1.800 células/mm³", reference: "—" },
      { exam: "Polimorfonucleares no líquido ascítico", result: "62% (1.116 células/mm³)", reference: "< 250/mm³" },
      { exam: "Gradiente albumina soro-ascite (GASA)", result: "1,8 g/dL", reference: "≥ 1,1 g/dL indica hipertensão portal" },
      { exam: "Proteína total no líquido ascítico", result: "1,1 g/dL", reference: "—" },
      { exam: "Bacterioscopia do líquido ascítico", result: "Ausência de bactérias", reference: "—" },
      { exam: "Creatinina", result: "1,7 mg/dL (basal 1,0 mg/dL)", reference: "0,7–1,3 mg/dL" },
      { exam: "Bilirrubina total", result: "4,2 mg/dL", reference: "< 1,2 mg/dL" },
      { exam: "INR", result: "1,8", reference: "< 1,2" },
    ],
    media: [],
    guidelineReference: [
      { society: "European Association for the Study of the Liver", title: "Clinical Practice Guidelines for the management of patients with decompensated cirrhosis", year: null },
      { society: "Sociedade Brasileira de Hepatologia", title: "Consenso sobre ascite e peritonite bacteriana espontânea", year: null },
    ],
    keywords: ["peritonite bacteriana espontânea", "albumina", "síndrome hepatorrenal", "cefalosporina de terceira geração"],
    tags: ["emergencia"],
    explanation: {
      answerSummary: "Cefalosporina de terceira geração associada a albumina intravenosa.",
      whyCorrect:
        "A contagem de polimorfonucleares no líquido ascítico é de 1.116 células/mm³, muito acima do limiar de 250/mm³ que define peritonite bacteriana espontânea. A bacterioscopia negativa não afasta o diagnóstico — a maioria dos casos tem cultura de baixo rendimento e bacterioscopia negativa, e a decisão terapêutica é celular, não microbiológica. O antimicrobiano de escolha na PBE adquirida na comunidade é uma cefalosporina de terceira geração. O componente que a questão realmente testa é a albumina: em pacientes com creatinina elevada, ureia alta ou bilirrubina acima de 4 mg/dL, a infusão de albumina reduz a incidência de síndrome hepatorrenal e a mortalidade. Este paciente preenche dois desses critérios — creatinina de 1,7 mg/dL e bilirrubina de 4,2 mg/dL —, o que torna a albumina parte do tratamento, não um adjuvante opcional.",
      keyClues: [
        "Polimorfonucleares de 1.116/mm³ no líquido ascítico, acima do limiar de 250/mm³",
        "GASA de 1,8 g/dL confirmando ascite por hipertensão portal",
        "Bacterioscopia negativa — esperado, não exclui o diagnóstico",
        "Creatinina de 1,7 mg/dL e bilirrubina de 4,2 mg/dL: critérios para albumina",
      ],
      clinicalPearl:
        "PBE se diagnostica pela contagem de polimorfonucleares, não pela cultura. E em quem tem disfunção renal ou bilirrubina alta, a albumina é tão parte do tratamento quanto o antibiótico.",
      commonTrap:
        "Prescrever apenas o antibiótico e omitir a albumina — perde-se a medida que mais reduz síndrome hepatorrenal e mortalidade exatamente no subgrupo de maior risco.",
      managementSteps: [
        "Cefalosporina de terceira geração intravenosa por 5 a 7 dias",
        "Albumina intravenosa no primeiro dia e novamente no terceiro dia",
        "Suspender betabloqueador se houver hipotensão ou disfunção renal",
        "Evitar aminoglicosídeos e anti-inflamatórios não esteroidais",
        "Instituir profilaxia secundária com quinolona após a resolução do episódio",
      ],
    },
    alternatives: [
      { label: "A", text: "Cefalosporina de terceira geração associada a albumina intravenosa.", isCorrect: true, rationale: "Correta. Antimicrobiano de primeira linha na PBE comunitária somado à albumina, indicada pela creatinina e bilirrubina elevadas." },
      { label: "B", text: "Cefalosporina de terceira geração isolada, reservando albumina para o caso de piora da função renal.", isCorrect: false, rationale: "A albumina é preventiva, não de resgate. Aguardar a piora anula seu principal benefício." },
      { label: "C", text: "Aguardar o resultado da cultura do líquido ascítico antes de iniciar antimicrobiano, dada a bacterioscopia negativa.", isCorrect: false, rationale: "O diagnóstico já está feito pela contagem de polimorfonucleares. Retardar o antibiótico eleva a mortalidade." },
      { label: "D", text: "Iniciar quinolona oral em regime ambulatorial, com reavaliação em 72 horas.", isCorrect: false, rationale: "Trata-se de PBE com disfunção renal e encefalopatia — quadro que exige internação e terapia intravenosa." },
    ],
  },
  {
    code: "CM-REUM-0001",
    type: "OBJECTIVE",
    status: "PUBLISHED",
    sourceType: "ORIGINAL",
    difficulty: "MEDIUM",
    clinicalReasoningType: "NEXT_STEP",
    specialtySlug: "reumatologia",
    topicSlug: "artrites",
    stem:
      "Homem de 62 anos, com diabetes mellitus tipo 2 e artrose de joelhos, procura a emergência com dor intensa, calor e edema em joelho direito iniciados há 24 horas, com impossibilidade de deambular. Refere febre aferida de 38,4 °C em casa. Nega trauma, mas relata infiltração intra-articular com corticoide realizada no mesmo joelho há 3 semanas. Ao exame físico, encontra-se com pressão arterial de 128×76 mmHg, frequência cardíaca de 98 bpm e temperatura de 38,2 °C. O joelho direito apresenta derrame articular volumoso, calor local, eritema e dor intensa à mobilização passiva mínima, com limitação importante da amplitude de movimento. Os demais joelhos e articulações estão sem alterações.",
    prompt: "A conduta mais adequada neste momento é:",
    labData: [
      { exam: "Leucócitos", result: "16.200/mm³ (14% bastões)", reference: "4.000–11.000/mm³" },
      { exam: "Proteína C reativa", result: "186 mg/L", reference: "< 5 mg/L" },
      { exam: "VHS", result: "82 mm/h", reference: "< 20 mm/h" },
      { exam: "Ácido úrico sérico", result: "8,9 mg/dL", reference: "3,5–7,2 mg/dL" },
      { exam: "Glicemia", result: "212 mg/dL", reference: "70–99 mg/dL" },
    ],
    media: [],
    guidelineReference: [
      { society: "Sociedade Brasileira de Reumatologia", title: "Recomendações sobre artrite séptica", year: null },
    ],
    keywords: ["artrite séptica", "artrocentese", "monoartrite aguda", "gota"],
    tags: ["emergencia", "procedimento"],
    explanation: {
      answerSummary: "Realizar artrocentese com análise do líquido sinovial — celularidade, pesquisa de cristais, Gram e cultura — antes de iniciar o antimicrobiano.",
      whyCorrect:
        "Monoartrite aguda febril é artrite séptica até prova em contrário, e a prova é a artrocentese. Ela é simultaneamente diagnóstica e terapêutica, e precisa vir antes do antibiótico, porque a coleta após a primeira dose reduz muito o rendimento da cultura — perdendo-se a chance de identificar o agente e ajustar o espectro. O ácido úrico de 8,9 mg/dL é a armadilha do caso: hiperuricemia é comum e não faz diagnóstico de gota; além disso, gota e artrite séptica podem coexistir. Existem ainda dois fatores de risco explícitos para infecção: diabetes e procedimento intra-articular recente. Só o líquido sinovial separa as hipóteses — celularidade muito elevada com predomínio neutrofílico aponta infecção, cristais de urato monossódico apontam gota, e os dois achados juntos exigem tratar ambas.",
      keyClues: [
        "Monoartrite aguda com febre e impotência funcional",
        "Infiltração intra-articular há 3 semanas — porta de entrada",
        "Diabetes como fator de risco para artrite séptica",
        "PCR de 186 mg/L com leucocitose e desvio à esquerda",
        "Hiperuricemia isolada não estabelece diagnóstico alternativo",
      ],
      clinicalPearl:
        "Toda monoartrite aguda febril merece artrocentese antes do antibiótico. Ácido úrico alto não exclui infecção — e gota e artrite séptica podem ocorrer na mesma articulação.",
      commonTrap:
        "Atribuir o quadro à gota pela hiperuricemia e prescrever anti-inflamatório ou colchicina. Uma artrite séptica não tratada destrói a cartilagem em poucos dias.",
      managementSteps: [
        "Artrocentese com contagem celular, pesquisa de cristais, Gram e cultura",
        "Colher hemoculturas antes do antimicrobiano",
        "Iniciar antibioticoterapia empírica logo após a coleta do líquido sinovial",
        "Programar drenagem articular adequada, por punções repetidas ou via cirúrgica",
      ],
    },
    alternatives: [
      { label: "A", text: "Iniciar colchicina e anti-inflamatório não esteroidal, dado o ácido úrico elevado.", isCorrect: false, rationale: "Hiperuricemia é frequente e não faz diagnóstico de gota. Tratar como crise gotosa uma artrite séptica leva a destruição articular." },
      { label: "B", text: "Realizar artrocentese com análise do líquido sinovial antes de iniciar o antimicrobiano.", isCorrect: true, rationale: "Correta. É o exame que define o diagnóstico, e a coleta precisa preceder o antibiótico para preservar o rendimento da cultura." },
      { label: "C", text: "Iniciar antibioticoterapia empírica imediatamente e programar a artrocentese para o dia seguinte.", isCorrect: false, rationale: "Antibiótico antes da punção compromete a cultura. A artrocentese pode e deve ser feita imediatamente." },
      { label: "D", text: "Solicitar ressonância magnética do joelho para diferenciar artrite séptica de crise gotosa.", isCorrect: false, rationale: "A ressonância não distingue as duas condições de forma confiável e apenas atrasa o diagnóstico definitivo, que é laboratorial." },
    ],
  },
];
