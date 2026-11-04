import type { Metadata } from "next";
import Link from "next/link";
import { BarrasMeses, Dona } from "@/components/admin/Graficos";
import { Icono } from "@/components/admin/Icono";
import { botonPrimario, botonSecundario, Encabezado, Etiqueta, Kpi, Progreso, Seccion, tarjeta, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, estadoMantencion, listaMantenciones, listaServicios, mensualEnPesos, resumenPeriodo, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, diasHasta, dinero, fecha, hoy, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";
import { colorDeCategoria, estadosProyecto, type EstadoProyecto, etiquetaCategoria, tonoEstado } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Resumen" };

type ProyectoActivo = { id: number; nombre: string; cliente: string | null; estado: EstadoProyecto; entrega: string | null; monto: number; cobrado: number };
type Movimiento = { tipo: "ingreso" | "gasto"; id: number; fecha: string; descripcion: string; monto: number; categoria: string | null };

const variacion = (actual: number, anterior: number) => (anterior > 0 ? ((actual - anterior) / anterior) * 100 : null);

function saludo() {
  const hora = Number(new Intl.DateTimeFormat("es-CL", { hour: "numeric", hour12: false, timeZone: "America/Santiago" }).format(new Date()));
  return hora < 12 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches";
}

export default async function Resumen() {
  const sql = db();
  const mes = mesActual();
  const desde6 = `${moverMes(mes, -5)}-01`;

  const [usuario, mantenciones, periodo, anterior, servicios, dolar, proyectos, movimientos, serie, categorias] = await Promise.all([
    exigirUsuario(),
    listaMantenciones(),
    resumenPeriodo(`${mes}-01`, `${moverMes(mes, 1)}-01`),
    resumenPeriodo(`${moverMes(mes, -1)}-01`, `${mes}-01`),
    listaServicios(),
    valorDolar(),
    sql<ProyectoActivo[]>`
      select p.id, p.nombre, c.nombre as cliente, p.estado, p.entrega, p.monto,
        coalesce((select sum(i.monto) from ingresos i where i.proyecto_id = p.id and i.mant_mes is null), 0)::bigint as cobrado
      from proyectos p left join clientes c on c.id = p.cliente_id
      where p.estado in ('en_curso', 'pausado', 'propuesta')
      order by array_position(array['en_curso', 'propuesta', 'pausado'], p.estado), p.entrega nulls last, p.nombre
      limit 6`,
    sql<Movimiento[]>`
      (select 'ingreso' as tipo, id, fecha, descripcion, monto, null as categoria, creado from ingresos order by fecha desc, creado desc limit 6)
      union all
      (select 'gasto' as tipo, id, fecha, descripcion, monto, categoria, creado from gastos order by fecha desc, creado desc limit 6)
      order by fecha desc, creado desc limit 6`,
    sql<{ mes: string; ingresos: number; gastos: number }[]>`
      select to_char(m, 'YYYY-MM') as mes,
        coalesce((select sum(monto) from ingresos where fecha >= m and fecha < m + interval '1 month'), 0)::bigint as ingresos,
        coalesce((select sum(monto) from gastos where fecha >= m and fecha < m + interval '1 month'), 0)::bigint as gastos
      from generate_series(${desde6}::date, ${`${mes}-01`}::date, interval '1 month') as m order by m`,
    sql<{ categoria: string; total: number }[]>`
      select categoria, sum(monto)::bigint as total from gastos
      where fecha >= ${`${mes}-01`} and fecha < ${`${moverMes(mes, 1)}-01`}
      group by categoria order by total desc`,
  ]);

  const utilidad = periodo.ingresos - periodo.gastos;
  const margen = periodo.ingresos > 0 ? Math.round((utilidad / periodo.ingresos) * 100) : null;
  const activos = servicios.filter((s) => s.activo);
  const costoFijo = activos.reduce((suma, s) => suma + mensualEnPesos(s, dolar), 0);
  const proximos = activos.filter((s) => s.proximo_cobro && diasHasta(s.proximo_cobro) <= 30).slice(0, 5);
  const porCobrar = proyectos.filter((p) => p.estado !== "propuesta").reduce((s, p) => s + Math.max(0, p.monto - p.cobrado), 0);
  const diaHoy = hoy();
  const mants = mantenciones.map((m) => ({ ...m, e: estadoMantencion(m, diaHoy) }));
  const recurrente = mants.reduce((s, m) => s + m.mant_monto, 0);
  const mantCobrado = mants.filter((m) => m.e.mesActualPagado).reduce((s, m) => s + m.mant_monto, 0);
  const mantPendientes = mants.filter((m) => m.e.pendientes.length > 0 || !m.e.mesActualPagado);
  const fechaLarga = new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Santiago" }).format(new Date());

  return (
    <>
      <Encabezado
        titulo={`${saludo()}, ${usuario.nombre.split(" ")[0]}`}
        descripcion={<span className="inline-block first-letter:uppercase">{fechaLarga}</span>}
        accion={
          <>
            <Link href="/admin/ingresos/nuevo" className={botonPrimario}>
              <Icono nombre="ingresos" className="size-4" /> Ingreso
            </Link>
            <Link href="/admin/gastos/nuevo" className={botonSecundario}>
              <Icono nombre="gastos" className="size-4" /> Gasto
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Kpi etiqueta="Ingresos del mes" valor={clp(periodo.ingresos)} icono="ingresos" variacion={variacion(periodo.ingresos, anterior.ingresos)} detalle="vs mes anterior" />
        <Kpi etiqueta="Gastos del mes" valor={clp(periodo.gastos)} icono="gastos" variacion={variacion(periodo.gastos, anterior.gastos)} invertir detalle="vs mes anterior" />
        <Kpi etiqueta="Utilidad del mes" valor={clp(utilidad)} icono="billetera" tono={utilidad >= 0 ? "bien" : "mal"} detalle={margen !== null ? `Margen ${margen}%` : undefined} />
        <Kpi etiqueta="Por cobrar" valor={clp(porCobrar)} icono="reloj" tono="acento" detalle={recurrente ? `+ ${clp(recurrente)}/mes en mantenciones` : "en proyectos activos"} />
      </div>

      <div className="mt-4 grid gap-4 md:mt-5 lg:grid-cols-3">
        <section className={`${tarjeta} aparecer p-5 lg:col-span-2`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-medium">Últimos 6 meses</h2>
            <Link href={`/admin/reparto?anio=${mes.slice(0, 4)}`} className="text-xs text-muted hover:text-fg">
              Ver el año →
            </Link>
          </div>
          <BarrasMeses datos={serie} />
        </section>
        <section className={`${tarjeta} aparecer p-5`}>
          <h2 className="mb-4 font-medium">
            Gastos de <span className="capitalize">{nombreMes(mes).split(" ")[0]}</span>
          </h2>
          {categorias.length ? (
            <Dona
              partes={categorias.map((c) => ({ etiqueta: etiquetaCategoria(c.categoria), valor: c.total, color: colorDeCategoria(c.categoria) }))}
              centro={clp(periodo.gastos)}
              subcentro="este mes"
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted">Sin gastos este mes.</p>
          )}
        </section>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-6">
        <Seccion
          titulo="Proyectos activos"
          className="lg:col-span-2"
          accion={
            <Link href="/admin/proyectos" className="text-sm text-muted hover:text-fg">
              Ver todos →
            </Link>
          }
        >
          {proyectos.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {proyectos.map((p, i) => {
                const avance = p.monto > 0 ? (p.cobrado / p.monto) * 100 : 0;
                const dias = p.entrega ? diasHasta(p.entrega) : null;
                return (
                  <li key={p.id} className="aparecer" style={{ animationDelay: `${i * 60}ms` }}>
                    <Link href={`/admin/proyectos/${p.id}`} className={`${tarjeta} group block p-4 transition hover:-translate-y-0.5 hover:border-accent/50`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium group-hover:text-accent-soft">{p.nombre}</p>
                          <p className="truncate text-xs text-muted">{p.cliente ?? "Sin cliente"}</p>
                        </div>
                        <Etiqueta tono={tonoEstado[p.estado]}>{estadosProyecto[p.estado]}</Etiqueta>
                      </div>
                      <div className="mt-4 flex items-baseline justify-between text-xs text-muted">
                        <span>
                          <span className="text-sm text-fg">{clp(p.cobrado)}</span> de {clp(p.monto)}
                        </span>
                        <span>{Math.round(avance)}%</span>
                      </div>
                      <div className="mt-2">
                        <Progreso valor={avance} etiqueta={`Cobrado de ${p.nombre}`} />
                      </div>
                      {dias !== null ? (
                        <p className={`mt-3 flex items-center gap-1.5 text-xs ${dias < 0 ? "text-[#ff8fa3]" : dias <= 7 ? "text-[#f5c96b]" : "text-muted"}`}>
                          <Icono nombre="calendario" className="size-3.5" />
                          {dias < 0 ? `Entrega atrasada ${-dias} d` : dias === 0 ? "Se entrega hoy" : `Entrega en ${dias} d · ${fecha(p.entrega)}`}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Vacio
              icono="proyectos"
              titulo="Sin proyectos activos"
              accion={
                <Link href="/admin/proyectos/nuevo" className={botonPrimario}>
                  Crear proyecto
                </Link>
              }
            >
              Registra tu primer proyecto para seguir lo cobrado y lo que falta.
            </Vacio>
          )}
        </Seccion>

        <div className="space-y-10">
        {mants.length ? (
          <Seccion
            titulo="Mantenciones del mes"
            accion={
              <Link href="/admin/mantenciones" className="text-sm text-muted hover:text-fg">
                Ver →
              </Link>
            }
          >
            <div className={`${tarjeta} p-4`}>
              <div className="mb-2 flex items-baseline justify-between text-xs text-muted">
                <span>
                  <span className="font-display text-lg font-medium text-fg">{clp(mantCobrado)}</span> de {clp(recurrente)}
                </span>
                <span>{recurrente ? Math.round((mantCobrado / recurrente) * 100) : 0}%</span>
              </div>
              <Progreso valor={recurrente ? (mantCobrado / recurrente) * 100 : 0} color="#7ee2a0" etiqueta="Mantenciones cobradas este mes" />
              {mantPendientes.length ? (
                <ul className="mt-3 space-y-1">
                  {mantPendientes.slice(0, 4).map((m) => {
                    const atrasadas = m.e.pendientes.filter((x) => x < diaHoy.slice(0, 7)).length;
                    return (
                      <li key={m.id}>
                        <Link href={`/admin/proyectos/${m.id}`} className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-white/[0.03]">
                          <span className="truncate">{m.cliente ?? m.nombre}</span>
                          <Etiqueta tono={atrasadas ? "mal" : m.e.mesActualVencido ? "aviso" : "neutro"}>
                            {atrasadas ? `${atrasadas} atrasada${atrasadas === 1 ? "" : "s"}` : m.e.mesActualVencido ? "Por cobrar" : `día ${m.mant_dia}`}
                          </Etiqueta>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#7ee2a0]">Todas cobradas este mes.</p>
              )}
            </div>
          </Seccion>
        ) : null}
        <Seccion
          titulo="Próximos cobros"
          accion={<span className="text-xs text-muted">Fijo: {clp(costoFijo)}/mes</span>}
        >
          {proximos.length ? (
            <ol className={`${tarjeta} divide-y divide-line`}>
              {proximos.map((s) => {
                const dias = diasHasta(s.proximo_cobro!);
                const tono = dias < 0 ? "mal" : dias <= s.avisar_dias ? "aviso" : "neutro";
                return (
                  <li key={s.id}>
                    <Link href={`/admin/servicios/${s.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.02]">
                      <span className="grid w-11 shrink-0 place-items-center rounded-xl border border-line bg-bg py-1.5 text-center leading-none">
                        <span className="font-display text-lg font-semibold">{Number(s.proximo_cobro!.slice(8))}</span>
                        <span className="mt-0.5 text-[10px] text-muted uppercase">{fecha(s.proximo_cobro).split(" ")[1]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{s.nombre}</span>
                        <span className="text-xs text-muted">
                          {dinero(s.costo, s.moneda)}
                          {s.moneda === "USD" ? ` ≈ ${clp(enPesos(s, dolar))}` : ""}
                        </span>
                      </span>
                      <Etiqueta tono={tono}>{dias < 0 ? "Vencido" : dias === 0 ? "Hoy" : `${dias} d`}</Etiqueta>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <Vacio icono="servicios" titulo="Nada en 30 días">
              No hay cobros de servicios en el próximo mes.
            </Vacio>
          )}
        </Seccion>
        </div>
      </div>

      <Seccion titulo="Últimos movimientos" className="mt-10">
        {movimientos.length ? (
          <ul className={`${tarjeta} divide-y divide-line`}>
            {movimientos.map((m) => (
              <li key={`${m.tipo}-${m.id}`}>
                <Link href={`/admin/${m.tipo === "ingreso" ? "ingresos" : "gastos"}/${m.id}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: m.tipo === "ingreso" ? "rgb(126 226 160 / 0.12)" : `color-mix(in srgb, ${colorDeCategoria(m.categoria ?? "otros")} 15%, transparent)`,
                      color: m.tipo === "ingreso" ? "#7ee2a0" : colorDeCategoria(m.categoria ?? "otros"),
                    }}
                  >
                    <Icono nombre={m.tipo === "ingreso" ? "ingresos" : "gastos"} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{m.descripcion}</span>
                    <span className="text-xs text-muted">
                      {m.fecha === hoy() ? "Hoy" : fecha(m.fecha)}
                      {m.categoria ? ` · ${etiquetaCategoria(m.categoria)}` : ""}
                    </span>
                  </span>
                  <span className={`text-sm font-medium tabular-nums ${m.tipo === "ingreso" ? "text-[#7ee2a0]" : ""}`}>
                    {m.tipo === "ingreso" ? "+" : "−"}
                    {clp(m.monto)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Vacio icono="billetera" titulo="Aún no hay movimientos">
            Cuando registres ingresos y gastos aparecerán aquí.
          </Vacio>
        )}
      </Seccion>
    </>
  );
}
