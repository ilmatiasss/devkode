import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icono } from "@/components/Iconos";
import { MediosDePago } from "@/components/MediosDePago";
import { PaginaInterna } from "@/components/PaginaInterna";
import { servicioPorSlug, servicios } from "@/content/servicios";
import { contact, site } from "@/content/site";

// Una página por servicio: qué es, para qué sirve, para quién, qué potencia, qué incluye y preguntas

export function generateStaticParams() {
  return servicios.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const servicio = servicioPorSlug((await params).slug);
  if (!servicio) return {};
  const titulo = `${servicio.titulo}: qué son y para quién | ${site.name}`;
  return {
    title: titulo,
    description: servicio.bajada,
    alternates: { canonical: `/servicios/${servicio.slug}` },
    openGraph: { title: titulo, description: servicio.bajada, url: `${site.url}/servicios/${servicio.slug}`, siteName: site.name, locale: "es_CL", type: "website", images: ["/og.png"] },
  };
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs text-accent">
      <span className="h-px w-8 bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}

function Lista({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed">
          <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Bloque({ etiqueta, titulo, children }: { etiqueta: string; titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-14 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16 md:px-8 md:py-20">
        <div>
          <Etiqueta>{etiqueta}</Etiqueta>
          <h2 className="mt-4 text-balance text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.02em]">{titulo}</h2>
        </div>
        <div className="text-muted md:text-lg">{children}</div>
      </div>
    </section>
  );
}

export default async function PaginaServicio({ params }: { params: Promise<{ slug: string }> }) {
  const servicio = servicioPorSlug((await params).slug);
  if (!servicio) notFound();
  const otros = servicios.filter((s) => s.slug !== servicio.slug);

  // Datos estructurados para Google: el servicio y sus preguntas frecuentes
  const datos = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: servicio.titulo,
      description: servicio.bajada,
      areaServed: "CL",
      provider: { "@type": "Organization", name: site.name, url: site.url },
      url: `${site.url}/servicios/${servicio.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: servicio.preguntas.map((p) => ({ "@type": "Question", name: p.pregunta, acceptedAnswer: { "@type": "Answer", text: p.respuesta } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />

      <PaginaInterna>
        <section>
          <div className="mx-auto max-w-[1200px] px-5 pt-14 pb-16 md:px-8 md:pt-20 md:pb-24">
            <a href="/servicios" className="text-sm text-muted transition-colors hover:text-fg">
              <span aria-hidden="true">← </span>Todos los servicios
            </a>
            <div className="mt-10 max-w-4xl">
              <span className="grid size-16 place-items-center rounded-full border border-accent/60 text-accent md:size-20">
                <Icono nombre={servicio.slug} className="size-8 md:size-10" />
              </span>
              <div className="mt-8">
                <Etiqueta>Servicio</Etiqueta>
              </div>
              <h1 className="mt-5 text-balance text-[clamp(2.6rem,7vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">{servicio.titulo}</h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{servicio.bajada}</p>
              {servicio.etiquetas ? (
                <div className="mt-6">
                  <MediosDePago nombres={servicio.etiquetas} grande />
                </div>
              ) : null}
              <a href="/#contacto" className="btn btn-primary mt-10">
                Conversemos tu proyecto
              </a>
            </div>
          </div>
        </section>

        <Bloque etiqueta="Qué es" titulo={servicio.queEsTitulo}>
          <div className="space-y-5 leading-relaxed">
            {servicio.queEs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Bloque>

        <Bloque etiqueta="Para qué sirve" titulo="Para qué sirve">
          <Lista items={servicio.paraQue} />
        </Bloque>

        <Bloque etiqueta="Para quién" titulo="Para quién es">
          <Lista items={servicio.paraQuien} />
        </Bloque>

        <Bloque etiqueta="Ejemplos" titulo="Así se ve en la práctica">
          <ul className="grid gap-3">
            {servicio.ejemplos.map((e) => (
              <li key={e} className="border border-line bg-surface/60 p-5 leading-relaxed">
                {e}
              </li>
            ))}
          </ul>
        </Bloque>

        <section className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
            <Etiqueta>Qué puede potenciar</Etiqueta>
            <h2 className="mt-4 max-w-2xl text-balance text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.02em]">
              Lo que puede hacer por tu negocio
            </h2>
            <ul className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {servicio.potencia.map((p, i) => (
                <li key={p.titulo} className="bg-bg p-6 md:p-8">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-medium tracking-tight">{p.titulo}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{p.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Bloque etiqueta="Qué incluye" titulo="Qué incluye">
          <Lista items={servicio.incluye} />
          {servicio.cuandoNo ? (
            <p className="mt-8 border-l-2 border-accent pl-4 text-base leading-relaxed">
              <span className="font-medium text-fg">¿Cuándo no es para ti? </span>
              {servicio.cuandoNo}
            </p>
          ) : null}
        </Bloque>

        <Bloque etiqueta="Cómo lo hacemos" titulo="Cómo lo hacemos, paso a paso">
          <ol className="space-y-6">
            {servicio.pasos.map((p, i) => (
              <li key={p.titulo} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                <span className="grid size-10 place-items-center rounded-full border border-accent/60 font-mono text-sm text-accent">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-fg md:text-xl">{p.titulo}</h3>
                  <p className="mt-1 leading-relaxed">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </Bloque>

        <Bloque etiqueta="Preguntas frecuentes" titulo="Preguntas frecuentes">
          <div className="divide-y divide-line border-y border-line">
            {servicio.preguntas.map((p) => (
              <details key={p.pregunta} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-fg [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">{p.pregunta}</span>
                  <span aria-hidden="true" className="font-mono text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-base leading-relaxed">{p.respuesta}</p>
              </details>
            ))}
          </div>
        </Bloque>

        <section className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
            <div className="relative overflow-hidden bg-accent px-6 py-12 text-on-accent md:px-14 md:py-16">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--color-on-accent)_20%,transparent)_1px,transparent_1px)] [background-size:16px_16px]"
              />
              <div className="relative max-w-2xl">
                <h2 className="text-balance text-[clamp(2rem,4.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">¿Te hace sentido?</h2>
                <p className="mt-5 text-lg leading-relaxed opacity-80">
                  Cuéntanos qué necesitas y te decimos con honestidad si esto es lo que te conviene o si hay algo más simple. La primera conversación no tiene costo.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <a href="/#contacto" className="inline-flex items-center bg-on-accent px-6 py-3.5 font-medium text-accent transition-opacity hover:opacity-90">
                    Pedir cotización
                  </a>
                  <a href={`mailto:${contact.email}?subject=${encodeURIComponent(servicio.titulo)}`} className="font-medium underline decoration-2 underline-offset-[6px]">
                    {contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
            <Etiqueta>Otros servicios</Etiqueta>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((s) => (
                <li key={s.slug} className="border border-line">
                  <a href={`/servicios/${s.slug}`} className="group block h-full p-6 transition-colors hover:bg-surface">
                    <Icono nombre={s.slug} className="size-6 text-accent" />
                    <h3 className="mt-4 text-lg font-medium tracking-tight transition-colors group-hover:text-accent">
                      {s.titulo} <span aria-hidden="true">→</span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.resumen}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </PaginaInterna>

    </>
  );
}
