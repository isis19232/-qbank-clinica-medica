import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTaxonomy } from "@/lib/services/questions";
import { GeneratorForm } from "@/components/generator-form";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Gerar questões" };
export const dynamic = "force-dynamic";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const canReview = user.role === "AUTHOR" || user.role === "ADMIN";

  const [taxonomy, profiles, pending] = await Promise.all([
    getTaxonomy(),
    prisma.examProfile.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.question.count({ where: { status: "IN_REVIEW" } }),
  ]);

  const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Gerar questões originais</h1>
        <p className="muted mt-0.5 text-sm">
          Questões novas, escritas do zero no estilo do perfil escolhido.
        </p>
      </header>

      {!aiConfigured && (
        <div className="surface border-[var(--color-warn-500)] p-4">
          <p className="text-sm font-medium">Camada de IA não configurada</p>
          <p className="muted mt-1 text-sm leading-relaxed">
            Defina <code className="rounded bg-[var(--surface-2)] px-1">ANTHROPIC_API_KEY</code> no
            ambiente para habilitar a geração. O restante da plataforma funciona normalmente sem ela —
            o provider offline se recusa a inventar conteúdo médico, o que é o comportamento correto
            para uma ferramenta de educação clínica.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GeneratorForm
          specialties={taxonomy[0]?.specialties ?? []}
          profiles={profiles}
          defaultProfile={typeof sp.profile === "string" ? sp.profile : ""}
          disabled={!aiConfigured}
        />

        <div className="grid gap-4">
          <Card title="Como a originalidade é garantida">
            <ul className="grid gap-2 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span aria-hidden className="muted shrink-0">•</span>
                <span>
                  O prompt do gerador proíbe explicitamente reproduzir enunciados de provas reais ou
                  de bancos comerciais. Ele recebe o <em>perfil estatístico</em> da prova-alvo, nunca
                  o texto de nenhuma questão.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="muted shrink-0">•</span>
                <span>
                  Os temas já presentes no banco são enviados junto, para que o gerador escolha
                  ângulos diferentes em vez de reciclar o mesmo caso.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="muted shrink-0">•</span>
                <span>
                  Regras de segurança médica proíbem inventar diretrizes, doses e limiares. Quando o
                  ano de uma diretriz é incerto, o campo fica vazio em vez de receber um chute.
                </span>
              </li>
            </ul>
          </Card>

          <Card title="Fila de revisão">
            <p className="text-2xl font-semibold tabular-nums">{pending}</p>
            <p className="muted mt-1 text-sm leading-relaxed">
              Questões geradas entram como <strong>em revisão</strong> e não aparecem no banco
              publicado até serem aprovadas. Numa plataforma de educação médica, conteúdo não
              revisado não pode ficar indistinguível do revisado.
            </p>
            {canReview && pending > 0 && (
              <Link href="/revisar" className="btn mt-3 px-2.5 py-1 text-xs">
                Revisar agora
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
