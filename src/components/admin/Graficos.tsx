import { clp } from "@/lib/admin/formato";

// Gráficos dibujados en el servidor con SVG: sin librerías ni JavaScript en el navegador.

const mesesCortos = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const corto = (mes: string) => mesesCortos[Number(mes.slice(5, 7)) - 1];
const compacto = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".", ",")} M` : n >= 1000 ? `${Math.round(n / 1000)} mil` : String(n));

export function BarrasMeses({ datos }: { datos: { mes: string; ingresos: number; gastos: number }[] }) {
  const max = Math.max(1, ...datos.flatMap((d) => [d.ingresos, d.gastos]));
  const W = 600;
  const H = 220;
  const base = 190;
  const alto = 160;
  const paso = W / datos.length;
  const ancho = Math.min(22, paso / 3.2);
  const lineas = [0.25, 0.5, 0.75, 1];

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Ingresos y gastos de los últimos meses">
        {lineas.map((f) => (
          <g key={f}>
            <line x1="0" x2={W} y1={base - alto * f} y2={base - alto * f} stroke="#26262a" strokeDasharray="3 5" />
            <text x={W} y={base - alto * f - 5} textAnchor="end" fontSize="11" fill="#6f6f78">
              {compacto(max * f)}
            </text>
          </g>
        ))}
        <line x1="0" x2={W} y1={base} y2={base} stroke="#2e2e33" />
        {datos.map((d, i) => {
          const cx = paso * i + paso / 2;
          const hi = (d.ingresos / max) * alto;
          const hg = (d.gastos / max) * alto;
          const ultimo = i === datos.length - 1;
          return (
            <g key={d.mes} className="crecer" style={{ animationDelay: `${i * 70}ms`, transformOrigin: `${cx}px ${base}px` }}>
              <rect x={cx - ancho - 2} y={base - hi} width={ancho} height={Math.max(hi, 1.5)} rx="5" fill="url(#gIngreso)" opacity={ultimo ? 1 : 0.85}>
                <title>{`Ingresos ${corto(d.mes)}: ${clp(d.ingresos)}`}</title>
              </rect>
              <rect x={cx + 2} y={base - hg} width={ancho} height={Math.max(hg, 1.5)} rx="5" fill="#3a3a42" opacity={ultimo ? 1 : 0.85}>
                <title>{`Gastos ${corto(d.mes)}: ${clp(d.gastos)}`}</title>
              </rect>
              <text x={cx} y={base + 20} textAnchor="middle" fontSize="12" fill={ultimo ? "#ededee" : "#8f8f96"} fontWeight={ultimo ? 600 : 400}>
                {corto(d.mes)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="gIngreso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4adff" />
            <stop offset="1" stopColor="#9b72ff" />
          </linearGradient>
        </defs>
      </svg>
      <figcaption className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-accent" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[#3a3a42]" /> Gastos
        </span>
      </figcaption>
    </figure>
  );
}

export function Dona({ partes, centro, subcentro }: { partes: { etiqueta: string; valor: number; color: string }[]; centro: string; subcentro: string }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let acumulado = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
      <svg viewBox="0 0 140 140" className="size-40 shrink-0" role="img" aria-label="Gastos por categoría">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1f1f23" strokeWidth="16" />
        {total > 0
          ? partes.map((p) => {
              const largo = (p.valor / total) * c;
              const arco = (
                <circle
                  key={p.etiqueta}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={p.color}
                  strokeWidth="16"
                  strokeDasharray={`${Math.max(largo - 2, 0.5)} ${c}`}
                  strokeDashoffset={-acumulado}
                  transform="rotate(-90 70 70)"
                >
                  <title>{`${p.etiqueta}: ${clp(p.valor)}`}</title>
                </circle>
              );
              acumulado += largo;
              return arco;
            })
          : null}
        <text x="70" y="68" textAnchor="middle" fontSize="15" fontWeight="600" fill="#ededee">
          {centro}
        </text>
        <text x="70" y="86" textAnchor="middle" fontSize="10" fill="#8f8f96">
          {subcentro}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {partes.slice(0, 5).map((p) => (
          <li key={p.etiqueta} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="flex-1 truncate text-muted">{p.etiqueta}</span>
            <span className="tabular-nums">{total ? Math.round((p.valor / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
