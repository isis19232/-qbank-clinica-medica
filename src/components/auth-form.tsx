"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Formulário compartilhado por login e cadastro. */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = isRegister
      ? { name: form.get("name"), email: form.get("email"), password: form.get("password") }
      : { email: form.get("email"), password: form.get("password") };

    try {
      const res = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir. Tente novamente.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Verifique sua rede e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-brand-600)] text-xs font-bold text-white"
        >
          CM
        </span>
        QBank Clínica Médica
      </Link>

      <div className="surface p-6">
        <h1 className="text-lg font-semibold tracking-tight">
          {isRegister ? "Criar conta" : "Entrar"}
        </h1>
        <p className="muted mt-1 text-sm">
          {isRegister
            ? "Leva menos de um minuto. Seus dados de estudo ficam na sua conta."
            : "Bem-vinda de volta. Continue de onde parou."}
        </p>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          {isRegister && (
            <label className="grid gap-1.5">
              <span className="text-xs font-medium">Nome</span>
              <input name="name" required minLength={2} maxLength={120} autoComplete="name" className="input" />
            </label>
          )}

          <label className="grid gap-1.5">
            <span className="text-xs font-medium">E-mail</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium">Senha</span>
            <input
              name="password"
              type="password"
              required
              minLength={isRegister ? 8 : 1}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="input"
            />
            {isRegister && <span className="muted text-[11px]">Mínimo de 8 caracteres.</span>}
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-[var(--color-bad-100)] px-3 py-2 text-xs text-[var(--color-bad-500)]">
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-primary mt-1">
            {pending ? "Aguarde…" : isRegister ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <p className="muted mt-4 text-xs">
          {isRegister ? (
            <>
              Já tem conta?{" "}
              <Link href="/entrar" className="underline">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Ainda não tem conta?{" "}
              <Link href="/cadastrar" className="underline">
                Criar conta
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
