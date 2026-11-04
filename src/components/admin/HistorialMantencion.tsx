import { moverMes } from "@/lib/admin/formato";

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Últimos meses de una mantención: pagado, pendiente, por vencer o antes de que empezara
export function HistorialMantencion({ pagados, pendientes, desde, mesHoy, cantidad = 6 }: { pagados: string[]; pendientes: string[]; desde: string; mesHoy: string; cantidad?: number }) {
  const lista = Array.from({ length: cantidad }, (_, i) => moverMes(mesHoy, i - cantidad + 1));
  const pagadosSet = new Set(pagados);
  const pendSet = new Set(pendientes);
  return (
    <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cantidad}, minmax(0, 1fr))` }} aria-label="Historial de los últimos meses">
      {lista.map((m) => {
        const estado = pagadosSet.has(m) ? "pagado" : pendSet.has(m) ? "pendiente" : m < desde ? "fuera" : "por vencer";
        const estilo =
          estado === "pagado"
            ? "border-[#1f4d33] bg-[#0f2219] text-[#7ee2a0]"
            : estado === "pendiente"
              ? "border-[#5b2330] bg-[#2a1118] text-[#ff8fa3]"
              : estado === "por vencer"
                ? "border-accent/40 bg-accent/10 text-accent-soft"
                : "border-line/60 text-muted/50";
        return (
          <li key={m} title={`${m}: ${estado}`} className={`rounded-lg border py-1.5 text-center text-[11px] leading-tight ${estilo}`}>
            {meses[Number(m.slice(5, 7)) - 1]}
            <span className="block text-[10px] opacity-80">{estado === "pagado" ? "✓" : estado === "pendiente" ? "!" : estado === "por vencer" ? "·" : "–"}</span>
            <span className="sr-only">{estado}</span>
          </li>
        );
      })}
    </ol>
  );
}
