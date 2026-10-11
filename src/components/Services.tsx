import { services } from "@/content/site";
import { Section } from "./Section";

export function Services() {
  const [main, ...others] = services;

  return (
    <Section
      id="servicios"
      label="Servicios"
      title="Lo que hacemos."
      intro="Desde una landing para tu próxima campaña hasta un sistema completo para tu operación."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Servicio principal, destacado */}
        <article className="card reveal relative overflow-hidden p-8 md:col-span-2 md:row-span-2 md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.8), transparent)" }}
          />
          <div className="relative flex h-full flex-col">
            <span className="font-mono text-sm text-accent">01</span>
            <h3 className="mt-8 text-3xl font-bold tracking-tight md:text-4xl">{main.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">{main.description}</p>
            {main.tags ? (
              <ul className="mt-auto flex flex-wrap gap-2 pt-10">
                {main.tags.map((tag) => (
                  <li key={tag} className="rounded-lg border border-line bg-bg/60 px-3 py-1.5 font-mono text-xs text-fg">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>

        {others.map((service, i) => (
          <article key={service.title} className="card reveal group flex flex-col p-7">
            <span className="font-mono text-sm text-muted transition-colors group-hover:text-accent">
              {String(i + 2).padStart(2, "0")}
            </span>
            <h3 className="mt-8 text-xl font-bold tracking-tight">{service.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{service.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
