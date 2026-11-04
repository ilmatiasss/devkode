import type { Metadata } from "next";
import Link from "next/link";
import { HistorialMantencion } from "@/components/admin/HistorialMantencion";
import { Icono } from "@/components/admin/Icono";
import { Avatar, botonPrimario, colorDe, Encabezado, Etiqueta, Kpi, tarjeta, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { estadoMantencion, listaMantenciones } from "@/lib/admin/consultas";
import { clp, hoy, nombreMes } from "@/lib/admin/formato";
import { registrarMantencion } from "../acciones";

export const metadata: Metadata = { title: "Mantenciones" };

export default async function Mantenciones() {
  const [, proyectos] = await Promise.all([exigirUsuario(), listaMantenciones()]);
  const dia = hoy();
  const mesHoy = dia.slice(0, 7);
  const filas = proyectos.map((p) => ({ ...p, estado: estadoMantencion(p, dia) }));

  const recurrente = filas.reduce((s, p) => s + p.mant_monto, 0);
  const cobradoMes = filas.filter((p) => p.estado.mesActualPagado).reduce((s, p) => s + p.mant_monto, 0);
  const porCobrarMes = filas.filter((p) => !p.estado.mesActualPagado).reduce((s, p) => s + p.mant_monto, 0);
  const atrasado = filas.reduce((s, p) => s + p.estado.pendientes.filter((m) => m < mesHoy).length * p.mant_monto, 0);

  return (
    <>
      <Encabezado
        titulo="Mantenciones"
        descripcion="Lo que cobran mes a mes a cada cliente, qué meses ya pagaron y cuáles faltan."
        accion={
          <Link href="/admin/proyectos" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Activar en un proyecto
          </Link>
        }
      />
      <div className="mb-8 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Kpi etiqueta="Ingreso recurrente mensual" valor={clp(recurrente)} icono="repetir" tono="acento" detalle={`${filas.length} mantención${filas.length === 1 ? "" : "es"} activa${filas.length === 1 ? "" : "s"}`} />
        <Kpi etiqueta={`Cobrado en ${nombreMes(mesHoy).split(" ")[0]}`} valor={clp(cobradoMes)} icono="check" tono="bien" />
        <Kpi etiqueta="Falta cobrar este mes" valor={clp(porCobrarMes)} icono="reloj" />
        <Kpi etiqueta="Atrasado de meses anteriores" valor={clp(atrasado)} icono="alerta" tono={atrasado > 0 ? "mal" : "neutro"} />
      </div>

      {filas.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {filas.map((p, i) => {
            const { pendientes, mesActualPagado, mesActualVencido, siguiente } = p.estado;
            const atrasados = pendientes.filter((m) => m < mesHoy).length;
            const tono = atrasados > 0 ? "mal" : mesActualPagado ? "bien" : mesActualVencido ? "aviso" : "acento";
            const texto = atrasados > 0 ? `${atrasados} mes${atrasados === 1 ? "" : "es"} atrasado${atrasados === 1 ? "" : "s"}` : mesActualPagado ? "Al día" : mesActualVencido ? "Por cobrar" : `Vence el ${p.mant_dia}`;
            return (
              <li key={p.id} className={`${tarjeta} aparecer flex flex-col p-5`} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <Avatar nombre={p.cliente ?? p.nombre} color={colorDe(p.cliente ?? p.nombre)} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/proyectos/${p.id}`} className="block truncate font-medium hover:text-accent-soft">
                      {p.nombre}
                    </Link>
                    <p className="truncate text-xs text-muted">{p.cliente ?? "Sin cliente"}</p>
                  </div>
                  <Etiqueta tono={tono}>{texto}</Etiqueta>
                </div>
                <p className="mt-4 font-display text-2xl font-medium tracking-tight">
                  {clp(p.mant_monto)} <span className="font-sans text-sm font-normal text-muted">/ mes · se cobra el día {p.mant_dia}</span>
                </p>
                <div className="mt-4">
                  <HistorialMantencion pagados={p.pagados} pendientes={pendientes} desde={(p.mant_desde ?? p.inicio ?? dia).slice(0, 7)} mesHoy={mesHoy} />
                </div>
                {pendientes.length > 1 ? <p className="mt-3 text-xs text-[#ff8fa3]">Deben {clp(pendientes.length * p.mant_monto)} en total.</p> : null}
                {siguiente ? (
                  <form action={registrarMantencion} className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
                    <input type="hidden" name="proyecto_id" value={p.id} />
                    <input type="hidden" name="mes" value={siguiente} />
                    <input type="hidden" name="monto" value={p.mant_monto} />
                    <span className="text-xs text-muted">
                      Siguiente: <span className="capitalize text-fg">{nombreMes(siguiente)}</span>
                    </span>
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-soft transition hover:bg-accent/20">
                      <Icono nombre="check" className="size-4" /> Registrar pago
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <Vacio
          icono="repetir"
          titulo="Ninguna mantención activa"
          accion={
            <Link href="/admin/proyectos" className={botonPrimario}>
              Ir a proyectos
            </Link>
          }
        >
          Abre un proyecto, activa &quot;Mantención mensual&quot; y define el monto y el día de cobro.
        </Vacio>
      )}
    </>
  );
}
