import { contact, site } from "@/content/site";

export function Contact() {
  const subject = encodeURIComponent("Proyecto web");
  const whatsappText = encodeURIComponent("Hola, vi la página de DevKode y quiero cotizar un proyecto.");

  return (
    <section id="contacto" className="bg-ink px-5 pb-10 pt-20 text-paper md:pt-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="display max-w-4xl text-balance text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
          Cuéntame qué necesitas.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-ink-muted">
          Aunque todavía no lo tengas del todo claro. Lo vemos juntos.
        </p>

        <div className="mt-12 flex flex-col items-start gap-5">
          <a
            href={`mailto:${contact.email}?subject=${subject}`}
            className="display break-all text-2xl underline decoration-accent-light decoration-2 underline-offset-[0.3em] transition-colors hover:text-accent-light sm:text-3xl md:text-4xl"
          >
            {contact.email}
          </a>
          {contact.whatsapp ? (
            <a
              href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold underline decoration-accent-light decoration-2 underline-offset-[0.25em] transition-colors hover:text-accent-light"
            >
              O por WhatsApp ↗<span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          ) : null}
        </div>

        <footer className="mt-24 flex flex-col justify-between gap-2 border-t border-paper/20 pt-6 text-[15px] text-on-ink-muted sm:flex-row">
          <p>{site.name}</p>
          <p>
            {site.location}, {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </section>
  );
}
