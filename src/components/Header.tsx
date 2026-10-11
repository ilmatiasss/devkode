import { nav } from "@/content/site";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-5">
        <a href="#inicio" aria-label="Ir al inicio">
          <Logo />
        </a>

        <nav aria-label="Principal" className="flex items-center gap-8 text-sm">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="hidden text-muted transition-colors hover:text-fg md:inline">
              {item.label}
            </a>
          ))}
          <a href="#contacto" className="btn btn-primary px-4! py-2! text-sm">
            Cotiza tu proyecto
          </a>
        </nav>
      </div>
    </header>
  );
}
