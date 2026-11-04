import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Icono } from "@/components/admin/Icono";
import { InputMonto } from "@/components/admin/InputMonto";
import { BarraGuardar, botonPeligro, Campo, Encabezado, entrada, Etiqueta, Kpi, Progreso, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaClientes } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, fecha } from "@/lib/admin/formato";
import { claves, estadosProyecto, type EstadoProyecto, tonoEstado } from "@/lib/admin/opciones";
import { eliminarProyecto, guardarProyecto } from "../../acciones";

export const metadata: Metadata = { title: "Proyecto" };

type Proyecto = { id: number; nombre: string; cliente_id: number | null; estado: EstadoProyecto; monto: number; inicio: string | null; entrega: string | null; notas: string | null };
type Mov = { id: number; fecha: string; descripcion: string; monto: number };

export default async function FichaProyecto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cliente?: string }> }) {
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
  const avance = proyecto && proyecto.monto > 0 ? (cobrado / proyecto.monto) * 100 : 0;
  const clienteInicial = proyecto?.cliente_id ?? (q.cliente && /^\d+$/.test(q.cliente) ? Number(q.cliente) : "");

  return (
    <>
      <Encabezado
        volver={{ href: "/admin/proyectos", texto: "Proyectos" }}
        titulo={proyecto?.nombre ?? "Nuevo proyecto"}
        etiqueta={proyecto ? <Etiqueta tono={tonoEstado[proyecto.estado]}>{estadosProyecto[proyecto.estado]}</Etiqueta> : undefined}
        descripcion={proyecto ? `Valor acordado ${clp(proyecto.monto)}` : "Completa los datos y guárdalo; después podrás registrarle pagos y gastos."}
      />

      {proyecto ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <Kpi etiqueta="Cobrado" valor={clp(cobrado)} icono="ingresos" tono="bien" detalle={`${Math.round(avance)}% del total`} />
            <Kpi etiqueta="Por cobrar" valor={clp(Math.max(0, proyecto.monto - cobrado))} icono="reloj" tono="acento" />
            <div className="col-span-2 md:col-span-1">
              <Kpi etiqueta="Margen (cobrado − gastos)" valor={clp(cobrado - gastado)} icono="billetera" tono={cobrado - gastado >= 0 ? "bien" : "mal"} detalle={`${clp(gastado)} en gastos`} />
            </div>
          </div>
          <div className="mt-4 mb-8">
            <Progreso valor={avance} color={avance >= 100 ? "#7ee2a0" : undefined} etiqueta="Avance de cobro" />
          </div>
        </>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <form action={guardarProyecto} className={`${tarjeta} aparecer grid gap-5 p-5 sm:grid-cols-2 md:p-6`}>
          <h2 className="flex items-center gap-2 font-medium sm:col-span-2">
            <Icono nombre="lapiz" className="size-4 text-accent-soft" /> {proyecto ? "Editar datos" : "Datos del proyecto"}
          </h2>
          {proyecto ? <input type="hidden" name="id" value={proyecto.id} /> : null}
          <Campo etiqueta="Nombre del proyecto" className="sm:col-span-2">
            <input name="nombre" required maxLength={120} placeholder="Ej: Tienda online Fruterra" defaultValue={proyecto?.nombre} className={entrada} />
          </Campo>
          <Campo etiqueta="Cliente" ayuda={clientes.length ? undefined : "Primero crea el cliente en Clientes."}>
            <select name="cliente_id" defaultValue={clienteInicial} className={entrada}>
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
          <Campo etiqueta="Valor acordado" className="sm:col-span-2">
            <InputMonto name="monto" required defaultValue={proyecto?.monto ?? ""} />
          </Campo>
          <Campo etiqueta="Inicio">
            <input name="inicio" type="date" defaultValue={proyecto?.inicio ?? ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Entrega">
            <input name="entrega" type="date" defaultValue={proyecto?.entrega ?? ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <textarea name="notas" rows={4} maxLength={4000} placeholder="Alcance, acuerdos, accesos pendientes…" defaultValue={proyecto?.notas ?? ""} className={entrada} />
          </Campo>
          <BarraGuardar cancelar="/admin/proyectos" texto={proyecto ? "Guardar cambios" : "Crear proyecto"} />
        </form>

        {proyecto ? (
          <div className="space-y-6">
            {[
              { titulo: "Pagos recibidos", lista: ingresos, ruta: "ingresos", nuevo: "Registrar pago", signo: "+", color: "text-[#7ee2a0]" },
              { titulo: "Gastos del proyecto", lista: gastos, ruta: "gastos", nuevo: "Registrar gasto", signo: "−", color: "" },
            ].map((b) => (
              <section key={b.ruta} className={`${tarjeta} aparecer p-5`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-medium">{b.titulo}</h2>
                  <Link href={`/admin/${b.ruta}/nuevo?proyecto=${proyecto.id}`} className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs text-accent-soft hover:bg-accent/20">
                    <Icono nombre="mas2" className="size-3.5" /> {b.nuevo}
                  </Link>
                </div>
                {b.lista.length ? (
                  <ul className="-mx-2">
                    {b.lista.map((m) => (
                      <li key={m.id}>
                        <Link href={`/admin/${b.ruta}/${m.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-white/[0.03]">
                          <span className="min-w-0">
                            <span className="block truncate">{m.descripcion}</span>
                            <span className="text-xs text-muted">{fecha(m.fecha)}</span>
                          </span>
                          <span className={`shrink-0 tabular-nums ${b.color}`}>
                            {b.signo}
                            {clp(m.monto)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-muted">Nada registrado todavía.</p>
                )}
              </section>
            ))}
          </div>
        ) : null}
      </div>

      {proyecto ? (
        <ZonaPeligro>
          <form action={eliminarProyecto} className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Sus pagos y gastos quedan registrados, pero sin proyecto asociado.</p>
            <input type="hidden" name="id" value={proyecto.id} />
            <BotonConfirmar mensaje="¿Eliminar este proyecto? Sus pagos y gastos quedan registrados, pero sin proyecto asociado." className={botonPeligro}>
              <Icono nombre="basura" className="size-4" /> Eliminar proyecto
            </BotonConfirmar>
          </form>
        </ZonaPeligro>
      ) : null}
    </>
  );
}
