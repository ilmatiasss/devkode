"use client";

import type { ReactNode } from "react";

// Botón de envío que pide confirmación antes de una acción que no se puede deshacer
export function BotonConfirmar({ mensaje, className, children }: { mensaje: string; className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(mensaje)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
