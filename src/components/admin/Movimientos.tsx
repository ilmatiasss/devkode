import Link from "next/link";
import { clp, fecha, hoy } from "@/lib/admin/formato";
import { colorDeCategoria, etiquetaCategoria } from "@/lib/admin/opciones";
import { Icono } from "./Icono";
import { tarjeta } from "./ui";

export type FilaMovimiento = {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  categoria?: string | null;
  detalle?: string | null; // proyecto, servicio…
  persona?: string | null; // quién pagó o recibió
};

const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
function titulo(f: string) {
  if (f === hoy()) return "Hoy";
  const [a, m, d] = f.split("-").map(Number);
  const dia = diasSemana[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
  return `${dia} ${fecha(f).split(" ").slice(0, 2).join(" ")}`;
}

// Lista de ingresos o gastos agrupada por día. Se lee igual de bien en celular que en escritorio.
export function ListaMovimientos({ filas, tipo }: { filas: FilaMovimiento[]; tipo: "ingresos" | "gastos" }) {
  const grupos = new Map<string, FilaMovimiento[]>();
  for (const f of filas) grupos.set(f.fecha, [...(grupos.get(f.fecha) ?? []), f]);

  return (
    <div className="space-y-5">
      {[...grupos.entries()].map(([dia, lista], g) => (
        <section key={dia} className="aparecer" style={{ animationDelay: `${Math.min(g, 6) * 50}ms` }}>
          <h2 className="mb-2 flex items-center justify-between px-1 text-xs text-muted">
            <span className="capitalize">{titulo(dia)}</span>
            <span className="tabular-nums">{clp(lista.reduce((s, f) => s + f.monto, 0))}</span>
          </h2>
          <ul className={`${tarjeta} divide-y divide-line`}>
            {lista.map((f) => {
              const color = tipo === "ingresos" ? "#7ee2a0" : colorDeCategoria(f.categoria ?? "otros");
              return (
                <li key={f.id}>
                  <Link href={`/admin/${tipo}/${f.id}`} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                      <Icono nombre={tipo === "ingresos" ? "ingresos" : "gastos"} className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{f.descripcion}</span>
                      <span className="block truncate text-xs text-muted">
                        {[f.categoria ? etiquetaCategoria(f.categoria) : null, f.detalle, f.persona ?? "Empresa"].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className={`shrink-0 text-[15px] font-medium tabular-nums ${tipo === "ingresos" ? "text-[#7ee2a0]" : ""}`}>
                      {tipo === "ingresos" ? "+" : "−"}
                      {clp(f.monto)}
                    </span>
                    <Icono nombre="lapiz" className="hidden size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
