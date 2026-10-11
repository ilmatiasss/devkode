export function Section({
  id,
  title,
  intro,
  className = "",
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`border-t-2 border-ink px-5 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid gap-4 md:mb-16 md:grid-cols-[5fr_7fr] md:gap-10">
          <h2 className="display text-4xl leading-none md:text-5xl">{title}</h2>
          {intro ? <p className="max-w-xl text-lg leading-relaxed text-muted md:pt-2">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
