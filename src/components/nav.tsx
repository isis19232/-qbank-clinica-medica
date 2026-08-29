"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

/** `label` cabe na barra em telas largas; `full` é o rótulo do menu móvel. */
const LINKS = [
  { href: "/dashboard", label: "Painel", full: "Painel" },
  { href: "/questoes", label: "Questões", full: "Questões" },
  { href: "/estudar", label: "Hoje", full: "Estudo de hoje" },
  { href: "/simulados", label: "Simulados", full: "Simulados" },
  { href: "/erros", label: "Erros", full: "Caderno de erros" },
  { href: "/flashcards", label: "Flashcards", full: "Flashcards" },
  { href: "/raio-x", label: "Raio-X", full: "Raio-X de prova" },
  { href: "/gerar", label: "Gerar", full: "Gerar questões" },
];

export function Nav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
    router.refresh();
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-brand-600)] text-xs font-bold text-white"
          >
            CM
          </span>
          <span className="hidden sm:inline">QBank Clínica Médica</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                title={l.full}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--surface-2)] font-medium"
                    : "muted hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <span className="muted hidden text-xs sm:inline">{userName}</span>
          <button type="button" onClick={logout} className="btn px-2.5 py-1 text-xs">
            Sair
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Abrir menu"
            className="btn px-2.5 py-1 lg:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-0.5 border-t px-4 py-2 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm hover:bg-[var(--surface-2)]"
            >
              {l.full}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
