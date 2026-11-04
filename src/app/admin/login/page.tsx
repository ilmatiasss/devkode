import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { usuarioActual } from "@/lib/admin/auth";
import { db, dbConfigurada } from "@/lib/admin/db";
import { FormularioIngreso } from "./FormularioIngreso";

export const metadata: Metadata = { title: "Ingresar" };

async function hayUsuarios() {
  try {
    const [fila] = await db()<{ n: number }[]>`select count(*)::bigint as n from usuarios`;
    return fila.n > 0;
  } catch {
    return false; // la tabla aún no existe
  }
}

export default async function Login() {
  if (await usuarioActual()) redirect("/admin");
  const listo = dbConfigurada && (await hayUsuarios());

  return (
    <main className="grid min-h-svh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 text-2xl font-medium tracking-tight">Panel de administración</h1>
        <div className="mt-6 border border-line bg-surface p-6">
          {listo ? (
            <FormularioIngreso />
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              {dbConfigurada ? (
                <>
                  Todavía no hay cuentas. Créalas en la{" "}
                  <Link href="/admin/configurar" className="text-fg underline underline-offset-4">
                    configuración inicial
                  </Link>
                  .
                </>
              ) : (
                "El panel todavía no está conectado a la base de datos (falta DATABASE_URL)."
              )}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
