import Link from "next/link";
import { escalar, type MesMantencion, partesDe, type ServicioDeProyecto } from "@/lib/admin/consultas";
import { clp, nombreMes } from "@/lib/admin/formato";
import { Icono } from "./Icono";

// Mantención de los últimos meses: lo cobrado, los servicios pagados con esa plata y lo que queda
// para repartir. Abajo, los servicios contratados de este proyecto.
export function ServiciosMantencion({
  proyectoId,
  meses,
  servicios,
  socios,
  limite = 3,
}: {
  proyectoId: number;
  meses: MesMantencion[];
  servicios: ServicioDeProyecto[];
  socios: { id: number; nombre: string }[];
  limite?: number;
}) {
  const propios = servicios.filter((s) => s.proyecto_id === proyectoId);
  const delProyecto = meses.filter((m) => m.proyecto_id === proyectoId).slice(0, limite);
  return (
    <div className="space-y-3 text-sm">
      {delProyecto.map((m) => {
        const gastado = m.servicios.reduce((t, s) => t + s.monto, 0);
        const queda = (m.cobrado ?? 0) - gastado;
        const partes = m.cobrado ? escalar(partesDe(m.para, m.cobrado, socios), queda) : {};
        return (
          <div key={m.mes} className="rounded-xl border border-line bg-bg/40 p-3">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{nombreMes(m.mes)}</p>
            <dl className="space-y-1">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Mantención cobrada</dt>
                <dd className="tabular-nums">{m.cobrado ? clp(m.cobrado) : <span className="text-[#f5c96b]">sin registrar</span>}</dd>
              </div>
              {m.servicios.map((s) => (
                <div key={s.id} className="flex justify-between gap-3">
                  <dt className="truncate">
                    <Link href={`/admin/gastos/${s.id}`} className="text-muted hover:text-fg">
                      − {s.descripcion}
                    </Link>
                  </dt>
                  <dd className="shrink-0 text-[#ff8fa3] tabular-nums">− {clp(s.monto)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-t border-line pt-1.5 font-medium">
                <dt>Queda para repartir</dt>
                <dd className={`tabular-nums ${queda < 0 ? "text-[#ff8fa3]" : "text-[#7ee2a0]"}`}>{clp(queda)}</dd>
              </div>
            </dl>
            {m.cobrado && socios.length > 1 ? (
              <p className="mt-1.5 text-right text-xs text-muted">{socios.map((u) => `${u.nombre.split(" ")[0]} ${clp(partes[String(u.id)] ?? 0)}`).join(" · ")}</p>
            ) : null}
          </div>
        );
      })}

      <div className="rounded-xl border border-dashed border-line p-3">
        <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Servicios de este proyecto</p>
        {propios.length ? (
          <ul className="space-y-1">
            {propios.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/servicios/${s.id}`} className="flex items-center justify-between gap-3 hover:text-accent-soft">
                  <span className="truncate">{s.nombre}</span>
                  <Icono nombre="adelante" className="size-3.5 shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted">Ninguno todavía.</p>
        )}
        <p className="mt-2 text-xs text-muted">Al registrar su pago, se descuenta solo de la mantención de ese mes.</p>
        <Link href={`/admin/servicios/nuevo?proyecto=${proyectoId}`} className="mt-2 inline-flex items-center gap-1 text-xs text-accent-soft hover:text-fg">
          <Icono nombre="mas2" className="size-3.5" /> Agregar servicio
        </Link>
      </div>
    </div>
  );
}
