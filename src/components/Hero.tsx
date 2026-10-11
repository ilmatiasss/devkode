import { projects, site } from "@/content/site";

// "A", "A y B", "A, B y C", con los nombres destacados
function NameList({ names }: { names: string[] }) {
  return names.map((name, i) => (
    <span key={name}>
      <span className="whitespace-nowrap font-semibold text-ink">{name}</span>
      {i < names.length - 2 ? ", " : i === names.length - 2 ? " y " : ""}
    </span>
  ));
}

export function Hero() {
  const done = projects.filter((p) => !p.status).map((p) => p.name);
  const building = projects.filter((p) => p.status).map((p) => p.name);

  return (
    <section id="inicio" className="px-5 pb-20 pt-14 md:pb-28 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[15px] text-muted">Desarrollo web a medida · {site.location}</p>

        <h1 className="display mt-6 text-balance text-[clamp(2.75rem,8.6vw,6.75rem)] leading-[0.92]">
          Sitios web hechos a medida.
        </h1>

        <div className="mt-12 grid gap-8 border-t border-line pt-8 md:mt-16 md:grid-cols-[5fr_7fr] md:gap-10">
          <p className="max-w-md text-xl leading-snug md:text-2xl">
            Diseñamos y programamos tiendas online, landing pages, webs corporativas, aplicaciones web y software para
            negocios en Chile.
          </p>

          <div className="md:pt-1">
            <p className="max-w-lg text-lg leading-relaxed text-muted">
              {done.length > 0 ? (
                <>
                  Hicimos <NameList names={done} />
                  {building.length > 0 ? ", y ahora estamos construyendo " : "."}
                </>
              ) : (
                "Ahora mismo estamos construyendo "
              )}
              {building.length > 0 ? (
                <>
                  <NameList names={building} />.
                </>
              ) : null}
            </p>
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-lg font-semibold">
              <a href="#proyectos" className="link">
                Ver proyectos
              </a>
              <a href="#contacto" className="link">
                Cuéntanos tu idea
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
