// Esqueleto que aparece al instante al cambiar de sección, mientras llegan los datos.
// Next.js lo deja precargado, así que cada clic responde de inmediato.
const bloque = "animate-pulse rounded-2xl bg-white/[0.04]";

export default function Cargando() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <div className={`${bloque} h-9 w-56 rounded-xl`} />
      <div className={`${bloque} mt-3 h-4 w-72 rounded-lg`} />
      <div className="mt-9 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bloque} h-28`} />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className={`${bloque} h-64 lg:col-span-2`} />
        <div className={`${bloque} h-64`} />
      </div>
    </div>
  );
}
