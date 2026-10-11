import Image from "next/image";
import { projects } from "@/content/site";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section
      id="proyectos"
      label="Proyectos"
      title="Proyectos que hemos desarrollado."
      intro="Tiendas y plataformas que diseñamos y programamos desde cero."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {projects.map((project) => (
          <article key={project.name} className="card reveal group flex flex-col overflow-hidden">
            <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-line bg-[#0b0c0f]">
              <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
                style={{ background: project.tint }}
              />
              {project.logo ? (
                <Image
                  src={project.logo}
                  alt={`Logo de ${project.name}`}
                  sizes="220px"
                  className="relative h-auto max-h-[72%] w-auto max-w-[62%] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="relative text-3xl font-bold tracking-tight">{project.name}</span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-tight">{project.name}</h3>
                {project.status ? (
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] text-accent">
                    {project.status}
                  </span>
                ) : null}
              </div>
              <p className="font-mono text-xs text-muted">{project.kind}</p>
              <p className="leading-relaxed text-muted">{project.description}</p>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-sm text-fg transition-colors hover:text-accent"
                >
                  {project.domain} <span aria-hidden="true">↗</span>
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
