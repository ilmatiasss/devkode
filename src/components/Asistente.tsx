"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Orientacion } from "@/content/asistente";

type Estado = "reposo" | "analizando" | "listo" | "error";

const ejemplos = [
  "Quiero vender mis productos online y despachar a todo Chile.",
  "Necesito un sistema para gestionar pedidos y repartos de mi negocio.",
  "Quiero una página para mostrar mi empresa y recibir consultas.",
];

const errores: Record<number, string> = {
  400: "Cuéntanos un poco más, al menos una frase sobre lo que necesitas.",
  422: "No logramos entender qué proyecto web necesitas. Cuéntanos qué quieres lograr con tu sitio.",
  429: "Hiciste varias consultas seguidas. Inténtalo de nuevo en un rato, o pídenos la cotización directo.",
};

export function Asistente({ ia, formEnabled, email }: { ia: boolean; formEnabled: boolean; email: string }) {
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("reposo");
  const [mensajeError, setMensajeError] = useState("");
  const [resultado, setResultado] = useState<Orientacion | null>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);

  async function orientar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estado === "analizando") return;
    setEstado("analizando");
    try {
      const response = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      if (!response.ok) {
        setMensajeError(errores[response.status] ?? "No pudimos orientarte ahora. Pídenos la cotización directo y lo vemos juntos.");
        setEstado("error");
        return;
      }
      const data: { orientacion: Orientacion } = await response.json();
      setResultado(data.orientacion);
      setEstado("listo");
      // Lleva la vista y el foco al resultado, para quien usa lector de pantalla o el celular
      requestAnimationFrame(() => {
        resultadoRef.current?.focus({ preventScroll: true });
        resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch {
      setMensajeError("No pudimos orientarte ahora. Pídenos la cotización directo y lo vemos juntos.");
      setEstado("error");
    }
  }

  const esenciales = resultado?.modulos.filter((m) => m.prioridad === "esencial") ?? [];
  const recomendados = resultado?.modulos.filter((m) => m.prioridad === "recomendado") ?? [];

  // El resumen que viaja al formulario de cotización (o al correo, si no hay formulario)
  const resumenParaCotizar = () => {
    if (!resultado) return "";
    return [
      `Mi idea: ${descripcion}`,
      "",
      "Orientación del asistente (sin valores):",
      `Tipo de proyecto: ${resultado.proyecto}`,
      `Esencial: ${esenciales.map((m) => m.titulo).join(", ") || "por definir"}`,
      recomendados.length ? `Recomendado para después: ${recomendados.map((m) => m.titulo).join(", ")}` : "",
    ]
      .filter((linea, i, todas) => linea !== "" || todas[i - 1] !== "")
      .join("\n")
      .slice(0, 3000);
  };

  function cotizar() {
    if (!resultado) return;
    window.dispatchEvent(new CustomEvent("devkode:brief", { detail: { type: resultado.proyecto, message: resumenParaCotizar() } }));
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }

  function reiniciar() {
    setResultado(null);
    setEstado("reposo");
    setMensajeError("");
  }

  const mailto = `mailto:${email}?subject=${encodeURIComponent("Proyecto web")}&body=${encodeURIComponent(resumenParaCotizar())}`;
  const accion = "btn btn-primary";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <form onSubmit={orientar} className="min-w-0 self-start">
        <label htmlFor="idea" className="text-sm font-medium text-fg">
          Cuéntanos tu idea
        </label>
        <textarea
          id="idea"
          required
          minLength={15}
          maxLength={800}
          rows={6}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Qué quieres hacer, para quién, qué necesitas que haga tu sitio…"
          className="mt-2 block w-full resize-y border border-line bg-surface px-4 py-3 text-fg placeholder:text-muted"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>Entre más detalle, mejor la orientación.</span>
          <span aria-hidden="true">{descripcion.length}/800</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Ejemplos para empezar">
          {ejemplos.map((ejemplo) => (
            <button
              key={ejemplo}
              type="button"
              onClick={() => setDescripcion(ejemplo)}
              className="border border-line px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-accent hover:text-fg"
            >
              {ejemplo}
            </button>
          ))}
        </div>

        <button type="submit" disabled={estado === "analizando"} className={`${accion} mt-6 disabled:cursor-wait disabled:opacity-60`}>
          {estado === "analizando" ? "Analizando…" : "Orientarme"} <span aria-hidden="true">→</span>
        </button>

        <p className="mt-4 max-w-md text-xs leading-relaxed text-muted">
          Es una orientación, no una cotización: no incluye valores ni plazos. No escribas datos personales.
          {ia ? " Analizamos tu texto con inteligencia artificial." : ""} Más detalles en la{" "}
          <a href="/privacidad" target="_blank" rel="noopener" className="underline decoration-accent underline-offset-4">
            política de privacidad<span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          .
        </p>

        <div aria-live="polite">
          {estado === "error" ? <p className="mt-4 border border-line bg-surface p-4 text-sm text-fg">{mensajeError}</p> : null}
        </div>
      </form>

      <div ref={resultadoRef} tabIndex={-1} aria-busy={estado === "analizando"} className="min-w-0 outline-none">
        {resultado && estado === "listo" ? (
          <div className="border border-line bg-surface p-6 [overflow-wrap:anywhere] md:p-8">
            <p className="flex items-center gap-3 font-mono text-xs text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Tu orientación{resultado.modo === "ia" ? " · con IA" : ""}
            </p>
            <h3 className="mt-4 text-2xl font-medium tracking-tight text-fg">{resultado.proyecto}</h3>
            <p className="mt-3 leading-relaxed text-muted">{resultado.resumen}</p>

            {[
              { titulo: "Lo esencial", lista: esenciales },
              { titulo: "Para sumar después", lista: recomendados },
            ].map(({ titulo, lista }) =>
              lista.length ? (
                <div key={titulo} className="mt-7">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-fg">{titulo}</h4>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {lista.map((modulo) => (
                      <li key={modulo.id} className="py-3">
                        <p className="font-medium text-fg">{modulo.titulo}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{modulo.descripcion}</p>
                        <p className="mt-1 text-sm leading-relaxed text-accent-soft">{modulo.motivo}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}

            {resultado.preguntas.length ? (
              <div className="mt-7">
                <h4 className="font-mono text-xs uppercase tracking-wider text-fg">Para afinar la cotización, nos ayudaría saber</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {resultado.preguntas.map((pregunta) => (
                    <li key={pregunta} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.65em] h-px w-4 shrink-0 bg-accent" />
                      {pregunta}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-7 text-xs leading-relaxed text-muted">
              Esto es una orientación general y puede no ajustarse a tu caso. La cotización formal la preparamos después de conversar contigo.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {formEnabled ? (
                <button type="button" onClick={cotizar} className={accion}>
                  Pedir cotización con este resumen <span aria-hidden="true">→</span>
                </button>
              ) : (
                <a href={mailto} className={accion}>
                  Escribirnos con este resumen <span aria-hidden="true">→</span>
                </a>
              )}
              <button
                type="button"
                onClick={reiniciar}
                className="text-sm font-medium text-fg underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-accent"
              >
                Empezar de nuevo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-56 flex-col justify-center border border-dashed border-line p-6 text-sm leading-relaxed text-muted md:p-8">
            <p className="font-medium text-fg">Aquí aparecerá tu orientación</p>
            <p className="mt-2">
              Te diremos qué tipo de proyecto parece ser, qué funciones necesitaría (por ejemplo catálogo, pasarela de pagos o panel de
              administración) y qué conviene dejar para después.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
