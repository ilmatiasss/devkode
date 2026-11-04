import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { db, dbConfigurada } from "@/lib/admin/db";
import { FormularioConfiguracion } from "./FormularioConfiguracion";

export const metadata: Metadata = { title: "Configuración inicial" };

// Siempre se evalúa al momento: nunca se genera al desplegar
export const dynamic = "force-dynamic";

// Solo existe mientras no haya ninguna cuenta y esté definida ADMIN_SETUP_TOKEN. Después de usarla,
// conviene borrar esa variable en Vercel.
async function disponible() {
  if (!dbConfigurada || (process.env.ADMIN_SETUP_TOKEN ?? "").length < 24) return false;
  try {
    const [fila] = await db()<{ n: number }[]>`select count(*)::bigint as n from usuarios`;
    return fila.n === 0;
  } catch {
    return true; // la base está vacía: todavía no existen las tablas
  }
}

export default async function Configurar() {
  if (!(await disponible())) notFound();
  return (
    <main className="panel min-h-svh px-5 py-12">
      <div className="aparecer mx-auto max-w-2xl">
      <Logo />
      <h1 className="mt-8 text-2xl font-medium tracking-tight">Configuración inicial del panel</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Crea las tablas en la base de datos y las cuentas de acceso. Las utilidades se reparten 50 y 50 (se cambia después en
        Ajustes). Esta página desaparece apenas exista una cuenta.
      </p>
      <div className="mt-8">
        <FormularioConfiguracion />
      </div>
      </div>
    </main>
  );
}
