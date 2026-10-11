// Sección con índice en la columna izquierda, como una ficha técnica
export function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="grid border-t border-line md:grid-cols-[200px_1fr]">
      <div className="px-5 pt-12 md:border-r md:border-line md:px-8 md:py-16">
        <div className="md:sticky md:top-24">
          <p className="font-mono text-xs text-muted">{index}</p>
          <h2 className="mt-2 text-lg font-medium">{title}</h2>
        </div>
      </div>
      <div className="min-w-0 px-5 pb-16 pt-6 md:px-10 md:py-16">
        {intro ? (
          <p className="mb-12 max-w-2xl text-[1.65rem] leading-snug tracking-[-0.015em] md:text-[2rem]">{intro}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
