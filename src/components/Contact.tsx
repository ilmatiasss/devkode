import { contact, site } from "@/content/site";
import { Logo } from "./Logo";

export function Contact() {
  const subject = encodeURIComponent("Proyecto web");
  const whatsappText = encodeURIComponent("Hola, vi la página de DevKode y quiero cotizar un proyecto.");

  return (
    <>
      <section id="contacto" className="grid bg-accent text-bg md:grid-cols-[200px_1fr]">
        <div className="px-5 pt-12 md:border-r md:border-bg/20 md:px-8 md:py-16">
          <p className="font-mono text-xs opacity-70">04</p>
          <p className="mt-2 text-lg font-medium">Contacto</p>
        </div>
        <div className="px-5 pb-14 pt-6 md:px-10 md:py-16">
          <h2 className="max-w-3xl text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.04] tracking-[-0.03em]">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">
            Cuéntanos qué necesitas, aunque todavía no lo tengas del todo claro. Lo vemos juntos y te enviamos una
            propuesta.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href={`mailto:${contact.email}?subject=${subject}`}
              className="btn bg-bg text-fg hover:bg-[#1d1d20]"
            >
              Escríbenos <span aria-hidden="true">→</span>
            </a>
            {contact.whatsapp ? (
              <a
                href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-2 underline-offset-[6px]"
              >
                WhatsApp ↗<span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            ) : null}
            <span className="font-mono text-sm">{contact.email}</span>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-line px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <Logo />
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
      </footer>
    </>
  );
}
