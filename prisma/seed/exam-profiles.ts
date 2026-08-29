/**
 * Perfis de prova. O perfil "internato-clinica-medica" foi calibrado a partir da
 * análise estrutural documentada em docs/01-exam-analysis.md — números agregados,
 * nunca conteúdo. O perfil "residencia-cm-geral" é um alvo genérico de residência.
 */

export interface ExamProfileSeed {
  slug: string;
  name: string;
  description: string;
  institutionSlug?: string;
  examBoardSlug?: string;
  year?: number;
  alternativesCount: number;
  avgStemWords: number;
  objectiveCount: number;
  discursiveCount: number;
  durationMinutes: number;
  labDataFrequency: number;
  ecgFrequency: number;
  imagingFrequency: number;
  calculationFrequency: number;
  managementFrequency: number;
  clinicalReasoningIntensity: number;
  easyShare: number;
  mediumShare: number;
  hardShare: number;
  veryHardShare: number;
  specialtyMix: Record<string, number>;
  distractorPatterns: string[];
  preferredTerminology: string[];
  recurringThemes: string[];
  statsSource: "DERIVED" | "REFERENCE" | "MANUAL";
  sampleSize: number;
}

export const INSTITUTIONS = [
  { slug: "internato-referencia", name: "Internato — perfil de referência", kind: "INTERNAL" as const, state: null },
];

export const EXAM_BOARDS = [
  { slug: "interna", name: "Avaliação interna de internato" },
  { slug: "generica-residencia", name: "Perfil genérico de residência" },
];

export const EXAM_PROFILES: ExamProfileSeed[] = [
  {
    slug: "internato-clinica-medica",
    name: "Internato — Clínica Médica (perfil de referência)",
    description:
      "Perfil calibrado a partir da análise estrutural da prova de referência fornecida: 20 objetivas com 4 alternativas, 2 discursivas, forte peso em manejo e alta densidade de dados laboratoriais. Os números são agregados estatísticos; nenhum conteúdo da prova original está reproduzido no banco.",
    institutionSlug: "internato-referencia",
    examBoardSlug: "interna",
    year: 2026,
    alternativesCount: 4,
    avgStemWords: 180,
    objectiveCount: 20,
    discursiveCount: 2,
    durationMinutes: 120,
    labDataFrequency: 0.68,
    ecgFrequency: 0.14,
    imagingFrequency: 0.23,
    calculationFrequency: 0.14,
    managementFrequency: 0.55,
    clinicalReasoningIntensity: 0.85,
    easyShare: 0.1,
    mediumShare: 0.4,
    hardShare: 0.35,
    veryHardShare: 0.15,
    specialtyMix: {
      cardiologia: 0.23,
      infectologia: 0.18,
      pneumologia: 0.14,
      endocrinologia: 0.14,
      neurologia: 0.09,
      emergencia: 0.09,
      oncologia: 0.05,
      nefrologia: 0.05,
      hematologia: 0.02,
      "cuidados-paliativos": 0.01,
    },
    distractorPatterns: [
      "Terapia correta oferecida no momento errado da sequência de manejo",
      "Alternativas que combinam classificação e conduta, cruzando as combinações certa/errada",
      "Diagnóstico prevalente que um único dado do caso torna incompatível",
      "Antimicrobiano plausível com espectro insuficiente para o agente crítico",
      "Opção eticamente confortável que viola a autonomia do paciente",
      "Mecanismo fisiopatológico atribuído ao fármaco ou agente errado",
    ],
    preferredTerminology: [
      "pressão arterial em mmHg com separador ×",
      "frequência respiratória em irpm",
      "valores de referência sempre ao lado do resultado",
      "escores nomeados em português (escore de Wells, classificação de Stanford)",
    ],
    recurringThemes: [
      "manejo inicial em emergência clínica",
      "escolha de antimicrobiano guiada por contexto e antibiograma",
      "classificação de gravidade seguida de terapia inicial",
      "interpretação de gasometria e de líquidos corporais",
      "diretriz brasileira aplicada a caso clínico",
    ],
    statsSource: "REFERENCE",
    sampleSize: 22,
  },
  {
    slug: "residencia-cm-geral",
    name: "Residência — Clínica Médica (perfil genérico)",
    description:
      "Perfil genérico de prova de residência em Clínica Médica: vinhetas mais curtas, distribuição equilibrada entre diagnóstico e conduta, e cobertura ampla de especialidades.",
    examBoardSlug: "generica-residencia",
    alternativesCount: 4,
    avgStemWords: 130,
    objectiveCount: 30,
    discursiveCount: 0,
    durationMinutes: 120,
    labDataFrequency: 0.5,
    ecgFrequency: 0.1,
    imagingFrequency: 0.15,
    calculationFrequency: 0.08,
    managementFrequency: 0.45,
    clinicalReasoningIntensity: 0.7,
    easyShare: 0.2,
    mediumShare: 0.45,
    hardShare: 0.27,
    veryHardShare: 0.08,
    specialtyMix: {
      cardiologia: 0.18,
      pneumologia: 0.12,
      infectologia: 0.12,
      gastroenterologia: 0.1,
      nefrologia: 0.1,
      endocrinologia: 0.1,
      neurologia: 0.08,
      hematologia: 0.06,
      reumatologia: 0.06,
      emergencia: 0.08,
    },
    distractorPatterns: [
      "Conduta correta para uma etapa posterior do manejo",
      "Exame complementar de menor rendimento no cenário descrito",
      "Diagnóstico diferencial que exigiria um achado ausente no caso",
    ],
    preferredTerminology: ["terminologia médica brasileira padrão"],
    recurringThemes: [
      "diagnóstico a partir de vinheta clínica",
      "conduta inicial em situações comuns de enfermaria e ambulatório",
      "interpretação de exames laboratoriais de rotina",
    ],
    statsSource: "MANUAL",
    sampleSize: 0,
  },
];

export const TAGS = [
  { slug: "emergencia", name: "Emergência", kind: "SETTING" },
  { slug: "escore-risco", name: "Escore de risco", kind: "SKILL" },
  { slug: "reperfusao", name: "Reperfusão", kind: "THEME" },
  { slug: "terapia-modificadora", name: "Terapia modificadora de prognóstico", kind: "THEME" },
  { slug: "neuroimagem", name: "Neuroimagem", kind: "SKILL" },
  { slug: "notificacao-compulsoria", name: "Notificação compulsória", kind: "THEME" },
  { slug: "farmacologia", name: "Farmacologia", kind: "THEME" },
  { slug: "correcao-eletrolitica", name: "Correção eletrolítica", kind: "SKILL" },
  { slug: "procedimento", name: "Procedimento", kind: "SKILL" },
  { slug: "pacote-sepse", name: "Pacote de sepse", kind: "GUIDELINE" },
  { slug: "controle-infeccao", name: "Controle de infecção", kind: "THEME" },
  { slug: "rastreamento", name: "Rastreamento", kind: "THEME" },
  { slug: "sindrome-geriatrica", name: "Síndrome geriátrica", kind: "THEME" },
  { slug: "cuidados-paliativos", name: "Cuidados paliativos", kind: "THEME" },
  { slug: "seguranca-medicamentosa", name: "Segurança medicamentosa", kind: "THEME" },
  { slug: "acls", name: "ACLS", kind: "GUIDELINE" },
  { slug: "terapia-intensiva", name: "Terapia intensiva", kind: "SETTING" },
  { slug: "disturbio-acido-base", name: "Distúrbio ácido-base", kind: "SKILL" },
];
