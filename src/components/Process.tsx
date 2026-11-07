import { steps } from "@/content/site";
import { Icono } from "./Iconos";
import { Section } from "./Section";

// Línea de tiempo con ícono y plazo en cada paso: vertical en celular, horizontal en pantallas anchas
export function Process() {
  return (
    <Section id="proceso" label="Cómo trabajamos" title="Sabes en todo momento en qué está tu proyecto.">
      <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
        {steps.map((step, index) => (
          <li key={step.title} className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 lg:block">
            {/* Tramo de línea hasta el paso siguiente */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute top-14 -bottom-10 left-7 w-px bg-line lg:top-7 lg:right-[-2rem] lg:bottom-auto lg:left-14 lg:h-px lg:w-auto"
              />
            ) : null}
            <span className="relative grid size-14 place-items-center rounded-full border border-accent/60 bg-bg text-accent">
              <Icono nombre={step.icono} className="size-6" />
            </span>
            <div className="lg:mt-6 lg:pr-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-muted">Paso {index + 1}</span>
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent-soft">{step.plazo}</span>
              </div>
              <h3 className="mt-2 text-xl font-medium tracking-tight md:text-2xl">{step.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted md:text-[17px]">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
