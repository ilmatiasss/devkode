import { contact, legal, site } from "@/content/site";
import { Logo } from "./Logo";

// Piezas compartidas por las páginas legales (/privacidad y /terminos)

export const legalLink = "font-medium text-fg underline decoration-accent decoration-2 underline-offset-4";

// Cómo se nombra al responsable dentro de una frase
export const responsable = legal.name
  ? `${legal.name}${legal.rut ? `, RUT ${legal.rut}` : ""}, que opera bajo el nombre ${site.name}`
  : site.name;

export function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-xl font-medium tracking-tight text-fg md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Recuadro con los datos del responsable. Solo aparece cuando `legal` está completo.
export function Titular() {
  if (!legal.name) return null;
  const rows: [string, string][] = [["Razón social", legal.name]];
  if (legal.rut) rows.push(["RUT", legal.rut]);
  if (legal.address) rows.push(["Domicilio", legal.address]);
  return (
    <dl className="space-y-1 border border-line bg-surface p-5 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap gap-x-2">
          <dt>{label}:</dt>
          <dd className="text-fg">{value}</dd>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-2">
        <dt>Correo de contacto:</dt>
        <dd>
          <a href={`mailto:${contact.email}`} className={legalLink}>
            {contact.email}
          </a>
        </dd>
      </div>
    </dl>
  );
}

export function LegalLayout({
  title,
  meta,
  intro,
  children,
}: {
  title: string;
  meta: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a href="/" aria-label={`${site.name}, ir al inicio`}>
            <Logo />
          </a>
          <a href="/" className="text-sm text-muted transition-colors hover:text-fg">
            <span aria-hidden="true">← </span>Volver al inicio
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <article className="max-w-3xl text-muted">
          <p className="flex items-center gap-3 font-mono text-xs text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {meta}
          </p>
          <h1 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed">{intro}</p>
          <div className="mt-12 space-y-10">{children}</div>
        </article>
      </main>

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
