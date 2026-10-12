import { site } from "@/content/site";
import { DotGlobe } from "./DotGlobe";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-5 py-20 text-center md:px-8"
    >
      {/* Globo animado: ocupa toda la portada, detrás del eslogan. El centro se atenúa para que el texto se lea. */}
      <DotGlobe className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:radial-gradient(ellipse_48%_36%_at_50%_50%,rgb(0_0_0/0.42),black_100%)]" />

      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-sm text-fg/80 [text-shadow:0_0_14px_rgb(11_11_12),0_0_26px_rgb(11_11_12/0.9)]">Desarrollo web a medida · {site.location}</p>

        <h1 className="mt-7 text-balance text-[clamp(2.1rem,6vw,5rem)] font-medium leading-[1.04] tracking-[-0.04em] [text-shadow:0_0_30px_rgb(11_11_12/0.9)]">
          Desarrollamos sitios web y tiendas online <span className="text-accent">a medida.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-fg/80 [text-shadow:0_0_16px_rgb(11_11_12),0_0_30px_rgb(11_11_12/0.9)]">
          Diseñamos y programamos la web de tu negocio desde cero, pensada en cómo vendes y en quién te compra.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <a href="#contacto" className="btn btn-primary">
            Cotiza tu proyecto <span aria-hidden="true">→</span>
          </a>
          <a
            href="#proyectos"
            className="font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
          >
            Ver proyectos
          </a>
        </div>
      </div>
    </section>
  );
}
