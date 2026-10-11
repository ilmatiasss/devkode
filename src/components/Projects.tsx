import { projects } from "@/content/site";
import { ArrowUpRight } from "./Icons";
import { SectionHeading } from "./SectionHeading";

export function Projects() {
  return (
    <section id="proyectos" className="border-t border-line bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Proyectos" title="En lo que estoy trabajando">
          Plataformas y tiendas que estoy construyendo ahora mismo.
        </SectionHeading>

        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.name} className="flex flex-col rounded-xl border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">{project.kind}</p>
                <span className="shrink-0 rounded-full border border-accent-dim px-2.5 py-0.5 font-mono text-xs text-accent">
                  {project.status}
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold">{project.name}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-muted">{project.description}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded-md bg-surface-2 px-2.5 py-1 text-xs text-muted">
                    {tag}
                  </li>
                ))}
              </ul>

              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {project.domain}
                  <ArrowUpRight />
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
