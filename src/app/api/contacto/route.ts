import nodemailer from "nodemailer";
import { contact, projectTypes, site } from "@/content/site";
import { versionPrivacidad } from "@/lib/funciones";
import { clientIp, createLimiter, json, oneLine, readBody, text } from "@/lib/seguridad";

export const runtime = "nodejs";

// Variables de entorno (se configuran en Vercel → Settings → Environment Variables):
//   SMTP_USER  correo desde el que se envía (ej. contacto@devkode.cl)
//   SMTP_PASS  contraseña de ese buzón
//   SMTP_HOST  opcional, por defecto mail.spacemail.com
//   SMTP_PORT  opcional, por defecto 465
//   CONTACT_TO opcional, a quién llegan las cotizaciones (por defecto, el correo de contacto)

const EMAIL = /^[^\s@<>(),;:"\\[\]]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Un mensaje legítimo pesa unos pocos KB; todo lo que pase de esto se rechaza sin procesarlo
const MAX_BODY = 16 * 1024;

// 5 envíos por hora por IP (ver createLimiter para sus alcances)
const limited = createLimiter(5, 60 * 60 * 1000);

export async function POST(request: Request) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return json({ error: "no_configurado" }, 503);

  const { body, error } = await readBody(request, MAX_BODY);
  if (error) return error;

  // Campo trampa: un visitante real no lo ve ni lo llena. Si viene lleno, es un robot:
  // se responde "ok" sin enviar nada para no darle pistas.
  if (text(body.website, 200) !== "") return json({ ok: true });

  if (limited(clientIp(request))) return json({ error: "demasiados_envios" }, 429);

  const name = oneLine(body.name, 80);
  const email = oneLine(body.email, 120);
  const phone = oneLine(body.phone, 40);
  const type = projectTypes.includes(text(body.type, 60)) ? text(body.type, 60) : "Sin especificar";
  const message = text(body.message, 3000);

  // Sin la aceptación de la política de privacidad no se trata ningún dato (Ley 21.719, art. 12)
  const consent = body.consent === "on" || body.consent === true;

  if (name.length < 2 || !EMAIL.test(email) || message.length < 10 || !consent) {
    return json({ error: "datos_invalidos" }, 400);
  }

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
        "",
        // Queda como respaldo de que la persona dio su consentimiento, y a qué versión de la política
        `Aceptó la política de privacidad (versión ${versionPrivacidad}) el ${new Date().toISOString()}.`,
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
