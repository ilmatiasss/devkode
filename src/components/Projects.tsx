import { projects } from "@/content/site";
import { ProjectOrbit } from "./ProjectOrbit";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section id="proyectos" label="Proyectos" title="Tiendas y plataformas que diseñamos y programamos desde cero.">
      <ProjectOrbit projects={projects} />
    </Section>
  );
}
