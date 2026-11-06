import { services } from "@/content/site";
import { Section } from "./Section";

// Lista tipográfica: cada servicio es una línea grande que se enciende al pasar el mouse y lleva a su página
export function Services() {
  return (
    <Section
      id="servicios"
      label="Servicios"
      title="Desde una landing para tu próxima campaña hasta un sistema completo."
    >
      <ol className="border-t border-line">
        {services.map((service, i) => (
          <li key={service.title} className="border-b border-line">
            <a
              href={`/servicios/${service.slug}`}
              className="group grid gap-x-12 gap-y-4 py-7 md:grid-cols-[1fr_minmax(0,26rem)] md:items-baseline md:py-9"
            >
              <h3 className="flex items-baseline gap-4 text-[clamp(1.8rem,3.6vw,3rem)] font-medium leading-none tracking-[-0.03em] transition-colors group-hover:text-accent">
                <span className="font-mono text-xs font-normal tracking-normal text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {service.title}
              </h3>
              <div>
                <p className="leading-relaxed text-muted">
                  {service.description}
                </p>
                {service.tags ? (
                  <p className="mt-3 font-mono text-xs text-fg">
                    {service.tags.join(" · ")}
                  </p>
                ) : null}
                <p className="mt-4 text-sm font-medium text-fg underline decoration-accent decoration-2 underline-offset-4 transition-colors group-hover:text-accent">
                  Qué es y para quién <span aria-hidden="true">→</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}
