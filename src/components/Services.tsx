import { services } from "@/content/site";
import { Icono } from "./Iconos";
import { MediosDePago } from "./MediosDePago";
import { Section } from "./Section";

// Lista tipográfica: cada servicio es una línea grande con su ícono, que se enciende al pasar el mouse y lleva a su página
export function Services() {
  return (
    <Section id="servicios" label="Servicios" title="Desde una landing para tu próxima campaña hasta un sistema completo.">
      <ol className="border-t border-line">
        {services.map((service, i) => (
          <li key={service.title} className="border-b border-line">
            <a
              href={`/servicios/${service.slug}`}
              className="group grid gap-x-12 gap-y-4 py-7 md:grid-cols-[1fr_minmax(0,26rem)] md:items-center md:py-9"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent md:size-16">
                  <Icono nombre={service.slug} className="size-6 md:size-7" />
                </span>
                <h3 className="flex items-baseline gap-3 text-[clamp(1.7rem,3.6vw,3rem)] font-medium leading-none tracking-[-0.03em] transition-colors group-hover:text-accent">
                  <span className="hidden font-mono text-xs font-normal tracking-normal text-muted sm:inline">{String(i + 1).padStart(2, "0")}</span>
                  {service.title}
                </h3>
              </div>
              <div>
                <p className="leading-relaxed text-muted md:text-[17px]">{service.description}</p>
                {service.tags ? (
                  <div className="mt-4">
                    <MediosDePago nombres={service.tags} />
                  </div>
                ) : null}
                <p className="mt-4 font-medium text-fg underline decoration-accent decoration-2 underline-offset-4 transition-colors group-hover:text-accent">
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
