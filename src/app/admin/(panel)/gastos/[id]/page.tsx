import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Aviso, botonPeligro, botonPrimario, botonSecundario, Campo, Encabezado, enlace, entrada } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaProyectos, listaUsuarios } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { hoy } from "@/lib/admin/formato";
import { categoriasGasto, claves } from "@/lib/admin/opciones";
import { eliminarGasto, guardarGasto } from "../../acciones";

export const metadata: Metadata = { title: "Gasto" };

type Gasto = { id: number; fecha: string; descripcion: string; categoria: string; monto: number; pagado_por: number | null; proyecto_id: number | null; servicio_id: number | null; notas: string | null };

export default async function FichaGasto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string; proyecto?: string }>;
}) {
  const usuario = await exigirUsuario();
  const { id } = await params;
  const q = await searchParams;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const [[gasto], proyectos, usuarios] = await Promise.all([
    nuevo ? Promise.resolve([undefined]) : db()<Gasto[]>`select * from gastos where id = ${Number(id)}`,
    listaProyectos(),
    listaUsuarios(),
  ]);
  if (!nuevo && !gasto) notFound();
  const proyectoInicial = gasto?.proyecto_id ?? (q.proyecto && /^\d+$/.test(q.proyecto) ? Number(q.proyecto) : "");

  return (
    <>
      <Encabezado titulo={gasto ? "Editar gasto" : "Registrar gasto"} descripcion={<Link href="/admin/gastos" className={enlace}>← Gastos</Link>} />
      <Aviso ok={q.ok} error={q.error} />
      {gasto?.servicio_id ? (
        <p className="mb-6 text-sm text-muted">
          Este gasto viene de un{" "}
          <Link href={`/admin/servicios/${gasto.servicio_id}`} className={enlace}>
            servicio contratado
          </Link>
          .
        </p>
      ) : null}
      <form action={guardarGasto} className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {gasto ? <input type="hidden" name="id" value={gasto.id} /> : null}
        <Campo etiqueta="Descripción" className="sm:col-span-2">
          <input name="descripcion" required maxLength={200} placeholder="Ej: Dominio fruterra.cl" defaultValue={gasto?.descripcion} className={entrada} />
        </Campo>
        <Campo etiqueta="Monto (pesos)">
          <input name="monto" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={gasto ? String(gasto.monto) : ""} className={entrada} />
        </Campo>
        <Campo etiqueta="Fecha">
          <input name="fecha" type="date" required defaultValue={gasto?.fecha ?? hoy()} className={entrada} />
        </Campo>
        <Campo etiqueta="Categoría">
          <select name="categoria" defaultValue={gasto?.categoria ?? "otros"} className={entrada}>
            {claves(categoriasGasto).map((c) => (
              <option key={c} value={c}>
                {categoriasGasto[c]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="¿Quién lo pagó?" ayuda="Si lo pagó uno de ustedes de su bolsillo, se le devuelve en el reparto.">
          <select name="pagado_por" defaultValue={gasto ? (gasto.pagado_por ?? "") : usuario.id} className={entrada}>
            <option value="">Cuenta de la empresa</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Proyecto (opcional)" className="sm:col-span-2">
          <select name="proyecto_id" defaultValue={proyectoInicial} className={entrada}>
            <option value="">Gasto general de DevKode</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={3} maxLength={2000} placeholder="Número de boleta, enlace a la factura…" defaultValue={gasto?.notas ?? ""} className={entrada} />
        </Campo>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={botonPrimario}>
            Guardar
          </button>
          <Link href="/admin/gastos" className={botonSecundario}>
            Cancelar
          </Link>
        </div>
      </form>
      {gasto ? (
        <form action={eliminarGasto} className="mt-12">
          <input type="hidden" name="id" value={gasto.id} />
          <BotonConfirmar mensaje="¿Eliminar este gasto?" className={botonPeligro}>
            Eliminar gasto
          </BotonConfirmar>
        </form>
      ) : null}
    </>
  );
}
