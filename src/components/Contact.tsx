import { contact, site } from "@/content/site";

export function Contact() {
  const subject = encodeURIComponent("Quiero cotizar un proyecto web");
  const whatsappText = encodeURIComponent("Hola, vi tu página de DevKode y quiero cotizar un proyecto.");

  return (
    <section id="contacto" className="border-t border-line py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-2xl border border-line bg-surface p-8 sm:p-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Contacto</p>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            ¿Tienes un proyecto en mente? Conversemos.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Cuéntame qué necesitas y te respondo con una propuesta. Sin compromiso.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${contact.email}?subject=${subject}`}
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Escríbeme por correo
            </a>
            {contact.whatsapp ? (
              <a
                href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line bg-surface-2 px-5 py-3 text-sm font-semibold transition-colors hover:border-accent-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                WhatsApp
              </a>
            ) : null}
          </div>

          <p className="mt-6 font-mono text-sm text-muted">{contact.email}</p>
        </div>
      </div>

      <footer className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}. Hecho en {site.location}.
        </p>
        <p className="font-mono">{"</>"} con Next.js y Tailwind CSS</p>
      </footer>
    </section>
  );
}
