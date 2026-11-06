import { createHash, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { enPesos, estadoMantencion, listaMantenciones, valorDolar } from "@/lib/admin/consultas";
import { asegurarEsquema, db, dbConfigurada } from "@/lib/admin/db";
import { clp, dinero, fecha, hoy, nombreMes } from "@/lib/admin/formato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Revisión diaria (Vercel Cron, ver vercel.json): avisa por correo a los socios de los servicios que
// se cobran dentro de su plazo de aviso. Cada cobro se avisa una sola vez.
// Vercel llama con "Authorization: Bearer <CRON_SECRET>"; sin ese secreto no hace nada.

const igual = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

type Pendiente = { id: number; nombre: string; proveedor: string | null; costo: number; moneda: string; proximo_cobro: string; dias: number; quien: string | null };

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET ?? "";
  const recibido = request.headers.get("authorization") ?? "";
  if (secreto.length < 16 || !igual(recibido, `Bearer ${secreto}`)) return Response.json({ error: "no_autorizado" }, { status: 401 });
  if (!dbConfigurada || !process.env.SMTP_USER || !process.env.SMTP_PASS) return Response.json({ error: "no_configurado" }, { status: 503 });

  await asegurarEsquema();
  const sql = db();
  const dia = hoy();
  const mesHoy = dia.slice(0, 7);
  const pendientes = await sql<Pendiente[]>`
    select s.id, s.nombre, s.proveedor, s.costo, s.moneda, s.proximo_cobro, (s.proximo_cobro - ${dia}::date) as dias, u.nombre as quien
    from servicios s left join usuarios u on u.id = s.pagado_por
    where s.activo and s.proximo_cobro is not null
      and s.proximo_cobro - ${dia}::date between 0 and s.avisar_dias
      and not exists (select 1 from avisos_enviados a where a.servicio_id = s.id and a.fecha_cobro = s.proximo_cobro)
    order by s.proximo_cobro`;

  // Mantenciones que toca cobrar a clientes: desde 2 días antes del día de cobro, una vez por mes
  const [mantenciones, yaAvisadas] = await Promise.all([
    listaMantenciones(),
    sql<{ proyecto_id: number }[]>`select proyecto_id from avisos_mantencion where mes = ${mesHoy}`,
  ]);
  const avisadas = new Set(yaAvisadas.map((a) => a.proyecto_id));
  const porCobrar = mantenciones.filter((m) => {
    const e = estadoMantencion(m, dia);
    return !e.mesActualPagado && Number(dia.slice(8, 10)) >= m.mant_dia - 2 && !avisadas.has(m.id) && (m.mant_desde ?? m.inicio ?? dia).slice(0, 7) <= mesHoy;
  });

  if (!pendientes.length && !porCobrar.length) return Response.json({ enviados: 0 });

  const [destinatarios, dolar] = await Promise.all([sql<{ email: string }[]>`select email from usuarios`, valorDolar()]);
  const lineas = pendientes.map((s) => {
    const cuando = s.dias === 0 ? "hoy" : s.dias === 1 ? "mañana" : `en ${s.dias} días`;
    const monto = s.moneda === "USD" ? `${dinero(s.costo, "USD")} (≈ ${clp(enPesos(s, dolar))})` : clp(s.costo);
    return `• ${s.nombre}${s.proveedor ? ` (${s.proveedor})` : ""}: ${monto}, ${cuando} (${fecha(s.proximo_cobro)}). Paga: ${s.quien ?? "cuenta de la empresa"}.`;
  });
  const lineasMant = porCobrar.map(
    (m) => `• ${m.cliente ?? m.nombre} (${m.nombre}): ${clp(m.mant_monto)}, se cobra el día ${m.mant_dia}${m.telefono ? `. Teléfono: ${m.telefono}` : ""}.`,
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const asunto = [
    pendientes.length ? (pendientes.length === 1 ? `Se viene un cobro: ${pendientes[0].nombre}` : `Se vienen ${pendientes.length} cobros de servicios`) : null,
    porCobrar.length ? `${porCobrar.length} mantención${porCobrar.length === 1 ? "" : "es"} por cobrar` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  await transporter.sendMail({
    from: { name: "Panel DevKode", address: process.env.SMTP_USER },
    to: destinatarios.map((d) => d.email),
    subject: asunto,
    text: [
      "Hola,",
      ...(pendientes.length
        ? ["", "Estos servicios se cobran pronto:", "", ...lineas, "", "Cuando se pague, regístralo en Servicios → Registrar pago.", "https://devkode.cl/admin/servicios"]
        : []),
      ...(porCobrar.length
        ? ["", `Mantenciones de ${nombreMes(mesHoy)} que toca cobrar a clientes:`, "", ...lineasMant, "", "Cuando paguen, regístralo en Mantenciones.", "https://devkode.cl/admin/mantenciones"]
        : []),
    ].join("\n"),
  });

  if (pendientes.length) {
    await sql`insert into avisos_enviados ${sql(pendientes.map((s) => ({ servicio_id: s.id, fecha_cobro: s.proximo_cobro })))} on conflict do nothing`;
  }
  if (porCobrar.length) {
    await sql`insert into avisos_mantencion ${sql(porCobrar.map((m) => ({ proyecto_id: m.id, mes: mesHoy })))} on conflict do nothing`;
  }
  return Response.json({ enviados: pendientes.length + porCobrar.length });
}
