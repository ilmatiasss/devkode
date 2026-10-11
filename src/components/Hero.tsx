import { site } from "@/content/site";
import { CodeWindow } from "./CodeWindow";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[620px] w-[1100px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.7), transparent)" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-28">
        <div className="min-w-0">
          <p className="label fade-up">{`// Desarrollo web a medida · ${site.location}`}</p>

          <h1
            className="fade-up mt-6 text-[clamp(2.5rem,5.6vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.035em]"
            style={{ animationDelay: "80ms" }}
          >
            Desarrollamos sitios web y tiendas online{" "}
            <span className="text-gradient whitespace-nowrap">a medida.</span>
          </h1>

          <p
            className="fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "160ms" }}
          >
            Diseñamos y programamos la web de tu negocio desde cero, con tecnología moderna, para que se vea bien,
            cargue rápido y te ayude a vender.
          </p>

          <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a href="#contacto" className="btn btn-primary">
              Cotiza tu proyecto <span aria-hidden="true">→</span>
            </a>
            <a href="#proyectos" className="btn btn-ghost">
              Ver proyectos
            </a>
          </div>
        </div>

        <CodeWindow className="fade-up mx-auto w-full min-w-0 max-w-[580px]" />
      </div>
    </section>
  );
}
