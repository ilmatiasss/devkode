import { steps } from "@/content/site";
import { Section } from "./Section";

// Línea de tiempo: vertical en celular, horizontal en pantallas anchas
export function Process() {
  return (
    <Section id="proceso" label="Cómo trabajamos" title="Sabes en todo momento en qué está tu proyecto.">
      <ol className="grid lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative border-l border-line pb-10 pl-7 last:pb-0 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-8"
          >
            <span
              className="absolute -left-[5px] top-1.5 size-[9px] rounded-full bg-accent lg:-top-[5px] lg:left-0"
              aria-hidden="true"
            />
            <span className="font-mono text-xs text-muted">Paso {index + 1}</span>
            <h3 className="mt-3 text-xl font-medium tracking-tight">{step.title}</h3>
            <p className="mt-2 max-w-xs leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
