import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hashClave, verificarClave } from "./clave";
import { db, dbConfigurada } from "./db";

// Sesiones guardadas en la base de datos. La cookie lleva un token aleatorio; en la base solo se
// guarda su huella SHA-256, así que una copia filtrada de la base no sirve para entrar.

const PRODUCCION = process.env.NODE_ENV === "production";
// El prefijo __Host- obliga a que la cookie sea segura, de este dominio exacto y de ruta "/"
const COOKIE = PRODUCCION ? "__Host-dk_sesion" : "dk_sesion";
const DURACION_MS = 7 * 24 * 60 * 60 * 1000;

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;

export type Usuario = { id: number; email: string; nombre: string; porcentaje: number };

const huella = (token: string) => createHash("sha256").update(token).digest("hex");

export async function crearSesion(usuarioId: number) {
  const sql = db();
  const token = randomBytes(32).toString("base64url");
  const expira = new Date(Date.now() + DURACION_MS);
  await sql`delete from sesiones where expira < now()`;
  await sql`insert into sesiones (id, usuario_id, expira) values (${huella(token)}, ${usuarioId}, ${expira})`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: PRODUCCION,
    sameSite: "lax",
    path: "/",
    expires: expira,
  });
}

// Usuario de la sesión actual (o null). Se resuelve una sola vez por solicitud.
export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  // Se leen las cookies antes que nada: así la página nunca se genera de antemano al desplegar
  const token = (await cookies()).get(COOKIE)?.value;
  if (!dbConfigurada || !token || token.length > 100) return null;
  const [usuario] = await db()<Usuario[]>`
    select u.id, u.email, u.nombre, u.porcentaje
    from sesiones s join usuarios u on u.id = s.usuario_id
    where s.id = ${huella(token)} and s.expira > now()`;
  return usuario ?? null;
});

// Toda página y toda acción del panel parte con esto: sin sesión válida, vuelve al ingreso
export async function exigirUsuario() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/admin/login");
  return usuario;
}

export async function cerrarSesion() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE)?.value;
  if (token && dbConfigurada) await db()`delete from sesiones where id = ${huella(token)}`;
  almacen.delete(COOKIE);
}

export async function cerrarOtrasSesiones(usuarioId: number) {
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  await db()`delete from sesiones where usuario_id = ${usuarioId} and id <> ${huella(token)}`;
}

// ---- Ingreso con correo y contraseña ----

// Límite por IP en memoria (por instancia): frena el abuso básico. El bloqueo real está por cuenta.
const intentosPorIp = new Map<string, number[]>();
function ipLimitada(ip: string) {
  const ahora = Date.now();
  const recientes = (intentosPorIp.get(ip) ?? []).filter((t) => ahora - t < 15 * 60_000);
  recientes.push(ahora);
  intentosPorIp.set(ip, recientes);
  if (intentosPorIp.size > 1000) intentosPorIp.clear();
  return recientes.length > 20;
}

// Para que una cuenta inexistente tarde lo mismo que una real y no se pueda adivinar quién existe
let hashFalso: Promise<string> | null = null;

type Fila = { id: number; hash_clave: string; intentos_fallidos: number; bloqueado: boolean };

export async function validarIngreso(email: string, clave: string): Promise<"ok" | "error" | "bloqueado"> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "desconocida";
  if (ipLimitada(ip)) return "bloqueado";

  const sql = db();
  const [fila] = await sql<Fila[]>`
    select id, hash_clave, intentos_fallidos, coalesce(bloqueado_hasta > now(), false) as bloqueado
    from usuarios where email = ${email.toLowerCase()}`;

  if (!fila) {
    await verificarClave(clave, await (hashFalso ??= hashClave("clave-de-relleno-para-medir-tiempos")));
    return "error";
  }
  if (fila.bloqueado) return "bloqueado";

  if (!(await verificarClave(clave, fila.hash_clave))) {
    const intentos = fila.intentos_fallidos + 1;
    if (intentos >= MAX_INTENTOS) {
      await sql`update usuarios set intentos_fallidos = 0,
        bloqueado_hasta = now() + make_interval(mins => ${BLOQUEO_MINUTOS}) where id = ${fila.id}`;
      return "bloqueado";
    }
    await sql`update usuarios set intentos_fallidos = ${intentos} where id = ${fila.id}`;
    return "error";
  }

  await sql`update usuarios set intentos_fallidos = 0, bloqueado_hasta = null where id = ${fila.id}`;
  await crearSesion(fila.id);
  return "ok";
}
