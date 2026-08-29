# Análise Estrutural da Prova de Referência

> **Fonte:** prova interna de Clínica Médica (internato, PR1 Rodízio 2026.1.1) + gabarito
> comentado, fornecidos pela usuária. Este documento registra **apenas características
> estruturais e estatísticas agregadas**. Nenhum enunciado, alternativa ou justificativa da
> prova original é reproduzido no banco de questões da plataforma. O material foi usado
> exclusivamente para calibrar o *perfil* de geração (estilo, extensão, dificuldade,
> distribuição de temas e padrões de raciocínio).

---

## 1. Forma da prova

| Característica | Valor observado |
|---|---|
| Questões objetivas | 20 |
| Alternativas por questão objetiva | 4 (A–D) |
| Questões discursivas | 2 (Q21 e Q22), cada uma com 2 sub-itens (A e B) |
| Duração | 2 horas |
| Tempo médio implícito | ~5,5 min/questão objetiva (descontando as discursivas) |
| Idioma | Português (pt-BR), terminologia médica brasileira |
| Consulta | Vedada |
| Correção objetiva | Folha de gabarito separada (A B C D) |
| Recurso | Formulário próprio, prazo de 48 h úteis, exige bibliografia |

## 2. Anatomia do enunciado objetivo

Padrão altamente consistente em 20/20 questões:

```
[Demografia + comorbidades + medicações em uso]
   → [Queixa e evolução temporal]
   → [Exame físico com sinais vitais numéricos completos]
   → [Tabela de exames complementares com valores de referência]
   → [Pergunta focada em uma decisão]
   → [4 alternativas plausíveis]
```

Medidas do corpus (22 questões):

| Métrica | Valor |
|---|---|
| Extensão média do enunciado | ~180 palavras (faixa 110–320) |
| Enunciados com sinais vitais completos (PA, FC, FR, SatO₂, Tax) | 20/22 (91%) |
| Enunciados com tabela laboratorial + valores de referência | 15/22 (68%) |
| Enunciados com ECG | 3/22 (14%) — Q13, Q14, Q22 |
| Enunciados com imagem (RX tórax, angio-TC) | 5/22 (23%) |
| Enunciados que exigem cálculo explícito | 3/22 (14%) — critérios de Light, relação P/S e LDH, FeNa |
| Enunciados com idade e sexo declarados | 22/22 (100%) |
| Uso de escores nomeados | Wells, Glasgow, mMRC, GOLD, KPS/Karnofsky, MEEM, NYHA, Stanford |

**Assinatura estilística:** o enunciado quase nunca entrega o diagnóstico. Ele entrega os
*achados* — o candidato precisa nomear a síndrome antes de responder a pergunta, que
frequentemente é sobre a etapa seguinte (conduta), não sobre o diagnóstico em si.

## 3. Tipos de pergunta (verbo condutor)

| Tipo de raciocínio | Nº | % | Exemplos de formulação |
|---|---|---|---|
| Conduta / tratamento inicial | 9 | 41% | "a conduta terapêutica mais adequada é prescrever" |
| Diagnóstico / hipótese principal | 4 | 18% | "a principal hipótese diagnóstica é" |
| Mecanismo fisiopatológico | 3 | 14% | "qual o mecanismo mais provável responsável por" |
| Classificação + conduta (combinada) | 3 | 14% | "a classificação e a terapia inicial são, respectivamente" |
| Próximo passo diagnóstico | 2 | 9% | "qual o exame complementar e o achado esperado" |
| Interpretação de dado laboratorial | 1 | 4% | critérios de Light (discursiva) |

A prova é **predominantemente de manejo** (55% quando somadas conduta e classificação+conduta),
não de diagnóstico puro. Isso deve ser espelhado pelo motor de geração.

## 4. Distribuição por especialidade

| Especialidade | Questões | % |
|---|---|---|
| Cardiologia | 5 (Q2, Q13, Q15, Q16, Q20) | 23% |
| Pneumologia | 3 (Q3, Q21, Q22) | 14% |
| Infectologia | 4 (Q1, Q5, Q6, Q7) | 18% |
| Endocrinologia | 3 (Q4, Q8, Q9) | 14% |
| Emergência / Terapia intensiva | 2 (Q11, Q14) | 9% |
| Oncologia / Cardio-oncologia | 2 (Q10, Q16 compartilhada) | 9% |
| Nefrologia | 1 (Q12) | 5% |
| Neurologia | 2 (Q1 compartilhada, Q17) | 9% |
| Hematologia | 1 (Q5 compartilhada) | 5% |
| Cuidados paliativos | 1 (Q19) | 5% |
| Doença tromboembólica | 1 (Q18) | 5% |
| Geriatria | 1 (Q17 compartilhada) | 5% |

*(Soma > 100% porque questões cruzam especialidades — daí a decisão de modelar
`specialty` primária + `tags` múltiplas no schema.)*

## 5. Temas específicos observados

Infectologia: encefalite viral, neutropenia febril, hepatite viral aguda, ITU complicada
com antibiograma / descalonamento (ESBL).
Cardiologia: dislipidemia de risco extremo, dissecção aórtica (A e B), cardiotoxicidade
por antraciclina vs. trastuzumabe, pericardite aguda, PCR em AESP.
Pneumologia: DPOC (classificação GOLD + terapia inicial), derrame pleural exsudativo
linfocitário, cor pulmonale, edema pulmonar de reexpansão.
Endocrinologia: hipopituitarismo por macroadenoma, farmacoterapia da obesidade,
DM2 com DCV estabelecida.
Nefrologia: IRA pré-renal vs. NTA (FeNa, Na urinário, sedimento).
Oncologia: hipercalcemia maligna (mecanismos), cuidados paliativos e conspiração do silêncio.
Emergência: sepse/choque séptico (ressuscitação volêmica), ACLS AESP, TVP pós-operatória
com escore de Wells.

## 6. Diretrizes explicitamente invocadas

| Diretriz / fonte | Onde aparece |
|---|---|
| GOLD (DPOC) | classificação de grupo e terapia inicial |
| Sociedade Brasileira de Diabetes | manejo inicial do DM2 com DCVA |
| Diretriz brasileira de dislipidemia (SBC) | meta de LDL em risco extremo, ezetimiba antes de PCSK9 |
| AHA / ACLS | algoritmo de AESP, 5H e 5T |
| Surviving Sepsis Campaign | 30 mL/kg de cristaloide |
| IDSA (neutropenia febril) | monoterapia antipseudomonas |
| Critérios de Light | diferenciação exsudato/transudato |
| Escore de Wells | probabilidade pré-teste de TVP |
| Classificação de Stanford | dissecção aórtica A vs. B |
| Escada analgésica da OMS | dor oncológica |
| Diretrizes de obesidade (IMC ≥ 27 + comorbidade) | limiar de farmacoterapia |

**Consequência de projeto:** cada questão do banco carrega `guidelineReference` com
sociedade + ano/versão, para que conteúdo desatualizado seja localizável e revisável.

## 7. Padrões de distratores

Cinco padrões recorrentes, catalogados para o gerador e para a classificação de erro:

1. **Terapia correta, momento errado.** Ex.: vasopressor antes da reposição volêmica.
2. **Classificação certa, terapia errada (e vice-versa).** Alternativas combinam dois
   campos e cruzam as combinações — força o candidato a acertar os dois.
3. **Diagnóstico prevalente porém incompatível com um dado-chave.** Ex.: hipotireoidismo
   primário diante de TSH normal com T4L baixo.
4. **Espectro antimicrobiano insuficiente.** Droga plausível que não cobre o agente crítico.
5. **Armadilha ética/de comunicação.** A opção "confortável" viola autonomia do paciente.
6. **Mecanismo trocado entre agentes.** Atribuir a lesão tipo I/II ao fármaco errado.

## 8. Calibração de dificuldade estimada

Aplicando a rubrica da plataforma retroativamente às 22 questões:

| Nível | Nº | % | Perfil |
|---|---|---|---|
| Fácil | 2 | 9% | reconhecimento de padrão clássico (hepatite A, pericardite) |
| Médio | 9 | 41% | integração de história + laboratório (IRA pré-renal, sepse, TVP) |
| Difícil | 8 | 36% | diagnósticos competindo ou diretriz específica (GOLD E, ezetimiba, cefepime) |
| Muito difícil | 3 | 14% | múltiplas variáveis interagindo (macroadenoma, cardiotoxicidade tipo II, discursiva do cor pulmonale) |

Perfil resultante: **prova de dificuldade média-alta**, sem trivia, com forte peso em manejo.

## 9. Discursivas — estrutura observada

Ambas seguem o mesmo molde:

- Vinheta clínica completa (mesma densidade das objetivas)
- Sub-item **A**: interpretação/diagnóstico ("qual o diagnóstico bioquímico e 2 hipóteses")
- Sub-item **B**: complicação ou conduta ("qual a principal complicação e a conduta imediata")
- Gabarito comentado enumera **pontos-chave discretos** — cada um claramente pontuável

Isso mapeia diretamente para o modelo `DiscursiveRubric` (critérios com peso, pontos
esperados, e resposta-modelo).

## 10. O que o perfil de geração deve reproduzir

| Parâmetro | Alvo derivado |
|---|---|
| `avgStemWords` | 180 |
| `alternativesCount` | 4 |
| `labDataFrequency` | 0.68 |
| `ecgFrequency` | 0.14 |
| `imagingFrequency` | 0.23 |
| `calculationFrequency` | 0.14 |
| `managementFrequency` | 0.55 |
| `clinicalReasoningIntensity` | 0.85 (alta) |
| Distribuição de dificuldade | 10 / 40 / 35 / 15 |
| Mix de especialidades | conforme seção 4 |

Esses números alimentam `ExamProfile` no banco e são injetados no prompt do gerador.
