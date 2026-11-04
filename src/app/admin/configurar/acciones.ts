"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { crearSesion } from "@/lib/admin/auth";
import { CLAVE_MINIMA, hashClave } from "@/lib/admin/clave";
import { db, dbConfigurada } from "@/lib/admin/db";
import { ESQUEMA } from "@/lib/admin/esquema";

export type EstadoConfiguracion = { error: string; valores?: Record<string, string> } | null;

const EMAIL = /^[^\s@<>(),;:"\\[\]]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Compara el código sin filtrar por tiempo de respuesta cuántos caracteres coinciden
const igual = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

function leerSocio(fd: FormData, n: 1 | 2) {
  const nombre = String(fd.get(`nombre${n}`) ?? "").trim().slice(0, 80);
  const email = String(fd.get(`email${n}`) ?? "").trim().toLowerCase().slice(0, 200);
  const clave = String(fd.get(`clave${n}`) ?? "");
  const repetir = String(fd.get(`repetir${n}`) ?? "");
  if (n === 2 && !nombre && !email && !clave) return null;
  if (nombre.length < 2 || !EMAIL.test(email)) return `Revisa el nombre y el correo de la cuenta ${n}.`;
  if (clave.length < CLAVE_MINIMA) return `La contraseña de la cuenta ${n} debe tener al menos ${CLAVE_MINIMA} caracteres.`;
  if (clave !== repetir) return `Las contraseñas de la cuenta ${n} no coinciden.`;
  return { nombre, email, clave };
}

export async function configurar(previo: EstadoConfiguracion, fd: FormData): Promise<EstadoConfiguracion> {
  const resultado = await configurarCuentas(fd);
  if (!resultado) return previo;
  // Si algo falla, el formulario vuelve con los nombres y correos ya escritos (no las contraseñas)
  const valores = Object.fromEntries(["nombre1", "email1", "nombre2", "email2"].map((k) => [k, String(fd.get(k) ?? "").slice(0, 200)]));
  return { ...resultado, valores };
}

async function configurarCuentas(fd: FormData): Promise<{ error: string } | null> {
  const esperado = process.env.ADMIN_SETUP_TOKEN ?? "";
  if (!dbConfigurada || esperado.length < 24) return { error: "La configuración inicial no está habilitada." };
  if (!igual(String(fd.get("codigo") ?? ""), esperado)) return { error: "El código de configuración no es correcto." };

  const socios = [leerSocio(fd, 1), leerSocio(fd, 2)];
  for (const s of socios) if (typeof s === "string") return { error: s };
  const cuentas = socios.filter((s): s is { nombre: string; email: string; clave: string } => typeof s === "object" && s !== null);
  if (cuentas.length === 2 && cuentas[0].email === cuentas[1].email) return { error: "Las dos cuentas tienen el mismo correo." };

  const sql = db();
  await sql.unsafe(ESQUEMA);
  const hashes = await Promise.all(cuentas.map((c) => hashClave(c.clave)));
  const porcentaje = cuentas.length === 2 ? 50 : 100;

  // Todo en una transacción con bloqueo: si dos personas lo envían a la vez, solo una gana
  const primero = await sql.begin(async (tx) => {
    await tx`lock table usuarios in exclusive mode`;
    const [{ n }] = await tx<{ n: number }[]>`select count(*)::bigint as n from usuarios`;
    if (n > 0) return null;
    const ids: number[] = [];
    for (const [i, c] of cuentas.entries()) {
      const [fila] = await tx<{ id: number }[]>`
        insert into usuarios (email, nombre, hash_clave, porcentaje)
        values (${c.email}, ${c.nombre}, ${hashes[i]}, ${porcentaje}) returning id`;
      ids.push(fila.id);
    }
    return ids[0];
  });
  if (primero === null) return { error: "El panel ya fue configurado." };

  await crearSesion(primero);
  redirect("/admin");
}
