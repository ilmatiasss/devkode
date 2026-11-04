import type { Metadata } from "next";
import Link from "next/link";
import { Icono } from "@/components/admin/Icono";
import { Avatar, botonPrimario, colorDe, Encabezado, Etiqueta, Kpi, Pestanas, Progreso, tarjeta, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, diasHasta, fecha } from "@/lib/admin/formato";
import { claves, estadosProyecto, type EstadoProyecto, tonoEstado } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Proyectos" };

type Fila = { id: number; nombre: string; cliente: string | null; estado: EstadoProyecto; inicio: string | null; entrega: string | null; monto: number; cobrado: number; gastado: number };

export default async function Proyectos({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const proyectos = await db()<Fila[]>`
    select p.id, p.nombre, c.nombre as cliente, p.estado, p.inicio, p.entrega, p.monto,
      coalesce((select sum(monto) from ingresos where proyecto_id = p.id), 0)::bigint as cobrado,
      coalesce((select sum(monto) from gastos where proyecto_id = p.id), 0)::bigint as gastado
    from proyectos p left join clientes c on c.id = p.cliente_id
    order by array_position(array['en_curso', 'propuesta', 'pausado', 'terminado', 'cancelado'], p.estado), p.entrega nulls last, p.nombre`;

  const filtro = q.estado && q.estado in estadosProyecto ? (q.estado as EstadoProyecto) : "activos";
  const activos = proyectos.filter((p) => ["en_curso", "propuesta", "pausado"].includes(p.estado));
  const lista = filtro === "activos" ? activos : proyectos.filter((p) => p.estado === filtro);
  const cartera = activos.reduce((s, p) => s + p.monto, 0);
  const porCobrar = activos.filter((p) => p.estado !== "propuesta").reduce((s, p) => s + Math.max(0, p.monto - p.cobrado), 0);
  const cobradoTotal = proyectos.reduce((s, p) => s + p.cobrado, 0);

  return (
    <>
      <Encabezado
        titulo="Proyectos"
        descripcion="Todo lo que tienen en marcha, lo cobrado y lo que falta."
        accion={
          <Link href="/admin/proyectos/nuevo" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Nuevo proyecto
          </Link>
        }
      />

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Kpi etiqueta="Cartera activa" valor={clp(cartera)} icono="proyectos" detalle={`${activos.length} proyectos`} />
        <Kpi etiqueta="Por cobrar" valor={clp(porCobrar)} icono="reloj" tono="acento" />
        <div className="col-span-2 md:col-span-1">
          <Kpi etiqueta="Cobrado histórico" valor={clp(cobradoTotal)} icono="ingresos" tono="bien" />
        </div>
      </div>

      <Pestanas
        activa={filtro}
        opciones={[
          { clave: "activos", texto: "Activos", href: "/admin/proyectos", cuenta: activos.length },
          ...claves(estadosProyecto).map((e) => ({
            clave: e,
            texto: estadosProyecto[e],
            href: `/admin/proyectos?estado=${e}`,
            cuenta: proyectos.filter((p) => p.estado === e).length,
          })),
        ]}
      />

      {lista.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((p, i) => {
            const avance = p.monto > 0 ? (p.cobrado / p.monto) * 100 : 0;
            const dias = p.entrega ? diasHasta(p.entrega) : null;
            const abierto = p.estado === "en_curso" || p.estado === "pausado" || p.estado === "propuesta";
            return (
              <li key={p.id} className="aparecer" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <Link href={`/admin/proyectos/${p.id}`} className={`${tarjeta} group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-accent/50`}>
                  <div className="flex items-start gap-3">
                    <Avatar nombre={p.cliente ?? p.nombre} color={colorDe(p.cliente ?? p.nombre)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium group-hover:text-accent-soft">{p.nombre}</p>
                      <p className="truncate text-xs text-muted">{p.cliente ?? "Sin cliente"}</p>
                    </div>
                    <Etiqueta tono={tonoEstado[p.estado]}>{estadosProyecto[p.estado]}</Etiqueta>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-baseline justify-between text-xs text-muted">
                      <span>
                        <span className="font-display text-lg font-medium text-fg">{clp(p.cobrado)}</span> de {clp(p.monto)}
                      </span>
                      <span>{Math.round(avance)}%</span>
                    </div>
                    <Progreso valor={avance} color={avance >= 100 ? "#7ee2a0" : undefined} etiqueta={`Cobrado de ${p.nombre}`} />
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-muted">
                    {dias !== null ? (
                      <span className={`flex items-center gap-1.5 ${abierto && dias < 0 ? "text-[#ff8fa3]" : abierto && dias <= 7 ? "text-[#f5c96b]" : ""}`}>
                        <Icono nombre="calendario" className="size-3.5" />
                        {abierto ? (dias < 0 ? `Atrasado ${-dias} d` : dias === 0 ? "Entrega hoy" : `Entrega en ${dias} d`) : fecha(p.entrega)}
                      </span>
                    ) : null}
                    {p.gastado > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Icono nombre="gastos" className="size-3.5" /> {clp(p.gastado)} en gastos
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Vacio
          icono="proyectos"
          titulo={filtro === "activos" ? "No hay proyectos activos" : "Nada en este estado"}
          accion={
            <Link href="/admin/proyectos/nuevo" className={botonPrimario}>
              Crear proyecto
            </Link>
          }
        />
      )}
    </>
  );
}
