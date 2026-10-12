"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Mensaje, Respuesta } from "@/content/asistente";
import { LogoMark } from "./Logo";

const saludo =
  "¡Hola! Cuéntame qué tienes en mente y vemos juntos qué necesitaría tu proyecto: una tienda, una página, un sistema… No importa si todavía no lo tienes claro.";
const inicio = ["Quiero vender online", "Necesito un sistema para mi negocio", "Una página para mi empresa", "No sé por dónde partir"];
const MAX_TURNOS = 10;

const fallos: Record<number, string> = {
  429: "Hemos conversado bastante por ahora. Lo mejor es que me dejes armada la cotización o nos escribas directo.",
};
const fallo = "No pude responderte en este momento. Inténtalo otra vez, o pídenos la cotización directo y lo vemos juntos.";

function Burbuja({ rol, children }: { rol: Mensaje["rol"]; children: ReactNode }) {
  if (rol === "usuario") {
    return (
      <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-on-accent [overflow-wrap:anywhere]">
        {children}
      </p>
    );
  }
  return (
    <div className="flex items-end gap-2.5">
      <span className="mb-0.5 shrink-0">
        <LogoMark size={24} />
      </span>
      <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-bg px-4 py-2.5 text-[15px] leading-relaxed text-fg [overflow-wrap:anywhere]">
        {children}
      </div>
    </div>
  );
}

export function Asistente({ ia, formEnabled, email }: { ia: boolean; formEnabled: boolean; email: string }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [meta, setMeta] = useState<Respuesta | null>(null);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [aviso, setAviso] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);

  const turnos = mensajes.filter((m) => m.rol === "usuario").length;
  const agotado = turnos >= MAX_TURNOS && !escribiendo;
  const esperaAlVisitante = mensajes.length === 0 || mensajes[mensajes.length - 1].rol === "asistente";
  const sugerencias = escribiendo || !esperaAlVisitante || agotado ? [] : mensajes.length === 0 ? inicio : (meta?.sugerencias ?? []);
  const puedeCotizar = turnos >= 1 && esperaAlVisitante && !escribiendo;

  // La conversación se desplaza dentro de su ventana, nunca mueve la página
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ top: lista.scrollHeight, behavior: reducir ? "auto" : "smooth" });
  }, [mensajes, escribiendo, aviso]);

  // El campo crece con lo que se escribe, hasta un máximo
  useEffect(() => {
    const campo = campoRef.current;
    if (!campo) return;
    campo.style.height = "auto";
    campo.style.height = `${Math.min(campo.scrollHeight, 128)}px`;
  }, [texto]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || escribiendo || agotado) return;
    const anteriores = mensajes;
    const historia: Mensaje[] = [...anteriores, { rol: "usuario", texto: limpio }];
    setMensajes(historia);
    setTexto("");
    setAviso("");
    setEscribiendo(true);
    try {
      const response = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historia }),
      });
      if (!response.ok) {
        // Se devuelve el mensaje al campo para que se pueda reintentar sin perder lo escrito
        setMensajes(anteriores);
        setTexto(limpio);
        setAviso(fallos[response.status] ?? fallo);
        return;
      }
      const data: { respuesta: Respuesta } = await response.json();
      setMensajes([...historia, { rol: "asistente", texto: data.respuesta.texto }]);
      setMeta(data.respuesta);
    } catch {
      setMensajes(anteriores);
      setTexto(limpio);
      setAviso(fallo);
    } finally {
      setEscribiendo(false);
    }
  }

  function alTeclear(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void enviar(texto);
    }
  }

  // El resumen que viaja al formulario de cotización (o al correo, si no hay formulario)
  const resumenParaCotizar = () =>
    [
      "Conversación con el asistente de la página:",
      ...mensajes.filter((m) => m.rol === "usuario").map((m) => `- ${m.texto}`),
      "",
      meta ? `Tipo de proyecto que entendió el asistente: ${meta.proyecto}` : "",
      meta?.funciones.length ? `Funciones que podría necesitar: ${meta.funciones.map((f) => f.titulo).join(", ")}` : "",
    ]
      .filter((linea, i, todas) => linea !== "" || (i > 0 && todas[i - 1] !== ""))
      .join("\n")
      .slice(0, 3000);

  function cotizar() {
    window.dispatchEvent(new CustomEvent("devkode:brief", { detail: { type: meta?.proyecto ?? "Aún no lo sé", message: resumenParaCotizar() } }));
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }

  function reiniciar() {
    setMensajes([]);
    setMeta(null);
    setAviso("");
    setTexto("");
  }

  const mailto = `mailto:${email}?subject=${encodeURIComponent("Proyecto web")}&body=${encodeURIComponent(resumenParaCotizar())}`;
  const botonCotizar = "rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-fg";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_0.5fr] lg:gap-14">
      <div className="flex h-[min(36rem,80svh)] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 md:px-5">
          <LogoMark size={30} />
          <div>
            <p className="text-sm font-medium text-fg">Asistente de DevKode</p>
            <p className="text-xs text-muted">{ia ? "Con inteligencia artificial" : "Asistente guiado"}</p>
          </div>
          {mensajes.length > 0 ? (
            <button type="button" onClick={reiniciar} className="ml-auto text-xs text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg">
              Nueva conversación
            </button>
          ) : null}
        </div>

        <div ref={listaRef} tabIndex={0} role="log" aria-label="Conversación con el asistente" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-5">
          <Burbuja rol="asistente">{saludo}</Burbuja>
          {mensajes.map((m, i) => (
            <Burbuja key={i} rol={m.rol}>
              {m.texto}
            </Burbuja>
          ))}
          {escribiendo ? (
            <Burbuja rol="asistente">
              <span className="sr-only">El asistente está escribiendo</span>
              <span aria-hidden="true" className="flex h-[1.4em] items-center gap-1">
                <span className="punto-escribiendo size-1.5 rounded-full bg-muted" />
                <span className="punto-escribiendo size-1.5 rounded-full bg-muted" />
                <span className="punto-escribiendo size-1.5 rounded-full bg-muted" />
              </span>
            </Burbuja>
          ) : null}
          {aviso ? <Burbuja rol="asistente">{aviso}</Burbuja> : null}
        </div>

        <div className="border-t border-line px-4 py-3 md:px-5">
          {sugerencias.length > 0 || puedeCotizar ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {sugerencias.map((sugerencia) => (
                <button
                  key={sugerencia}
                  type="button"
                  onClick={() => void enviar(sugerencia)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg transition-colors hover:border-accent hover:bg-accent/10"
                >
                  {sugerencia}
                </button>
              ))}
              {puedeCotizar && (meta?.listo || agotado) ? (
                formEnabled ? (
                  <button type="button" onClick={cotizar} className={botonCotizar}>
                    Pedir cotización con esta conversación <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <a href={mailto} className={botonCotizar}>
                    Escribirnos con esta conversación <span aria-hidden="true">→</span>
                  </a>
                )
              ) : puedeCotizar ? (
                formEnabled ? (
                  <button type="button" onClick={cotizar} className="px-2 py-1.5 text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg">
                    Pedir la cotización con lo que llevamos
                  </button>
                ) : (
                  <a href={mailto} className="px-2 py-1.5 text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg">
                    Escribirnos con lo que llevamos
                  </a>
                )
              ) : null}
            </div>
          ) : null}

          {agotado ? (
            <p className="text-sm text-muted">Llegamos al límite de esta conversación. Lo mejor ahora es que armemos tu cotización.</p>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void enviar(texto);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={campoRef}
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                onKeyDown={alTeclear}
                rows={1}
                maxLength={600}
                aria-label="Escribe tu mensaje"
                placeholder="Escribe aquí…"
                className="block max-h-32 min-h-10 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-2.5 text-[15px] text-fg placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={escribiendo || texto.trim() === ""}
                aria-label="Enviar mensaje"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-colors hover:bg-fg disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 16V4M5 9l5-5 5 5" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>

      <aside className="min-w-0 space-y-4 text-sm leading-relaxed text-muted lg:pt-2">
        <p>
          Cuéntanos tu idea como se la contarías a un amigo. Te hacemos algunas preguntas y te decimos qué necesitaría tu proyecto: por ejemplo
          catálogo, pasarela de pagos o panel de administración.
        </p>
        <p>Es una orientación, no una cotización: no incluye valores ni plazos.</p>
        <p>
          No escribas datos personales.{ia ? " Tus mensajes se analizan con inteligencia artificial." : ""} Más detalles en la{" "}
          <a href="/privacidad" target="_blank" rel="noopener" className="text-fg underline decoration-accent decoration-2 underline-offset-4">
            política de privacidad<span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
