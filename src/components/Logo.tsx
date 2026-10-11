export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
        <path d="M9 8h6.5a8 8 0 010 16H9z" fill="none" stroke="var(--color-bg)" strokeWidth="3.4" />
      </svg>
      <span className="text-lg font-bold tracking-tight">
        Dev<span className="text-accent">Kode</span>
      </span>
    </span>
  );
}
