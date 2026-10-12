import nodemailer from "nodemailer";
import { contact, projectTypes, site } from "@/content/site";

export const runtime = "nodejs";

// Variables de entorno (se configuran en Vercel → Settings → Environment Variables):
//   SMTP_USER  correo desde el que se envía (ej. contacto@devkode.cl)
//   SMTP_PASS  contraseña de ese buzón
//   SMTP_HOST  opcional, por defecto mail.spacemail.com
//   SMTP_PORT  opcional, por defecto 465
//   CONTACT_TO opcional, a quién llegan las cotizaciones (por defecto, el correo de contacto)

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status });

// Quita caracteres de control; `oneLine` además elimina saltos de línea (para asuntos y nombres)
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";
const oneLine = (value: unknown, max: number) => text(value, max).replace(/\s*[\r\n]+\s*/g, " ");

// Sin comas, comillas, paréntesis ni signos que permitan colar más destinatarios en el encabezado
const EMAIL = /^[^\s@<>(),;:"\\[\]]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Un mensaje legítimo pesa unos pocos KB; todo lo que pase de esto se rechaza sin procesarlo
const MAX_BODY = 16 * 1024;

// Límite simple por IP: 5 envíos por hora. Vive en la memoria de cada instancia, así que
// frena el abuso básico pero no reemplaza una protección más fuerte (regla de Vercel Firewall).
const hits = new Map<string, number[]>();
const WINDOW = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW)) hits.delete(key);
  }
  return recent.length > MAX_PER_WINDOW;
}

// Solo se aceptan envíos hechos desde esta misma página. Los navegadores siempre indican el
// origen en un POST; si no coincide con el sitio, se rechaza (evita que otra web use el formulario).
function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return json({ error: "no_configurado" }, 503);

  if (!sameOrigin(request)) return json({ error: "origen_no_permitido" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "tipo_no_soportado" }, 415);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return json({ error: "muy_grande" }, 413);

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json({ error: "muy_grande" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("no es un objeto");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "invalido" }, 400);
  }

  // Campo trampa: un visitante real no lo ve ni lo llena. Si viene lleno, es un robot:
  // se responde "ok" sin enviar nada para no darle pistas.
  if (text(body.website, 200) !== "") return json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "desconocida";
  if (limited(ip)) return json({ error: "demasiados_envios" }, 429);

  const name = oneLine(body.name, 80);
  const email = oneLine(body.email, 120);
  const phone = oneLine(body.phone, 40);
  const type = projectTypes.includes(text(body.type, 60)) ? text(body.type, 60) : "Sin especificar";
  const message = text(body.message, 3000);

  if (name.length < 2 || !EMAIL.test(email) || message.length < 10) return json({ error: "datos_invalidos" }, 400);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "mail.spacemail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user, pass },
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });

  try {
    await transporter.sendMail({
      from: { name: `Formulario ${site.name}`, address: user },
      to: process.env.CONTACT_TO ?? contact.email,
      // Al responder el correo, la respuesta va directo a quien pidió la cotización
      replyTo: { name, address: email },
      subject: `Cotización: ${type} · ${name}`,
      text: [
        `Nueva solicitud de cotización desde ${site.url}`,
        "",
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `Teléfono: ${phone || "no indicó"}`,
        `Tipo de proyecto: ${type}`,
        "",
        "Mensaje:",
        message,
      ].join("\n"),
    });
  } catch (error) {
    // La causa (códigos como EAUTH, ETIMEDOUT o ESOCKET) queda solo en los registros de Vercel,
    // nunca el mensaje del servidor ni las credenciales. Al visitante no se le revela nada interno.
    const { code, responseCode, command } = error as { code?: string; responseCode?: number; command?: string };
    console.error("contacto: no se pudo enviar el correo", { code, responseCode, command });
    return json({ error: "envio_fallido" }, 502);
  }

  return json({ ok: true });
}
