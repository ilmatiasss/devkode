// Sección a todo el ancho: etiqueta con una línea naranja y un título grande
export function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 max-w-3xl md:mb-16">
          <p className="flex items-center gap-3 font-mono text-xs text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {label}
          </p>
          <h2 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
