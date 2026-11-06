"use client";

import { useState } from "react";

type Socio = { id: number; nombre: string };

// Un porcentaje por socio (acepta decimales). Con dos socios, al cambiar uno el otro se completa solo.
export function CamposPorcentaje({ socios, inicial, prefijo }: { socios: Socio[]; inicial: Record<string, number>; prefijo: string }) {
  const [valores, setValores] = useState<Record<number, string>>(() => Object.fromEntries(socios.map((s) => [s.id, String(inicial[String(s.id)] ?? "")])));
  const numero = (v: string) => Number(v.replace(",", "."));
  const suma = Object.values(valores).reduce((a, v) => a + (numero(v) || 0), 0);

  function cambiar(id: number, texto: string) {
    const limpio = texto.replace(/[^\d.,]/g, "").slice(0, 6);
    if (socios.length === 2) {
      const otro = socios.find((s) => s.id !== id)!;
      const n = numero(limpio);
      const resto = Number.isFinite(n) && n >= 0 && n <= 100 ? String(Math.round((100 - n) * 100) / 100) : valores[otro.id];
      setValores({ [id]: limpio, [otro.id]: limpio ? resto : valores[otro.id] });
    } else setValores((v) => ({ ...v, [id]: limpio }));
  }

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-2 gap-3">
        {socios.map((s) => (
          <label key={s.id} className="block text-sm">
            <span className="text-[#c9c9cf]">{s.nombre.split(" ")[0]}</span>
            <span className="relative mt-1.5 block">
              <input
                name={`${prefijo}${s.id}`}
                inputMode="decimal"
                required
                autoComplete="off"
                value={valores[s.id]}
                onChange={(e) => cambiar(s.id, e.target.value)}
                className="block w-full rounded-xl border border-line bg-bg/70 py-2.5 pr-8 pl-3 text-[15px] text-fg tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted">%</span>
            </span>
          </label>
        ))}
      </div>
      {Math.abs(suma - 100) >= 0.01 ? <p className="mt-2 text-xs text-[#ff8fa3]">Suman {Math.round(suma * 100) / 100}%: deben sumar 100%.</p> : null}
    </div>
  );
}
