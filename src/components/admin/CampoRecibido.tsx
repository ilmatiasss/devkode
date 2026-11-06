"use client";

import { useEffect, useRef, useState } from "react";

type Socio = { id: number; nombre: string };

const digitos = (v: string) => v.replace(/\D/g, "").slice(0, 10);
const formatear = (n: number) => (n ? n.toLocaleString("es-CL") : "");

// "¿Dónde llegó el pago?": a la empresa, a un socio, o dividido entre varias cuentas
// (por ejemplo, el cliente le pagó la mitad a cada uno). Lee el monto total del mismo formulario.
export function CampoRecibido({ socios, inicial, detalle }: { socios: Socio[]; inicial: number | null; detalle: Record<string, number> | null }) {
  const [modo, setModo] = useState(detalle ? "dividido" : String(inicial ?? ""));
  const cuentas = [...socios.map((s) => ({ clave: String(s.id), nombre: s.nombre.split(" ")[0] })), { clave: "empresa", nombre: "Empresa" }];
  const [partes, setPartes] = useState<Record<string, number>>(() => Object.fromEntries(cuentas.map((c) => [c.clave, Number(detalle?.[c.clave] ?? 0)])));
  const [total, setTotal] = useState(0);
  const raiz = useRef<HTMLFieldSetElement>(null);

  // Sigue el monto total que se escribe arriba en el formulario
  useEffect(() => {
    const campo = raiz.current?.form?.elements.namedItem("monto");
    if (!(campo instanceof HTMLInputElement)) return;
    const leer = () => setTotal(Number(digitos(campo.value)) || 0);
    leer();
    campo.addEventListener("input", leer);
    return () => campo.removeEventListener("input", leer);
  }, []);

  const suma = Object.values(partes).reduce((a, b) => a + b, 0);
  const primera = useRef<HTMLInputElement>(null);

  // Si las partes no suman el total, el navegador no deja enviar el formulario (y no se pierde lo escrito)
  useEffect(() => {
    primera.current?.setCustomValidity(modo === "dividido" && suma !== total ? "Lo que llegó a cada cuenta debe sumar el monto total" : "");
  }, [modo, suma, total]);
  function partesIguales() {
    const base = Math.floor(total / socios.length);
    setPartes(Object.fromEntries(cuentas.map((c, i) => [c.clave, c.clave === "empresa" ? 0 : base + (i === 0 ? total - base * socios.length : 0)])));
  }
  function elegir(valor: string) {
    setModo(valor);
    if (valor === "dividido" && suma === 0) partesIguales();
  }

  const opciones = [
    { valor: "", texto: "Cuenta de la empresa" },
    ...socios.map((s) => ({ valor: String(s.id), texto: `Cuenta de ${s.nombre.split(" ")[0]}` })),
    ...(socios.length > 1 ? [{ valor: "dividido", texto: "Dividido entre cuentas" }] : []),
  ];

  return (
    <fieldset ref={raiz} className="min-w-0">
      <legend className="text-sm font-medium text-[#c9c9cf]">¿Dónde llegó el pago?</legend>
      <input type="hidden" name="recibido_por" value={modo} />
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={modo === o.valor}
            onClick={() => elegir(o.valor)}
            className={`rounded-full border px-3.5 py-2 text-sm transition ${modo === o.valor ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}
          >
            {o.texto}
          </button>
        ))}
      </div>

      {modo === "dividido" ? (
        <div className="mt-4 rounded-2xl border border-line bg-bg/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">¿Cuánto llegó a cada cuenta?</p>
            <button type="button" onClick={partesIguales} className="rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs text-accent-soft hover:bg-accent/20">
              Partes iguales entre socios
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {cuentas.map((c) => (
              <label key={c.clave} className="block text-sm">
                <span className="text-[#c9c9cf]">{c.nombre}</span>
                <span className="relative mt-1.5 block">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">$</span>
                  <input
                    ref={c === cuentas[0] ? primera : undefined}
                    name={`recibido_${c.clave}`}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={formatear(partes[c.clave])}
                    onChange={(e) => setPartes((p) => ({ ...p, [c.clave]: Number(digitos(e.target.value)) || 0 }))}
                    className="block w-full rounded-xl border border-line bg-bg/70 py-2.5 pr-3 pl-7 text-[15px] text-fg tabular-nums placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </span>
              </label>
            ))}
          </div>
          <p className={`mt-3 text-xs ${suma === total ? "text-muted" : "text-[#ff8fa3]"}`}>
            {suma === total ? `Suman $${formatear(total) || "0"}, el total del pago.` : `Suman $${formatear(suma) || "0"} y el pago es de $${formatear(total) || "0"}: deben coincidir.`}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">Si llegó a la cuenta de uno de ustedes (o una parte a cada uno), se considera en el reparto.</p>
      )}
    </fieldset>
  );
}
