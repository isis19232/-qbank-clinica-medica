import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
