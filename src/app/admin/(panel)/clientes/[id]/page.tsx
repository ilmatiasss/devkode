import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Icono } from "@/components/admin/Icono";
import { Avatar, BarraGuardar, botonPeligro, Campo, colorDe, Encabezado, entrada, Etiqueta, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp } from "@/lib/admin/formato";
import { estadosProyecto, type EstadoProyecto, tonoEstado } from "@/lib/admin/opciones";
import { eliminarCliente, guardarCliente } from "../../acciones";

export const metadata: Metadata = { title: "Cliente" };

type Cliente = { id: number; nombre: string; contacto: string | null; email: string | null; telefono: string | null; rut: string | null; notas: string | null };

export default async function FichaCliente({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const sql = db();
  const [cliente] = nuevo ? [undefined] : await sql<Cliente[]>`select * from clientes where id = ${Number(id)}`;
  if (!nuevo && !cliente) notFound();
  const proyectos = nuevo
    ? []
    : await sql<{ id: number; nombre: string; estado: EstadoProyecto; monto: number }[]>`select id, nombre, estado, monto from proyectos where cliente_id = ${Number(id)} order by creado desc`;
  const opcional = <span className="font-normal text-muted"> (opcional)</span>;

  return (
    <>
      <Encabezado volver={{ href: "/admin/clientes", texto: "Clientes" }} titulo={cliente?.nombre ?? "Nuevo cliente"} descripcion={cliente?.contacto ?? "Los campos marcados como opcionales se pueden completar después."} />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <form action={guardarCliente} className={`${tarjeta} aparecer grid gap-5 p-5 sm:grid-cols-2 md:p-6`}>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Avatar nombre={cliente?.nombre ?? "?"} color={colorDe(cliente?.nombre ?? "?")} className="size-11 text-base" />
            <h2 className="font-medium">{cliente ? "Editar datos" : "Datos del cliente"}</h2>
          </div>
          {cliente ? <input type="hidden" name="id" value={cliente.id} /> : null}
          <Campo etiqueta="Nombre o razón social" className="sm:col-span-2">
            <input name="nombre" required maxLength={120} placeholder="Ej: Reycar Detailing Center" defaultValue={cliente?.nombre} className={entrada} />
          </Campo>
          <Campo etiqueta="Persona de contacto">
            <input name="contacto" required maxLength={120} placeholder="Nombre y apellido" defaultValue={cliente?.contacto ?? ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Teléfono">
            <input name="telefono" type="tel" required maxLength={40} placeholder="+56 9 1234 5678" defaultValue={cliente?.telefono ?? ""} className={entrada} />
          </Campo>
          <label className="block text-sm">
            <span className="font-medium text-[#c9c9cf]">Correo{opcional}</span>
            <input name="email" type="email" maxLength={200} defaultValue={cliente?.email ?? ""} className={entrada} />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#c9c9cf]">RUT{opcional}</span>
            <input name="rut" maxLength={20} placeholder="12.345.678-9" defaultValue={cliente?.rut ?? ""} className={entrada} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-[#c9c9cf]">Notas{opcional}</span>
            <textarea name="notas" rows={4} maxLength={4000} placeholder="Dirección, rubro, cómo llegó, preferencias…" defaultValue={cliente?.notas ?? ""} className={entrada} />
          </label>
          <BarraGuardar cancelar="/admin/clientes" texto={cliente ? "Guardar cambios" : "Crear cliente"} />
        </form>

        {cliente ? (
          <section className={`${tarjeta} aparecer h-fit p-5`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-medium">Proyectos</h2>
              <Link href={`/admin/proyectos/nuevo?cliente=${cliente.id}`} className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs text-accent-soft hover:bg-accent/20">
                <Icono nombre="mas2" className="size-3.5" /> Nuevo proyecto
              </Link>
            </div>
            {proyectos.length ? (
              <ul className="-mx-2">
                {proyectos.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/proyectos/${p.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-white/[0.03]">
                      <span className="min-w-0">
                        <span className="block truncate">{p.nombre}</span>
                        <span className="text-xs text-muted">{clp(p.monto)}</span>
                      </span>
                      <Etiqueta tono={tonoEstado[p.estado]}>{estadosProyecto[p.estado]}</Etiqueta>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-muted">Sin proyectos todavía.</p>
            )}
          </section>
        ) : null}
      </div>

      {cliente ? (
        <ZonaPeligro>
          <form action={eliminarCliente} className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Sus proyectos se mantienen, pero quedan sin cliente asociado.</p>
            <input type="hidden" name="id" value={cliente.id} />
            <BotonConfirmar mensaje="¿Eliminar este cliente? Sus proyectos quedan, pero sin cliente asociado." className={botonPeligro}>
              <Icono nombre="basura" className="size-4" /> Eliminar cliente
            </BotonConfirmar>
          </form>
        </ZonaPeligro>
      ) : null}
    </>
  );
}
