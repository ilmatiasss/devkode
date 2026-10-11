import { steps } from "@/content/site";
import { Section } from "./Section";

export function Process() {
  return (
    <Section id="proceso" index="03" title="Cómo trabajamos" intro="Sabes en todo momento en qué está tu proyecto.">
      <ol className="grid border-t border-line sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="border-b border-line py-7 sm:px-6 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pl-0 xl:border-b-0 xl:border-r xl:pl-6! xl:first:pl-0! xl:last:border-r-0"
          >
            <span className="font-mono text-xs text-accent">Paso {index + 1}</span>
            <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
