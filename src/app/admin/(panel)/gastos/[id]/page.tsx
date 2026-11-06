import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { CampoPagoGasto } from "@/components/admin/CampoPagoGasto";
import { Icono } from "@/components/admin/Icono";
import { InputMonto } from "@/components/admin/InputMonto";
import { Selector } from "@/components/admin/Selector";
import { BarraGuardar, botonPeligro, Campo, Encabezado, enlace, entrada, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaProyectos, listaUsuarios } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { hoy } from "@/lib/admin/formato";
import { categoriasGasto, claves, colorDeCategoria } from "@/lib/admin/opciones";
import { eliminarGasto, guardarGasto } from "../../acciones";

export const metadata: Metadata = { title: "Gasto" };

type Gasto = {
  id: number;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  pagado_por: number | null;
  proyecto_id: number | null;
  servicio_id: number | null;
  proveedor: string | null;
  documento: string | null;
  notas: string | null;
  pone: Record<string, number> | null;
  mant_mes: string | null;
};

export default async function FichaGasto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ proyecto?: string }> }) {
  const { id } = await params;
  const q = await searchParams;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const [usuario, [gasto], proyectos, usuarios, servicios] = await Promise.all([
    exigirUsuario(),
    nuevo ? Promise.resolve([undefined]) : db()<Gasto[]>`select * from gastos where id = ${Number(id)}`,
    listaProyectos(),
    listaUsuarios(),
    db()<{ id: number; nombre: string; activo: boolean }[]>`select id, nombre, activo from servicios order by activo desc, nombre`,
  ]);
  if (!nuevo && !gasto) notFound();
  const proyectoInicial = gasto?.proyecto_id ?? (q.proyecto && /^\d+$/.test(q.proyecto) ? Number(q.proyecto) : "");

  return (
    <>
      <Encabezado
        volver={{ href: "/admin/gastos", texto: "Gastos" }}
        titulo={gasto ? "Editar gasto" : "Registrar gasto"}
        descripcion={
          gasto?.servicio_id ? (
            <>
              Viene de un{" "}
              <Link href={`/admin/servicios/${gasto.servicio_id}`} className={enlace}>
                servicio contratado
              </Link>
              .
            </>
          ) : (
            "Cualquier cosa que haya salido de la empresa o de su bolsillo."
          )
        }
      />
      <form action={guardarGasto} className={`${tarjeta} aparecer grid max-w-3xl gap-5 p-5 sm:grid-cols-2 md:p-7`}>
        {gasto ? <input type="hidden" name="id" value={gasto.id} /> : null}
        <div className="rounded-2xl bg-[radial-gradient(120%_120%_at_0%_0%,rgb(255_143_163/0.1),transparent_60%)] p-4 sm:col-span-2 md:p-5">
          <p className="mb-2 flex items-center gap-2 text-sm text-[#ff8fa3]">
            <Icono nombre="gastos" className="size-4" /> Monto del gasto
          </p>
          <InputMonto name="monto" required grande ariaLabel="Monto del gasto" defaultValue={gasto?.monto ?? ""} />
        </div>
        <Campo etiqueta="¿Qué se compró o pagó?" className="sm:col-span-2">
          <input name="descripcion" required maxLength={200} placeholder="Ej: Dominio fruterra.cl, notebook, publicidad de noviembre" defaultValue={gasto?.descripcion} className={entrada} />
        </Campo>
        <Campo etiqueta="¿Dónde? (proveedor o tienda)">
          <input name="proveedor" maxLength={120} placeholder="Ej: NIC Chile, PC Factory, Meta" defaultValue={gasto?.proveedor ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="N° de boleta o factura">
          <input name="documento" maxLength={60} placeholder="Opcional" defaultValue={gasto?.documento ?? ""} className={entrada} />
        </Campo>
        <div className="sm:col-span-2">
          <Selector
            name="categoria"
            etiqueta="Categoría"
            inicial={gasto?.categoria ?? "otros"}
            opciones={claves(categoriasGasto).map((c) => ({ valor: c, texto: categoriasGasto[c], color: colorDeCategoria(c) }))}
          />
        </div>
        <Campo etiqueta="Fecha">
          <input name="fecha" type="date" required defaultValue={gasto?.fecha ?? hoy()} className={entrada} />
        </Campo>
        <Campo etiqueta="¿Es pago de un servicio contratado?">
          <select name="servicio_id" defaultValue={gasto?.servicio_id ?? ""} className={entrada}>
            <option value="">No</option>
            {servicios.map((sv) => (
              <option key={sv.id} value={sv.id}>
                {sv.nombre}
                {sv.activo ? "" : " (inactivo)"}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Proyecto (opcional)">
          <select name="proyecto_id" defaultValue={proyectoInicial} className={entrada}>
            <option value="">Gasto general de DevKode</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <div className="sm:col-span-2">
          <CampoPagoGasto
            socios={usuarios}
            inicial={gasto?.mant_mes ? "mantencion" : gasto ? String(gasto.pagado_por ?? "") : String(usuario.id)}
            mantMes={gasto?.mant_mes ?? null}
            pone={gasto?.pone ?? null}
          />
        </div>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={3} maxLength={2000} placeholder="Enlace a la factura, garantía, detalles…" defaultValue={gasto?.notas ?? ""} className={entrada} />
        </Campo>
        <BarraGuardar cancelar="/admin/gastos" texto={gasto ? "Guardar cambios" : "Registrar gasto"} />
      </form>
      {gasto ? (
        <div className="max-w-3xl">
          <ZonaPeligro>
            <form action={eliminarGasto}>
              <input type="hidden" name="id" value={gasto.id} />
              <BotonConfirmar mensaje="¿Eliminar este gasto?" className={botonPeligro}>
                <Icono nombre="basura" className="size-4" /> Eliminar gasto
              </BotonConfirmar>
            </form>
          </ZonaPeligro>
        </div>
      ) : null}
    </>
  );
}
