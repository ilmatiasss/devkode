import { site } from "@/content/site";
import { Logo } from "./Logo";

// Cabecera y pie de las páginas internas del sitio (servicios)
export function PaginaInterna({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a href="/" aria-label={`${site.name}, ir al inicio`}>
            <Logo />
          </a>
          <nav
            aria-label="Principal"
            className="flex items-center gap-5 text-sm md:gap-7"
          >
            <a
              href="/servicios"
              className="text-muted transition-colors hover:text-fg"
            >
              Servicios
            </a>
            <a
              href="/#proyectos"
              className="hidden text-muted transition-colors hover:text-fg md:inline"
            >
              Proyectos
            </a>
            <a
              href="/#contacto"
              className="btn btn-primary px-4! py-2! text-sm"
            >
              Cotiza tu proyecto
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <nav aria-label="Páginas legales" className="flex gap-6">
            <a href="/privacidad" className="transition-colors hover:text-fg">
              Política de privacidad
            </a>
            <a href="/terminos" className="transition-colors hover:text-fg">
              Términos y condiciones
            </a>
          </nav>
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
        </div>
      </footer>
    </>
  );
}
