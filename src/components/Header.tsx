import { nav, site } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="display text-xl">
          {site.name}
        </a>

        <nav aria-label="Principal" className="flex items-center gap-7 text-[15px]">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hidden text-muted transition-colors hover:text-ink md:inline">
              {item.label}
            </a>
          ))}
          <a href="#contacto" className="link font-semibold">
            Escríbenos
          </a>
        </nav>
      </div>
    </header>
  );
}
