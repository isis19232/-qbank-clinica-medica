import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getTaxonomy } from "@/lib/services/questions";
import { StudyLauncher } from "@/components/study-launcher";
import { Card } from "@/components/ui";
import { DEFAULT_MIX, MINUTES_PER_QUESTION, SLOT_LABEL } from "@/lib/engines/daily-plan";

export const metadata: Metadata = { title: "Estudo de hoje" };
export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const user = await requireUser();

  const [taxonomy, profiles, dueCount, errorCount] = await Promise.all([
    getTaxonomy(),
    prisma.examProfile.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.userQuestionStat.count({
      where: { userId: user.id, suspended: false, nextReviewAt: { lte: new Date() } },
    }),
    prisma.errorNotebookEntry.count({ where: { userId: user.id, resolved: false } }),
  ]);

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Estudo de hoje</h1>
        <p className="muted mt-0.5 text-sm">
          Diga quanto tempo você tem. O bloco é montado a partir das suas lacunas.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <StudyLauncher
          specialties={(taxonomy[0]?.specialties ?? []).filter((s) => s.questionCount > 0)}
          profiles={profiles}
          defaultProfileSlug={undefined}
        />

        <div className="grid gap-4">
          <Card title="Composição do bloco">
            <ul className="grid gap-2 text-sm">
              {(Object.keys(DEFAULT_MIX) as (keyof typeof DEFAULT_MIX)[]).map((slot) => (
                <li key={slot} className="flex items-center gap-3">
                  <span className="flex-1">{SLOT_LABEL[slot]}</span>
                  <span className="chip tabular-nums">{Math.round(DEFAULT_MIX[slot] * 100)}%</span>
                </li>
              ))}
            </ul>
            <p className="muted mt-3 text-[11px] leading-relaxed">
              Quando uma fonte não tem material suficiente — por exemplo, nenhuma revisão devida —,
              a sobra vira questão nova. O bloco nunca sai menor por falta de material numa cota só.
            </p>
          </Card>

          <Card title="Suas filas">
            <ul className="grid gap-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Revisões devidas hoje</span>
                <span className="font-medium tabular-nums">{dueCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Erros em aberto</span>
                <span className="font-medium tabular-nums">{errorCount}</span>
              </li>
            </ul>
            <p className="muted mt-3 text-[11px] leading-relaxed">
              Ritmo de referência: ~{MINUTES_PER_QUESTION.toFixed(1)} min por questão, calibrado a partir
              de prova de 2 h com 20 objetivas e 2 discursivas.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
