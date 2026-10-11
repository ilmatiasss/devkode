import { services } from "@/content/site";
import { ServiceGlyph } from "./Icons";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  return (
    <section id="servicios" className="border-t border-line py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Servicios" title="Lo que puedo construir para ti">
          Desde una página simple hasta un sistema completo. Cada proyecto se diseña según tu negocio, sin plantillas
          genéricas.
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent-dim"
            >
              <div className="mb-5 inline-flex size-11 items-center justify-center rounded-lg bg-surface-2 text-accent">
                <ServiceGlyph name={service.icon} />
              </div>
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{service.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {service.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-accent" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
