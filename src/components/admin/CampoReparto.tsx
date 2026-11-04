"use client";

import { useState } from "react";

type Socio = { id: number; nombre: string; porcentaje: number };

// Elige cómo se reparte un proyecto, ingreso o gasto entre los socios: el reparto que ya aplica
// (general o del proyecto) o porcentajes propios. Con dos socios, mover uno ajusta al otro.
export function CampoReparto({
  socios,
  inicial,
  textoBase,
  etiqueta = "Reparto entre socios",
}: {
  socios: Socio[];
  inicial: Record<string, number> | null;
  textoBase: string;
  etiqueta?: string;
}) {
  const [personalizado, setPersonalizado] = useState(Boolean(inicial));
  const [valores, setValores] = useState<Record<number, number>>(() =>
    Object.fromEntries(socios.map((s) => [s.id, Number(inicial?.[String(s.id)] ?? s.porcentaje)])),
  );
  const suma = Object.values(valores).reduce((a, b) => a + b, 0);

  function cambiar(id: number, n: number) {
    const v = Math.max(0, Math.min(100, Math.round(n || 0)));
    if (socios.length === 2) {
      const otro = socios.find((s) => s.id !== id)!;
      setValores({ [id]: v, [otro.id]: 100 - v });
    } else setValores((prev) => ({ ...prev, [id]: v }));
  }

  if (socios.length < 2) return null;
  return (
    <fieldset className="min-w-0 rounded-2xl border border-line bg-bg/40 p-4">
      <legend className="px-1 text-sm font-medium text-[#c9c9cf]">{etiqueta}</legend>
      <input type="hidden" name="reparto_modo" value={personalizado ? "personalizado" : "base"} />
      <div className="flex flex-wrap gap-2">
        {[
          { v: false, t: textoBase },
          { v: true, t: "Porcentajes propios" },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={personalizado === o.v}
            onClick={() => setPersonalizado(o.v)}
            className={`rounded-full border px-3.5 py-2 text-sm transition ${personalizado === o.v ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}
          >
            {o.t}
          </button>
        ))}
      </div>

      {personalizado ? (
        <div className="mt-4 space-y-4">
          {socios.map((s) => (
            <div key={s.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <label htmlFor={`reparto_${s.id}`}>{s.nombre}</label>
                <span className="flex items-center gap-1">
                  <input
                    id={`reparto_${s.id}`}
                    name={`reparto_${s.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={valores[s.id]}
                    onChange={(e) => cambiar(s.id, Number(e.target.value))}
                    className="w-16 rounded-lg border border-line bg-bg px-2 py-1 text-right tabular-nums [color-scheme:dark] focus:border-accent focus:outline-none"
                  />
                  <span className="text-muted">%</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={valores[s.id]}
                onChange={(e) => cambiar(s.id, Number(e.target.value))}
                aria-label={`Porcentaje de ${s.nombre}`}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          ))}
          <p className={`text-xs ${suma === 100 ? "text-muted" : "text-[#ff8fa3]"}`}>
            {suma === 100 ? "Suman 100%." : `Suman ${suma}%: deben sumar 100%.`}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
