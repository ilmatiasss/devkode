"use client";

import { useActionState } from "react";
import { botonPrimario, entrada } from "@/components/admin/ui";
import { iniciarSesion } from "./acciones";

export function FormularioIngreso() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, null);
  return (
    <form action={accion} className="space-y-4">
      <label className="block text-sm">
        <span className="text-muted">Correo</span>
        <input name="email" type="email" required autoComplete="username" defaultValue={estado?.email} className={entrada} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Contraseña</span>
        <input name="clave" type="password" required autoComplete="current-password" className={entrada} />
      </label>
      <div aria-live="polite">
        {estado?.error ? <p className="rounded-xl border border-[#5b2330] bg-[#2a1118] px-3 py-2 text-sm text-[#ffc2cd]">{estado.error}</p> : null}
      </div>
      <button type="submit" disabled={enviando} className={`${botonPrimario} w-full`}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
