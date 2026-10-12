// Marca: una D grande con una k pequeña pegada a su curva, sobre un cuadrado del color de acento
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="var(--color-accent)" />
        <path d="M5.5 8h5a7.2 7.2 0 010 14.4h-5z" fill="none" stroke="var(--color-on-accent)" strokeWidth="3.2" />
        <path
          d="M21 15.6v8.8M27 15.6l-6 4.9M23.2 19l3.9 5.4"
          fill="none"
          stroke="var(--color-on-accent)"
          strokeWidth="2.3"
        />
      </svg>
      <span className="text-lg font-bold tracking-tight">
        Dev<span className="text-accent">Kode</span>
      </span>
    </span>
  );
}
