# Arquitetura

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript estrito | Server Components mantêm gabarito e explicação fora do bundle do cliente até a resposta ser registrada |
| Estilo | Tailwind CSS v4 com tokens em CSS custom properties | Tema claro/escuro é troca de valores, não segunda folha de estilo |
| Banco | Prisma ORM · PostgreSQL | Enums modelados como String + constantes TS — schema já era compatível com SQLite e Postgres sem alteração de tipo |
| Autenticação | Sessão opaca própria (scrypt + cookie HttpOnly) | Sem dependência nativa; o banco guarda só o SHA-256 do token |
| Validação | Zod v4 | Mesmos schemas validam entrada de API, colunas JSON e saída do gerador de IA |
| IA | `@anthropic-ai/sdk` atrás de uma interface `AiProvider` | Trocável, testável, e com fallback offline explícito |
| Testes | Vitest | Motores são funções puras — testáveis sem banco |

## Camadas

```
src/app/(app)/*          Páginas autenticadas (Server Components)
src/app/api/*            Rotas HTTP — validam, delegam, formatam erro
src/components/*         UI; os "runners" são os únicos client components pesados
src/lib/services/*       Orquestração: fala com Prisma e com os motores
src/lib/engines/*        Lógica pura: adaptativo, SRS, erros, analytics, raio-x, plano
src/lib/ai/*             Provider de IA + prompts (regras de segurança médica)
src/lib/domain/*         Enums e schemas Zod — fonte única da forma dos dados
src/lib/auth/*           Senha e sessão
prisma/                  Schema, seed e o banco de questões original
```

A regra que organiza tudo: **`engines/` não importa Prisma**. Recebe linhas já lidas e devolve
números. Isso é o que torna o motor adaptativo, o SRS e o classificador de erros testáveis com
79 testes que rodam em menos de um segundo, sem banco.

## Decisões que valem explicação

### O gabarito não trafega antes da resposta

`GET /api/questions/[id]` sem sessão zera `isCorrect` e omite `explanation`. Na página de
resolução, o Server Component monta o objeto do runner sem o campo `isCorrect`; a explicação
só é buscada **depois** de `POST /api/attempts` retornar. Não adianta abrir o DevTools.

### Repetição espaçada guiada por confiança, não só por acerto

O SM-2 clássico usa uma autoavaliação de 0 a 5. Aqui a qualidade vem do cruzamento entre
acerto e confiança declarada, porque os dois casos que mais importam em prova são invisíveis
para "acertou/errou":

- **acertou chutando** → não consolidou, volta em até 3 dias;
- **errou com confiança** → conceito errado gravado, volta em ~6 horas.

### O motor adaptativo tem cota anti-overfitting

Dez sinais ponderados (pesos somam 1.0) ordenam os candidatos. Mas selecionar só pelo topo
transformaria o estudo numa monocultura do tópico mais fraco. Por isso a seleção passa por
baldes com cota fixa — 45% fraco, 25% médio, 15% forte, 15% alto rendimento — e a sobra
volta ao ranking global. O teste `selectAdaptive` verifica exatamente isso.

### Estatística insuficiente não vira número

Duas salvaguardas explícitas:
- **Raio-X**: abaixo de 12 questões associadas, retorna `insufficient: true` e a UI mostra
  "dados insuficientes" em vez de percentuais que a amostra não sustenta.
- **Percentil de simulado**: abaixo de 10 tentativas concluídas, retorna `null`.

O perfil de prova separa **declarado** (calibrado a partir do material de referência) de
**medido** (calculado sobre o banco atual) e mostra os dois lado a lado. Um perfil que promete
180 palavras por enunciado enquanto o banco entrega 110 é informação útil, não um erro a esconder.

### O provider offline se recusa a gerar questões

Sem `ANTHROPIC_API_KEY`, `OfflineProvider.generateQuestions` lança. Não gera "questão de
exemplo". Numa plataforma de educação médica, uma questão clínica plausível-porém-falsa é pior
que nenhuma questão. O tutor, esse sim, degrada com utilidade: devolve o que o banco já
registra sobre o caso, marcando a resposta como degradada.

### Questão gerada por IA entra em revisão

`sourceType: AI_GENERATED`, `status: IN_REVIEW`. Não aparece no banco publicado nem em
simulados até revisão humana. Questões que falham a validação Zod são descartadas em vez de
gravadas parcialmente.

### Classificação de erro é heurística auditável, não IA

`classifyError` é uma cascata de regras explícitas em um arquivo de 60 linhas. Roda sem custo
de API e o usuário pode sempre sobrescrever — e uma vez sobrescrita (`classifiedBy: USER`),
a heurística nunca mais toca aquele registro.

## Fluxo de uma resposta

```
POST /api/attempts
  └─ recordAnswer()
       ├─ cria Attempt
       ├─ atualiza QuestionStat        (agregado anônimo + histograma de alternativas)
       ├─ atualiza UserQuestionStat    (acurácia pessoal + próximo agendamento SRS)
       ├─ upsert ErrorNotebookEntry    (se errou; classifica o tipo de erro)
       └─ resolve entradas antigas     (se acertou; preserva o histórico)
```

O histograma de alternativas alimenta a detecção de **distrator dominante** — a alternativa
errada mais escolhida —, que por sua vez alimenta a classificação `DISTRACTOR_CONFUSION`.

## Modelo de dados

23 modelos. Os eixos:

- **Taxonomia**: `Area → Specialty → Topic → Subtopic`, mais `Tag` N:N. A área
  "Clínica Médica" está ativa; Cirurgia, Pediatria, GO, Preventiva e Psiquiatria já entram
  cadastradas e inativas — adicionar uma delas é popular especialidades, não migrar schema.
- **Conteúdo**: `Question` + `Alternative`, com `labData`, `media`, `guidelineReference`,
  `explanation` e `rubric` como colunas JSON validadas por Zod.
- **Perfil de prova**: `ExamProfile` guarda as frequências e a distribuição de dificuldade
  que alimentam tanto o gerador quanto o Raio-X.
- **Desempenho**: `Attempt` (evento), `UserQuestionStat` (estado por usuário×questão),
  `QuestionStat` (agregado anônimo), `ErrorNotebookEntry`, `Flashcard`.
- **Sessões**: `StudySession` (bloco de estudo) e `Exam`/`ExamItem`/`ExamAttempt` (simulado).
- **IA**: `GenerationJob` registra parâmetros, resultado e consumo de tokens de toda chamada.

Colunas JSON foram escolhidas onde a forma é estável mas rica (tabela de exames, explicação
estruturada, rubrica). O Zod garante a forma; o banco garante só que é texto. `parseJson`
tem fallback silencioso — dado legado malformado nunca derruba a tela.

## Deploy em produção (Vercel + PostgreSQL)

O projeto roda em PostgreSQL (`prisma/schema.prisma`, provider `postgresql`) — necessário
porque o filesystem das funções serverless da Vercel é efêmero e não serve para SQLite.
A migration inicial está versionada em `prisma/migrations/`.

1. Crie um banco Postgres (Vercel Postgres/Neon, Supabase, Railway etc.) e configure
   `DATABASE_URL` nas variáveis de ambiente do projeto na Vercel (Production e Preview).
2. `npm run build` já roda `prisma generate && prisma migrate deploy && next build` — a
   Vercel aplica as migrations pendentes a cada deploy, antes do build do Next.
3. Rode `npm run db:seed` uma vez (localmente, apontando `DATABASE_URL` para o banco de
   produção, ou via `vercel env pull` + script) para popular taxonomia, perfis e o banco de
   questões inicial.

Para evoluir o schema depois: edite `prisma/schema.prisma` e rode `npm run db:migrate`
(`prisma migrate dev`) localmente para gerar a nova migration, commit e push — o próximo
deploy aplica automaticamente via `migrate deploy`.

Nenhuma mudança de código de aplicação foi necessária: os enums já eram `String` com
constantes em TypeScript, e as colunas JSON já eram texto validado na aplicação — só o
`datasource provider`, a migration inicial e os scripts de build mudaram.
