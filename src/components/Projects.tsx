import { projects } from "@/content/site";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section
      id="proyectos"
      title="Proyectos"
      intro="Lo que hemos hecho y en lo que estamos trabajando ahora."
      className="bg-paper-2"
    >
      <ul className="border-b border-ink/25">
        {projects.map((project) => (
          <li
            key={project.name}
            className="grid gap-4 border-t border-ink/25 py-9 md:grid-cols-[5fr_7fr] md:gap-10 md:py-12"
          >
            <div>
              <h3 className="display text-4xl leading-none md:text-5xl">{project.name}</h3>
              <p className="mt-3 text-[15px] text-muted">
                {project.kind}
                {project.status ? (
                  <>
                    {" · "}
                    <span className="text-accent">{project.status}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="md:pt-1">
              <p className="max-w-xl text-lg leading-relaxed">{project.description}</p>
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link mt-5 inline-block font-semibold"
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
