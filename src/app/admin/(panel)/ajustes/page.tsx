import type { Metadata } from "next";
import { BotonConfirmar } from "@/components/admin/BotonConfirmar";
import { CamposPorcentaje } from "@/components/admin/CamposPorcentaje";
import { Icono, type NombreIcono } from "@/components/admin/Icono";
import { botonPrimario, botonSecundario, Campo, Encabezado, entrada, tarjeta } from "@/components/admin/ui";
import { sesionEnParalelo } from "@/lib/admin/auth";
import { listaUsuarios, reglasReparto, textoPeriodo, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { cambiarClave, cerrarDemasSesiones, eliminarPeriodo, guardarAjustes, guardarPeriodo, guardarReglaMantencion } from "../acciones";

export const metadata: Metadata = { title: "Ajustes" };

// Región de Neon (sale del nombre del servidor de la base) y la región de Vercel que le queda más cerca
const regionesNeon: Record<string, { nombre: string; vercel: string }> = {
  "us-east-1": { nombre: "Virginia (EE. UU.)", vercel: "iad1" },
  "us-east-2": { nombre: "Ohio (EE. UU.)", vercel: "cle1" },
  "us-west-2": { nombre: "Oregón (EE. UU.)", vercel: "pdx1" },
  "eu-central-1": { nombre: "Fráncfort", vercel: "fra1" },
  "eu-west-2": { nombre: "Londres", vercel: "lhr1" },
  "ap-southeast-1": { nombre: "Singapur", vercel: "sin1" },
  "ap-southeast-2": { nombre: "Sídney", vercel: "syd1" },
  "sa-east-1": { nombre: "São Paulo", vercel: "gru1" },
};

// Mide cuánto tarda una consulta mínima a la base desde el servidor (la mejor de tres)
async function medirBase() {
  const tiempos: number[] = [];
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    await db()`select 1`;
    tiempos.push(performance.now() - t);
  }
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").hostname;
    } catch {
      return "";
    }
  })();
  const region = Object.keys(regionesNeon).find((r) => host.includes(`.${r}.`)) ?? null;
  return { ms: Math.round(Math.min(...tiempos)), region, vercel: process.env.VERCEL_REGION ?? null };
}

function Bloque({
  titulo,
  descripcion,
  icono,
  children,
  className = "",
  id,
}: {
  titulo: string;
  descripcion?: string;
  icono: NombreIcono;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${tarjeta} aparecer scroll-mt-24 p-5 md:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-soft">
          <Icono nombre={icono} className="size-5" />
        </span>
        <div>
          <h2 className="font-medium">{titulo}</h2>
          {descripcion ? <p className="mt-0.5 text-sm text-muted">{descripcion}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function Ajustes() {
  const usuario = await sesionEnParalelo();
  const [usuarios, dolar, [{ sesiones }], rendimiento, reglas] = await Promise.all([
    listaUsuarios(),
    valorDolar(),
    db()<{ sesiones: number }[]>`select count(*)::bigint as sesiones from sesiones where usuario_id = ${usuario.id} and expira > now()`,
    medirBase(),
    reglasReparto(),
  ]);
  const general = Object.fromEntries(usuarios.map((u) => [String(u.id), u.porcentaje]));
  const nombreCorto = (id: string) => usuarios.find((u) => String(u.id) === id)?.nombre.split(" ")[0] ?? "Ex socio";
  const textoReparto = (r: Record<string, number>) => Object.entries(r).map(([id, n]) => `${nombreCorto(id)} ${String(n).replace(".", ",")}%`).join(" · ");
  const otros = usuarios.filter((u) => u.id !== usuario.id);
  const correoListo = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const avisosListos = correoListo && Boolean(process.env.CRON_SECRET);

  return (
    <>
      <Encabezado titulo="Ajustes" descripcion="Reparto, moneda, seguridad de las cuentas y avisos." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Bloque icono="reparto" titulo="Socios, reparto y moneda" descripcion="El nombre se muestra en todo el panel. Los porcentajes deben sumar 100. El dólar se usa para convertir servicios cobrados en USD.">
          <form action={guardarAjustes} className="grid gap-4 sm:grid-cols-2">
            {usuarios.map((u) => (
              <div key={u.id} className="grid grid-cols-[1fr_5.5rem] gap-3 sm:col-span-2">
                <Campo etiqueta="Nombre">
                  <input name={`nombre_${u.id}`} required maxLength={80} defaultValue={u.nombre} className={entrada} />
                </Campo>
                <Campo etiqueta="%">
                  <input name={`porcentaje_${u.id}`} type="number" min={0} max={100} step={0.01} required defaultValue={u.porcentaje} aria-label={`Porcentaje de ${u.nombre}`} className={entrada} />
                </Campo>
              </div>
            ))}
            <Campo etiqueta="Valor del dólar (pesos)">
              <input name="dolar" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={dolar} className={entrada} />
            </Campo>
            <div className="sm:col-span-2">
              <button type="submit" className={botonPrimario}>
                Guardar
              </button>
            </div>
          </form>
        </Bloque>

        <Bloque
          id="reglas"
          className="lg:col-span-2"
          icono="reparto"
          titulo="Reglas de reparto"
          descripcion="Para cada ingreso o gasto se usa la primera que aplique: 1) el porcentaje propio del movimiento, 2) la regla de mantenciones, 3) el reparto del proyecto, 4) el período que cubre su fecha, 5) los porcentajes generales de arriba."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <form action={guardarReglaMantencion} className="grid min-w-0 content-start gap-4 rounded-2xl border border-line bg-bg/40 p-4">
              <label className="flex cursor-pointer items-start justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">Mantenciones aparte</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Los pagos de mantención y los servicios que se pagan para un proyecto (hosting, dominio…) se reparten con estos porcentajes, sin importar
                    el período.
                  </span>
                </span>
                <input type="checkbox" name="activa" defaultChecked={Boolean(reglas.mantencion)} className="mt-1 size-5 accent-[var(--color-accent)]" />
              </label>
              <CamposPorcentaje socios={usuarios} prefijo="mant_" inicial={reglas.mantencion ?? Object.fromEntries(usuarios.map((u) => [String(u.id), 100 / usuarios.length]))} />
              <button type="submit" className={`${botonSecundario} w-fit`}>
                Guardar regla de mantenciones
              </button>
            </form>

            <div className="min-w-0 space-y-3">
              <p className="text-sm font-medium">Períodos con otro reparto</p>
              {reglas.periodos.map((p) => (
                <details key={p.id} className="group rounded-2xl border border-line bg-bg/40">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <Icono nombre="calendario" className="size-4 shrink-0 text-accent-soft" />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block font-medium first-letter:uppercase">{textoPeriodo(p)}</span>
                      <span className="block text-xs text-muted">
                        {textoReparto(p.reparto)}
                        {p.nota ? ` · ${p.nota}` : ""}
                      </span>
                    </span>
                    <Icono nombre="lapiz" className="size-4 shrink-0 text-muted" />
                  </summary>
                  <div className="border-t border-line p-4">
                    <FormPeriodo usuarios={usuarios} periodo={p} general={general} />
                    <form action={eliminarPeriodo} className="mt-3">
                      <input type="hidden" name="id" value={p.id} />
                      <BotonConfirmar mensaje="¿Eliminar este período? Esos meses vuelven a usar los porcentajes generales." className="text-xs text-[#ff8fa3] hover:underline">
                        Eliminar período
                      </BotonConfirmar>
                    </form>
                  </div>
                </details>
              ))}
              <details className="rounded-2xl border border-dashed border-line" open={reglas.periodos.length === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm text-accent-soft [&::-webkit-details-marker]:hidden">
                  <Icono nombre="mas2" className="size-4" /> Agregar período
                </summary>
                <div className="border-t border-line p-4">
                  <FormPeriodo usuarios={usuarios} general={general} />
                </div>
              </details>
            </div>
          </div>
        </Bloque>

        <Bloque icono="candado" titulo="Cambiar mi contraseña" descripcion="Mínimo 12 caracteres. Al cambiarla se cierran tus otras sesiones abiertas.">
          <form action={cambiarClave} className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Contraseña actual">
              <input name="actual" type="password" required autoComplete="current-password" className={entrada} />
            </Campo>
            <Campo etiqueta="Nueva">
              <input name="nueva" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
            </Campo>
            <Campo etiqueta="Repetir nueva">
              <input name="repetir" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
            </Campo>
            <div className="sm:col-span-2">
              <button type="submit" className={botonPrimario}>
                Cambiar contraseña
              </button>
            </div>
          </form>
        </Bloque>

        {otros.length ? (
          <Bloque
            icono="clientes"
            titulo="Contraseña temporal para tu socio"
            descripcion="Si tu socio olvidó su contraseña, fija una temporal y pídele que la cambie al entrar. Se le cierran sus sesiones."
          >
            <form action={cambiarClave} className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Cuenta">
                <select name="usuario_id" className={entrada}>
                  {otros.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo etiqueta="Tu contraseña actual (para confirmar)">
                <input name="actual" type="password" required autoComplete="current-password" className={entrada} />
              </Campo>
              <Campo etiqueta="Contraseña temporal">
                <input name="nueva" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
              </Campo>
              <Campo etiqueta="Repetir">
                <input name="repetir" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
              </Campo>
              <div className="sm:col-span-2">
                <button type="submit" className={botonSecundario}>
                  Fijar contraseña temporal
                </button>
              </div>
            </form>
          </Bloque>
        ) : null}

        <Bloque icono="salir" titulo="Sesiones" descripcion={`Tienes ${sesiones} sesión${sesiones === 1 ? "" : "es"} abierta${sesiones === 1 ? "" : "s"}, incluida esta.`}>
          <form action={cerrarDemasSesiones}>
            <button type="submit" className={botonSecundario}>
              Cerrar las demás sesiones
            </button>
          </form>
        </Bloque>

        <Bloque icono="pulso" titulo="Rendimiento" descripcion="Cuánto tarda el panel en hablar con la base de datos.">
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-bg/50 p-3">
              <dt className="text-xs text-muted">Por consulta</dt>
              <dd className={`mt-1 font-display text-lg ${rendimiento.ms > 60 ? "text-[#f5c96b]" : "text-[#7ee2a0]"}`}>{rendimiento.ms} ms</dd>
            </div>
            <div className="rounded-xl bg-bg/50 p-3">
              <dt className="text-xs text-muted">Base (Neon)</dt>
              <dd className="mt-1">{rendimiento.region ? (regionesNeon[rendimiento.region]?.nombre ?? rendimiento.region) : "—"}</dd>
            </div>
            <div className="rounded-xl bg-bg/50 p-3">
              <dt className="text-xs text-muted">Servidor (Vercel)</dt>
              <dd className="mt-1">{rendimiento.vercel ?? "—"}</dd>
            </div>
          </dl>
          {rendimiento.region && rendimiento.vercel && regionesNeon[rendimiento.region] && !rendimiento.vercel.startsWith(regionesNeon[rendimiento.region].vercel) ? (
            <p className="mt-4 rounded-xl border border-[#5a4512] bg-[#241c08] p-3 text-sm text-[#f5c96b]">
              El servidor y la base están en regiones distintas, y cada consulta cruza el continente. En Vercel → Settings → Functions → Function
              Region elige <strong>{regionesNeon[rendimiento.region].vercel}</strong> y vuelve a desplegar.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">Servidor y base en la misma zona. La primera visita tras unos minutos sin uso tarda un poco más porque Neon despierta la base.</p>
          )}
        </Bloque>

        <Bloque icono="correo" titulo="Avisos de cobro por correo">
          <p className="text-sm leading-relaxed text-muted">
            {avisosListos
              ? "Activos: cada mañana revisamos los servicios y les escribimos a los dos cuando un cobro está por llegar."
              : correoListo
                ? "Falta la variable CRON_SECRET en Vercel para activar la revisión diaria."
                : "Falta configurar el correo (SMTP_USER y SMTP_PASS) en Vercel."}
          </p>
        </Bloque>
      </div>
    </>
  );
}

// Crear o editar un período de reparto (de un mes a otro, con sus porcentajes)
function FormPeriodo({
  usuarios,
  periodo,
  general,
}: {
  usuarios: { id: number; nombre: string }[];
  periodo?: { id: number; desde: string; hasta: string | null; reparto: Record<string, number>; nota: string | null };
  general: Record<string, number>;
}) {
  return (
    <form action={guardarPeriodo} className="grid min-w-0 gap-4">
      {periodo ? <input type="hidden" name="id" value={periodo.id} /> : null}
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Desde (mes)">
          <input name="desde" type="month" required defaultValue={periodo?.desde.slice(0, 7)} className={entrada} />
        </Campo>
        <Campo etiqueta="Hasta (mes)" ayuda="Vacío = sin fin">
          <input name="hasta" type="month" defaultValue={periodo?.hasta?.slice(0, 7) ?? ""} className={entrada} />
        </Campo>
      </div>
      <CamposPorcentaje socios={usuarios} prefijo="periodo_" inicial={periodo?.reparto ?? general} />
      <Campo etiqueta="Nota (opcional)">
        <input name="nota" maxLength={200} defaultValue={periodo?.nota ?? ""} placeholder="Ej: Matías cubre más horas de octubre a febrero" className={entrada} />
      </Campo>
      <button type="submit" className={`${botonPrimario} w-fit`}>
        {periodo ? "Guardar período" : "Agregar período"}
      </button>
    </form>
  );
}
