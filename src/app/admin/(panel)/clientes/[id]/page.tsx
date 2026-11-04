import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Aviso, botonPeligro, botonPrimario, botonSecundario, Campo, Encabezado, enlace, entrada } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { estadosProyecto, type EstadoProyecto } from "@/lib/admin/opciones";
import { eliminarCliente, guardarCliente } from "../../acciones";

export const metadata: Metadata = { title: "Cliente" };

type Cliente = { id: number; nombre: string; contacto: string | null; email: string | null; telefono: string | null; rut: string | null; notas: string | null };

export default async function FichaCliente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await exigirUsuario();
  const { id } = await params;
  const q = await searchParams;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const sql = db();
  const [cliente] = nuevo ? [undefined] : await sql<Cliente[]>`select * from clientes where id = ${Number(id)}`;
  if (!nuevo && !cliente) notFound();
  const proyectos = nuevo
    ? []
    : await sql<{ id: number; nombre: string; estado: EstadoProyecto }[]>`select id, nombre, estado from proyectos where cliente_id = ${Number(id)} order by creado desc`;

  return (
    <>
      <Encabezado titulo={cliente?.nombre ?? "Nuevo cliente"} descripcion={<Link href="/admin/clientes" className={enlace}>← Clientes</Link>} />
      <Aviso ok={q.ok} error={q.error} />

      <form action={guardarCliente} className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {cliente ? <input type="hidden" name="id" value={cliente.id} /> : null}
        <Campo etiqueta="Nombre o razón social" className="sm:col-span-2">
          <input name="nombre" required maxLength={120} defaultValue={cliente?.nombre} className={entrada} />
        </Campo>
        <Campo etiqueta="Persona de contacto">
          <input name="contacto" maxLength={120} defaultValue={cliente?.contacto ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="RUT">
          <input name="rut" maxLength={20} defaultValue={cliente?.rut ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="Correo">
          <input name="email" type="email" maxLength={200} defaultValue={cliente?.email ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="Teléfono">
          <input name="telefono" type="tel" maxLength={40} defaultValue={cliente?.telefono ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={4} maxLength={4000} defaultValue={cliente?.notas ?? ""} className={entrada} />
        </Campo>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={botonPrimario}>
            Guardar
          </button>
          <Link href="/admin/clientes" className={botonSecundario}>
            Cancelar
          </Link>
        </div>
      </form>

      {cliente ? (
        <>
          <section className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-lg font-medium">Proyectos</h2>
            {proyectos.length ? (
              <ul className="divide-y divide-line border border-line text-sm">
                {proyectos.map((p) => (
                  <li key={p.id} className="flex justify-between px-4 py-3">
                    <Link href={`/admin/proyectos/${p.id}`} className={enlace}>
                      {p.nombre}
                    </Link>
                    <span className="text-muted">{estadosProyecto[p.estado]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Sin proyectos todavía.</p>
            )}
          </section>
          <form action={eliminarCliente} className="mt-12">
            <input type="hidden" name="id" value={cliente.id} />
            <BotonConfirmar mensaje="¿Eliminar este cliente? Sus proyectos quedan, pero sin cliente asociado." className={botonPeligro}>
              Eliminar cliente
            </BotonConfirmar>
          </form>
        </>
      ) : null}
    </>
  );
}
