import { stack } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

export function Stack() {
  return (
    <section id="tecnologias" className="border-t border-line py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow="Tecnologías" title="Herramientas modernas y probadas">
          Elijo la tecnología según lo que cada proyecto necesita, priorizando velocidad, seguridad y que sea fácil de
          mantener.
        </SectionHeading>

        <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
          {stack.map((row) => (
            <div key={row.group} className="grid gap-3 p-5 sm:grid-cols-[180px_1fr] sm:items-center">
              <dt className="font-mono text-sm text-muted">{row.group}</dt>
              <dd className="flex flex-wrap gap-2">
                {row.items.map((item) => (
                  <span key={item} className="rounded-md border border-line bg-surface-2 px-3 py-1.5 text-sm">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
