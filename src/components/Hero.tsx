import { site } from "@/content/site";
import { CodeWindow } from "./CodeWindow";
import { DotGlobe } from "./DotGlobe";

export function Hero() {
  return (
    <section id="inicio" className="relative isolate grid grid-cols-1 overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      {/* Globo animado: ocupa toda la portada, detrás del contenido */}
      <DotGlobe className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_bottom,black_60%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent_8%,black_46%)]" />

      <div className="min-w-0 px-5 pb-14 pt-14 md:px-8 md:pb-20 md:pt-20 lg:border-r lg:border-line">
        <p className="font-mono text-xs text-muted">Desarrollo web a medida · {site.location}</p>

        <h1 className="mt-8 text-[clamp(2.5rem,5.4vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.03em]">
          Desarrollamos sitios web y tiendas online <span className="whitespace-nowrap text-accent">a medida.</span>
        </h1>

        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted">
          Diseñamos y programamos la web de tu negocio desde cero, pensada en cómo vendes y en quién te compra.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href="#contacto" className="btn btn-primary">
            Cotiza tu proyecto <span aria-hidden="true">→</span>
          </a>
          <a href="#proyectos" className="font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent">
            Ver proyectos
          </a>
        </div>
      </div>

      <div className="min-w-0 border-t border-line px-5 py-10 md:px-8 lg:flex lg:items-center lg:border-t-0">
        <CodeWindow className="mx-auto w-full max-w-[540px]" />
      </div>
    </section>
  );
}
