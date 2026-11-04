import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { Aviso, botonPeligro, botonPrimario, botonSecundario, Campo, Encabezado, enlace, entrada } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, listaProyectos, listaUsuarios, type Servicio, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, fecha, hoy } from "@/lib/admin/formato";
import { categoriasGasto, ciclos, claves } from "@/lib/admin/opciones";
import { eliminarServicio, guardarServicio, registrarPagoServicio } from "../../acciones";

export const metadata: Metadata = { title: "Servicio" };

export default async function FichaServicio({
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
      <Encabezado titulo={servicio?.nombre ?? "Nuevo servicio"} descripcion={<Link href="/admin/servicios" className={enlace}>← Servicios</Link>} />
      <Aviso ok={q.ok} error={q.error} />

      <form action={guardarServicio} className="grid max-w-3xl gap-5 sm:grid-cols-2">
        {servicio ? <input type="hidden" name="id" value={servicio.id} /> : null}
        <Campo etiqueta="Nombre">
          <input name="nombre" required maxLength={120} placeholder="Ej: Vercel Pro" defaultValue={servicio?.nombre} className={entrada} />
        </Campo>
        <Campo etiqueta="Proveedor">
          <input name="proveedor" maxLength={120} placeholder="Ej: Vercel" defaultValue={servicio?.proveedor ?? ""} className={entrada} />
        </Campo>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Campo etiqueta="Costo por ciclo" ayuda="En dólares se aceptan decimales: 20,00">
            <input name="costo" required inputMode="decimal" pattern="[\d.,$ ]+" defaultValue={servicio ? String(servicio.costo) : ""} className={entrada} />
          </Campo>
          <Campo etiqueta="Moneda">
            <select name="moneda" defaultValue={servicio?.moneda ?? "CLP"} className={entrada}>
              <option value="CLP">CLP</option>
              <option value="USD">USD</option>
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Ciclo de cobro">
          <select name="ciclo" defaultValue={servicio?.ciclo ?? "mensual"} className={entrada}>
            {claves(ciclos).map((c) => (
              <option key={c} value={c}>
                {ciclos[c]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Próximo cobro">
          <input name="proximo_cobro" type="date" defaultValue={servicio?.proximo_cobro ?? ""} className={entrada} />
        </Campo>
        <Campo etiqueta="Avisar con (días de anticipación)">
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
        <Campo etiqueta="¿Con qué tarjeta o cuenta se paga?">
          <select name="pagado_por" defaultValue={servicio?.pagado_por ?? ""} className={entrada}>
            <option value="">Cuenta de la empresa</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Proyecto (si es para un cliente)" className="sm:col-span-2">
          <select name="proyecto_id" defaultValue={servicio?.proyecto_id ?? ""} className={entrada}>
            <option value="">Servicio propio de DevKode</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Notas" className="sm:col-span-2">
          <textarea name="notas" rows={3} maxLength={2000} defaultValue={servicio?.notas ?? ""} className={entrada} />
        </Campo>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" name="activo" defaultChecked={servicio?.activo ?? true} className="size-4 accent-[var(--color-accent)]" />
          Activo (desmárcalo si lo cancelaron)
        </label>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className={botonPrimario}>
            Guardar
          </button>
          <Link href="/admin/servicios" className={botonSecundario}>
            Volver
          </Link>
        </div>
      </form>

      {servicio ? (
        <>
          {servicio.activo ? (
            <section className="mt-12 max-w-3xl border border-line bg-surface p-5">
              <h2 className="text-lg font-medium">Registrar pago</h2>
              <p className="mt-1 text-sm text-muted">Se guarda como gasto y la fecha del próximo cobro avanza según el ciclo.</p>
              <form action={registrarPagoServicio} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <input type="hidden" name="id" value={servicio.id} />
                <Campo etiqueta="Monto cobrado (pesos)">
                  <input name="monto" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={enPesos(servicio, dolar)} className={entrada} />
                </Campo>
                <Campo etiqueta="Fecha del cobro">
                  <input name="fecha" type="date" required defaultValue={servicio.proximo_cobro ?? hoy()} className={entrada} />
                </Campo>
                <button type="submit" className={botonPrimario}>
                  Registrar
                </button>
              </form>
            </section>
          ) : null}

          <section className="mt-10 max-w-3xl">
            <h2 className="mb-3 text-lg font-medium">Pagos registrados</h2>
            {pagos.length ? (
              <ul className="divide-y divide-line border border-line text-sm">
                {pagos.map((p) => (
                  <li key={p.id} className="flex justify-between px-4 py-3">
                    <Link href={`/admin/gastos/${p.id}`} className={enlace}>
                      {fecha(p.fecha)}
                    </Link>
                    <span>{clp(p.monto)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Todavía no hay pagos registrados.</p>
            )}
          </section>

          <form action={eliminarServicio} className="mt-12">
            <input type="hidden" name="id" value={servicio.id} />
            <BotonConfirmar mensaje="¿Eliminar este servicio? Los gastos ya registrados se mantienen." className={botonPeligro}>
              Eliminar servicio
            </BotonConfirmar>
          </form>
        </>
      ) : null}
    </>
  );
}
