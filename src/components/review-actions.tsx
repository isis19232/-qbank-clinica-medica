"use client";

import { useState } from "react";

/** Aprova (publica) ou rejeita (retira) uma questão da fila de revisão. */
export function ReviewActions({ questionId }: { questionId: string }) {
  const [status, setStatus] = useState<"PENDING" | "PUBLISHED" | "RETIRED">("PENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "APPROVE" | "REJECT") {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/questions/${questionId}/review`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Não foi possível salvar a decisão.");
      return;
    }
    setStatus(action === "APPROVE" ? "PUBLISHED" : "RETIRED");
  }

  if (status === "PUBLISHED") {
    return <span className="chip border-[var(--color-ok-500)] text-[var(--color-ok-500)]">Publicada</span>;
  }
  if (status === "RETIRED") {
    return <span className="chip border-[var(--color-bad-500)] text-[var(--color-bad-500)]">Rejeitada</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={saving}
        onClick={() => decide("APPROVE")}
        className="btn border-[var(--color-ok-500)] px-2.5 py-1 text-xs text-[var(--color-ok-500)]"
      >
        Aprovar e publicar
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={() => decide("REJECT")}
        className="btn border-[var(--color-bad-500)] px-2.5 py-1 text-xs text-[var(--color-bad-500)]"
      >
        Rejeitar
      </button>
      {error && (
        <p role="alert" className="text-xs text-[var(--color-bad-500)]">
          {error}
        </p>
      )}
    </div>
  );
}
