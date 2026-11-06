"use client";

import { useEffect, useRef, useState } from "react";

type Socio = { id: number; nombre: string };

const digitos = (v: string) => v.replace(/\D/g, "").slice(0, 10);
const formatear = (n: number) => (n ? n.toLocaleString("es-CL") : "");

function iguales(total: number, socios: Socio[]) {
  const base = Math.floor(total / socios.length);
  return Object.fromEntries(socios.map((s, i) => [s.id, base + (i === 0 ? total - base * socios.length : 0)]));
}

// Cuánto de un ingreso es para cada socio (o cuánto pone cada uno en un gasto), en pesos.
// Parte en mitad y mitad y sigue al monto total mientras no se cambie a mano.
export function CampoPara({ socios, inicial, etiqueta, prefijo }: { socios: Socio[]; inicial: Record<string, number> | null; etiqueta: string; prefijo: string }) {
  const [partes, setPartes] = useState<Record<number, number>>(() => Object.fromEntries(socios.map((s) => [s.id, Number(inicial?.[String(s.id)] ?? 0)])));
  const [manual, setManual] = useState(Boolean(inicial));
  const [total, setTotal] = useState(0);
  const raiz = useRef<HTMLFieldSetElement>(null);
  const primera = useRef<HTMLInputElement>(null);

  // Lee el monto total del mismo formulario
  useEffect(() => {
    const campo = raiz.current?.form?.elements.namedItem("monto");
    if (!(campo instanceof HTMLInputElement)) return;
    const leer = () => setTotal(Number(digitos(campo.value)) || 0);
    leer();
    campo.addEventListener("input", leer);
    return () => campo.removeEventListener("input", leer);
  }, []);

  // Mientras no se haya cambiado a mano, va mitad y mitad del total
  useEffect(() => {
    if (!manual) setPartes(iguales(total, socios));
  }, [total, manual, socios]);

  const suma = Object.values(partes).reduce((a, b) => a + b, 0);
  useEffect(() => {
    primera.current?.setCustomValidity(suma !== total ? "Las partes deben sumar el monto total" : "");
  }, [suma, total]);

  if (socios.length < 2) return null;
  const todoPara = (id: number) => {
    setManual(true);
    setPartes(Object.fromEntries(socios.map((s) => [s.id, s.id === id ? total : 0])));
  };

  return (
    <fieldset ref={raiz} className="min-w-0 rounded-2xl border border-line bg-bg/40 p-4">
      <legend className="px-1 text-sm font-medium text-[#c9c9cf]">{etiqueta}</legend>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setManual(false);
            setPartes(iguales(total, socios));
          }}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg"
        >
          Mitad y mitad
        </button>
        {socios.map((s) => (
          <button key={s.id} type="button" onClick={() => todoPara(s.id)} className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-accent/50 hover:text-fg">
            Todo {s.nombre.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {socios.map((s, i) => (
          <label key={s.id} className="block text-sm">
            <span className="text-[#c9c9cf]">{s.nombre.split(" ")[0]}</span>
            <span className="relative mt-1.5 block">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">$</span>
              <input
                ref={i === 0 ? primera : undefined}
                name={`${prefijo}${s.id}`}
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={formatear(partes[s.id])}
                onChange={(e) => {
                  const n = Number(digitos(e.target.value)) || 0;
                  setManual(true);
                  // Con dos socios, lo que falta para el total se le asigna al otro
                  if (socios.length === 2) {
                    const otro = socios.find((o) => o.id !== s.id)!;
                    setPartes({ [s.id]: n, [otro.id]: Math.max(0, total - n) });
                  } else setPartes((p) => ({ ...p, [s.id]: n }));
                }}
                className="block w-full rounded-xl border border-line bg-bg/70 py-2.5 pr-3 pl-7 text-[15px] text-fg tabular-nums placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </span>
          </label>
        ))}
      </div>
      {suma !== total ? <p className="mt-2 text-xs text-[#ff8fa3]">Suman ${formatear(suma) || "0"} y el total es ${formatear(total) || "0"}: deben coincidir.</p> : null}
    </fieldset>
  );
}
