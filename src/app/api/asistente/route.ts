import { orientarConIA, orientarConReglas } from "@/lib/asistente";
import { clientIp, createLimiter, json, readBody, text } from "@/lib/seguridad";

export const runtime = "nodejs";

// Variables de entorno (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  activa el modo con IA. Sin ella, el asistente usa reglas simples.
//   ASISTENTE_MODEL    opcional, modelo a usar (por defecto claude-haiku-5-5)

const MAX_BODY = 4 * 1024;

// 10 consultas por hora por IP (ver createLimiter para sus alcances)
const limited = createLimiter(10, 60 * 60 * 1000);

export async function POST(request: Request) {
  const { body, error } = await readBody(request, MAX_BODY);
  if (error) return error;

  const descripcion = text(body.descripcion, 800);
  if (descripcion.length < 15) return json({ error: "datos_invalidos" }, 400);

  if (limited(clientIp(request))) return json({ error: "demasiadas_consultas" }, 429);

  const conIA = await orientarConIA(descripcion);
  if (conIA === "fuera_de_alcance") return json({ error: "fuera_de_alcance" }, 422);

  return json({ orientacion: conIA ?? orientarConReglas(descripcion) });
}
