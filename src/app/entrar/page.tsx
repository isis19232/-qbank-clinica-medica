import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
