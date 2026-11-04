import type { Metadata } from "next";
import { Aviso, botonPrimario, botonSecundario, Campo, Encabezado, entrada } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { listaUsuarios, valorDolar } from "@/lib/admin/consultas";
import { db } from "@/lib/admin/db";
import { cambiarClave, cerrarDemasSesiones, guardarAjustes } from "../acciones";

export const metadata: Metadata = { title: "Ajustes" };

function Bloque({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <section className="max-w-3xl border border-line bg-surface p-6">
      <h2 className="text-lg font-medium">{titulo}</h2>
      {descripcion ? <p className="mt-1 text-sm text-muted">{descripcion}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function Ajustes({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const usuario = await exigirUsuario();
  const q = await searchParams;
  const [usuarios, dolar, [{ sesiones }]] = await Promise.all([
    listaUsuarios(),
    valorDolar(),
    db()<{ sesiones: number }[]>`select count(*)::bigint as sesiones from sesiones where usuario_id = ${usuario.id} and expira > now()`,
  ]);
  const otros = usuarios.filter((u) => u.id !== usuario.id);
  const correoListo = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const avisosListos = correoListo && Boolean(process.env.CRON_SECRET);

  return (
    <>
      <Encabezado titulo="Ajustes" />
      <Aviso ok={q.ok} error={q.error} />
      <div className="space-y-6">
        <Bloque titulo="Reparto y moneda" descripcion="Los porcentajes deben sumar 100. El dólar se usa para convertir servicios cobrados en USD.">
          <form action={guardarAjustes} className="grid gap-4 sm:grid-cols-3">
            {usuarios.map((u) => (
              <Campo key={u.id} etiqueta={`${u.nombre} (%)`}>
                <input name={`porcentaje_${u.id}`} type="number" min={0} max={100} required defaultValue={u.porcentaje} className={entrada} />
              </Campo>
            ))}
            <Campo etiqueta="Valor del dólar (pesos)">
              <input name="dolar" required inputMode="numeric" pattern="[\d.$ ]+" defaultValue={dolar} className={entrada} />
            </Campo>
            <div className="sm:col-span-3">
              <button type="submit" className={botonPrimario}>
                Guardar
              </button>
            </div>
          </form>
        </Bloque>

        <Bloque titulo="Cambiar mi contraseña" descripcion="Mínimo 12 caracteres. Al cambiarla se cierran tus otras sesiones abiertas.">
          <form action={cambiarClave} className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Contraseña actual">
              <input name="actual" type="password" required autoComplete="current-password" className={entrada} />
            </Campo>
            <Campo etiqueta="Nueva">
              <input name="nueva" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
            </Campo>
            <Campo etiqueta="Repetir nueva">
              <input name="repetir" type="password" required minLength={12} autoComplete="new-password" className={entrada} />
            </Campo>
            <div className="sm:col-span-3">
              <button type="submit" className={botonPrimario}>
                Cambiar contraseña
              </button>
            </div>
          </form>
        </Bloque>

        {otros.length ? (
          <Bloque
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

        <Bloque titulo="Sesiones" descripcion={`Tienes ${sesiones} sesión${sesiones === 1 ? "" : "es"} abierta${sesiones === 1 ? "" : "s"}, incluida esta.`}>
          <form action={cerrarDemasSesiones}>
            <button type="submit" className={botonSecundario}>
              Cerrar las demás sesiones
            </button>
          </form>
        </Bloque>

        <Bloque titulo="Avisos de cobro por correo">
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
