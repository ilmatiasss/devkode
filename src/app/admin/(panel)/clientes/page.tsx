import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, botonPrimario, Encabezado, enlace, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Clientes" };

type Fila = { id: number; nombre: string; contacto: string | null; email: string | null; telefono: string | null; proyectos: number; facturado: number };

export default async function Clientes({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const clientes = await db()<Fila[]>`
    select c.id, c.nombre, c.contacto, c.email, c.telefono,
      (select count(*) from proyectos p where p.cliente_id = c.id)::bigint as proyectos,
      coalesce((select sum(i.monto) from ingresos i join proyectos p on p.id = i.proyecto_id where p.cliente_id = c.id), 0)::bigint as facturado
    from clientes c order by c.nombre`;

  return (
    <>
      <Encabezado
        titulo="Clientes"
        accion={
          <Link href="/admin/clientes/nuevo" className={botonPrimario}>
            Nuevo cliente
          </Link>
        }
      />
      <Aviso ok={q.ok} error={q.error} />
      {clientes.length ? (
        <Tabla>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Proyectos</th>
              <th>Cobrado en total</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/clientes/${c.id}`} className={enlace}>
                    {c.nombre}
                  </Link>
                </td>
                <td className="text-muted">{[c.contacto, c.email, c.telefono].filter(Boolean).join(" · ") || "—"}</td>
                <td>{c.proyectos}</td>
                <td>{clp(c.facturado)}</td>
                <td className="text-right">
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs text-accent-soft underline underline-offset-4 hover:text-fg">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      ) : (
        <Vacio>Todavía no hay clientes.</Vacio>
      )}
    </>
  );
}
