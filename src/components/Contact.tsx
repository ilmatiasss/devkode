import { contact, nav, projectTypes, site } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { Logo } from "./Logo";

export function Contact() {
  // El formulario solo se muestra si el envío de correo está configurado en Vercel
  // (variables SMTP_USER y SMTP_PASS). La página se genera al desplegar, así que después
  // de agregarlas hay que volver a desplegar. Mientras tanto queda el botón de correo.
  const formEnabled = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  const subject = encodeURIComponent("Proyecto web");
  const whatsappText = encodeURIComponent("Hola, vi la página de DevKode y quiero cotizar un proyecto.");

  const whatsappLink = contact.whatsapp ? (
    <a
      href={`https://wa.me/${contact.whatsapp}?text=${whatsappText}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline decoration-2 underline-offset-[6px]"
    >
      WhatsApp ↗<span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  ) : null;

  return (
    <>
      <section id="contacto" className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
          <div className="relative overflow-hidden bg-accent px-6 py-14 text-bg md:px-14 md:py-20">
            {/* Trama de puntos, como eco del globo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(rgb(11_11_12/0.2)_1px,transparent_1px)] [background-size:16px_16px]"
            />
            <div className={`relative ${formEnabled ? "grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" : ""}`}>
              <div className="max-w-3xl">
                <h2 className="text-balance text-[clamp(2.2rem,5.4vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
                  {formEnabled ? "Pide tu cotización." : "¿Tienes un proyecto en mente?"}
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">
                  {formEnabled
                    ? "Cuéntanos qué necesitas, aunque todavía no lo tengas del todo claro. Te respondemos con una propuesta."
                    : "Cuéntanos qué necesitas, aunque todavía no lo tengas del todo claro. Lo vemos juntos y te enviamos una propuesta."}
                </p>

                {formEnabled ? (
                  <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span className="opacity-80">¿Prefieres escribir directo?</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-mono underline decoration-2 underline-offset-[6px]"
                    >
                      {contact.email}
                    </a>
                    {whatsappLink}
                  </p>
                ) : (
                  <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <a
                      href={`mailto:${contact.email}?subject=${subject}`}
                      className="btn bg-bg text-fg hover:bg-[#1d1d20]"
                    >
                      Escríbenos <span aria-hidden="true">→</span>
                    </a>
                    {whatsappLink}
                    <span className="font-mono text-sm">{contact.email}</span>
                  </div>
                )}
              </div>

              {formEnabled ? <ContactForm projectTypes={projectTypes} email={contact.email} /> : null}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
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
