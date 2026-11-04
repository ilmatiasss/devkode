// Marca: el nombre en minúsculas con un punto en el color de acento ("devkode.").
// Es texto real con la tipografía de los títulos, así se ve nítido en cualquier tamaño.
export function Logo() {
  return (
    <span className="font-display text-[1.35rem] leading-none font-bold tracking-[-0.045em] text-fg">
      devkode<span className="text-accent">.</span>
    </span>
  );
}
