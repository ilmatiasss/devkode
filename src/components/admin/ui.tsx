import Link from "next/link";
import type { ReactNode } from "react";
import { Icono, type NombreIcono } from "./Icono";

// Piezas visuales del panel de administración

export const entrada =
  "mt-1.5 block w-full rounded-xl border border-line bg-bg/70 px-3.5 py-2.5 text-[15px] text-fg placeholder:text-muted/70 transition-colors [color-scheme:dark] hover:border-[#3a3a40] focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/30";
export const botonPrimario =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent shadow-[0_8px_24px_-8px_rgb(155_114_255/0.6)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60";
export const botonSecundario =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg transition hover:border-accent/60 hover:bg-accent/5 active:scale-[0.98]";
export const botonPeligro =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#5b2330] px-4 py-2.5 text-sm text-[#ff8fa3] transition hover:bg-[#2a1118] active:scale-[0.98]";
export const enlace = "text-fg underline decoration-line underline-offset-4 transition-colors hover:decoration-accent";
export const tarjeta = "rounded-2xl border border-line bg-surface/80";

export function Campo({ etiqueta, ayuda, className = "", children }: { etiqueta: string; ayuda?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-[#c9c9cf]">{etiqueta}</span>
      {children}
      {ayuda ? <span className="mt-1.5 block text-xs leading-relaxed text-muted">{ayuda}</span> : null}
    </label>
  );
}

export function Encabezado({
  titulo,
  descripcion,
  accion,
  volver,
  etiqueta,
}: {
  titulo: string;
  descripcion?: ReactNode;
  accion?: ReactNode;
  volver?: { href: string; texto: string };
  etiqueta?: ReactNode;
}) {
  return (
    <header className="aparecer mb-7 md:mb-9">
      {volver ? (
        <Link href={volver.href} className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
          <Icono nombre="atras" className="size-4" /> {volver.texto}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[clamp(1.7rem,4vw,2.4rem)] leading-tight font-medium tracking-[-0.03em] [overflow-wrap:anywhere]">{titulo}</h1>
            {etiqueta}
          </div>
          {descripcion ? <p className="mt-1.5 text-sm text-muted">{descripcion}</p> : null}
        </div>
        {accion ? <div className="flex flex-wrap gap-2">{accion}</div> : null}
      </div>
    </header>
  );
}

export function Seccion({ titulo, accion, children, className = "" }: { titulo: string; accion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`aparecer ${className}`}>
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

const tonos = {
  neutro: "text-fg",
  bien: "text-[#7ee2a0]",
  mal: "text-[#ff8fa3]",
  acento: "text-accent-soft",
};

export function Kpi({
  etiqueta,
  valor,
  detalle,
  tono = "neutro",
  icono,
  variacion,
  invertir = false,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  tono?: keyof typeof tonos;
  icono?: NombreIcono;
  variacion?: number | null;
  invertir?: boolean;
}) {
  const sube = variacion !== null && variacion !== undefined && variacion > 0;
  const bueno = invertir ? !sube : sube;
  return (
    <div className={`${tarjeta} aparecer relative min-w-0 overflow-hidden p-4 md:p-5`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs leading-snug text-muted md:text-[13px]">{etiqueta}</p>
        {icono ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-soft">
            <Icono nombre={icono} className="size-4" />
          </span>
        ) : null}
      </div>
      <p className={`mt-2 font-display text-[clamp(1.15rem,4.6vw,1.6rem)] leading-tight font-medium tracking-tight [overflow-wrap:anywhere] ${tonos[tono]}`}>{valor}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {variacion !== null && variacion !== undefined && Number.isFinite(variacion) && variacion !== 0 ? (
          <span className={`rounded-full px-1.5 py-0.5 ${bueno ? "bg-[#0f2219] text-[#7ee2a0]" : "bg-[#2a1118] text-[#ff8fa3]"}`}>
            {sube ? "▲" : "▼"} {Math.abs(Math.round(variacion))}%
          </span>
        ) : null}
        {detalle ? <span>{detalle}</span> : null}
      </div>
    </div>
  );
}

export function Progreso({ valor, color = "var(--color-accent)", etiqueta }: { valor: number; color?: string; etiqueta?: string }) {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta ?? "Avance"}>
      <div className="barra h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Vacio({ icono = "pulso", titulo, children, accion }: { icono?: NombreIcono; titulo: string; children?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="aparecer flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent-soft">
        <Icono nombre={icono} className="size-6" />
      </span>
      <p className="mt-4 font-medium">{titulo}</p>
      {children ? <p className="mt-1 max-w-sm text-sm text-muted">{children}</p> : null}
      {accion ? <div className="mt-5">{accion}</div> : null}
    </div>
  );
}

const colores = {
  neutro: "border-line bg-bg/60 text-muted",
  acento: "border-accent/40 bg-accent/10 text-accent-soft",
  bien: "border-[#1f4d33] bg-[#0f2219] text-[#7ee2a0]",
  mal: "border-[#5b2330] bg-[#2a1118] text-[#ff8fa3]",
  aviso: "border-[#5a4512] bg-[#241c08] text-[#f5c96b]",
};
export type Tono = keyof typeof colores;

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: Tono }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${colores[tono]}`}>{children}</span>;
}

export function Avatar({ nombre, color = "#9b72ff", className = "size-10 text-sm" }: { nombre: string; color?: string; className?: string }) {
  const iniciales = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl font-display font-semibold ${className}`}
      style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      {iniciales || "·"}
    </span>
  );
}

// Color estable a partir de un texto (para avatares)
const paleta = ["#9b72ff", "#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#fb923c", "#22d3ee", "#a3e635"];
export function colorDe(texto: string) {
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return paleta[h % paleta.length];
}

export function Pestanas({ opciones, activa }: { opciones: { href: string; texto: string; cuenta?: number; clave: string }[]; activa: string }) {
  return (
    <nav aria-label="Filtro" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {opciones.map((o) => (
        <Link
          key={o.clave}
          href={o.href}
          aria-current={o.clave === activa ? "page" : undefined}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            o.clave === activa ? "border-accent/60 bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"
          }`}
        >
          {o.texto}
          {o.cuenta !== undefined ? <span className="rounded-full bg-bg/80 px-1.5 text-xs text-muted">{o.cuenta}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function SelectorMes({ ruta, anterior, siguiente, nombre }: { ruta: string; anterior: string; siguiente: string; nombre: string }) {
  const boton = "grid size-10 place-items-center rounded-xl transition-colors hover:bg-accent/10 hover:text-fg";
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface/80 p-1 text-sm text-muted">
      <Link href={`${ruta}?mes=${anterior}`} className={boton} aria-label="Mes anterior">
        <Icono nombre="atras" className="size-4" />
      </Link>
      <span className="min-w-36 px-2 text-center font-medium text-fg capitalize">{nombre}</span>
      <Link href={`${ruta}?mes=${siguiente}`} className={boton} aria-label="Mes siguiente">
        <Icono nombre="adelante" className="size-4" />
      </Link>
    </div>
  );
}

// Barra fija con los botones de un formulario: abajo en celular (sobre el menú), al pie en escritorio
export function BarraGuardar({ cancelar, texto = "Guardar cambios" }: { cancelar: string; texto?: string }) {
  return (
    <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-2 flex gap-2 border-t border-line bg-bg/85 px-4 py-3 backdrop-blur-md sm:col-span-2 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
      <button type="submit" className={`${botonPrimario} flex-1 md:flex-none`}>
        <Icono nombre="check" className="size-4" /> {texto}
      </button>
      <Link href={cancelar} className={`${botonSecundario} flex-1 md:flex-none`}>
        Cancelar
      </Link>
    </div>
  );
}

export function ZonaPeligro({ children }: { children: ReactNode }) {
  return (
    <section className="mt-10 rounded-2xl border border-[#3a1a22] bg-[#170b0f]/60 p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-[#ffb3c1]">
        <Icono nombre="alerta" className="size-4" /> Zona de cuidado
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
