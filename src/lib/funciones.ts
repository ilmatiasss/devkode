import { privacy } from "@/content/site";

// Qué partes del sitio están activas según las variables de entorno. Las páginas se generan al
// desplegar, así que después de agregar o quitar una variable en Vercel hay que volver a desplegar.

// El formulario de cotización necesita el correo configurado
export const formularioActivo = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

// El asistente funciona siempre con reglas simples; con ANTHROPIC_API_KEY además usa IA
export const iaActiva = Boolean(process.env.ANTHROPIC_API_KEY);

// La política cambia cuando la IA está activa (se envía texto a un proveedor externo), y cada
// solicitud queda registrada con la versión que aceptó la persona
export const versionPrivacidad = iaActiva ? privacy.versionConIA : privacy.version;
