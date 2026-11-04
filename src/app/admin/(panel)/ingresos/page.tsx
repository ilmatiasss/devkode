import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, botonPrimario, Encabezado, enlace, SelectorMes, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, esMes, fecha, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Ingresos" };

type Fila = { id: number; fecha: string; descripcion: string; monto: number; proyecto_id: number | null; proyecto: string | null; recibio: string | null };

export default async function Ingresos({ searchParams }: { searchParams: Promise<{ mes?: string; ok?: string; error?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const mes = esMes(q.mes) ? q.mes : mesActual();
  const filas = await db()<Fila[]>`
    select i.id, i.fecha, i.descripcion, i.monto, i.proyecto_id, p.nombre as proyecto, u.nombre as recibio
    from ingresos i left join proyectos p on p.id = i.proyecto_id left join usuarios u on u.id = i.recibido_por
    where i.fecha >= ${`${mes}-01`} and i.fecha < ${`${moverMes(mes, 1)}-01`}
    order by i.fecha desc, i.id desc`;
  const total = filas.reduce((s, f) => s + f.monto, 0);

  return (
    <>
      <Encabezado
        titulo="Ingresos"
        descripcion="Pagos recibidos de clientes."
        accion={
          <Link href="/admin/ingresos/nuevo" className={botonPrimario}>
            Registrar ingreso
          </Link>
        }
      />
      <Aviso ok={q.ok} error={q.error} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SelectorMes mes={mes} ruta="/admin/ingresos" anterior={moverMes(mes, -1)} siguiente={moverMes(mes, 1)} nombre={nombreMes(mes)} />
        <p className="text-sm text-muted">
          Total del mes: <span className="font-medium text-fg">{clp(total)}</span>
        </p>
      </div>
      {filas.length ? (
        <Tabla>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Proyecto</th>
              <th>Lo recibió</th>
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
                  <Link href={`/admin/ingresos/${f.id}`} className={enlace}>
                    {f.descripcion}
                  </Link>
                </td>
                <td className="text-muted">
                  {f.proyecto_id ? (
                    <Link href={`/admin/proyectos/${f.proyecto_id}`} className="hover:text-fg">
                      {f.proyecto}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="text-muted">{f.recibio ?? "Empresa"}</td>
                <td className="text-right whitespace-nowrap">{clp(f.monto)}</td>
                <td className="text-right">
                  <Link href={`/admin/ingresos/${f.id}`} className="text-xs text-accent-soft underline underline-offset-4 hover:text-fg">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      ) : (
        <Vacio>No hay ingresos registrados en este mes.</Vacio>
      )}
    </>
  );
}
