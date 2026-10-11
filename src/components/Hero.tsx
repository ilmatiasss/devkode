import { projects, site } from "@/content/site";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, rgba(61,220,151,0.14), transparent 70%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "auto, 48px 48px, 48px 48px",
          maskImage: "linear-gradient(to bottom, black 55%, transparent)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-20 md:pt-28 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            {site.tagline} · {site.location}
          </p>

          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Sitios web a medida para{" "}
            <span className="text-accent">hacer crecer tu negocio</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Diseño y desarrollo tiendas online, landing pages, webs corporativas, aplicaciones web y software a
            medida. Todo pensado desde cero para lo que tu negocio necesita.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#proyectos"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver proyectos
            </a>
            <a
              href="#contacto"
              className="rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-accent-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Cuéntame tu idea
            </a>
          </div>
        </div>

        {/* Tarjeta decorativa estilo terminal con los proyectos actuales */}
        <div
          className="rounded-xl border border-line bg-surface shadow-2xl shadow-black/40"
          role="img"
          aria-label="Lista de proyectos actuales, todos en desarrollo"
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-muted">devkode ~ proyectos</span>
          </div>
          <div className="space-y-3 p-5 font-mono text-sm" aria-hidden="true">
            <p className="text-muted">
              <span className="text-accent">$</span> ls proyectos/
            </p>
            {projects.map((p) => (
              <p key={p.name} className="flex items-center justify-between gap-4">
                <span>{p.name.toLowerCase().replace(/\s+/g, "-")}/</span>
                <span className="rounded border border-line px-2 py-0.5 text-xs text-accent">{p.status.toLowerCase()}</span>
              </p>
            ))}
            <p className="pt-1 text-muted">
              <span className="text-accent">$</span> <span className="animate-pulse">▍</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
