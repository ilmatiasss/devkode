"use client";

import { useState } from "react";

const formatear = (digitos: string) => (digitos ? Number(digitos).toLocaleString("es-CL") : "");

// Campo de pesos que agrega los puntos de miles mientras se escribe. Envía "1.250.000",
// que el servidor entiende igual que "1250000".
export function InputMonto({
  name,
  defaultValue,
  required,
  grande = false,
  className = "",
  ariaLabel,
}: {
  name: string;
  defaultValue?: number | string;
  required?: boolean;
  grande?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const inicial = String(defaultValue ?? "").replace(/\D/g, "");
  const [valor, setValor] = useState(formatear(inicial));
  return (
    <div className={`relative ${className}`}>
      <span className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted ${grande ? "text-2xl md:text-3xl" : "text-[15px]"}`}>$</span>
      <input
        name={name}
        value={valor}
        onChange={(e) => setValor(formatear(e.target.value.replace(/\D/g, "").slice(0, 10)))}
        inputMode="numeric"
        autoComplete="off"
        required={required}
        aria-label={ariaLabel}
        pattern="[\d.]+"
        placeholder="0"
        className={`block w-full rounded-xl border border-line bg-bg/70 pr-3.5 text-fg [color-scheme:dark] placeholder:text-muted/50 transition-colors hover:border-[#3a3a40] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          grande ? "py-3 pl-9 font-display text-3xl font-medium tracking-tight md:pl-10 md:text-4xl" : "mt-1.5 py-2.5 pl-7 text-[15px]"
        }`}
      />
    </div>
  );
}
