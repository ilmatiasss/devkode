"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "ok" | "error";

const field =
  "mt-2 block w-full border border-bg bg-bg px-4 py-3 text-fg placeholder:text-muted focus-visible:outline-bg";

export function ContactForm({ projectTypes, email }: { projectTypes: string[]; email: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    setStatus("sending");
    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" className="bg-bg p-7 text-fg md:p-9">
        <p className="text-2xl font-medium tracking-tight">¡Gracias! Recibimos tu mensaje.</p>
        <p className="mt-3 leading-relaxed text-muted">Te respondemos a tu correo lo antes posible.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-medium underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-accent"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      {/* Campo trampa contra robots: las personas no lo ven */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No llenar este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="text-sm font-medium">
        Nombre
        <input
          type="text"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="Tu nombre"
          className={field}
        />
      </label>

      <label className="text-sm font-medium">
        Correo
        <input
          type="email"
          name="email"
          required
          maxLength={120}
          autoComplete="email"
          placeholder="tu@correo.cl"
          className={field}
        />
      </label>

      <label className="text-sm font-medium">
        Teléfono <span className="font-normal opacity-70">(opcional)</span>
        <input
          type="tel"
          name="phone"
          maxLength={40}
          autoComplete="tel"
          placeholder="+56 9 1234 5678"
          className={field}
        />
      </label>

      <label className="text-sm font-medium">
        ¿Qué necesitas?
        <select name="type" defaultValue={projectTypes[0]} className={field}>
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium sm:col-span-2">
        Cuéntanos de tu proyecto
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          placeholder="Qué quieres lograr, para cuándo lo necesitas, si ya tienes algo hecho…"
          className={`${field} resize-y`}
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn bg-bg text-fg hover:bg-[#1d1d20] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Pedir cotización"} <span aria-hidden="true">→</span>
        </button>

        <p className="mt-4 max-w-md text-xs leading-relaxed opacity-75">
          Usamos tus datos solo para responder esta solicitud. No los compartimos ni te enviamos publicidad.
        </p>

        <div aria-live="polite">
          {status === "error" ? (
            <p className="mt-4 bg-bg p-4 text-fg">
              No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos directo a{" "}
              <a href={`mailto:${email}`} className="font-medium underline decoration-accent decoration-2 underline-offset-4">
                {email}
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
