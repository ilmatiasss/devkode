"use client";

import { useState } from "react";

// Fecha de entrega con la opción de dejarla pendiente (proyecto en curso sin fecha definida)
export function CampoEntrega({ inicial, clase }: { inicial: string | null; clase: string }) {
  const [sinFecha, setSinFecha] = useState(!inicial);
  const [valor, setValor] = useState(inicial ?? "");
  return (
    <div className="block text-sm">
      <label htmlFor="entrega" className="font-medium text-[#c9c9cf]">
        Entrega
      </label>
      <input
        id="entrega"
        name="entrega"
        type="date"
        disabled={sinFecha}
        value={sinFecha ? "" : valor}
        onChange={(e) => setValor(e.target.value)}
        className={`${clase} disabled:opacity-40`}
      />
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={sinFecha} onChange={(e) => setSinFecha(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
        Aún sin fecha de entrega
      </label>
    </div>
  );
}
