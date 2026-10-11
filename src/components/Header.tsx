import { nav, site } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="flex items-center gap-2 font-mono text-lg font-semibold tracking-tight">
          <span className="text-accent">{"</>"}</span>
          <span>{site.name}</span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm text-muted md:flex">
          {nav
            .filter((item) => item.href !== "#contacto")
            .map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </a>
            ))}
        </nav>

        <a
          href="#contacto"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Contacto
        </a>
      </div>
    </header>
  );
}
