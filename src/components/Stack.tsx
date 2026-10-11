import { stack } from "@/content/site";
import { Section } from "./Section";

export function Stack() {
  return (
    <Section
      id="herramientas"
      title="Herramientas"
      intro="Elegimos según lo que necesita cada proyecto. Estas son las que más usamos."
    >
      <dl className="grid border-b border-line md:grid-cols-2 md:gap-x-10">
        {stack.map((row) => (
          <div key={row.group} className="flex items-baseline justify-between gap-6 border-t border-line py-4">
            <dt className="text-muted">{row.group}</dt>
            <dd className="text-right text-lg">{row.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
