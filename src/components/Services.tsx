import { services } from "@/content/site";
import { Section } from "./Section";

export function Services() {
  return (
    <Section
      id="servicios"
      index="02"
      title="Servicios"
      intro="Desde una landing para tu próxima campaña hasta un sistema completo para tu operación."
    >
      <ol className="border-t border-line">
        {services.map((service, i) => (
          <li
            key={service.title}
            className="grid grid-cols-[2.5rem_1fr] gap-x-6 gap-y-2 border-b border-line py-6 xl:grid-cols-[2.5rem_16rem_1fr] xl:gap-x-8"
          >
            <span className="font-mono text-xs text-muted pt-1.5">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-xl font-medium tracking-tight">{service.title}</h3>
            <div className="col-start-2 xl:col-start-3 xl:row-start-1">
              <p className="max-w-xl leading-relaxed text-muted">{service.description}</p>
              {service.tags ? (
                <p className="mt-3 font-mono text-xs text-fg">{service.tags.join(" · ")}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
