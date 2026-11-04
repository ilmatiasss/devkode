import type { Metadata } from "next";
import Link from "next/link";
import { Icono } from "@/components/admin/Icono";
import { Avatar, botonPrimario, Encabezado, Etiqueta, Kpi, Progreso, Seccion, tarjeta, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, listaServicios, mensualEnPesos, valorDolar } from "@/lib/admin/consultas";
import { clp, diasHasta, dinero, fecha, hoy } from "@/lib/admin/formato";
import { ciclos, colorDeCategoria, etiquetaCategoria, mesesPorCiclo } from "@/lib/admin/opciones";
import { registrarPagoServicio } from "../acciones";

export const metadata: Metadata = { title: "Servicios contratados" };

export default async function Servicios() {
  await exigirUsuario();
  const [servicios, dolar] = await Promise.all([listaServicios(), valorDolar()]);
  const activos = servicios.filter((s) => s.activo);
  const inactivos = servicios.filter((s) => !s.activo);
  const mensual = activos.reduce((suma, s) => suma + mensualEnPesos(s, dolar), 0);
  const esteMes = activos.filter((s) => s.proximo_cobro && diasHasta(s.proximo_cobro) <= 30).reduce((suma, s) => suma + enPesos(s, dolar), 0);

  return (
    <>
      <Encabezado
        titulo="Servicios contratados"
        descripcion="Hosting, dominios, correo y suscripciones. Les avisamos por correo antes de cada cobro."
        accion={
          <Link href="/admin/servicios/nuevo" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Nuevo servicio
          </Link>
        }
      />
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Kpi etiqueta="Costo fijo mensual" valor={clp(mensual)} icono="servicios" detalle="anuales prorrateados" />
        <Kpi etiqueta="A pagar en 30 días" valor={clp(esteMes)} icono="calendario" tono="acento" />
        <div className="col-span-2 md:col-span-1">
          <Kpi etiqueta="Costo anual estimado" valor={clp(mensual * 12)} icono="billetera" detalle={`${activos.length} activos · dólar a ${clp(dolar)}`} />
        </div>
      </div>

      {activos.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activos.map((s, i) => {
            const dias = s.proximo_cobro ? diasHasta(s.proximo_cobro) : null;
            const largoCiclo = mesesPorCiclo[s.ciclo] * 30.4;
            const avance = dias !== null && largoCiclo > 0 ? ((largoCiclo - Math.max(dias, 0)) / largoCiclo) * 100 : 0;
            const tono = dias === null ? "neutro" : dias < 0 ? "mal" : dias <= s.avisar_dias ? "aviso" : "neutro";
            const color = colorDeCategoria(s.categoria);
            return (
              <li key={s.id} className={`${tarjeta} aparecer flex flex-col p-5`} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <Avatar nombre={s.proveedor ?? s.nombre} color={color} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/servicios/${s.id}`} className="block truncate font-medium hover:text-accent-soft">
                      {s.nombre}
                    </Link>
                    <p className="truncate text-xs text-muted">{[s.proveedor, etiquetaCategoria(s.categoria)].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Link href={`/admin/servicios/${s.id}`} aria-label={`Editar ${s.nombre}`} title="Editar" className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-muted hover:border-accent/50 hover:text-fg">
                    <Icono nombre="lapiz" className="size-4" />
                  </Link>
                </div>

                <p className="mt-5 font-display text-2xl font-medium tracking-tight">
                  {dinero(s.costo, s.moneda)}
                  <span className="ml-1.5 font-sans text-sm font-normal text-muted">/ {ciclos[s.ciclo].toLowerCase()}</span>
                </p>
                {s.moneda === "USD" ? <p className="text-xs text-muted">≈ {clp(enPesos(s, dolar))}</p> : null}

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted">{s.proximo_cobro ? `Próximo cobro ${fecha(s.proximo_cobro)}` : "Sin fecha de cobro"}</span>
                    {dias !== null ? <Etiqueta tono={tono}>{dias < 0 ? "Vencido" : dias === 0 ? "Hoy" : `en ${dias} d`}</Etiqueta> : null}
                  </div>
                  {largoCiclo > 0 && dias !== null ? <Progreso valor={avance} color={tono === "mal" ? "#ff8fa3" : tono === "aviso" ? "#f5c96b" : color} etiqueta="Tiempo hasta el próximo cobro" /> : null}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-5 text-xs text-muted">
                  <span>Paga: {s.pagado_por_nombre ?? "Empresa"}</span>
                  <form action={registrarPagoServicio}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="monto" value={enPesos(s, dolar)} />
                    <input type="hidden" name="fecha" value={s.proximo_cobro && dias !== null && dias <= 0 ? s.proximo_cobro : hoy()} />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-accent-soft transition hover:bg-accent/20">
                      <Icono nombre="check" className="size-3.5" /> Registrar pago
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Vacio
          icono="servicios"
          titulo="Sin servicios registrados"
          accion={
            <Link href="/admin/servicios/nuevo" className={botonPrimario}>
              Agregar servicio
            </Link>
          }
        >
          Anota hosting, dominios y suscripciones para saber cuánto pagan al mes y recibir avisos.
        </Vacio>
      )}

      {inactivos.length ? (
        <Seccion titulo="Cancelados o inactivos" className="mt-10">
          <ul className={`${tarjeta} divide-y divide-line`}>
            {inactivos.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/servicios/${s.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted hover:bg-white/[0.02] hover:text-fg">
                  <span className="truncate">{s.nombre}</span>
                  <span>{dinero(s.costo, s.moneda)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Seccion>
      ) : null}
    </>
  );
}
