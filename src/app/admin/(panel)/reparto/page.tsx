import type { Metadata } from "next";
import Link from "next/link";
import { BarrasMeses } from "@/components/admin/Graficos";
import { Icono } from "@/components/admin/Icono";
import { Avatar, colorDe, Encabezado, Kpi, Pestanas, SelectorMes, tarjeta } from "@/components/admin/ui";
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

  const socios = usuarios.map((u) => {
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
            coalesce((select sum(monto) from ingresos where fecha >= m and fecha < m + interval '1 month'), 0)::bigint as ingresos,
            coalesce((select sum(monto) from gastos where fecha >= m and fecha < m + interval '1 month'), 0)::bigint as gastos
          from generate_series(${`${periodo.anio}-01-01`}::date, ${`${periodo.anio}-12-01`}::date, interval '1 month') as m
          order by m`
      : [];

  return (
    <>
      <Encabezado titulo="Reparto" descripcion="Cuánto ganó DevKode y cuánto le corresponde a cada socio." />

      <Pestanas
        activa={periodo.tipo}
        opciones={[
          { clave: "mes", texto: "Mes", href: "/admin/reparto" },
          { clave: "anio", texto: "Año", href: `/admin/reparto?anio=${anioActual}` },
          { clave: "todo", texto: "Desde el inicio", href: "/admin/reparto?todo=1" },
        ]}
      />
      <div className="mb-6">
        {periodo.tipo === "mes" ? (
          <SelectorMes ruta="/admin/reparto" anterior={moverMes(periodo.mes, -1)} siguiente={moverMes(periodo.mes, 1)} nombre={nombreMes(periodo.mes)} />
        ) : periodo.tipo === "anio" ? (
          <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface/80 p-1 text-sm">
            <Link href={`/admin/reparto?anio=${periodo.anio - 1}`} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-accent/10 hover:text-fg" aria-label="Año anterior">
              <Icono nombre="atras" className="size-4" />
            </Link>
            <span className="min-w-20 px-2 text-center font-medium">{periodo.anio}</span>
            <Link href={`/admin/reparto?anio=${periodo.anio + 1}`} className="grid size-10 place-items-center rounded-xl text-muted hover:bg-accent/10 hover:text-fg" aria-label="Año siguiente">
              <Icono nombre="adelante" className="size-4" />
            </Link>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Kpi etiqueta="Ingresos" valor={clp(resumen.ingresos)} icono="ingresos" />
        <Kpi etiqueta="Gastos" valor={clp(resumen.gastos)} icono="gastos" />
        <div className="col-span-2 md:col-span-1">
          <Kpi etiqueta="Utilidad a repartir" valor={clp(utilidad)} icono="reparto" tono={utilidad >= 0 ? "bien" : "mal"} />
        </div>
      </div>

      <h2 className="mt-10 mb-1 text-lg font-medium tracking-tight capitalize">{periodo.titulo}</h2>
      <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted">
        A cada socio le corresponde su porcentaje de la utilidad. Como algunos pagos llegan o salen de sus cuentas personales, abajo ves cuánto falta
        para quedar parejos.
      </p>

      {/* Reparto visual de la utilidad */}
      {socios.length > 1 ? (
        <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-line" aria-hidden="true">
          {socios.map((s) => (
            <div key={s.id} className="barra h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${s.porcentaje}%`, background: colorDe(s.nombre) }} />
          ))}
        </div>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {socios.map((s, i) => {
          const recibe = s.diferencia >= 0;
          return (
            <li key={s.id} className={`${tarjeta} aparecer p-5 md:p-6`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-3">
                <Avatar nombre={s.nombre} color={colorDe(s.nombre)} className="size-11 text-base" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.nombre}</p>
                  <p className="text-xs text-muted">{s.porcentaje}% de la utilidad</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Le corresponde</dt>
                  <dd className="tabular-nums">{clp(s.corresponde)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Recibió en su cuenta</dt>
                  <dd className="tabular-nums">− {clp(s.recibio)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Pagó de su bolsillo</dt>
                  <dd className="tabular-nums">+ {clp(s.pago)}</dd>
                </div>
              </dl>
              <div className={`mt-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${recibe ? "bg-[#0f2219] text-[#7ee2a0]" : "bg-[#2a1118] text-[#ff8fa3]"}`}>
                <span className="text-sm">{recibe ? "Debe recibir" : "Debe entregar"}</span>
                <span className="font-display text-xl font-medium tabular-nums">{clp(Math.abs(s.diferencia))}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-sm text-muted">
        <Icono nombre="candado" className="mt-0.5 size-4 shrink-0" />
        <span>
          Saldo del período en la cuenta de la empresa: <span className="text-fg">{clp(enEmpresa)}</span>. Lo que reciben los socios sale de ahí o de
          quien tenga que entregar.
        </span>
      </p>

      {meses.length ? (
        <section className={`${tarjeta} aparecer mt-10 p-5`}>
          <h2 className="mb-4 font-medium">Mes a mes</h2>
          <BarrasMeses datos={meses} />
          <ul className="mt-6 divide-y divide-line text-sm">
            {meses
              .filter((m) => m.ingresos || m.gastos)
              .map((m) => (
                <li key={m.mes}>
                  <Link href={`/admin/reparto?mes=${m.mes}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-accent-soft">
                    <span className="capitalize">{nombreMes(m.mes)}</span>
                    <span className={`tabular-nums ${m.ingresos - m.gastos < 0 ? "text-[#ff8fa3]" : ""}`}>{clp(m.ingresos - m.gastos)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
