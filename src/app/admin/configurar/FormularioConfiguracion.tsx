"use client";

import { useActionState } from "react";
import { entrada } from "@/components/admin/ui";
import { configurar } from "./acciones";

function Cuenta({ n, obligatoria, valores }: { n: 1 | 2; obligatoria: boolean; valores?: Record<string, string> }) {
  return (
    <fieldset className="grid gap-4 border border-line p-5 sm:grid-cols-2">
      <legend className="px-2 text-sm font-medium">{obligatoria ? `Cuenta ${n}` : `Cuenta ${n} (tu socio, opcional)`}</legend>
      <label className="block text-sm">
        <span className="text-muted">Nombre</span>
        <input name={`nombre${n}`} required={obligatoria} autoComplete="off" defaultValue={valores?.[`nombre${n}`]} className={entrada} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Correo</span>
        <input name={`email${n}`} type="email" required={obligatoria} autoComplete="off" defaultValue={valores?.[`email${n}`]} className={entrada} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Contraseña (mínimo 12 caracteres)</span>
        <input name={`clave${n}`} type="password" minLength={12} required={obligatoria} autoComplete="new-password" className={entrada} />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Repetir contraseña</span>
        <input name={`repetir${n}`} type="password" minLength={12} required={obligatoria} autoComplete="new-password" className={entrada} />
      </label>
    </fieldset>
  );
}

export function FormularioConfiguracion() {
  const [estado, accion, enviando] = useActionState(configurar, null);
  return (
    <form action={accion} className="space-y-6">
      <label className="block text-sm">
        <span className="text-muted">Código de configuración (variable ADMIN_SETUP_TOKEN en Vercel)</span>
        <input name="codigo" type="password" required autoComplete="off" className={entrada} />
      </label>
      <Cuenta n={1} obligatoria valores={estado?.valores} />
      <Cuenta n={2} obligatoria={false} valores={estado?.valores} />
      <div aria-live="polite">
        {estado?.error ? <p className="border border-[#5b2330] bg-[#2a1118] px-3 py-2 text-sm text-[#ffc2cd]">{estado.error}</p> : null}
      </div>
      <button type="submit" disabled={enviando} className="btn btn-primary disabled:opacity-60">
        {enviando ? "Creando…" : "Crear cuentas y entrar"}
      </button>
    </form>
  );
}
