import type { Metadata } from "next";
import Link from "next/link";
import { Icono } from "@/components/admin/Icono";
import { Avatar, botonPrimario, colorDe, Encabezado, tarjeta, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Clientes" };

type Fila = { id: number; nombre: string; contacto: string | null; email: string | null; telefono: string | null; proyectos: number; activos: number; facturado: number };

// Enlace de WhatsApp a partir de un teléfono chileno escrito de cualquier forma
function whatsapp(telefono: string | null) {
  const digitos = (telefono ?? "").replace(/\D/g, "");
  if (digitos.length < 8) return null;
  const numero = digitos.length === 9 && digitos.startsWith("9") ? `56${digitos}` : digitos;
  return `https://wa.me/${numero}`;
}

const accion = "grid size-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-accent/50 hover:text-fg";

export default async function Clientes() {
  await exigirUsuario();
  const clientes = await db()<Fila[]>`
    select c.id, c.nombre, c.contacto, c.email, c.telefono,
      (select count(*) from proyectos p where p.cliente_id = c.id)::bigint as proyectos,
      (select count(*) from proyectos p where p.cliente_id = c.id and p.estado in ('en_curso', 'pausado', 'propuesta'))::bigint as activos,
      coalesce((select sum(i.monto) from ingresos i join proyectos p on p.id = i.proyecto_id where p.cliente_id = c.id), 0)::bigint as facturado
    from clientes c order by c.nombre`;

  return (
    <>
      <Encabezado
        titulo="Clientes"
        descripcion={`${clientes.length} cliente${clientes.length === 1 ? "" : "s"} registrados`}
        accion={
          <Link href="/admin/clientes/nuevo" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Nuevo cliente
          </Link>
        }
      />
      {clientes.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clientes.map((c, i) => {
            const wa = whatsapp(c.telefono);
            return (
              <li key={c.id} className={`${tarjeta} aparecer flex flex-col p-5`} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <Avatar nombre={c.nombre} color={colorDe(c.nombre)} className="size-12 text-base" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/clientes/${c.id}`} className="block truncate font-medium hover:text-accent-soft">
                      {c.nombre}
                    </Link>
                    <p className="truncate text-sm text-muted">{c.contacto ?? "Sin contacto"}</p>
                  </div>
                  <Link href={`/admin/clientes/${c.id}`} className={accion} aria-label={`Editar ${c.nombre}`} title="Editar">
                    <Icono nombre="lapiz" className="size-4" />
                  </Link>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-bg/50 p-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Proyectos</dt>
                    <dd className="mt-0.5">
                      {c.proyectos}
                      {c.activos > 0 ? <span className="text-xs text-accent-soft"> · {c.activos} activo{c.activos === 1 ? "" : "s"}</span> : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Cobrado</dt>
                    <dd className="mt-0.5 tabular-nums">{clp(c.facturado)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center gap-2">
                  {c.telefono ? (
                    <a href={`tel:${c.telefono.replace(/[^\d+]/g, "")}`} className={accion} aria-label={`Llamar a ${c.nombre}`} title={c.telefono}>
                      <Icono nombre="telefono" className="size-4" />
                    </a>
                  ) : null}
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className={accion} aria-label={`WhatsApp de ${c.nombre}`} title="WhatsApp">
                      <Icono nombre="chat" className="size-4" />
                    </a>
                  ) : null}
                  {c.email ? (
                    <a href={`mailto:${c.email}`} className={accion} aria-label={`Escribir a ${c.nombre}`} title={c.email}>
                      <Icono nombre="correo" className="size-4" />
                    </a>
                  ) : null}
                  <span className="ml-auto truncate text-xs text-muted">{c.telefono}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Vacio
          icono="clientes"
          titulo="Todavía no hay clientes"
          accion={
            <Link href="/admin/clientes/nuevo" className={botonPrimario}>
              Agregar cliente
            </Link>
          }
        >
          Solo necesitas el nombre, la persona de contacto y un teléfono.
        </Vacio>
      )}
    </>
  );
}
