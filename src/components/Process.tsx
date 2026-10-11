import { process } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

export function Process() {
  return (
    <section id="proceso" className="border-t border-line bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Proceso" title="Así trabajamos juntos">
          Un camino claro, sin sorpresas, de la primera conversación al sitio publicado.
        </SectionHeading>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-surface p-6">
              <span className="font-mono text-sm text-accent">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
