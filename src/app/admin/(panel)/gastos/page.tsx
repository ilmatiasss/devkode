import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, botonPrimario, Encabezado, enlace, SelectorMes, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, esMes, fecha, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";
import { etiquetaCategoria } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Gastos" };

type Fila = { id: number; fecha: string; descripcion: string; categoria: string; monto: number; proyecto: string | null; pago: string | null; servicio_id: number | null };

export default async function Gastos({ searchParams }: { searchParams: Promise<{ mes?: string; ok?: string; error?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const mes = esMes(q.mes) ? q.mes : mesActual();
  const filas = await db()<Fila[]>`
    select g.id, g.fecha, g.descripcion, g.categoria, g.monto, g.servicio_id, p.nombre as proyecto, u.nombre as pago
    from gastos g left join proyectos p on p.id = g.proyecto_id left join usuarios u on u.id = g.pagado_por
    where g.fecha >= ${`${mes}-01`} and g.fecha < ${`${moverMes(mes, 1)}-01`}
    order by g.fecha desc, g.id desc`;
  const total = filas.reduce((s, f) => s + f.monto, 0);
  const porCategoria = Object.entries(
    filas.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.categoria]: (acc[f.categoria] ?? 0) + f.monto }), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <Encabezado
        titulo="Gastos"
        accion={
          <Link href="/admin/gastos/nuevo" className={botonPrimario}>
            Registrar gasto
          </Link>
        }
      />
      <Aviso ok={q.ok} error={q.error} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SelectorMes mes={mes} ruta="/admin/gastos" anterior={moverMes(mes, -1)} siguiente={moverMes(mes, 1)} nombre={nombreMes(mes)} />
        <p className="text-sm text-muted">
          Total del mes: <span className="font-medium text-fg">{clp(total)}</span>
        </p>
      </div>
      {porCategoria.length > 1 ? (
        <ul className="mb-5 flex flex-wrap gap-2 text-xs">
          {porCategoria.map(([categoria, monto]) => (
            <li key={categoria} className="border border-line px-2.5 py-1 text-muted">
              {etiquetaCategoria(categoria)}: <span className="text-fg">{clp(monto)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {filas.length ? (
        <Tabla>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Pagó</th>
              <th className="text-right">Monto</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id}>
                <td className="whitespace-nowrap">{fecha(f.fecha)}</td>
                <td>
                  <Link href={`/admin/gastos/${f.id}`} className={enlace}>
                    {f.descripcion}
                  </Link>
                  {f.proyecto ? <span className="block text-xs text-muted">{f.proyecto}</span> : null}
                </td>
                <td className="text-muted">{etiquetaCategoria(f.categoria)}</td>
                <td className="text-muted">{f.pago ?? "Empresa"}</td>
                <td className="text-right whitespace-nowrap">{clp(f.monto)}</td>
                <td className="text-right">
                  <Link href={`/admin/gastos/${f.id}`} className="text-xs text-accent-soft underline underline-offset-4 hover:text-fg">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      ) : (
        <Vacio>No hay gastos registrados en este mes.</Vacio>
      )}
    </>
  );
}
