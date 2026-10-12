import Image from "next/image";
import { projects } from "@/content/site";
import { ProjectsGlobe } from "./ProjectsGlobe";
import { Section } from "./Section";

// Los tres proyectos siempre se ven a la vez: tres columnas parejas en pantallas anchas y
// tres filas compactas en celular. De fondo, un globo de puntos con los colores de cada uno.
export function Projects() {
  return (
    <Section id="proyectos" label="Proyectos" title="Tiendas y plataformas que diseñamos y programamos desde cero.">
      <div className="relative isolate">
        <ProjectsGlobe
          colors={projects.map((project) => project.color)}
          className="pointer-events-none absolute -left-4 -top-12 -z-10 h-[calc(100%+6rem)] w-[calc(100%+2rem)] [mask-image:radial-gradient(ellipse_closest-side,black_82%,transparent)] md:-left-8 md:w-[calc(100%+4rem)]"
        />

        <ul className="grid gap-3 md:grid-cols-3 md:gap-6 lg:gap-10">
          {projects.map((project) => (
            <li
              key={project.name}
              className="flex items-center gap-4 border border-line bg-bg/40 p-3 md:flex-col md:items-center md:gap-0 md:p-8 md:text-center"
            >
              <div
                className="flex size-[84px] shrink-0 items-center justify-center border border-b-2 border-line bg-[#0b0c0f] md:size-[132px]"
                style={{ borderBottomColor: project.color }}
              >
                {project.logo ? (
                  <Image
                    src={project.logo}
                    alt={`Logo de ${project.name}`}
                    sizes="(min-width: 768px) 132px, 84px"
                    className="h-auto w-auto max-w-[72%] object-contain"
                    style={{ maxHeight: project.logoMaxHeight ?? "72%" }}
                  />
                ) : (
                  <span className="text-sm font-semibold">{project.name}</span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col md:mt-7 md:items-center">
                <h3 className="text-xl font-medium tracking-tight md:text-2xl">{project.name}</h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted md:mt-1 md:justify-center md:text-xs">
                  {project.kind}
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: project.status ? "var(--color-accent)" : "currentColor" }}
                      aria-hidden="true"
                    />
                    <span className={project.status ? "text-accent" : undefined}>{project.status ?? "En línea"}</span>
                  </span>
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted md:mt-4 md:max-w-[17rem] md:text-base md:leading-relaxed">
                  {project.description}
                </p>
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 self-start font-mono text-xs underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent md:mt-auto md:self-center md:pt-6 md:text-[13px]"
                  >
                    {project.domain} <span aria-hidden="true">↗</span>
                    <span className="sr-only">(se abre en una pestaña nueva)</span>
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
