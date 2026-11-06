import type { Metadata } from "next";
import Link from "next/link";
import { Icono } from "@/components/admin/Icono";
import { ListaMovimientos } from "@/components/admin/Movimientos";
import { botonPrimario, Encabezado, Kpi, SelectorMes, tarjeta, Vacio } from "@/components/admin/ui";
import { sesionEnParalelo } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, esMes, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";
import { colorDeCategoria, etiquetaCategoria } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Gastos" };

type Fila = { id: number; fecha: string; descripcion: string; categoria: string; monto: number; detalle: string | null; persona: string | null; con_mant: boolean };

export default async function Gastos({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sesion = sesionEnParalelo();
  const q = await searchParams;
  const mes = esMes(q.mes) ? q.mes : mesActual();
  const sql = db();
  const [filas, [anterior]] = await Promise.all([
    sql<Fila[]>`
      select g.id, g.fecha, g.descripcion, g.categoria, g.monto, concat_ws(' · ', g.proveedor, p.nombre) as detalle,
        case when g.mant_mes is not null then 'Plata de la mantención' else u.nombre end as persona, g.mant_mes is not null as con_mant
      from gastos g left join proyectos p on p.id = g.proyecto_id left join usuarios u on u.id = g.pagado_por
      where g.fecha >= ${`${mes}-01`} and g.fecha < ${`${moverMes(mes, 1)}-01`}
      order by g.fecha desc, g.id desc`,
    sql<{ total: number }[]>`select coalesce(sum(monto), 0)::bigint as total from gastos where fecha >= ${`${moverMes(mes, -1)}-01`} and fecha < ${`${mes}-01`}`,
  ]);
  const total = filas.reduce((s, f) => s + f.monto, 0);
  const porCategoria = Object.entries(filas.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.categoria]: (acc[f.categoria] ?? 0) + f.monto }), {})).sort(
    (a, b) => b[1] - a[1],
  );
  const deBolsillo = filas.filter((f) => f.persona && !f.con_mant).reduce((s, f) => s + f.monto, 0);

  await sesion;
  return (
    <>
      <Encabezado
        titulo="Gastos"
        descripcion="Todo lo que sale, por categoría y por quién lo pagó."
        accion={
          <Link href="/admin/gastos/nuevo" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Registrar gasto
          </Link>
        }
      />
      <div className="mb-6">
        <SelectorMes ruta="/admin/gastos" anterior={moverMes(mes, -1)} siguiente={moverMes(mes, 1)} nombre={nombreMes(mes)} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1">
          <Kpi
            etiqueta="Total del mes"
            valor={clp(total)}
            icono="gastos"
            variacion={anterior.total > 0 ? ((total - anterior.total) / anterior.total) * 100 : null}
            invertir
            detalle="vs mes anterior"
          />
          <Kpi etiqueta="Pagado de su bolsillo" valor={clp(deBolsillo)} icono="billetera" detalle="se compensa en Reparto" />
        </div>
        <section className={`${tarjeta} aparecer p-5`}>
          <h2 className="mb-4 font-medium">Por categoría</h2>
          {porCategoria.length ? (
            <ul className="space-y-3.5">
              {porCategoria.map(([categoria, monto]) => (
                <li key={categoria}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: colorDeCategoria(categoria) }} />
                      {etiquetaCategoria(categoria)}
                    </span>
                    <span className="tabular-nums text-muted">
                      {clp(monto)} <span className="text-xs">· {Math.round((monto / total) * 100)}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <div className="barra h-full rounded-full" style={{ width: `${(monto / porCategoria[0][1]) * 100}%`, background: colorDeCategoria(categoria) }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">Sin gastos este mes.</p>
          )}
        </section>
      </div>

      {filas.length ? (
        <ListaMovimientos filas={filas} tipo="gastos" />
      ) : (
        <Vacio
          icono="gastos"
          titulo="Sin gastos este mes"
          accion={
            <Link href="/admin/gastos/nuevo" className={botonPrimario}>
              Registrar gasto
            </Link>
          }
        />
      )}
    </>
  );
}
