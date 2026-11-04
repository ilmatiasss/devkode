import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, botonPrimario, Encabezado, enlace, Etiqueta, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, fecha } from "@/lib/admin/formato";
import { estadosProyecto, type EstadoProyecto } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Proyectos" };

type Fila = { id: number; nombre: string; cliente: string | null; estado: EstadoProyecto; inicio: string | null; entrega: string | null; monto: number; cobrado: number; gastado: number };

export default async function Proyectos({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const proyectos = await db()<Fila[]>`
    select p.id, p.nombre, c.nombre as cliente, p.estado, p.inicio, p.entrega, p.monto,
      coalesce((select sum(monto) from ingresos where proyecto_id = p.id), 0)::bigint as cobrado,
      coalesce((select sum(monto) from gastos where proyecto_id = p.id), 0)::bigint as gastado
    from proyectos p left join clientes c on c.id = p.cliente_id
    order by array_position(array['en_curso', 'propuesta', 'pausado', 'terminado', 'cancelado'], p.estado), p.entrega nulls last, p.nombre`;

  return (
    <>
      <Encabezado
        titulo="Proyectos"
        accion={
          <Link href="/admin/proyectos/nuevo" className={botonPrimario}>
            Nuevo proyecto
          </Link>
        }
      />
      <Aviso ok={q.ok} error={q.error} />
      {proyectos.length ? (
        <Tabla>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Estado</th>
              <th>Entrega</th>
              <th>Valor</th>
              <th>Cobrado</th>
              <th>Por cobrar</th>
              <th>Gastos</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/proyectos/${p.id}`} className={enlace}>
                    {p.nombre}
                  </Link>
                  {p.cliente ? <span className="block text-xs text-muted">{p.cliente}</span> : null}
                </td>
                <td>
                  <Etiqueta tono={p.estado === "en_curso" ? "acento" : p.estado === "terminado" ? "bien" : "neutro"}>{estadosProyecto[p.estado]}</Etiqueta>
                </td>
                <td>{fecha(p.entrega)}</td>
                <td>{clp(p.monto)}</td>
                <td>{clp(p.cobrado)}</td>
                <td>{clp(Math.max(0, p.monto - p.cobrado))}</td>
                <td className="text-muted">{clp(p.gastado)}</td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      ) : (
        <Vacio>Todavía no hay proyectos.</Vacio>
      )}
    </>
  );
}
