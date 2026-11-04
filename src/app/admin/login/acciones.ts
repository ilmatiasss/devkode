"use server";

import { redirect } from "next/navigation";
import { validarIngreso } from "@/lib/admin/auth";
import { dbConfigurada } from "@/lib/admin/db";

export type EstadoIngreso = { error: string; email?: string } | null;

export async function iniciarSesion(_previo: EstadoIngreso, fd: FormData): Promise<EstadoIngreso> {
  if (!dbConfigurada) return { error: "El panel todavía no está configurado." };
  const email = String(fd.get("email") ?? "").trim().slice(0, 200);
  const clave = String(fd.get("clave") ?? "").slice(0, 200);
  if (!email || !clave) return { error: "Escribe tu correo y tu contraseña." };

  const resultado = await validarIngreso(email, clave);
  if (resultado === "bloqueado") return { error: "Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.", email };
  if (resultado === "error") return { error: "Correo o contraseña incorrectos.", email };
  redirect("/admin");
}
