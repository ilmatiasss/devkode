import type { Metadata } from "next";
import Link from "next/link";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { BarrasMeses } from "@/components/admin/Graficos";
import { Icono } from "@/components/admin/Icono";
import { InputMonto } from "@/components/admin/InputMonto";
import { Selector } from "@/components/admin/Selector";
import { Avatar, botonPrimario, Campo, colorDe, Encabezado, entrada, Kpi, Pestanas, SelectorMes, tarjeta } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { calcularReparto, listaTransferencias, listaUsuarios, resumenPeriodo } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { clp, esMes, fecha, hoy, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";
import { eliminarTransferencia, guardarTransferencia } from "../acciones";

export const metadata: Metadata = { title: "Reparto" };

type Busqueda = { mes?: string; anio?: string; todo?: string };

function periodoDe(q: Busqueda) {
  if (q.todo) return { tipo: "todo" as const, desde: null, hasta: null, titulo: "Desde el inicio", query: "todo=1" };
  if (q.anio && /^\d{4}$/.test(q.anio)) {
    const a = Number(q.anio);
    return { tipo: "anio" as const, anio: a, desde: `${a}-01-01`, hasta: `${a + 1}-01-01`, titulo: `Año ${a}`, query: `anio=${a}` };
  }
  const mes = esMes(q.mes) ? q.mes : mesActual();
  return { tipo: "mes" as const, mes, desde: `${mes}-01`, hasta: `${moverMes(mes, 1)}-01`, titulo: nombreMes(mes), query: `mes=${mes}` };
}

export default async function Reparto({ searchParams }: { searchParams: Promise<Busqueda> }) {
  const q = await searchParams;
  const periodo = periodoDe(q);
  const [, resumen, usuarios, transferencias] = await Promise.all([
    exigirUsuario(),
    resumenPeriodo(periodo.desde, periodo.hasta),
    listaUsuarios(),
    listaTransferencias(periodo.desde, periodo.hasta),
  ]);
  const calculo = await calcularReparto(periodo.desde, periodo.hasta, usuarios);
  const utilidad = resumen.ingresos - resumen.gastos;
  const de = (lista: { persona: number | null; total: number }[], persona: number | null) => lista.find((f) => f.persona === persona)?.total ?? 0;
  const entregado = (persona: number | null) => transferencias.filter((t) => t.de_usuario === persona).reduce((s, t) => s + t.monto, 0);
  const recibido = (persona: number | null) => transferencias.filter((t) => t.a_usuario === persona).reduce((s, t) => s + t.monto, 0);
  const nombreDe = (id: number | null) => (id === null ? "la empresa" : (usuarios.find((u) => u.id === id)?.nombre.split(" ")[0] ?? "Ex socio"));

  const socios = usuarios.map((u) => {
    // Lo que es para él en los ingresos menos lo que pone en los gastos
    const corresponde = calculo.leToca.get(u.id) ?? 0;
    const recibio = de(resumen.porPersonaI, u.id);
    const pago = de(resumen.porPersonaG, u.id);
    const transfirio = recibido(u.id) - entregado(u.id); // neto de lo que se pasaron entre ellos
    return { ...u, corresponde, recibio, pago, transfirio, diferencia: corresponde - (recibio - pago + transfirio) };
  });
  const enEmpresa = de(resumen.porPersonaI, null) - de(resumen.porPersonaG, null) - recibido(null) + entregado(null);

  // Sugerencia para el formulario: quien debe entregar le pasa a quien debe recibir
  const debe = [...socios].sort((a, b) => a.diferencia - b.diferencia)[0];
  const cobra = [...socios].sort((a, b) => b.diferencia - a.diferencia)[0];
  const sugerencia =
    debe && cobra && debe.diferencia < 0 && cobra.diferencia > 0
      ? { de: String(debe.id), a: String(cobra.id), monto: Math.min(-debe.diferencia, cobra.diferencia) }
      : cobra && cobra.diferencia > 0
        ? { de: "empresa", a: String(cobra.id), monto: cobra.diferencia }
        : { de: String(usuarios[0]?.id ?? "empresa"), a: String(usuarios[1]?.id ?? "empresa"), monto: 0 };
  // Si se mira un mes pasado, la transferencia por defecto queda en el último día de ese mes
  const fechaSugerida =
    periodo.tipo === "mes" && periodo.mes < mesActual() ? new Date(Date.parse(`${moverMes(periodo.mes, 1)}-01`) - 86_400_000).toISOString().slice(0, 10) : hoy();
  const cuentas = [...usuarios.map((u) => ({ valor: String(u.id), texto: u.nombre.split(" ")[0], color: colorDe(u.nombre) })), { valor: "empresa", texto: "Cuenta de la empresa" }];

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
        Cada ingreso dice cuánto es para cada uno y cada gasto cuánto pone cada uno. Abajo ves cuánto le toca a cada socio, cuánto ya tiene y cuánto
        falta para quedar parejos. Cuando uno le pase plata al otro, anótenlo en Transferencias.
      </p>

      {/* Reparto visual de la utilidad */}
      {socios.length > 1 ? (
        <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-line" aria-hidden="true">
          {socios.map((s) => (
            <div
              key={s.id}
              className="barra h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${utilidad > 0 ? Math.max(0, (s.corresponde / utilidad) * 100) : 100 / socios.length}%`, background: colorDe(s.nombre) }}
            />
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
                  {utilidad > 0 ? <p className="text-xs text-muted">{Math.round((s.corresponde / utilidad) * 100)}% de la utilidad del período</p> : null}
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Le toca</dt>
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
                {s.transfirio !== 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{s.transfirio > 0 ? "Le transfirieron" : "Transfirió"}</dt>
                    <dd className="tabular-nums">
                      {s.transfirio > 0 ? "−" : "+"} {clp(Math.abs(s.transfirio))}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {s.diferencia === 0 ? (
                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-[#c9c9cf]">
                  <span className="text-sm">Está al día</span>
                  <Icono nombre="check" className="size-5 text-[#7ee2a0]" />
                </div>
              ) : (
                <div className={`mt-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${recibe ? "bg-[#0f2219] text-[#7ee2a0]" : "bg-[#2a1118] text-[#ff8fa3]"}`}>
                  <span className="text-sm">{recibe ? "Debe recibir" : "Debe entregar"}</span>
                  <span className="font-display text-xl font-medium tabular-nums">{clp(Math.abs(s.diferencia))}</span>
                </div>
              )}
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

      {usuarios.length > 1 ? (
        <section id="transferir" className="mt-10 grid scroll-mt-24 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className={`${tarjeta} aparecer bg-[radial-gradient(120%_120%_at_100%_0%,rgb(155_114_255/0.12),transparent_60%)] p-5 md:p-6`}>
            <h2 className="flex items-center gap-2 font-medium">
              <Icono nombre="billetera" className="size-4 text-accent-soft" /> Registrar transferencia
            </h2>
            <p className="mt-1 text-sm text-muted">Cuando uno le pasa plata al otro (o la empresa a un socio) para quedar parejos.</p>
            <form action={guardarTransferencia} className="mt-5 grid min-w-0 gap-5">
              <input type="hidden" name="volver" value={periodo.query} />
              <Selector name="de" etiqueta="¿Quién entrega?" inicial={sugerencia.de} opciones={cuentas} />
              <Selector name="a" etiqueta="¿Quién recibe?" inicial={sugerencia.a} opciones={cuentas} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Monto">
                  <InputMonto name="monto" required defaultValue={sugerencia.monto || undefined} />
                </Campo>
                <Campo etiqueta="Fecha">
                  <input name="fecha" type="date" required defaultValue={fechaSugerida} className={entrada} />
                </Campo>
              </div>
              <label className="block text-sm">
                <span className="font-medium text-[#c9c9cf]">
                  Nota<span className="font-normal text-muted"> (opcional)</span>
                </span>
                <input name="notas" maxLength={300} placeholder="Ej: su parte de la mantención de Fruterra" className={entrada} />
              </label>
              <button type="submit" className={`${botonPrimario} w-full`}>
                <Icono nombre="check" className="size-4" /> Registrar transferencia
              </button>
            </form>
          </div>

          <div className={`${tarjeta} aparecer h-fit p-5 md:p-6`}>
            <h2 className="mb-3 font-medium">Transferencias del período</h2>
            {transferencias.length ? (
              <ul className="divide-y divide-line">
                {transferencias.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block first-letter:uppercase">{nombreDe(t.de_usuario)}</span>
                        <Icono nombre="adelante" className="size-3.5 text-muted" />
                        <span className="inline-block first-letter:uppercase">{nombreDe(t.a_usuario)}</span>
                      </p>
                      <p className="truncate text-xs text-muted">
                        {fecha(t.fecha)}
                        {t.notas ? ` · ${t.notas}` : ""}
                      </p>
                    </div>
                    <span className="tabular-nums">{clp(t.monto)}</span>
                    <form action={eliminarTransferencia}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="volver" value={periodo.query} />
                      <BotonConfirmar mensaje="¿Eliminar esta transferencia?" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-[#2a1118] hover:text-[#ff8fa3]">
                        <Icono nombre="basura" className="size-4" />
                        <span className="sr-only">Eliminar transferencia</span>
                      </BotonConfirmar>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-muted">No hay transferencias en este período.</p>
            )}
          </div>
        </section>
      ) : null}

      {calculo.porProyecto.length ? (
        <section className={`${tarjeta} aparecer mt-10 p-5`}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mb-1 font-medium">Por proyecto</h2>
              <p className="text-sm text-muted">Toca un proyecto para ver cada pago y gasto, y editarlo.</p>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {calculo.porProyecto.map((g) => (
              <li key={g.id ?? "general"}>
                <details className="group py-3">
                  <summary className="cursor-pointer list-none rounded-xl [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className={`flex items-center gap-2 font-medium ${g.id ? "" : "text-muted"}`}>
                        <Icono nombre="adelante" className="size-3.5 text-muted transition group-open:rotate-90" />
                        {g.nombre}
                      </span>
                      <span className={`tabular-nums ${g.utilidad < 0 ? "text-[#ff8fa3]" : ""}`}>{clp(g.utilidad)}</span>
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-5.5 text-xs text-muted">
                      {usuarios.map((u) => (
                        <span key={u.id}>
                          {u.nombre.split(" ")[0]}: <span className="text-fg tabular-nums">{clp(g.partes.get(u.id) ?? 0)}</span>
                        </span>
                      ))}
                    </p>
                  </summary>
                  <div className="mt-3 ml-5.5 rounded-xl border border-line bg-bg/40">
                    <ul className="divide-y divide-line text-sm">
                      {g.movimientos.map((m) => (
                        <li key={`${m.tipo}-${m.id}`}>
                          <Link href={`/admin/${m.tipo === "ingreso" ? "ingresos" : "gastos"}/${m.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03]">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate">{m.descripcion}</span>
                              <span className="block text-xs text-muted">
                                {fecha(m.fecha)} · {m.tipo === "ingreso" ? "llegó a " : "pagó "}
                                {m.dividido
                                  ? Object.entries(m.dividido)
                                      .map(([k, v]) => `${k === "empresa" ? "Empresa" : nombreDe(Number(k))} ${clp(v)}`)
                                      .join(" + ")
                                  : nombreDe(m.persona)}
                              </span>
                              <span className={`block text-xs ${m.iguales ? "text-muted" : "text-accent-soft"}`}>
                                {m.tipo === "ingreso" ? "Para " : "Pone "}
                                {usuarios.map((u) => `${u.nombre.split(" ")[0]} ${clp(m.partes[String(u.id)] ?? 0)}`).join(" · ")}
                              </span>
                            </span>
                            <span className={`tabular-nums ${m.tipo === "ingreso" ? "text-[#7ee2a0]" : "text-[#ff8fa3]"}`}>
                              {m.tipo === "ingreso" ? "+" : "−"} {clp(m.monto)}
                            </span>
                            <Icono nombre="lapiz" className="size-3.5 shrink-0 text-muted" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {g.id ? (
                      <Link href={`/admin/proyectos/${g.id}`} className="flex items-center justify-center gap-1.5 border-t border-line px-3 py-2.5 text-xs text-accent-soft hover:text-fg">
                        Ir al proyecto {g.nombre} <Icono nombre="adelante" className="size-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
