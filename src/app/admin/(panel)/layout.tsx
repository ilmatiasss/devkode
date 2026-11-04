import Link from "next/link";
import { NavAdmin } from "@/components/admin/NavAdmin";
import { Logo } from "@/components/Logo";
import { exigirUsuario } from "@/lib/admin/auth";
import { salir } from "./acciones";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  const sesion = (
    <form action={salir} className="flex items-center gap-3 text-xs text-muted">
      <span className="truncate">{usuario.nombre}</span>
      <button type="submit" className="underline decoration-line underline-offset-4 hover:text-fg">
        Cerrar sesión
      </button>
    </form>
  );

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4 border-b border-line px-5 py-4 lg:sticky lg:top-0 lg:h-svh lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" aria-label="DevKode, resumen del panel">
            <Logo />
          </Link>
          <div className="lg:hidden">{sesion}</div>
        </div>
        <NavAdmin />
        <div className="mt-auto hidden lg:block">{sesion}</div>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
