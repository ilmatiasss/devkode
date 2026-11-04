import type { Metadata } from "next";
import Link from "next/link";
import { Encabezado, Kpi, SelectorMes, Tabla } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaUsuarios, resumenPeriodo } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, esMes, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Reparto" };

type Busqueda = { mes?: string; anio?: string; todo?: string };

function periodoDe(q: Busqueda) {
  if (q.todo) return { tipo: "todo" as const, desde: null, hasta: null, titulo: "Desde el inicio" };
  if (q.anio && /^\d{4}$/.test(q.anio)) {
    const a = Number(q.anio);
    return { tipo: "anio" as const, anio: a, desde: `${a}-01-01`, hasta: `${a + 1}-01-01`, titulo: `Año ${a}` };
  }
  const mes = esMes(q.mes) ? q.mes : mesActual();
  return { tipo: "mes" as const, mes, desde: `${mes}-01`, hasta: `${moverMes(mes, 1)}-01`, titulo: nombreMes(mes) };
}

export default async function Reparto({ searchParams }: { searchParams: Promise<Busqueda> }) {
  await exigirUsuario();
  const q = await searchParams;
  const periodo = periodoDe(q);
  const [resumen, usuarios] = await Promise.all([resumenPeriodo(periodo.desde, periodo.hasta), listaUsuarios()]);
  const utilidad = resumen.ingresos - resumen.gastos;
  const de = (lista: { persona: number | null; total: number }[], persona: number | null) => lista.find((f) => f.persona === persona)?.total ?? 0;

  const filas = usuarios.map((u) => {
    const corresponde = Math.round((utilidad * u.porcentaje) / 100);
    const recibio = de(resumen.porPersonaI, u.id);
    const pago = de(resumen.porPersonaG, u.id);
    return { ...u, corresponde, recibio, pago, diferencia: corresponde - (recibio - pago) };
  });
  const enEmpresa = de(resumen.porPersonaI, null) - de(resumen.porPersonaG, null);

  const anioActual = Number(mesActual().slice(0, 4));
  const meses =
    periodo.tipo === "anio"
      ? await db()<{ mes: string; ingresos: number; gastos: number }[]>`
          select to_char(m, 'YYYY-MM') as mes,
            coalesce((select sum(monto) from ingresos where date_trunc('month', fecha) = m), 0)::bigint as ingresos,
            coalesce((select sum(monto) from gastos where date_trunc('month', fecha) = m), 0)::bigint as gastos
          from generate_series(${`${periodo.anio}-01-01`}::date, ${`${periodo.anio}-12-01`}::date, interval '1 month') as m
          order by m`
      : [];

  const pestaña = (activa: boolean) => `px-3 py-2 text-sm border ${activa ? "border-accent text-fg" : "border-line text-muted hover:text-fg"}`;

  return (
    <>
      <Encabezado titulo="Reparto" descripcion="Cuánto ganó DevKode y cuánto le corresponde a cada socio." />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          <Link href="/admin/reparto" className={pestaña(periodo.tipo === "mes")}>
            Mes
          </Link>
          <Link href={`/admin/reparto?anio=${anioActual}`} className={pestaña(periodo.tipo === "anio")}>
            Año
          </Link>
          <Link href="/admin/reparto?todo=1" className={pestaña(periodo.tipo === "todo")}>
            Todo
          </Link>
        </div>
        {periodo.tipo === "mes" ? (
          <SelectorMes mes={periodo.mes} ruta="/admin/reparto" anterior={moverMes(periodo.mes, -1)} siguiente={moverMes(periodo.mes, 1)} nombre={nombreMes(periodo.mes)} />
        ) : periodo.tipo === "anio" ? (
          <div className="flex items-center gap-1 text-sm">
            <Link href={`/admin/reparto?anio=${periodo.anio - 1}`} className="border border-line px-3 py-2 hover:border-accent" aria-label="Año anterior">
              ←
            </Link>
            <span className="border border-line px-3 py-2">{periodo.anio}</span>
            <Link href={`/admin/reparto?anio=${periodo.anio + 1}`} className="border border-line px-3 py-2 hover:border-accent" aria-label="Año siguiente">
              →
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Ingresos" valor={clp(resumen.ingresos)} />
        <Kpi etiqueta="Gastos" valor={clp(resumen.gastos)} />
        <Kpi etiqueta="Utilidad a repartir" valor={clp(utilidad)} tono={utilidad >= 0 ? "bien" : "mal"} />
      </div>

      <section className="mt-10">
        <h2 className="mb-1 text-xl font-medium tracking-tight capitalize">{periodo.titulo}</h2>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted">
          A cada socio le corresponde su porcentaje de la utilidad. Como algunos pagos llegan o salen de sus cuentas personales,
          la última columna dice cuánto falta para quedar parejos: positivo es lo que debe recibir, negativo lo que debe entregar.
        </p>
        <Tabla>
          <thead>
            <tr>
              <th>Socio</th>
              <th>%</th>
              <th>Le corresponde</th>
              <th>Recibió en su cuenta</th>
              <th>Pagó de su bolsillo</th>
              <th>Para quedar parejos</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id}>
                <td>{f.nombre}</td>
                <td className="text-muted">{f.porcentaje}%</td>
                <td>{clp(f.corresponde)}</td>
                <td className="text-muted">{clp(f.recibio)}</td>
                <td className="text-muted">{clp(f.pago)}</td>
                <td className={f.diferencia >= 0 ? "text-[#7ee2a0]" : "text-[#ff8fa3]"}>
                  {f.diferencia >= 0 ? `Recibe ${clp(f.diferencia)}` : `Entrega ${clp(-f.diferencia)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </Tabla>
        <p className="mt-3 text-sm text-muted">
          Saldo del período en la cuenta de la empresa: <span className="text-fg">{clp(enEmpresa)}</span>. Lo que reciben los socios sale de
          ahí o de quien tenga que entregar.
        </p>
      </section>

      {meses.length ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-medium tracking-tight">Mes a mes</h2>
          <Tabla>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Ingresos</th>
                <th>Gastos</th>
                <th>Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => (
                <tr key={m.mes}>
                  <td className="capitalize">
                    <Link href={`/admin/reparto?mes=${m.mes}`} className="hover:text-accent-soft">
                      {nombreMes(m.mes)}
                    </Link>
                  </td>
                  <td>{clp(m.ingresos)}</td>
                  <td>{clp(m.gastos)}</td>
                  <td className={m.ingresos - m.gastos >= 0 ? "" : "text-[#ff8fa3]"}>{clp(m.ingresos - m.gastos)}</td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </section>
      ) : null}
    </>
  );
}
