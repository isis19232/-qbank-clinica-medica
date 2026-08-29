import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { listDueFlashcards } from "@/lib/services/flashcards";
import { FlashcardReview } from "@/components/flashcard-review";
import { EmptyState, Stat } from "@/components/ui";

export const metadata: Metadata = { title: "Flashcards" };
export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const user = await requireUser();

  const [due, total] = await Promise.all([
    listDueFlashcards(user.id, 40),
    prisma.flashcard.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="grid gap-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Flashcards</h1>
        <p className="muted mt-0.5 text-sm">
          Criados a partir das questões que você errou e das pérolas clínicas.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Para revisar hoje" value={due.length} />
        <Stat label="Total de cartões" value={total} />
        <Stat label="Em dia" value={Math.max(0, total - due.length)} />
      </div>

      {due.length === 0 ? (
        <EmptyState
          title={total === 0 ? "Nenhum flashcard ainda" : "Nada para revisar hoje"}
          hint={
            total === 0
              ? "Ao terminar uma questão, use o botão “Criar flashcards” para transformar a explicação em cartões."
              : "Volte amanhã — os cartões reaparecem conforme o agendamento da repetição espaçada."
          }
        />
      ) : (
        <FlashcardReview
          cards={due.map((c) => ({
            id: c.id,
            front: c.front,
            back: c.back,
            topicLabel: c.topicLabel,
            difficulty: c.difficulty,
          }))}
        />
      )}
    </div>
  );
}
