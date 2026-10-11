import Image from "next/image";
import { projects } from "@/content/site";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section id="proyectos" label="Proyectos" title="Tiendas y plataformas que diseñamos y programamos desde cero.">
      <ul className="grid border border-line md:grid-cols-3">
        {projects.map((project) => (
          <li
            key={project.name}
            className="group flex flex-col border-b border-line transition-colors last:border-b-0 hover:bg-surface md:border-b-0 md:border-r md:last:border-r-0"
          >
            {/* Logo sobre una trama de puntos, como eco del globo de la portada */}
            <div className="relative flex aspect-[4/3] items-center justify-center border-b border-line bg-[radial-gradient(rgb(255_255_255/0.1)_1px,transparent_1px)] [background-size:16px_16px]">
              <span className="absolute right-4 top-4 flex items-center gap-2 font-mono text-[11px] text-muted">
                <span
                  className={`size-1.5 rounded-full ${project.status ? "bg-accent" : "bg-fg/50"}`}
                  aria-hidden="true"
                />
                <span className={project.status ? "text-accent" : undefined}>{project.status ?? "En línea"}</span>
              </span>
              {project.logo ? (
                <Image
                  src={project.logo}
                  alt={`Logo de ${project.name}`}
                  sizes="(min-width: 768px) 320px, 80vw"
                  className="h-auto w-auto max-w-[62%] object-contain transition-transform duration-300 group-hover:scale-105"
                  style={{ maxHeight: project.logoMaxHeight ?? "62%" }}
                />
              ) : (
                <span className="text-2xl font-semibold">{project.name}</span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-6 md:p-7">
              <h3 className="text-2xl font-medium tracking-tight">{project.name}</h3>
              <p className="mt-1 font-mono text-xs text-muted">{project.kind}</p>
              <p className="mt-4 leading-relaxed text-muted">{project.description}</p>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 pt-1 font-mono text-[13px] underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent md:mt-auto"
                >
                  {project.domain} <span aria-hidden="true">↗</span>
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
