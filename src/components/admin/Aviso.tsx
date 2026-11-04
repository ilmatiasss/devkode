"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mensajeDe } from "@/lib/admin/formato";
import { Icono } from "./Icono";

const avisos: Record<string, string> = {
  guardado: "Cambios guardados",
  eliminado: "Eliminado",
  pago: "Pago registrado y próximo cobro actualizado",
  mantencion: "Mantención registrada como ingreso",
  transferencia: "Transferencia registrada",
  clave: "Contraseña actualizada",
  sesiones: "Se cerraron las demás sesiones",
};

// Notificación flotante. Lee ?ok= o ?error= de la dirección, se muestra animada y se va sola
// (los errores se quedan hasta cerrarlos). Luego limpia la dirección para que no reaparezca.
export function Aviso() {
  const params = useSearchParams();
  const ruta = usePathname();
  const ok = params.get("ok");
  const error = params.get("error");
  const texto = mensajeDe(error) ?? (ok ? avisos[ok] : undefined);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!texto) return;
    setVisible(true);
    const limpio = new URLSearchParams(params);
    limpio.delete("ok");
    limpio.delete("error");
    const destino = `${ruta}${limpio.size ? `?${limpio}` : ""}`;
    window.history.replaceState(null, "", destino);
    if (error) return;
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [texto, error, params, ruta]);

  if (!texto) return null;
  const esError = Boolean(mensajeDe(error));
  return (
    <div
      role={esError ? "alert" : "status"}
      className={`fixed inset-x-4 top-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md transition-all duration-300 md:right-6 md:left-auto md:top-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      } ${esError ? "border-[#5b2330] bg-[#2a1118]/95 text-[#ffd1da]" : "border-[#1f4d33] bg-[#0f2219]/95 text-[#c8f5d7]"}`}
    >
      <span className={`grid size-7 shrink-0 place-items-center rounded-full ${esError ? "bg-[#5b2330]" : "bg-[#1f4d33]"}`}>
        <Icono nombre={esError ? "alerta" : "check"} className="size-4" />
      </span>
      <span className="flex-1">{texto}</span>
      <button type="button" onClick={() => setVisible(false)} aria-label="Cerrar aviso" className="rounded-lg p-1 opacity-70 hover:opacity-100">
        <Icono nombre="cerrar" className="size-4" />
      </button>
    </div>
  );
}
