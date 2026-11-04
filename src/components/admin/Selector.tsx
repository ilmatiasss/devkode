"use client";

import { useState } from "react";

// Opciones como botones (chips) que envían un valor oculto. Más rápido que un desplegable en el celular.
export function Selector({
  name,
  opciones,
  inicial,
  etiqueta,
}: {
  name: string;
  opciones: { valor: string; texto: string; color?: string }[];
  inicial: string;
  etiqueta: string;
}) {
  const [valor, setValor] = useState(inicial);
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium text-[#c9c9cf]">{etiqueta}</legend>
      <input type="hidden" name={name} value={valor} />
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activo = o.valor === valor;
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => setValor(o.valor)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition ${
                activo ? "border-accent bg-accent/15 text-fg" : "border-line bg-bg/60 text-muted hover:border-[#3a3a40] hover:text-fg"
              }`}
            >
              {o.color ? <span className="size-2 rounded-full" style={{ background: o.color }} /> : null}
              {o.texto}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
