import type { Metadata } from "next";
import { Icono } from "@/components/Iconos";
import { MediosDePago } from "@/components/MediosDePago";
import { PaginaInterna } from "@/components/PaginaInterna";
import { servicios } from "@/content/servicios";
import { site } from "@/content/site";

// Todos los servicios con una descripción breve; cada uno lleva a su página con el detalle completo

export const metadata: Metadata = {
  title: `Servicios: páginas web, tiendas online y más | ${site.name}`,
  description: "Landing pages, tiendas online, webs corporativas, aplicaciones web, software a medida y mantención mensual. Qué es cada uno y para quién sirve.",
  alternates: { canonical: "/servicios" },
};

export default function Servicios() {
  return (
    <PaginaInterna>
      <section>
        <div className="mx-auto max-w-[1200px] px-5 pt-14 pb-12 md:px-8 md:pt-20 md:pb-16">
          <a href="/" className="text-sm text-muted transition-colors hover:text-fg">
            <span aria-hidden="true">← </span>Inicio
          </a>
          <div className="mt-10 max-w-3xl">
            <p className="flex items-center gap-3 font-mono text-xs text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Servicios
            </p>
            <h1 className="mt-5 text-balance text-[clamp(2.6rem,7vw,5rem)] font-medium leading-[0.98] tracking-[-0.04em]">¿Qué necesita tu negocio?</h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
              Desde una página para tu próxima campaña hasta un sistema completo. Revisa qué es cada servicio y para quién sirve; si no sabes cuál elegir,
              conversemos y te orientamos sin costo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
          <ul className="grid gap-4 md:grid-cols-2">
            {servicios.map((s) => (
              <li key={s.slug}>
                <a href={`/servicios/${s.slug}`} className="group flex h-full flex-col border border-line p-6 transition-colors hover:border-accent/60 hover:bg-surface md:p-8">
                  <span className="grid size-14 place-items-center rounded-full border border-line text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                    <Icono nombre={s.slug} className="size-7" />
                  </span>
                  <h2 className="mt-6 text-2xl font-medium tracking-tight transition-colors group-hover:text-accent md:text-3xl">{s.titulo}</h2>
                  <p className="mt-3 leading-relaxed text-muted md:text-[17px]">{s.bajada}</p>
                  <p className="mt-5 text-sm text-fg">
                    <span className="text-muted">Ideal para: </span>
                    {s.paraQuien[0].replace(/\.$/, "").replace(/^./, (c) => c.toLowerCase())}.
                  </p>
                  {s.etiquetas ? (
                    <div className="mt-5">
                      <MediosDePago nombres={s.etiquetas} />
                    </div>
                  ) : null}
                  <span className="mt-auto pt-7 font-medium text-fg underline decoration-accent decoration-2 underline-offset-4 transition-colors group-hover:text-accent">
                    Ver en detalle <span aria-hidden="true">→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
          <div className="flex flex-col items-start gap-6 border border-line bg-surface/60 p-6 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl">¿No sabes cuál necesitas?</h2>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">Cuéntanos qué quieres lograr y te decimos qué te conviene, aunque sea algo más simple.</p>
            </div>
            <a href="/#contacto" className="btn btn-primary shrink-0">
              Conversemos <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </PaginaInterna>
  );
}
