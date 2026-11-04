import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Icono } from "@/components/admin/Icono";
import { InputMonto } from "@/components/admin/InputMonto";
import { Selector } from "@/components/admin/Selector";
import { BarraGuardar, botonPeligro, botonPrimario, Campo, Encabezado, entrada, Etiqueta, tarjeta, ZonaPeligro } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, listaProyectos, listaUsuarios, type Servicio, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, fecha, hoy } from "@/lib/admin/formato";
import { categoriasGasto, ciclos, claves } from "@/lib/admin/opciones";
import { eliminarServicio, guardarServicio, registrarPagoServicio } from "../../acciones";

export const metadata: Metadata = { title: "Servicio" };

export default async function FichaServicio({ params }: { params: Promise<{ id: string }> }) {
  await exigirUsuario();
  const { id } = await params;
  const nuevo = id === "nuevo";
  if (!nuevo && !/^\d{1,9}$/.test(id)) notFound();

  const sql = db();
  const [[servicio], proyectos, usuarios, dolar, pagos] = await Promise.all([
    nuevo ? Promise.resolve([undefined]) : sql<Servicio[]>`select *, null as pagado_por_nombre, null as proyecto_nombre from servicios where id = ${Number(id)}`,
    listaProyectos(),
    listaUsuarios(),
    valorDolar(),
    nuevo
      ? Promise.resolve([] as { id: number; fecha: string; monto: number }[])
      : sql<{ id: number; fecha: string; monto: number }[]>`select id, fecha, monto from gastos where servicio_id = ${Number(id)} order by fecha desc limit 12`,
  ]);
  if (!nuevo && !servicio) notFound();

  return (
    <>
      <Encabezado
        volver={{ href: "/admin/servicios", texto: "Servicios" }}
        titulo={servicio?.nombre ?? "Nuevo servicio"}
        etiqueta={servicio ? <Etiqueta tono={servicio.activo ? "bien" : "neutro"}>{servicio.activo ? "Activo" : "Inactivo"}</Etiqueta> : undefined}
        descripcion={servicio?.proveedor ?? "Algo que pagan periódicamente: hosting, dominio, correo, software…"}
      />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <form action={guardarServicio} className={`${tarjeta} aparecer grid gap-5 p-5 sm:grid-cols-2 md:p-6`}>
          <h2 className="flex items-center gap-2 font-medium sm:col-span-2">
            <Icono nombre="lapiz" className="size-4 text-accent-soft" /> {servicio ? "Editar servicio" : "Datos del servicio"}
          </h2>
          {servicio ? <input type="hidden" name="id" value={servicio.id} /> : null}
          <Campo etiqueta="Nombre">
            <input name="nombre" required maxLength={120} placeholder="Ej: Vercel Pro" defaultValue={servicio?.nombre} className={entrada} />
          </Campo>
          <Campo etiqueta="Proveedor">
            <input name="proveedor" maxLength={120} placeholder="Ej: Vercel" defaultValue={servicio?.proveedor ?? ""} className={entrada} />
          </Campo>
          <div className="grid grid-cols-[1fr_6.5rem] gap-3 sm:col-span-2">
            <Campo etiqueta="Costo por ciclo" ayuda="En dólares se aceptan decimales: 20,00">
              <input name="costo" required inputMode="decimal" pattern="[\d.,$ ]+" placeholder="0" defaultValue={servicio ? String(servicio.costo).replace(".", ",") : ""} className={entrada} />
            </Campo>
            <Campo etiqueta="Moneda">
              <select name="moneda" defaultValue={servicio?.moneda ?? "CLP"} className={entrada}>
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
              </select>
            </Campo>
          </div>
          <div className="sm:col-span-2">
            <Selector name="ciclo" etiqueta="Ciclo de cobro" inicial={servicio?.ciclo ?? "mensual"} opciones={claves(ciclos).map((c) => ({ valor: c, texto: ciclos[c] }))} />
          </div>
          <Campo etiqueta="Próximo cobro">
            <input name="proximo_cobro" type="date" defaultValue={servicio?.proximo_cobro ?? ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Avisar con (días)">
            <input name="avisar_dias" type="number" min={0} max={60} defaultValue={servicio?.avisar_dias ?? 5} className={entrada} />
          </Campo>
          <Campo etiqueta="Categoría">
            <select name="categoria" defaultValue={servicio?.categoria ?? "hosting"} className={entrada}>
              {claves(categoriasGasto).map((c) => (
                <option key={c} value={c}>
                  {categoriasGasto[c]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Proyecto (si es de un cliente)">
            <select name="proyecto_id" defaultValue={servicio?.proyecto_id ?? ""} className={entrada}>
              <option value="">Servicio propio de DevKode</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <div className="sm:col-span-2">
            <Selector
              name="pagado_por"
              etiqueta="¿Con qué tarjeta o cuenta se paga?"
              inicial={String(servicio?.pagado_por ?? "")}
              opciones={[{ valor: "", texto: "Cuenta de la empresa" }, ...usuarios.map((u) => ({ valor: String(u.id), texto: u.nombre.split(" ")[0] }))]}
            />
          </div>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <textarea name="notas" rows={3} maxLength={2000} placeholder="Cuenta asociada, cómo cancelarlo…" defaultValue={servicio?.notas ?? ""} className={entrada} />
          </Campo>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-bg/50 px-4 py-3 text-sm sm:col-span-2">
            <span>
              Servicio activo
              <span className="block text-xs text-muted">Desmárcalo si lo cancelaron: deja de contar en el costo fijo.</span>
            </span>
            <input type="checkbox" name="activo" defaultChecked={servicio?.activo ?? true} className="size-5 accent-[var(--color-accent)]" />
          </label>
          <BarraGuardar cancelar="/admin/servicios" texto={servicio ? "Guardar cambios" : "Crear servicio"} />
        </form>

        {servicio ? (
          <div className="space-y-6">
            {servicio.activo ? (
              <section className={`${tarjeta} aparecer bg-[radial-gradient(120%_120%_at_100%_0%,rgb(155_114_255/0.12),transparent_60%)] p-5`}>
                <h2 className="font-medium">Registrar pago</h2>
                <p className="mt-1 text-sm text-muted">Se guarda como gasto y el próximo cobro avanza según el ciclo.</p>
                <form action={registrarPagoServicio} className="mt-4 space-y-4">
                  <input type="hidden" name="id" value={servicio.id} />
                  <Campo etiqueta="Monto cobrado">
                    <InputMonto name="monto" required defaultValue={enPesos(servicio, dolar)} />
                  </Campo>
                  <Campo etiqueta="Fecha del cobro">
                    <input name="fecha" type="date" required defaultValue={servicio.proximo_cobro ?? hoy()} className={entrada} />
                  </Campo>
                  <button type="submit" className={`${botonPrimario} w-full`}>
                    <Icono nombre="check" className="size-4" /> Registrar pago
                  </button>
                </form>
              </section>
            ) : null}
            <section className={`${tarjeta} aparecer p-5`}>
              <h2 className="mb-3 font-medium">Historial de pagos</h2>
              {pagos.length ? (
                <ul className="-mx-2">
                  {pagos.map((p) => (
                    <li key={p.id}>
                      <Link href={`/admin/gastos/${p.id}`} className="flex justify-between rounded-xl px-2 py-2.5 text-sm hover:bg-white/[0.03]">
                        <span className="text-muted">{fecha(p.fecha)}</span>
                        <span className="tabular-nums">{clp(p.monto)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted">Todavía no hay pagos registrados.</p>
              )}
            </section>
          </div>
        ) : null}
      </div>

      {servicio ? (
        <ZonaPeligro>
          <form action={eliminarServicio} className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Los pagos ya registrados como gasto se mantienen.</p>
            <input type="hidden" name="id" value={servicio.id} />
            <BotonConfirmar mensaje="¿Eliminar este servicio? Los gastos ya registrados se mantienen." className={botonPeligro}>
              <Icono nombre="basura" className="size-4" /> Eliminar servicio
            </BotonConfirmar>
          </form>
        </ZonaPeligro>
      ) : null}
    </>
  );
}
