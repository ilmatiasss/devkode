import Link from "next/link";
import type { ReactNode } from "react";
import { mensajeDe } from "@/lib/admin/formato";

// Piezas visuales del panel de administración

export const entrada =
  "mt-1.5 block w-full border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted [color-scheme:dark]";
export const botonPrimario = "btn btn-primary px-4! py-2! text-sm";
export const botonSecundario =
  "inline-flex items-center gap-2 border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-accent";
export const botonPeligro =
  "inline-flex items-center gap-2 border border-[#5b2330] px-4 py-2 text-sm text-[#ff8fa3] transition-colors hover:bg-[#2a1118]";
export const enlace = "text-fg underline decoration-line underline-offset-4 transition-colors hover:decoration-accent";

export function Campo({
  etiqueta,
  ayuda,
  className = "",
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-muted">{etiqueta}</span>
      {children}
      {ayuda ? <span className="mt-1 block text-xs text-muted">{ayuda}</span> : null}
    </label>
  );
}

export function Encabezado({ titulo, descripcion, accion }: { titulo: string; descripcion?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-tight">{titulo}</h1>
        {descripcion ? <p className="mt-1.5 text-sm text-muted">{descripcion}</p> : null}
      </div>
      {accion}
    </div>
  );
}

export function Kpi({ etiqueta, valor, detalle, tono }: { etiqueta: string; valor: string; detalle?: string; tono?: "bien" | "mal" }) {
  const color = tono === "bien" ? "text-[#7ee2a0]" : tono === "mal" ? "text-[#ff8fa3]" : "text-fg";
  return (
    <div className="min-w-0 border border-line bg-surface p-4 sm:p-5">
      <p className="text-xs text-muted">{etiqueta}</p>
      <p className={`mt-2 font-display text-xl font-medium tracking-tight sm:text-2xl ${color}`}>{valor}</p>
      {detalle ? <p className="mt-1 text-xs text-muted">{detalle}</p> : null}
    </div>
  );
}

const avisos: Record<string, string> = {
  guardado: "Guardado.",
  eliminado: "Eliminado.",
  pago: "Pago registrado como gasto y próximo cobro actualizado.",
  clave: "Contraseña actualizada.",
  sesiones: "Se cerraron las demás sesiones.",
};

export function Aviso({ ok, error }: { ok?: string; error?: string }) {
  const textoError = mensajeDe(error);
  const textoOk = ok ? avisos[ok] : undefined;
  if (!textoError && !textoOk) return null;
  return (
    <p
      role={textoError ? "alert" : "status"}
      className={`mb-6 border px-4 py-3 text-sm ${textoError ? "border-[#5b2330] bg-[#2a1118] text-[#ffc2cd]" : "border-[#1f4d33] bg-[#0f2219] text-[#b6f0cb]"}`}
    >
      {textoError ?? textoOk}
    </p>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-line px-5 py-8 text-center text-sm text-muted">{children}</p>;
}

export function Tabla({ children }: { children: ReactNode }) {
  return (
    // relative: contiene los textos ocultos para lectores de pantalla; tabIndex: se puede desplazar con teclado
    <div tabIndex={0} className="relative overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-normal [&_th]:text-muted [&_thead]:bg-surface [&_tr]:border-b [&_tr]:border-line [&_tbody_tr:last-child]:border-0">
        {children}
      </table>
    </div>
  );
}

export function Etiqueta({ children, tono = "neutro" }: { children: ReactNode; tono?: "neutro" | "acento" | "bien" | "mal" }) {
  const colores = {
    neutro: "border-line text-muted",
    acento: "border-accent/50 text-accent-soft",
    bien: "border-[#1f4d33] text-[#7ee2a0]",
    mal: "border-[#5b2330] text-[#ff8fa3]",
  };
  return <span className={`inline-block whitespace-nowrap border px-2 py-0.5 text-xs ${colores[tono]}`}>{children}</span>;
}

export function SelectorMes({ mes, ruta, anterior, siguiente, nombre }: { mes: string; ruta: string; anterior: string; siguiente: string; nombre: string }) {
  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Elegir mes">
      <Link href={`${ruta}?mes=${anterior}`} className="border border-line px-3 py-2 hover:border-accent" aria-label="Mes anterior">
        ←
      </Link>
      <span className="min-w-36 border border-line px-3 py-2 text-center capitalize" aria-current="date" data-mes={mes}>
        {nombre}
      </span>
      <Link href={`${ruta}?mes=${siguiente}`} className="border border-line px-3 py-2 hover:border-accent" aria-label="Mes siguiente">
        →
      </Link>
    </div>
  );
}
