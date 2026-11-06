import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { CampoRecibido } from "@/components/admin/CampoRecibido";
import { CampoEntrega } from "@/components/admin/CampoEntrega";
import { CampoPara } from "@/components/admin/CampoPara";
import { HistorialMantencion } from "@/components/admin/HistorialMantencion";
import { Icono } from "@/components/admin/Icono";
import { ServiciosMantencion } from "@/components/admin/ServiciosMantencion";
import { InputMonto } from "@/components/admin/InputMonto";
import { BarraGuardar, botonPeligro, botonPrimario, Campo, Encabezado, entrada, Etiqueta, Kpi, Progreso, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { estadoMantencion, listaClientes, listaUsuarios, mesesMantencion, serviciosDeProyectos } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, fecha, hoy, nombreMes } from "@/lib/admin/formato";
import { claves, estadosProyecto, type EstadoProyecto, tonoEstado } from "@/lib/admin/opciones";
import { eliminarProyecto, guardarProyecto, registrarMantencion } from "../../acciones";

export const metadata: Metadata = { title: "Proyecto" };

type Proyecto = {
  id: number;
  nombre: string;
  cliente_id: number | null;
  estado: EstadoProyecto;
  monto: number;
  inicio: string | null;
  entrega: string | null;
  notas: string | null;
  mant_activa: boolean;
  mant_monto: number;
  mant_dia: number;
  mant_desde: string | null;
};
type Mov = { id: number; fecha: string; descripcion: string; monto: number; mant_mes?: string | null };

export default async function FichaProyecto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cliente?: string }> }) {
  const { id } = await params;
  const q = await searchParams;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const sql = db();
  const [, [proyecto], clientes, usuarios, ingresos, gastos, servicios, meses] = await Promise.all([
    exigirUsuario(),
    nuevo ? Promise.resolve([undefined]) : sql<Proyecto[]>`select * from proyectos where id = ${Number(id)}`,
    listaClientes(),
    listaUsuarios(),
    nuevo ? Promise.resolve([] as Mov[]) : sql<Mov[]>`select id, fecha, descripcion, monto, mant_mes from ingresos where proyecto_id = ${Number(id)} order by fecha desc`,
    nuevo ? Promise.resolve([] as Mov[]) : sql<Mov[]>`select id, fecha, descripcion, monto from gastos where proyecto_id = ${Number(id)} order by fecha desc`,
    serviciosDeProyectos(),
    nuevo ? Promise.resolve([]) : mesesMantencion(Number(id)),
  ]);
  if (!nuevo && !proyecto) notFound();

  // Lo cobrado del valor acordado (sin mantenciones) y lo cobrado en mantenciones, por separado
  const cobrado = ingresos.filter((i) => !i.mant_mes).reduce((s, i) => s + i.monto, 0);
  const cobradoMant = ingresos.filter((i) => i.mant_mes).reduce((s, i) => s + i.monto, 0);
  const gastado = gastos.reduce((s, g) => s + g.monto, 0);
  const avance = proyecto && proyecto.monto > 0 ? (cobrado / proyecto.monto) * 100 : 0;
  const dia = hoy();
  const mant = proyecto?.mant_activa ? estadoMantencion({ ...proyecto, inicio: proyecto.inicio, pagados: ingresos.flatMap((i) => (i.mant_mes ? [i.mant_mes] : [])) }, dia) : null;
  const pagosMantencion = ingresos.filter((i) => i.mant_mes);
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
              <Kpi
                etiqueta="Margen (todo lo cobrado − gastos)"
                valor={clp(cobrado + cobradoMant - gastado)}
                icono="billetera"
                tono={cobrado + cobradoMant - gastado >= 0 ? "bien" : "mal"}
                detalle={`${cobradoMant ? `${clp(cobradoMant)} en mantenciones · ` : ""}${clp(gastado)} en gastos`}
              />
            </div>
          </div>
          <div className="mt-4 mb-8">
            <Progreso valor={avance} color={avance >= 100 ? "#7ee2a0" : undefined} etiqueta="Avance de cobro" />
          </div>
        </>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <form action={guardarProyecto} className={`${tarjeta} aparecer grid min-w-0 gap-5 p-5 sm:grid-cols-2 md:p-6`}>
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
          <CampoEntrega inicial={proyecto?.entrega ?? null} clase={entrada} />
          <fieldset className="min-w-0 rounded-2xl border border-line bg-bg/40 p-4 sm:col-span-2">
            <legend className="px-1 text-sm font-medium text-[#c9c9cf]">Mantención mensual</legend>
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span>
                Cobrar mantención todos los meses
                <span className="block text-xs text-muted">Aparece en Mantenciones y les avisamos por correo el día de cobro.</span>
              </span>
              <input type="checkbox" name="mant_activa" defaultChecked={proyecto?.mant_activa ?? false} className="size-5 shrink-0 accent-[var(--color-accent)]" />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Campo etiqueta="Monto mensual">
                <InputMonto name="mant_monto" defaultValue={proyecto?.mant_monto || ""} />
              </Campo>
              <Campo etiqueta="Día de cobro">
                <input name="mant_dia" type="number" min={1} max={28} defaultValue={proyecto?.mant_dia ?? 5} className={entrada} />
              </Campo>
              <Campo etiqueta="Desde">
                <input name="mant_desde" type="date" defaultValue={proyecto?.mant_desde ?? ""} className={entrada} />
              </Campo>
            </div>
          </fieldset>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <textarea name="notas" rows={4} maxLength={4000} placeholder="Alcance, acuerdos, accesos pendientes…" defaultValue={proyecto?.notas ?? ""} className={entrada} />
          </Campo>
          <BarraGuardar cancelar="/admin/proyectos" texto={proyecto ? "Guardar cambios" : "Crear proyecto"} />
        </form>

        {proyecto ? (
          <div className="space-y-6">
            {proyecto.mant_activa && mant ? (
              <section className={`${tarjeta} aparecer bg-[radial-gradient(120%_120%_at_100%_0%,rgb(155_114_255/0.12),transparent_60%)] p-5`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-medium">
                    <Icono nombre="repetir" className="size-4 text-accent-soft" /> Mantención mensual
                  </h2>
                  <Etiqueta tono={mant.pendientes.some((m) => m < dia.slice(0, 7)) ? "mal" : mant.mesActualPagado ? "bien" : "aviso"}>
                    {mant.pendientes.length ? `${mant.pendientes.length} pendiente${mant.pendientes.length === 1 ? "" : "s"}` : "Al día"}
                  </Etiqueta>
                </div>
                <p className="mb-4 text-sm text-muted">
                  {clp(proyecto.mant_monto)} al mes, el día {proyecto.mant_dia}
                </p>
                <HistorialMantencion pagados={pagosMantencion.map((i) => i.mant_mes!)} pendientes={mant.pendientes} desde={(proyecto.mant_desde ?? proyecto.inicio ?? dia).slice(0, 7)} mesHoy={dia.slice(0, 7)} />
                <div className="mt-4">
                  <ServiciosMantencion proyectoId={proyecto.id} meses={meses} servicios={servicios} socios={usuarios} />
                </div>
                {mant.siguiente ? (
                  <form action={registrarMantencion} className="mt-5 space-y-3">
                    <input type="hidden" name="proyecto_id" value={proyecto.id} />
                    <input type="hidden" name="volver" value="proyecto" />
                    <div className="grid grid-cols-2 gap-3">
                      <Campo etiqueta="Mes">
                        <select name="mes" defaultValue={mant.siguiente} className={entrada}>
                          {[...new Set([...mant.pendientes, mant.siguiente])].map((m) => (
                            <option key={m} value={m}>
                              {nombreMes(m)}
                            </option>
                          ))}
                        </select>
                      </Campo>
                      <Campo etiqueta="Monto">
                        <InputMonto name="monto" required defaultValue={proyecto.mant_monto} />
                      </Campo>
                    </div>
                    <CampoRecibido socios={usuarios} inicial={null} detalle={null} />
                    <CampoPara socios={usuarios} inicial={null} etiqueta="¿Para quién es?" prefijo="para_" />
                    <button type="submit" className={`${botonPrimario} w-full`}>
                      <Icono nombre="check" className="size-4" /> Registrar mantención
                    </button>
                  </form>
                ) : null}
              </section>
            ) : null}
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
