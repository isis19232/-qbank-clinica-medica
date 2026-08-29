/**
 * Taxonomia de Clínica Médica. `yieldWeight` (1–5) reflete a frequência do
 * tópico em provas de residência brasileiras e alimenta a priorização adaptativa.
 *
 * As demais áreas (Cirurgia, Pediatria, GO, Preventiva, Psiquiatria) já entram
 * cadastradas e inativas: o schema é o mesmo, basta popular especialidades.
 */

export interface TopicSeed {
  slug: string;
  name: string;
  yieldWeight: number;
  subtopics?: { slug: string; name: string }[];
}

export interface SpecialtySeed {
  slug: string;
  name: string;
  topics: TopicSeed[];
}

export const AREAS = [
  { slug: "clinica-medica", name: "Clínica Médica", order: 1, active: true },
  { slug: "cirurgia", name: "Cirurgia", order: 2, active: false },
  { slug: "pediatria", name: "Pediatria", order: 3, active: false },
  { slug: "ginecologia-obstetricia", name: "Ginecologia e Obstetrícia", order: 4, active: false },
  { slug: "preventiva", name: "Medicina Preventiva e Social", order: 5, active: false },
  { slug: "psiquiatria", name: "Psiquiatria", order: 6, active: false },
];

export const CLINICAL_MEDICINE: SpecialtySeed[] = [
  {
    slug: "cardiologia",
    name: "Cardiologia",
    topics: [
      {
        slug: "sindromes-coronarianas",
        name: "Síndromes coronarianas agudas",
        yieldWeight: 5,
        subtopics: [
          { slug: "iamcsst", name: "IAM com supra de ST" },
          { slug: "iamssst", name: "IAM sem supra de ST e angina instável" },
          { slug: "reperfusao", name: "Estratégias de reperfusão" },
        ],
      },
      {
        slug: "insuficiencia-cardiaca",
        name: "Insuficiência cardíaca",
        yieldWeight: 5,
        subtopics: [
          { slug: "icfer", name: "IC com fração de ejeção reduzida" },
          { slug: "icfep", name: "IC com fração de ejeção preservada" },
          { slug: "ic-descompensada", name: "IC agudamente descompensada" },
        ],
      },
      {
        slug: "arritmias",
        name: "Arritmias",
        yieldWeight: 4,
        subtopics: [
          { slug: "fibrilacao-atrial", name: "Fibrilação atrial" },
          { slug: "taquiarritmias", name: "Taquiarritmias" },
          { slug: "bradiarritmias", name: "Bradiarritmias e bloqueios" },
        ],
      },
      {
        slug: "dislipidemia",
        name: "Dislipidemia e risco cardiovascular",
        yieldWeight: 4,
        subtopics: [
          { slug: "metas-ldl", name: "Metas de LDL por estrato de risco" },
          { slug: "terapia-hipolipemiante", name: "Terapia hipolipemiante" },
        ],
      },
      {
        slug: "hipertensao",
        name: "Hipertensão arterial",
        yieldWeight: 4,
        subtopics: [
          { slug: "hipertensao-secundaria", name: "Hipertensão secundária" },
          { slug: "emergencia-hipertensiva", name: "Urgência e emergência hipertensiva" },
        ],
      },
      {
        slug: "doenca-pericardica",
        name: "Doenças do pericárdio",
        yieldWeight: 3,
        subtopics: [
          { slug: "pericardite-aguda", name: "Pericardite aguda" },
          { slug: "tamponamento", name: "Tamponamento cardíaco" },
        ],
      },
      {
        slug: "doenca-aortica",
        name: "Doenças da aorta",
        yieldWeight: 3,
        subtopics: [
          { slug: "disseccao-aortica", name: "Dissecção aórtica" },
          { slug: "aneurisma-aorta", name: "Aneurisma de aorta" },
        ],
      },
      { slug: "valvopatias", name: "Valvopatias", yieldWeight: 3 },
      {
        slug: "cardio-oncologia",
        name: "Cardio-oncologia",
        yieldWeight: 2,
        subtopics: [{ slug: "cardiotoxicidade", name: "Cardiotoxicidade por quimioterápicos" }],
      },
    ],
  },
  {
    slug: "pneumologia",
    name: "Pneumologia",
    topics: [
      {
        slug: "dpoc",
        name: "DPOC",
        yieldWeight: 5,
        subtopics: [
          { slug: "dpoc-classificacao", name: "Classificação GOLD e terapia inicial" },
          { slug: "dpoc-exacerbacao", name: "Exacerbação aguda" },
          { slug: "cor-pulmonale", name: "Cor pulmonale" },
        ],
      },
      { slug: "asma", name: "Asma", yieldWeight: 4 },
      {
        slug: "pneumonias",
        name: "Pneumonias",
        yieldWeight: 5,
        subtopics: [
          { slug: "pac", name: "Pneumonia adquirida na comunidade" },
          { slug: "pneumonia-hospitalar", name: "Pneumonia hospitalar e associada à ventilação" },
        ],
      },
      {
        slug: "derrame-pleural",
        name: "Derrame pleural",
        yieldWeight: 4,
        subtopics: [
          { slug: "criterios-light", name: "Critérios de Light" },
          { slug: "derrame-parapneumonico", name: "Derrame parapneumônico e empiema" },
        ],
      },
      { slug: "tuberculose", name: "Tuberculose", yieldWeight: 5 },
      { slug: "doenca-intersticial", name: "Doenças intersticiais pulmonares", yieldWeight: 3 },
    ],
  },
  {
    slug: "gastroenterologia",
    name: "Gastroenterologia",
    topics: [
      { slug: "hepatites", name: "Hepatites virais", yieldWeight: 4 },
      {
        slug: "cirrose",
        name: "Cirrose e suas complicações",
        yieldWeight: 5,
        subtopics: [
          { slug: "pbe", name: "Peritonite bacteriana espontânea" },
          { slug: "hda-varicosa", name: "Hemorragia digestiva varicosa" },
          { slug: "encefalopatia-hepatica", name: "Encefalopatia hepática" },
        ],
      },
      { slug: "doenca-inflamatoria-intestinal", name: "Doença inflamatória intestinal", yieldWeight: 3 },
      { slug: "pancreatite", name: "Pancreatite aguda", yieldWeight: 4 },
      { slug: "hemorragia-digestiva", name: "Hemorragia digestiva", yieldWeight: 4 },
    ],
  },
  {
    slug: "nefrologia",
    name: "Nefrologia",
    topics: [
      {
        slug: "injuria-renal-aguda",
        name: "Injúria renal aguda",
        yieldWeight: 5,
        subtopics: [
          { slug: "ira-pre-renal", name: "IRA pré-renal" },
          { slug: "necrose-tubular", name: "Necrose tubular aguda" },
          { slug: "nefrite-intersticial", name: "Nefrite intersticial aguda" },
        ],
      },
      { slug: "doenca-renal-cronica", name: "Doença renal crônica", yieldWeight: 4 },
      {
        slug: "disturbios-hidroeletroliticos",
        name: "Distúrbios hidroeletrolíticos",
        yieldWeight: 5,
        subtopics: [
          { slug: "hiponatremia", name: "Hiponatremia" },
          { slug: "hipercalemia", name: "Hipercalemia" },
          { slug: "disturbios-calcio", name: "Distúrbios do cálcio" },
        ],
      },
      { slug: "disturbios-acido-base", name: "Distúrbios ácido-base", yieldWeight: 4 },
      { slug: "glomerulopatias", name: "Glomerulopatias", yieldWeight: 3 },
    ],
  },
  {
    slug: "endocrinologia",
    name: "Endocrinologia",
    topics: [
      {
        slug: "diabetes",
        name: "Diabetes mellitus",
        yieldWeight: 5,
        subtopics: [
          { slug: "dm2-tratamento", name: "Tratamento do DM2" },
          { slug: "cetoacidose", name: "Cetoacidose diabética e EHH" },
          { slug: "complicacoes-cronicas", name: "Complicações crônicas" },
        ],
      },
      { slug: "tireoide", name: "Doenças da tireoide", yieldWeight: 4 },
      {
        slug: "hipofise-adrenal",
        name: "Hipófise e adrenal",
        yieldWeight: 3,
        subtopics: [
          { slug: "hipopituitarismo", name: "Hipopituitarismo" },
          { slug: "insuficiencia-adrenal", name: "Insuficiência adrenal" },
          { slug: "cushing", name: "Síndrome de Cushing" },
        ],
      },
      { slug: "obesidade", name: "Obesidade", yieldWeight: 3 },
      { slug: "osteometabolico", name: "Doenças osteometabólicas", yieldWeight: 2 },
    ],
  },
  {
    slug: "neurologia",
    name: "Neurologia",
    topics: [
      {
        slug: "avc",
        name: "Doença cerebrovascular",
        yieldWeight: 5,
        subtopics: [
          { slug: "avc-isquemico", name: "AVC isquêmico" },
          { slug: "avc-hemorragico", name: "AVC hemorrágico" },
        ],
      },
      {
        slug: "cefaleias",
        name: "Cefaleias",
        yieldWeight: 3,
        subtopics: [{ slug: "cefaleia-secundaria", name: "Cefaleias secundárias" }],
      },
      { slug: "epilepsia", name: "Epilepsia e estado de mal", yieldWeight: 3 },
      {
        slug: "infeccoes-snc",
        name: "Infecções do sistema nervoso central",
        yieldWeight: 4,
        subtopics: [
          { slug: "meningites", name: "Meningites" },
          { slug: "encefalites", name: "Encefalites" },
        ],
      },
      {
        slug: "demencias",
        name: "Demências e síndromes confusionais",
        yieldWeight: 3,
        subtopics: [{ slug: "hematoma-subdural", name: "Hematoma subdural crônico" }],
      },
    ],
  },
  {
    slug: "infectologia",
    name: "Infectologia",
    topics: [
      {
        slug: "sepse",
        name: "Sepse e choque séptico",
        yieldWeight: 5,
        subtopics: [{ slug: "ressuscitacao-sepse", name: "Ressuscitação inicial" }],
      },
      {
        slug: "infeccoes-urinarias",
        name: "Infecções do trato urinário",
        yieldWeight: 4,
        subtopics: [{ slug: "itu-complicada", name: "ITU complicada e resistência" }],
      },
      { slug: "hiv", name: "HIV e infecções oportunistas", yieldWeight: 4 },
      {
        slug: "arboviroses",
        name: "Arboviroses",
        yieldWeight: 4,
        subtopics: [{ slug: "dengue", name: "Dengue" }],
      },
      { slug: "endocardite", name: "Endocardite infecciosa", yieldWeight: 3 },
      { slug: "antimicrobianos", name: "Uso racional de antimicrobianos", yieldWeight: 4 },
    ],
  },
  {
    slug: "hematologia",
    name: "Hematologia",
    topics: [
      {
        slug: "anemias",
        name: "Anemias",
        yieldWeight: 5,
        subtopics: [
          { slug: "anemia-ferropriva", name: "Anemia ferropriva" },
          { slug: "anemia-doenca-cronica", name: "Anemia de doença crônica" },
          { slug: "anemias-hemoliticas", name: "Anemias hemolíticas" },
        ],
      },
      {
        slug: "neutropenia-febril",
        name: "Neutropenia febril",
        yieldWeight: 4,
      },
      { slug: "disturbios-coagulacao", name: "Distúrbios da coagulação", yieldWeight: 3 },
      { slug: "leucemias-linfomas", name: "Leucemias e linfomas", yieldWeight: 3 },
    ],
  },
  {
    slug: "oncologia",
    name: "Oncologia",
    topics: [
      {
        slug: "emergencias-oncologicas",
        name: "Emergências oncológicas",
        yieldWeight: 4,
        subtopics: [
          { slug: "hipercalcemia-maligna", name: "Hipercalcemia maligna" },
          { slug: "sindrome-lise-tumoral", name: "Síndrome de lise tumoral" },
          { slug: "compressao-medular", name: "Compressão medular metastática" },
        ],
      },
      { slug: "rastreamento-oncologico", name: "Rastreamento oncológico", yieldWeight: 3 },
      { slug: "sindromes-paraneoplasicas", name: "Síndromes paraneoplásicas", yieldWeight: 3 },
    ],
  },
  {
    slug: "reumatologia",
    name: "Reumatologia",
    topics: [
      { slug: "artrites", name: "Artrites", yieldWeight: 4 },
      { slug: "lupus", name: "Lúpus eritematoso sistêmico", yieldWeight: 4 },
      { slug: "vasculites", name: "Vasculites", yieldWeight: 3 },
      { slug: "gota", name: "Gota e artropatias por cristais", yieldWeight: 3 },
    ],
  },
  {
    slug: "emergencia",
    name: "Medicina de Emergência",
    topics: [
      {
        slug: "parada-cardiorrespiratoria",
        name: "Parada cardiorrespiratória",
        yieldWeight: 5,
        subtopics: [
          { slug: "ritmos-chocaveis", name: "Ritmos chocáveis" },
          { slug: "aesp-assistolia", name: "AESP e assistolia" },
        ],
      },
      { slug: "dor-toracica", name: "Abordagem da dor torácica", yieldWeight: 5 },
      { slug: "dispneia-aguda", name: "Dispneia aguda", yieldWeight: 4 },
      { slug: "intoxicacoes", name: "Intoxicações exógenas", yieldWeight: 3 },
      {
        slug: "tromboembolismo",
        name: "Doença tromboembólica",
        yieldWeight: 5,
        subtopics: [
          { slug: "tvp", name: "Trombose venosa profunda" },
          { slug: "tep", name: "Tromboembolismo pulmonar" },
        ],
      },
    ],
  },
  {
    slug: "terapia-intensiva",
    name: "Terapia Intensiva",
    topics: [
      { slug: "ventilacao-mecanica", name: "Ventilação mecânica", yieldWeight: 4 },
      { slug: "choque", name: "Estados de choque", yieldWeight: 5 },
      { slug: "sdra", name: "SDRA", yieldWeight: 3 },
      { slug: "sedacao-analgesia", name: "Sedação e analgesia", yieldWeight: 2 },
    ],
  },
  {
    slug: "geriatria",
    name: "Geriatria",
    topics: [
      { slug: "sindromes-geriatricas", name: "Síndromes geriátricas", yieldWeight: 4 },
      { slug: "delirium", name: "Delirium", yieldWeight: 4 },
      { slug: "polifarmacia", name: "Polifarmácia e desprescrição", yieldWeight: 3 },
      { slug: "quedas", name: "Quedas e fragilidade", yieldWeight: 3 },
    ],
  },
  {
    slug: "cuidados-paliativos",
    name: "Cuidados Paliativos",
    topics: [
      { slug: "controle-sintomas", name: "Controle de sintomas", yieldWeight: 4 },
      { slug: "comunicacao-ma-noticia", name: "Comunicação e objetivos de cuidado", yieldWeight: 4 },
      { slug: "dor-oncologica", name: "Dor oncológica", yieldWeight: 4 },
    ],
  },
  {
    slug: "farmacologia-clinica",
    name: "Farmacologia Clínica",
    topics: [
      { slug: "interacoes-medicamentosas", name: "Interações medicamentosas", yieldWeight: 3 },
      { slug: "ajuste-renal", name: "Ajuste de dose na disfunção renal", yieldWeight: 3 },
      { slug: "reacoes-adversas", name: "Reações adversas a medicamentos", yieldWeight: 3 },
    ],
  },
  {
    slug: "clinica-geral",
    name: "Clínica Médica Geral",
    topics: [
      { slug: "distúrbios-nutricionais", name: "Distúrbios nutricionais", yieldWeight: 2 },
      { slug: "cuidado-perioperatorio", name: "Avaliação de risco perioperatório", yieldWeight: 3 },
      { slug: "febre-origem-indeterminada", name: "Febre de origem indeterminada", yieldWeight: 3 },
    ],
  },
];
