import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Icono } from "@/components/admin/Icono";
import { InputMonto } from "@/components/admin/InputMonto";
import { Selector } from "@/components/admin/Selector";
import { BarraGuardar, botonPeligro, Campo, Encabezado, entrada, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaProyectos, listaUsuarios } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { hoy } from "@/lib/admin/formato";
import { eliminarIngreso, guardarIngreso } from "../../acciones";

export const metadata: Metadata = { title: "Ingreso" };

type Ingreso = { id: number; fecha: string; descripcion: string; monto: number; proyecto_id: number | null; recibido_por: number | null; notas: string | null };

export default async function FichaIngreso({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ proyecto?: string }> }) {
  await exigirUsuario();
  const { id } = await params;
  const q = await searchParams;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const [[ingreso], proyectos, usuarios] = await Promise.all([
    nuevo ? Promise.resolve([undefined]) : db()<Ingreso[]>`select * from ingresos where id = ${Number(id)}`,
    listaProyectos(),
    listaUsuarios(),
  ]);
  if (!nuevo && !ingreso) notFound();
  const proyectoInicial = ingreso?.proyecto_id ?? (q.proyecto && /^\d+$/.test(q.proyecto) ? Number(q.proyecto) : "");

  return (
    <>
      <Encabezado volver={{ href: "/admin/ingresos", texto: "Ingresos" }} titulo={ingreso ? "Editar ingreso" : "Registrar ingreso"} descripcion="Un pago recibido de un cliente." />
      <form action={guardarIngreso} className={`${tarjeta} aparecer grid max-w-3xl gap-5 p-5 sm:grid-cols-2 md:p-7`}>
        {ingreso ? <input type="hidden" name="id" value={ingreso.id} /> : null}
        <div className="rounded-2xl bg-[radial-gradient(120%_120%_at_0%_0%,rgb(126_226_160/0.12),transparent_60%)] p-4 sm:col-span-2 md:p-5">
          <p className="mb-2 flex items-center gap-2 text-sm text-[#7ee2a0]">
            <Icono nombre="ingresos" className="size-4" /> Monto recibido
          </p>
          <InputMonto name="monto" required grande ariaLabel="Monto recibido" defaultValue={ingreso?.monto ?? ""} />
        </div>
        <Campo etiqueta="Descripción" className="sm:col-span-2">
          <input name="descripcion" required maxLength={200} placeholder="Ej: Anticipo 50% tienda online" defaultValue={ingreso?.descripcion} className={entrada} />
        </Campo>
        <Campo etiqueta="Fecha">
          <input name="fecha" type="date" required defaultValue={ingreso?.fecha ?? hoy()} className={entrada} />
        </Campo>
        <Campo etiqueta="Proyecto">
          <select name="proyecto_id" defaultValue={proyectoInicial} className={entrada}>
            <option value="">Sin proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <div className="sm:col-span-2">
          <Selector
            name="recibido_por"
            etiqueta="¿Dónde llegó el pago?"
            inicial={String(ingreso?.recibido_por ?? "")}
            opciones={[{ valor: "", texto: "Cuenta de la empresa" }, ...usuarios.map((u) => ({ valor: String(u.id), texto: `Cuenta de ${u.nombre.split(" ")[0]}` }))]}
          />
          <p className="mt-2 text-xs text-muted">Si llegó a la cuenta de uno de ustedes, se considera en el reparto.</p>
        </div>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={3} maxLength={2000} placeholder="Número de factura, medio de pago…" defaultValue={ingreso?.notas ?? ""} className={entrada} />
        </Campo>
        <BarraGuardar cancelar="/admin/ingresos" texto={ingreso ? "Guardar cambios" : "Registrar ingreso"} />
      </form>
      {ingreso ? (
        <div className="max-w-3xl">
          <ZonaPeligro>
            <form action={eliminarIngreso}>
              <input type="hidden" name="id" value={ingreso.id} />
              <BotonConfirmar mensaje="¿Eliminar este ingreso?" className={botonPeligro}>
                <Icono nombre="basura" className="size-4" /> Eliminar ingreso
              </BotonConfirmar>
            </form>
          </ZonaPeligro>
        </div>
      ) : null}
    </>
  );
}
