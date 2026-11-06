import Link from "next/link";
import { mensualEnPesos, type ServicioDeProyecto } from "@/lib/admin/consultas";
import { clp } from "@/lib/admin/formato";
import { Icono } from "./Icono";

// Lo que cobra la mantención menos los servicios que se pagan con ella (hosting, dominio…),
// y cuánto queda para cada socio. Los servicios se conectan eligiendo el proyecto en el servicio.
export function ServiciosMantencion({
  proyectoId,
  mantencion,
  servicios,
  dolar,
  socios,
}: {
  proyectoId: number;
  mantencion: number;
  servicios: ServicioDeProyecto[];
  dolar: number;
  socios: number;
}) {
  const propios = servicios.filter((s) => s.proyecto_id === proyectoId);
  const costo = Math.round(propios.reduce((t, s) => t + mensualEnPesos(s, dolar), 0));
  const queda = mantencion - costo;
  return (
    <div className="rounded-xl border border-line bg-bg/40 p-3 text-sm">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Servicios que paga</p>
      {propios.length ? (
        <ul className="space-y-1.5">
          {propios.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/servicios/${s.id}`} className="flex justify-between gap-3 hover:text-accent-soft">
                <span className="truncate">{s.nombre}</span>
                <span className="shrink-0 text-[#ff8fa3] tabular-nums">
                  − {clp(mensualEnPesos(s, dolar))}
                  {s.ciclo === "mensual" ? "" : "/mes aprox."}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted">Ninguno todavía.</p>
      )}
      <div className="mt-3 flex justify-between gap-3 border-t border-line pt-2.5">
        <span className="text-muted">Queda al mes</span>
        <span className={`font-medium tabular-nums ${queda < 0 ? "text-[#ff8fa3]" : "text-[#7ee2a0]"}`}>{clp(queda)}</span>
      </div>
      {socios > 1 && queda > 0 ? <p className="mt-1 text-right text-xs text-muted">{clp(Math.floor(queda / socios))} para cada uno</p> : null}
      <Link href={`/admin/servicios/nuevo?proyecto=${proyectoId}`} className="mt-3 inline-flex items-center gap-1 text-xs text-accent-soft hover:text-fg">
        <Icono nombre="mas2" className="size-3.5" /> Agregar servicio de este proyecto
      </Link>
    </div>
  );
}
