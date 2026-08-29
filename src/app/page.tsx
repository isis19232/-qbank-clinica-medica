import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const FEATURES = [
  {
    title: "Questões originais",
    body: "Banco autoral de Clínica Médica, com vinheta clínica, dados laboratoriais e explicação estruturada em cada questão.",
  },
  {
    title: "Motor adaptativo",
    body: "A próxima questão é escolhida por dez sinais — seus erros, sua confiança, o peso do tópico e o perfil da prova-alvo.",
  },
  {
    title: "Caderno de erros",
    body: "Cada erro é classificado por tipo: lacuna de conhecimento, leitura apressada, confusão com distrator, erro de diretriz.",
  },
  {
    title: "Repetição espaçada",
    body: "SM-2 modificado por confiança. Acertar chutando traz a questão de volta cedo; acertar com segurança a afasta.",
  },
  {
    title: "Raio-X de prova",
    body: "Perfil estatístico de cada prova: temas frequentes, tipos de pergunta, dificuldade média e uso de exames.",
  },
  {
    title: "Tutor de IA",
    body: "Explicação mais profunda, por que a alternativa B está errada, aula do tópico e questões semelhantes — sob demanda.",
  },
];

export default async function Landing() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  const [questionCount, specialtyCount] = await Promise.all([
    prisma.question.count({ where: { status: "PUBLISHED" } }),
    prisma.specialty.count(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-brand-600)] text-xs font-bold text-white"
        >
          CM
        </span>
        QBank Clínica Médica
      </div>

      <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Questões de Clínica Médica que exigem raciocínio, não memória.
      </h1>
      <p className="muted mt-4 max-w-2xl text-base leading-relaxed">
        Banco de questões originais e plataforma de estudo adaptativo para preparação de residência
        médica no Brasil. Vinhetas clínicas com dados laboratoriais, explicações passo a passo,
        análise de desempenho por tópico e revisão espaçada guiada pelos seus erros.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/cadastrar" className="btn btn-primary">
          Criar conta
        </Link>
        <Link href="/entrar" className="btn">
          Entrar
        </Link>
        <span className="muted text-xs">
          {questionCount} questões publicadas · {specialtyCount} especialidades
        </span>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="surface p-5">
            <h2 className="text-sm font-semibold">{f.title}</h2>
            <p className="muted mt-2 text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      <p className="muted mt-14 max-w-3xl border-t pt-6 text-xs leading-relaxed">
        Todo o conteúdo desta plataforma é original. Nenhuma questão é copiada de provas reais ou de
        bancos comerciais. As explicações citam sociedades e diretrizes quando aplicável; material
        clínico deve sempre ser confrontado com a diretriz vigente antes de qualquer decisão
        assistencial. Esta é uma ferramenta de estudo, não de apoio à decisão clínica.
      </p>
    </main>
  );
}
