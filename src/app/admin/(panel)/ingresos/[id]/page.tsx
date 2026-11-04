import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Aviso, botonPeligro, botonPrimario, botonSecundario, Campo, Encabezado, enlace, entrada } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaProyectos, listaUsuarios } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { hoy } from "@/lib/admin/formato";
import { eliminarIngreso, guardarIngreso } from "../../acciones";

export const metadata: Metadata = { title: "Ingreso" };

type Ingreso = { id: number; fecha: string; descripcion: string; monto: number; proyecto_id: number | null; recibido_por: number | null; notas: string | null };

export default async function FichaIngreso({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string; proyecto?: string }>;
}) {
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
      <Encabezado titulo={ingreso ? "Editar ingreso" : "Registrar ingreso"} descripcion={<Link href="/admin/ingresos" className={enlace}>← Ingresos</Link>} />
      <Aviso ok={q.ok} error={q.error} />
      <form action={guardarIngreso} className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {ingreso ? <input type="hidden" name="id" value={ingreso.id} /> : null}
        <Campo etiqueta="Descripción" className="sm:col-span-2">
          <input name="descripcion" required maxLength={200} placeholder="Ej: Anticipo 50% tienda online" defaultValue={ingreso?.descripcion} className={entrada} />
        </Campo>
        <Campo etiqueta="Monto (pesos)">
          <input name="monto" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={ingreso ? String(ingreso.monto) : ""} className={entrada} />
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
        <Campo etiqueta="¿Dónde llegó el pago?" ayuda="Si llegó a la cuenta de uno de ustedes, se considera en el reparto.">
          <select name="recibido_por" defaultValue={ingreso?.recibido_por ?? ""} className={entrada}>
            <option value="">Cuenta de la empresa</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                Cuenta de {u.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={3} maxLength={2000} defaultValue={ingreso?.notas ?? ""} className={entrada} />
        </Campo>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={botonPrimario}>
            Guardar
          </button>
          <Link href="/admin/ingresos" className={botonSecundario}>
            Cancelar
          </Link>
        </div>
      </form>
      {ingreso ? (
        <form action={eliminarIngreso} className="mt-12">
          <input type="hidden" name="id" value={ingreso.id} />
          <BotonConfirmar mensaje="¿Eliminar este ingreso?" className={botonPeligro}>
            Eliminar ingreso
          </BotonConfirmar>
        </form>
      ) : null}
    </>
  );
}
