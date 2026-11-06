"use client";

import { useEffect, useRef, useState } from "react";
import { CampoPara } from "./CampoPara";

type Socio = { id: number; nombre: string };

// "¿Quién lo pagó?" de un gasto. Además de la empresa o un socio, puede pagarse con la plata de la
// mantención de un proyecto: entonces se descuenta de la mantención de ese mes y no se pregunta
// cuánto pone cada uno (lo que queda de la mantención se reparte como ella).
export function CampoPagoGasto({
  socios,
  inicial,
  mantMes,
  pone,
}: {
  socios: Socio[];
  inicial: string; // "", id de socio o "mantencion"
  mantMes: string | null;
  pone: Record<string, number> | null;
}) {
  const [valor, setValor] = useState(inicial);
  const [mes, setMes] = useState(mantMes ?? "");
  const raiz = useRef<HTMLDivElement>(null);

  // Si no se eligió mes, usa el mes de la fecha del gasto
  useEffect(() => {
    const form = raiz.current?.closest("form");
    const fecha = form?.elements.namedItem("fecha");
    if (!(fecha instanceof HTMLInputElement)) return;
    const seguir = () => setMes((m) => (mantMes || m ? m : fecha.value.slice(0, 7)));
    seguir();
    const cambio = () => {
      if (!mantMes) setMes(fecha.value.slice(0, 7));
    };
    fecha.addEventListener("input", cambio);
    return () => fecha.removeEventListener("input", cambio);
  }, [mantMes]);

  const opciones = [
    { valor: "", texto: "Cuenta de la empresa" },
    ...socios.map((s) => ({ valor: String(s.id), texto: s.nombre.split(" ")[0] })),
    { valor: "mantencion", texto: "Plata de la mantención" },
  ];

  return (
    <div ref={raiz} className="grid min-w-0 gap-5">
      <fieldset className="min-w-0">
        <legend className="text-sm font-medium text-[#c9c9cf]">¿Con qué plata se pagó?</legend>
        <input type="hidden" name="pagado_por" value={valor} />
        <div className="mt-2 flex flex-wrap gap-2">
          {opciones.map((o) => (
            <button
              key={o.valor}
              type="button"
              aria-pressed={valor === o.valor}
              onClick={() => setValor(o.valor)}
              className={`rounded-full border px-3.5 py-2 text-sm transition ${valor === o.valor ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}
            >
              {o.texto}
            </button>
          ))}
        </div>
      </fieldset>

      {valor === "mantencion" ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <label className="block text-sm">
            <span className="font-medium text-[#c9c9cf]">¿De la mantención de qué mes?</span>
            <input
              name="mant_mes"
              type="month"
              required
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-line bg-bg/70 px-3.5 py-2.5 text-[15px] text-fg [color-scheme:dark] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <p className="mt-2 text-xs text-muted">
            Se descuenta de la mantención de ese mes del proyecto elegido. Lo que queda se reparte igual que la mantención, así que no tienes que decir cuánto pone cada uno.
          </p>
        </div>
      ) : (
        <>
          <p className="-mt-3 text-xs text-muted">Si lo pagó uno de ustedes de su bolsillo, se le devuelve en el reparto.</p>
          <CampoPara socios={socios} inicial={pone} etiqueta="¿Cuánto pone cada uno?" prefijo="pone_" />
        </>
      )}
    </div>
  );
}
