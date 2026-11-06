import type { Metadata } from "next";
import { Icono, type NombreIcono } from "@/components/admin/Icono";
import { botonPrimario, botonSecundario, Campo, Encabezado, entrada, tarjeta } from "@/components/admin/ui";
import { sesionEnParalelo } from "@/lib/admin/auth";
import { listaUsuarios, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { cambiarClave, cerrarDemasSesiones, guardarAjustes } from "../acciones";

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

function Bloque({ titulo, descripcion, icono, children }: { titulo: string; descripcion?: string; icono: NombreIcono; children: React.ReactNode }) {
  return (
    <section className={`${tarjeta} aparecer p-5 md:p-6`}>
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
  const [usuarios, dolar, [{ sesiones }], rendimiento] = await Promise.all([
    listaUsuarios(),
    valorDolar(),
    db()<{ sesiones: number }[]>`select count(*)::bigint as sesiones from sesiones where usuario_id = ${usuario.id} and expira > now()`,
    medirBase(),
  ]);
  const otros = usuarios.filter((u) => u.id !== usuario.id);
  const correoListo = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const avisosListos = correoListo && Boolean(process.env.CRON_SECRET);

  return (
    <>
      <Encabezado titulo="Ajustes" descripcion="Reparto, moneda, seguridad de las cuentas y avisos." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Bloque icono="reparto" titulo="Socios y moneda" descripcion="El nombre se muestra en todo el panel. El dólar se usa para convertir servicios cobrados en USD.">
          <form action={guardarAjustes} className="grid gap-4 sm:grid-cols-2">
            {usuarios.map((u) => (
              <Campo key={u.id} etiqueta={`Nombre del socio ${u.id === usuario.id ? "(tú)" : ""}`}>
                <input name={`nombre_${u.id}`} required maxLength={80} defaultValue={u.nombre} className={entrada} />
              </Campo>
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
