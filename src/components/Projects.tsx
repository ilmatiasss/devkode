import Image from "next/image";
import { projects } from "@/content/site";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section
      id="proyectos"
      index="01"
      title="Proyectos"
      intro="Tiendas y plataformas que diseñamos y programamos desde cero."
    >
      <ul className="border-t border-line">
        {projects.map((project) => (
          <li
            key={project.name}
            className="grid grid-cols-[84px_1fr] gap-x-5 gap-y-4 border-b border-line py-7 sm:grid-cols-[128px_1fr] md:gap-x-8 lg:grid-cols-[128px_1fr_auto]"
          >
            <div className="flex aspect-square items-center justify-center rounded-[3px] border border-line bg-surface">
              {project.logo ? (
                <Image
                  src={project.logo}
                  alt={`Logo de ${project.name}`}
                  sizes="128px"
                  className="h-auto w-auto max-w-[86%] object-contain"
                  style={{ maxHeight: project.logoMaxHeight ?? "86%" }}
                />
              ) : (
                <span className="text-sm font-semibold">{project.name}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-2xl font-medium tracking-tight">{project.name}</h3>
              <p className="mt-1 font-mono text-xs text-muted">{project.kind}</p>
              <p className="mt-3 max-w-xl leading-relaxed text-muted">{project.description}</p>
            </div>

            <div className="col-start-2 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] lg:col-start-3 lg:flex-col lg:items-end lg:justify-between lg:py-1">
              <span className={project.status ? "text-accent" : "text-muted"}>
                {project.status ?? "En línea"}
              </span>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {project.domain} ↗<span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
