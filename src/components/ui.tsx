import type { ReactNode } from "react";
import { DIFFICULTY_LABEL, REASONING_LABEL, type Difficulty, type ReasoningType } from "@/lib/domain/enums";

/** Primitivos de UI compartilhados. Server components — sem estado. */

export function Card({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={`surface p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  EASY: "bg-[var(--color-ok-100)] text-[var(--color-ok-500)] border-transparent",
  MEDIUM: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] border-transparent",
  HARD: "bg-[var(--color-warn-100)] text-[var(--color-warn-500)] border-transparent",
  VERY_HARD: "bg-[var(--color-bad-100)] text-[var(--color-bad-500)] border-transparent",
};

export function DifficultyChip({ difficulty }: { difficulty: string }) {
  const d = difficulty as Difficulty;
  return <span className={`chip ${DIFFICULTY_STYLE[d] ?? ""}`}>{DIFFICULTY_LABEL[d] ?? difficulty}</span>;
}

export function ReasoningChip({ type }: { type: string }) {
  return <span className="chip">{REASONING_LABEL[type as ReasoningType] ?? type}</span>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneColor =
    tone === "good"
      ? "text-[var(--color-ok-500)]"
      : tone === "warn"
        ? "text-[var(--color-warn-500)]"
        : tone === "bad"
          ? "text-[var(--color-bad-500)]"
          : "";
  return (
    <div className="surface p-4">
      <div className="muted text-xs font-medium uppercase tracking-wide">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneColor}`}>{value}</div>
      {hint && <div className="muted mt-1 text-xs">{hint}</div>}
    </div>
  );
}

/** Barra de desempenho com semáforo. `answered` = 0 renderiza estado vazio. */
export function AccuracyBar({
  label,
  accuracy,
  answered,
  extra,
}: {
  label: string;
  accuracy: number;
  answered: number;
  extra?: ReactNode;
}) {
  const pct = Math.round(accuracy * 100);
  const band = accuracy >= 0.8 ? "🟢" : accuracy >= 0.6 ? "🟡" : "🔴";
  const color =
    accuracy >= 0.8
      ? "var(--color-ok-500)"
      : accuracy >= 0.6
        ? "var(--color-warn-500)"
        : "var(--color-bad-500)";

  return (
    <div className="py-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium">{label}</span>
        <span className="shrink-0 tabular-nums">
          {answered === 0 ? <span className="muted text-xs">sem dados</span> : `${pct}% ${band}`}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        {answered > 0 && (
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        )}
      </div>
      <div className="muted mt-1 flex justify-between text-[11px]">
        <span>{answered} respondida{answered === 1 ? "" : "s"}</span>
        {extra}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center gap-2 p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="muted max-w-md text-xs leading-relaxed">{hint}</p>}
      {action}
    </div>
  );
}

export function formatDuration(ms: number): string {
  if (!ms) return "—";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}min ${String(s).padStart(2, "0")}s`;
}
