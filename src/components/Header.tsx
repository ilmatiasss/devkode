import { nav } from "@/content/site";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
        <a href="#inicio" aria-label="DevKode, ir al inicio">
          <Logo />
        </a>

        <nav aria-label="Principal" className="flex items-center gap-7 text-sm">
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
