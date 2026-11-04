import type { Metadata } from "next";
import Link from "next/link";
import { Encabezado, enlace, Etiqueta, Kpi, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, listaServicios, mensualEnPesos, resumenPeriodo, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, diasHasta, dinero, fecha, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";
import { estadosProyecto, type EstadoProyecto } from "@/lib/admin/opciones";

export const metadata: Metadata = { title: "Resumen" };

type ProyectoActivo = { id: number; nombre: string; cliente: string | null; estado: EstadoProyecto; entrega: string | null; monto: number; cobrado: number };
type Movimiento = { tipo: "ingreso" | "gasto"; id: number; fecha: string; descripcion: string; monto: number };

export default async function Resumen() {
  const usuario = await exigirUsuario();
  const sql = db();
  const mes = mesActual();

  const [periodo, servicios, dolar, proyectos, movimientos] = await Promise.all([
    resumenPeriodo(`${mes}-01`, `${moverMes(mes, 1)}-01`),
    listaServicios(),
    valorDolar(),
    sql<ProyectoActivo[]>`
      select p.id, p.nombre, c.nombre as cliente, p.estado, p.entrega, p.monto,
        coalesce((select sum(i.monto) from ingresos i where i.proyecto_id = p.id), 0)::bigint as cobrado
      from proyectos p left join clientes c on c.id = p.cliente_id
      where p.estado in ('en_curso', 'pausado', 'propuesta')
      order by p.entrega nulls last, p.nombre`,
    sql<Movimiento[]>`
      (select 'ingreso' as tipo, id, fecha, descripcion, monto, creado from ingresos order by creado desc limit 6)
      union all
      (select 'gasto' as tipo, id, fecha, descripcion, monto, creado from gastos order by creado desc limit 6)
      order by creado desc limit 8`,
  ]);

  const utilidad = periodo.ingresos - periodo.gastos;
  const activos = servicios.filter((s) => s.activo);
  const costoFijo = activos.reduce((suma, s) => suma + mensualEnPesos(s, dolar), 0);
  const proximos = activos.filter((s) => s.proximo_cobro && diasHasta(s.proximo_cobro) <= 30);
  const enCurso = proyectos.filter((p) => p.estado !== "propuesta");
  const porCobrar = enCurso.reduce((suma, p) => suma + Math.max(0, p.monto - p.cobrado), 0);

  return (
    <>
      <Encabezado titulo={`Hola, ${usuario.nombre.split(" ")[0]}`} descripcion={<span className="capitalize">{nombreMes(mes)}</span>} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi etiqueta="Ingresos del mes" valor={clp(periodo.ingresos)} />
        <Kpi etiqueta="Gastos del mes" valor={clp(periodo.gastos)} />
        <Kpi etiqueta="Utilidad del mes" valor={clp(utilidad)} tono={utilidad >= 0 ? "bien" : "mal"} />
        <Kpi etiqueta="Por cobrar en proyectos" valor={clp(porCobrar)} detalle={enCurso.length === 1 ? "1 proyecto activo" : `${enCurso.length} proyectos activos`} />
      </div>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-medium tracking-tight">Próximos cobros de servicios</h2>
          <p className="text-sm text-muted">Costo fijo mensual: {clp(costoFijo)}</p>
        </div>
        {proximos.length ? (
          <Tabla>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Paga</th>
              </tr>
            </thead>
            <tbody>
              {proximos.map((s) => {
                const dias = diasHasta(s.proximo_cobro!);
                return (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/admin/servicios/${s.id}`} className={enlace}>
                        {s.nombre}
                      </Link>
                    </td>
                    <td>
                      {fecha(s.proximo_cobro)}{" "}
                      <Etiqueta tono={dias < 0 ? "mal" : dias <= s.avisar_dias ? "acento" : "neutro"}>
                        {dias < 0 ? `vencido hace ${-dias} d` : dias === 0 ? "hoy" : `en ${dias} d`}
                      </Etiqueta>
                    </td>
                    <td>
                      {dinero(s.costo, s.moneda)}
                      {s.moneda === "USD" ? <span className="text-muted"> ≈ {clp(enPesos(s, dolar))}</span> : null}
                    </td>
                    <td className="text-muted">{s.pagado_por_nombre ?? "Empresa"}</td>
                  </tr>
                );
              })}
            </tbody>
          </Tabla>
        ) : (
          <Vacio>No hay cobros en los próximos 30 días.</Vacio>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-medium tracking-tight">Proyectos activos</h2>
        {proyectos.length ? (
          <Tabla>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estado</th>
                <th>Entrega</th>
                <th>Cobrado</th>
                <th>Por cobrar</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/proyectos/${p.id}`} className={enlace}>
                      {p.nombre}
                    </Link>
                    {p.cliente ? <span className="block text-xs text-muted">{p.cliente}</span> : null}
                  </td>
                  <td>
                    <Etiqueta tono={p.estado === "en_curso" ? "acento" : "neutro"}>{estadosProyecto[p.estado]}</Etiqueta>
                  </td>
                  <td>{fecha(p.entrega)}</td>
                  <td>{clp(p.cobrado)}</td>
                  <td>{clp(Math.max(0, p.monto - p.cobrado))}</td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        ) : (
          <Vacio>
            Aún no hay proyectos activos.{" "}
            <Link href="/admin/proyectos/nuevo" className={enlace}>
              Agrega el primero
            </Link>
            .
          </Vacio>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-medium tracking-tight">Últimos movimientos</h2>
        {movimientos.length ? (
          <ul className="divide-y divide-line border border-line">
            {movimientos.map((m) => (
              <li key={`${m.tipo}-${m.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <Link href={`/admin/${m.tipo === "ingreso" ? "ingresos" : "gastos"}/${m.id}`} className={enlace}>
                  {m.descripcion}
                </Link>
                <span className="flex items-center gap-4">
                  <span className="text-muted">{fecha(m.fecha)}</span>
                  <span className={m.tipo === "ingreso" ? "text-[#7ee2a0]" : "text-fg"}>
                    {m.tipo === "ingreso" ? "+" : "−"} {clp(m.monto)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vacio>Todavía no hay ingresos ni gastos registrados.</Vacio>
        )}
      </section>
    </>
  );
}
