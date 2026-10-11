import { tech } from "@/content/site";

// Franja con las tecnologías que usamos, en movimiento continuo
export function Marquee() {
  const loop = [...tech, ...tech];

  return (
    <section aria-label="Tecnologías que usamos" className="border-y border-line bg-surface/60 py-5">
      <p className="sr-only">Trabajamos con {tech.join(", ")}.</p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" aria-hidden="true">
        <div className="marquee-track font-mono text-sm text-muted">
          {loop.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center whitespace-nowrap">
              <span className="px-7">{item}</span>
              <span className="text-accent">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
