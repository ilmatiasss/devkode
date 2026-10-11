import { services } from "@/content/site";
import { Section } from "./Section";

export function Services() {
  return (
    <Section
      id="servicios"
      title="Qué hago"
      intro="Desde una página sencilla hasta un sistema completo. Cada proyecto parte de cero, según lo que necesita tu negocio."
    >
      <ul className="border-b border-line">
        {services.map((service) => (
          <li
            key={service.title}
            className="grid gap-3 border-t border-line py-7 md:grid-cols-[5fr_7fr] md:gap-10 md:py-9"
          >
            <h3 className="display text-2xl md:text-3xl">{service.title}</h3>
            <p className="max-w-xl text-lg leading-relaxed text-muted">{service.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
