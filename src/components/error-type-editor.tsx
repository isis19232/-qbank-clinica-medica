"use client";

import { useState } from "react";
import { ERROR_TYPES, ERROR_TYPE_LABEL, type ErrorType } from "@/lib/domain/enums";
import { ERROR_TYPE_ADVICE } from "@/lib/engines/error-classifier";

/**
 * Permite ao usuário corrigir a classificação automática do erro.
 * Uma vez reclassificado manualmente, a heurística não sobrescreve mais.
 */
export function ErrorTypeEditor({
  entryId,
  current,
  classifiedBy,
}: {
  entryId: string;
  current: string;
  classifiedBy: string;
}) {
  const [value, setValue] = useState(current);
  const [manual, setManual] = useState(classifiedBy === "USER");
  const [saving, setSaving] = useState(false);

  async function update(errorType: string) {
    setValue(errorType);
    setSaving(true);
    await fetch("/api/errors", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ entryId, errorType }),
    });
    setManual(true);
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="muted text-xs">Tipo de erro:</span>
        <select
          value={value}
          onChange={(e) => update(e.target.value)}
          disabled={saving}
          className="input max-w-56 py-1 text-xs"
          aria-label="Tipo de erro"
        >
          {ERROR_TYPES.map((t) => (
            <option key={t} value={t}>
              {ERROR_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </label>
      <span className="muted text-[11px]">{manual ? "classificado por você" : "classificação automática"}</span>
      <p className="muted basis-full text-[11px] leading-relaxed">
        {ERROR_TYPE_ADVICE[value as ErrorType]}
      </p>
    </div>
  );
}
