import { steps } from "@/content/site";
import { Section } from "./Section";

export function Process() {
  return (
    <Section
      id="proceso"
      label="Cómo trabajamos"
      title="Sin sorpresas, de principio a fin."
      intro="Sabes en todo momento en qué está tu proyecto."
    >
      <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-[2.15rem] hidden h-px bg-gradient-to-r from-accent/70 via-line to-transparent lg:block"
        />
        {steps.map((step, index) => (
          <li key={step.title} className="reveal relative">
            <span className="relative z-10 inline-flex size-[4.3rem] items-center justify-center rounded-2xl border border-line bg-surface font-mono text-lg text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-3 max-w-xs leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
