import type { Mensaje } from "@/content/asistente";
import { responderConIA, responderConReglas } from "@/lib/asistente";
import { clientIp, createLimiter, json, readBody, text } from "@/lib/seguridad";

export const runtime = "nodejs";

// Variables de entorno (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  activa el modo con IA. Sin ella, el asistente usa reglas simples.
//   ASISTENTE_MODEL    opcional, modelo a usar (por defecto claude-haiku-5-5)

const MAX_BODY = 16 * 1024;
const MAX_MENSAJES = 21; // hasta 11 del visitante y 10 del asistente
const MAX_TEXTO = 600;
const MAX_TOTAL = 6000;

// 40 mensajes por hora por IP (ver createLimiter para sus alcances)
const limited = createLimiter(40, 60 * 60 * 1000);

// Devuelve la conversación validada, o null si no tiene la forma esperada: empieza y termina
// con el visitante y se alternan los turnos.
function leerConversacion(valor: unknown): Mensaje[] | null {
  if (!Array.isArray(valor) || valor.length === 0 || valor.length > MAX_MENSAJES) return null;

  const mensajes: Mensaje[] = [];
  for (const [i, bruto] of valor.entries()) {
    const { rol, texto } = (bruto ?? {}) as { rol?: unknown; texto?: unknown };
    const turno = i % 2 === 0 ? "usuario" : "asistente";
    const limpio = text(texto, MAX_TEXTO);
    if (rol !== turno || limpio === "") return null;
    mensajes.push({ rol: turno, texto: limpio });
  }

  const total = mensajes.reduce((suma, m) => suma + m.texto.length, 0);
  if (mensajes[mensajes.length - 1].rol !== "usuario" || total > MAX_TOTAL) return null;
  return mensajes;
}

export async function POST(request: Request) {
  const { body, error } = await readBody(request, MAX_BODY);
  if (error) return error;

  const mensajes = leerConversacion(body.mensajes);
  if (!mensajes) return json({ error: "datos_invalidos" }, 400);

  if (limited(clientIp(request))) return json({ error: "demasiadas_consultas" }, 429);

  const respuesta = (await responderConIA(mensajes)) ?? responderConReglas(mensajes);
  return json({ respuesta });
}
