export function Section({
  id,
  label,
  title,
  intro,
  children,
}: {
  id: string;
  label: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-12 max-w-2xl md:mb-14">
          <p className="label">{`// ${label}`}</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em]">{title}</h2>
          {intro ? <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
