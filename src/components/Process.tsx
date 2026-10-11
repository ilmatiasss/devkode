import { steps } from "@/content/site";
import { Section } from "./Section";

export function Process() {
  return (
    <Section id="proceso" title="Cómo trabajo">
      <ol className="grid gap-x-10 gap-y-10 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-line pt-5">
            <span className="display text-xl text-accent">{index + 1}</span>
            <div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-md text-lg leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
