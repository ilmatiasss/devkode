import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Aviso, botonPeligro, botonPrimario, botonSecundario, Campo, Encabezado, enlace, entrada, Kpi } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaClientes } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, fecha } from "@/lib/admin/formato";
import { claves, estadosProyecto } from "@/lib/admin/opciones";
import { eliminarProyecto, guardarProyecto } from "../../acciones";

export const metadata: Metadata = { title: "Proyecto" };

type Proyecto = { id: number; nombre: string; cliente_id: number | null; estado: string; monto: number; inicio: string | null; entrega: string | null; notas: string | null };
type Mov = { id: number; fecha: string; descripcion: string; monto: number };

export default async function FichaProyecto({
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
  const [[proyecto], clientes, ingresos, gastos] = await Promise.all([
    nuevo ? Promise.resolve([undefined]) : sql<Proyecto[]>`select * from proyectos where id = ${Number(id)}`,
    listaClientes(),
    nuevo ? Promise.resolve([] as Mov[]) : sql<Mov[]>`select id, fecha, descripcion, monto from ingresos where proyecto_id = ${Number(id)} order by fecha desc`,
    nuevo ? Promise.resolve([] as Mov[]) : sql<Mov[]>`select id, fecha, descripcion, monto from gastos where proyecto_id = ${Number(id)} order by fecha desc`,
  ]);
  if (!nuevo && !proyecto) notFound();

  const cobrado = ingresos.reduce((s, i) => s + i.monto, 0);
  const gastado = gastos.reduce((s, g) => s + g.monto, 0);

  return (
    <>
      <Encabezado titulo={proyecto?.nombre ?? "Nuevo proyecto"} descripcion={<Link href="/admin/proyectos" className={enlace}>← Proyectos</Link>} />
      <Aviso ok={q.ok} error={q.error} />

      {proyecto ? (
        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          <Kpi etiqueta="Cobrado" valor={clp(cobrado)} detalle={`de ${clp(proyecto.monto)}`} />
          <Kpi etiqueta="Por cobrar" valor={clp(Math.max(0, proyecto.monto - cobrado))} />
          <Kpi etiqueta="Margen (cobrado − gastos)" valor={clp(cobrado - gastado)} tono={cobrado - gastado >= 0 ? "bien" : "mal"} />
        </div>
      ) : null}

      <form action={guardarProyecto} className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {proyecto ? <input type="hidden" name="id" value={proyecto.id} /> : null}
        <Campo etiqueta="Nombre del proyecto" className="sm:col-span-2">
          <input name="nombre" required maxLength={120} defaultValue={proyecto?.nombre} className={entrada} />
        </Campo>
        <Campo etiqueta="Cliente" ayuda={clientes.length ? undefined : "Primero crea el cliente en la sección Clientes."}>
          <select name="cliente_id" defaultValue={proyecto?.cliente_id ?? ""} className={entrada}>
            <option value="">Sin cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Estado">
          <select name="estado" defaultValue={proyecto?.estado ?? "en_curso"} className={entrada}>
            {claves(estadosProyecto).map((e) => (
              <option key={e} value={e}>
                {estadosProyecto[e]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Valor acordado (pesos)" ayuda="Sin puntos ni decimales, o con puntos: 1.250.000">
          <input name="monto" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={proyecto ? String(proyecto.monto) : "0"} className={entrada} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo etiqueta="Inicio">
            <input name="inicio" type="date" defaultValue={proyecto?.inicio ?? ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Entrega">
            <input name="entrega" type="date" defaultValue={proyecto?.entrega ?? ""} className={entrada} />
          </Campo>
        </div>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={4} maxLength={4000} defaultValue={proyecto?.notas ?? ""} className={entrada} />
        </Campo>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={botonPrimario}>
            Guardar
          </button>
          <Link href="/admin/proyectos" className={botonSecundario}>
            Volver
          </Link>
        </div>
      </form>

      {proyecto ? (
        <>
          <div className="mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {[
              { titulo: "Pagos recibidos", lista: ingresos, ruta: "ingresos", nuevo: "Registrar pago" },
              { titulo: "Gastos del proyecto", lista: gastos, ruta: "gastos", nuevo: "Registrar gasto" },
            ].map((bloque) => (
              <section key={bloque.ruta}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-medium">{bloque.titulo}</h2>
                  <Link href={`/admin/${bloque.ruta}/nuevo?proyecto=${proyecto.id}`} className="text-sm text-accent-soft underline underline-offset-4">
                    {bloque.nuevo}
                  </Link>
                </div>
                {bloque.lista.length ? (
                  <ul className="divide-y divide-line border border-line text-sm">
                    {bloque.lista.map((m) => (
                      <li key={m.id} className="flex justify-between gap-3 px-4 py-3">
                        <Link href={`/admin/${bloque.ruta}/${m.id}`} className={enlace}>
                          {m.descripcion}
                        </Link>
                        <span className="whitespace-nowrap text-muted">
                          {fecha(m.fecha)} · <span className="text-fg">{clp(m.monto)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">Nada registrado todavía.</p>
                )}
              </section>
            ))}
          </div>
          <form action={eliminarProyecto} className="mt-12">
            <input type="hidden" name="id" value={proyecto.id} />
            <BotonConfirmar mensaje="¿Eliminar este proyecto? Sus pagos y gastos quedan registrados, pero sin proyecto asociado." className={botonPeligro}>
              Eliminar proyecto
            </BotonConfirmar>
          </form>
        </>
      ) : null}
    </>
  );
}
