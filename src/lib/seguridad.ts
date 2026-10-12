// Piezas de seguridad compartidas por las rutas de la API (formulario y asistente)

export const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status });

// Quita caracteres de control; `oneLine` además elimina saltos de línea (para asuntos y nombres)
export const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";
export const oneLine = (value: unknown, max: number) => text(value, max).replace(/\s*[\r\n]+\s*/g, " ");

// Solo se aceptan envíos hechos desde esta misma página. Los navegadores siempre indican el
// origen en un POST; si no coincide con el sitio, se rechaza (evita que otra web use la API).
export function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

// Lee el cuerpo como un objeto JSON, con tope de tamaño. Devuelve la respuesta de error lista
// para entregar si algo no corresponde (origen, tipo de contenido, tamaño o formato).
export async function readBody(
  request: Request,
  maxBytes: number,
): Promise<{ body: Record<string, unknown>; error?: undefined } | { body?: undefined; error: Response }> {
  if (!sameOrigin(request)) return { error: json({ error: "origen_no_permitido" }, 403) };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { error: json({ error: "tipo_no_soportado" }, 415) };
  }
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return { error: json({ error: "muy_grande" }, 413) };

  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return { error: json({ error: "muy_grande" }, 413) };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("no es un objeto");
    return { body: parsed as Record<string, unknown> };
  } catch {
    return { error: json({ error: "invalido" }, 400) };
  }
}

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "desconocida";

// Límite simple por IP. Vive en la memoria de cada instancia, así que frena el abuso básico
// pero no reemplaza una protección más fuerte (regla de Vercel Firewall).
export function createLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 500) {
      for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
    return recent.length > max;
  };
}
