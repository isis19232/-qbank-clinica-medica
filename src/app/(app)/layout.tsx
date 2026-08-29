import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Nav } from "@/components/nav";

/** Todas as rotas autenticadas passam por aqui — o guard é único. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  return (
    <>
      <Nav userName={user.name} />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </>
  );
}
