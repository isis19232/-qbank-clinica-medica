"use client";

import { useState } from "react";
import { DifficultyChip } from "./ui";

const GRADES = [
  { key: "AGAIN", label: "De novo", hint: "não lembrei" },
  { key: "HARD", label: "Difícil", hint: "lembrei com esforço" },
  { key: "GOOD", label: "Bom", hint: "lembrei" },
  { key: "EASY", label: "Fácil", hint: "imediato" },
] as const;

export function FlashcardReview({
  cards,
}: {
  cards: { id: string; front: string; back: string; topicLabel: string | null; difficulty: string }[];
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);

  const card = cards[index];

  async function grade(g: (typeof GRADES)[number]["key"]) {
    if (!card) return;
    setSaving(true);
    await fetch("/api/flashcards", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: card.id, grade: g }),
    });
    setSaving(false);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (!card) {
    return (
      <div className="surface p-10 text-center">
        <p className="text-sm font-medium">Revisão concluída</p>
        <p className="muted mt-1 text-xs">{cards.length} cartões revisados.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="muted flex items-center gap-3 text-xs tabular-nums">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--color-brand-600)] transition-all"
            style={{ width: `${(index / cards.length) * 100}%` }}
          />
        </div>
        {index + 1} / {cards.length}
      </div>

      <article className="surface fade-in min-h-56 p-5 sm:p-8">
        <header className="mb-4 flex flex-wrap items-center gap-2">
          <DifficultyChip difficulty={card.difficulty} />
          {card.topicLabel && <span className="chip">{card.topicLabel}</span>}
        </header>

        <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">{card.front}</p>

        {flipped ? (
          <div className="fade-in mt-5 border-t pt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{card.back}</p>
          </div>
        ) : (
          <button type="button" onClick={() => setFlipped(true)} className="btn btn-primary mt-6">
            Mostrar resposta
          </button>
        )}
      </article>

      {flipped && (
        <div className="fade-in grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => grade(g.key)}
              disabled={saving}
              className="btn flex-col py-2.5"
            >
              <span className="text-sm font-medium">{g.label}</span>
              <span className="muted text-[11px]">{g.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
