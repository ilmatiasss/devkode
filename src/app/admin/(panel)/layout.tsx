import { Suspense } from "react";
import { Aviso } from "@/components/admin/Aviso";
import { NavAdmin } from "@/components/admin/NavAdmin";
import { exigirUsuario } from "@/lib/admin/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  return (
    <div className="panel min-h-svh">
      <NavAdmin nombre={usuario.nombre} />
      <Suspense>
        <Aviso />
      </Suspense>
      <main className="min-w-0 px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-8 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-14">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
