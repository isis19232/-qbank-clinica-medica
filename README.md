# QBank Clínica Médica

Banco de questões originais e plataforma de estudo adaptativo em Clínica Médica, para
preparação de residência médica no Brasil.

Interface e conteúdo em português do Brasil.

---

## Começando

```bash
npm install
npm run setup     # prisma generate + db push + seed
npm run dev       # http://localhost:3000
```

Login de demonstração: `demo@qbank.local` / `demo1234`

O `.env` já vem com um `DATABASE_URL` de SQLite para desenvolvimento. A camada de IA é
opcional — sem `ANTHROPIC_API_KEY` a aplicação funciona por completo, apenas sem geração de
questões e com o tutor em modo degradado.

```bash
# Opcional, habilita geração de questões, tutor completo e correção discursiva
ANTHROPIC_API_KEY="sk-ant-..."
```

## Produção

Veja [**docs/03-deployment.md**](docs/03-deployment.md) para deploy em Vercel com PostgreSQL.

Resumo:
- Ambiente: Vercel + Vercel Postgres
- Migrações: Prisma Migrate (aplicadas automaticamente)
- Autenticação: AUTH_SECRET seguro obrigatório
- IA: ANTHROPIC_API_KEY opcional

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (roda `prisma generate` antes) |
| `npm start` | Servidor de produção |
| `npm test` | Suíte de testes (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Repopula taxonomia, perfis e banco de questões (idempotente) |
| `npm run db:reset` | Recria o banco do zero e semeia |

## O que está implementado

**Resolução de questões.** Vinheta clínica → tabela de exames com valores de referência →
pergunta focada → 4 alternativas → confirmar → resultado → explicação estruturada → pérola
clínica → próxima. Atalhos A–D e Enter. O gabarito não trafega ao cliente antes da resposta
ser registrada.

**Explicação estruturada.** Toda questão traz: resumo da resposta, raciocínio passo a passo,
pistas-chave, justificativa individual de cada alternativa, sequência de manejo quando
aplicável, pérola clínica, armadilha comum e as diretrizes citadas com a sociedade
responsável.

**Motor adaptativo.** Dez sinais ponderados escolhem a próxima questão: fraqueza no tópico,
erro recente, rendimento do tópico em prova, casamento de dificuldade com habilidade
estimada, revisão devida, confiança declarada, aderência ao perfil da prova-alvo, novidade,
recência e poder discriminativo. Uma cota de mistura impede que o estudo vire monocultura do
tópico mais fraco.

**Repetição espaçada.** SM-2 modificado por confiança. Acertar chutando traz a questão de
volta em até 3 dias; errar com convicção, em ~6 horas.

**Caderno de erros.** Todo erro é registrado e classificado automaticamente em oito tipos
(lacuna de conhecimento, leitura apressada, confusão com distrator, erro de diretriz, erro de
cálculo, raciocínio diagnóstico, raciocínio terapêutico, interpretação equivocada). Cada tipo
vem com orientação acionável. O usuário pode reclassificar — e a heurística não sobrescreve
uma classificação manual.

**Estudo de hoje.** Informe os minutos disponíveis; o bloco é montado com 40% questões novas,
20% revisão de erros, 20% revisão espaçada e 20% tópicos fracos. Quando uma fonte não tem
material, a sobra vira questão nova — o bloco nunca sai curto por rigidez de cota.

**Simulados.** Prova cronometrada com folha de respostas navegável, montada segundo o
blueprint do perfil escolhido. Relatório final por especialidade, tópico e dificuldade, com
questões em branco, respostas alteradas e percentil (só quando há amostra suficiente).

**Analytics.** Acurácia geral e por recorte, mapa de fraquezas com semáforo, tópicos
prioritários (alta importância × baixo desempenho), evolução temporal, sequência de dias e
calibração de confiança contra acerto.

**Raio-X de prova.** Perfil estatístico de cada prova, mostrando lado a lado o perfil
*declarado* e o *medido no banco atual*: especialidades frequentes, tipos de pergunta,
distribuição de dificuldade, uso de laboratório/ECG/imagem, padrões de distrator e diretrizes
mais citadas.

**Tutor de IA.** Dentro de cada questão: explique melhor, por que a alternativa B está errada,
pérola clínica, ensine este tópico, crie 3 questões semelhantes, me teste neste tópico. O
tutor distingue explicitamente o que está sustentado pelo caso, o que vem de diretriz e o que
é conhecimento médico geral.

**Geração de questões originais.** Por tópico, dificuldade, tipo de raciocínio, perfil de
prova, ou focada nos seus pontos fracos.

**Flashcards.** Conversão de questões erradas e pérolas clínicas em cartões, com o mesmo
motor de repetição espaçada.

**Discursivas.** Tipo de questão próprio, com sub-itens, rubrica de correção por critério
pontuável e resposta-modelo. Correção assistida contra a rubrica.

## Conteúdo do banco

27 questões originais publicadas — 25 objetivas e 2 discursivas — cobrindo 15 especialidades,
os quatro níveis de dificuldade e 10 tipos de raciocínio clínico. A taxonomia tem 16
especialidades, 74 tópicos e 59 subtópicos.

## Originalidade e uso do material de referência

O material de prova fornecido pela usuária foi usado **exclusivamente** para calibrar o perfil
de geração: extensão de enunciado, número de alternativas, frequência de dados laboratoriais e
exames, distribuição de temas, tipos de pergunta, nível de dificuldade e padrões de distrator.
Esses números agregados estão em [`docs/01-exam-analysis.md`](docs/01-exam-analysis.md) e no
registro `ExamProfile` correspondente.

Nenhum enunciado, alternativa ou justificativa da prova de referência foi reproduzido. Todas
as 27 questões do banco foram escritas do zero para esta plataforma. O prompt do gerador
proíbe explicitamente reproduzir conteúdo de provas reais ou de bancos comerciais.

## Segurança médica

- O prompt do gerador e o do tutor proíbem inventar diretrizes, doses, limiares e referências.
  Quando o ano de uma diretriz é incerto, o campo fica `null` em vez de receber um chute — e um
  teste verifica isso em todo o banco.
- Questões geradas por IA entram como `IN_REVIEW` e não aparecem no banco publicado nem em
  simulados até revisão humana.
- Sem credencial de IA, o provider offline **se recusa** a gerar questões em vez de produzir
  conteúdo clínico plausível-porém-falso.
- Toda saída de IA exibida ao usuário vem com aviso de que condutas e limiares devem ser
  confirmados na diretriz vigente.
- `guidelineReference` armazena sociedade, título e versão, para que conteúdo desatualizado
  seja localizável e revisável.

Esta é uma ferramenta de **estudo**, não de apoio à decisão clínica.

## Testes

79 testes cobrindo os motores puros (repetição espaçada, seleção adaptativa, classificação de
erro, plano diário, analytics, raio-x) e a integridade do banco semeado — cada questão é
validada contra o schema, com gabarito único, slugs de taxonomia existentes, explicação
completa, justificativa por alternativa e rubricas cujos critérios somam a nota máxima
declarada.

```bash
npm test
```

## Documentação

- [`docs/01-exam-analysis.md`](docs/01-exam-analysis.md) — análise estrutural do material de
  referência e derivação do perfil de geração
- [`docs/02-architecture.md`](docs/02-architecture.md) — camadas, modelo de dados e as
  decisões de projeto que merecem explicação

## Roadmap

Fases 1 a 4 do escopo original estão implementadas. O que fica para depois:

- Revisão editorial de questões geradas por IA dentro da própria interface
- Importação de questões enviadas pelo usuário (o schema já suporta `USER_UPLOADED`)
- Imagens reais de ECG e radiografia (hoje cada exame traz descrição textual completa, e as
  questões são respondíveis sem a imagem)
- Ativação das demais áreas: Cirurgia, Pediatria, GO, Preventiva, Psiquiatria
