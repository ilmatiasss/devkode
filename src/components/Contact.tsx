import { contact, nav, site } from "@/content/site";
import { Logo } from "./Logo";

export function Contact() {
  const subject = encodeURIComponent("Proyecto web");
  const whatsappText = encodeURIComponent("Hola, vi la página de DevKode y quiero cotizar un proyecto.");

  return (
    <>
      <section id="contacto" className="px-5 pb-20 md:pb-28">
        <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-line bg-surface px-7 py-16 text-center md:px-14 md:py-24">
          <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.8), transparent)" }}
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="label">{"// Contacto"}</p>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.035em]">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Cuéntanos qué necesitas, aunque todavía no lo tengas del todo claro. Lo vemos juntos y te enviamos una
              propuesta.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href={`mailto:${contact.email}?subject=${subject}`} className="btn btn-primary">
                Escríbenos <span aria-hidden="true">→</span>
              </a>
              {contact.whatsapp ? (
                <a
                  href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  WhatsApp<span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              ) : null}
            </div>
            <p className="mt-6 font-mono text-sm text-muted">{contact.email}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav aria-label="Pie de página" className="flex flex-wrap gap-6">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </a>
            ))}
          </nav>
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} {site.name} · {site.location}
          </p>
        </div>
      </footer>
    </>
  );
}
