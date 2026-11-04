import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, botonPrimario, Encabezado, enlace, Etiqueta, Kpi, Tabla, Vacio } from "@/components/admin/ui";
import { exigirUsuario } from "@/lib/admin/auth";
import { enPesos, listaServicios, mensualEnPesos, valorDolar } from "@/lib/admin/consultas";
import { clp, diasHasta, dinero, fecha, hoy } from "@/lib/admin/formato";
import { ciclos } from "@/lib/admin/opciones";
import { registrarPagoServicio } from "../acciones";

export const metadata: Metadata = { title: "Servicios contratados" };

export default async function Servicios({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await exigirUsuario();
  const q = await searchParams;
  const [servicios, dolar] = await Promise.all([listaServicios(), valorDolar()]);
  const activos = servicios.filter((s) => s.activo);
  const inactivos = servicios.filter((s) => !s.activo);
  const mensual = activos.reduce((suma, s) => suma + mensualEnPesos(s, dolar), 0);

  return (
    <>
      <Encabezado
        titulo="Servicios contratados"
        descripcion="Hosting, dominios, correo y suscripciones. Les avisamos por correo antes de cada cobro."
        accion={
          <Link href="/admin/servicios/nuevo" className={botonPrimario}>
            Nuevo servicio
          </Link>
        }
      />
      <Aviso ok={q.ok} error={q.error} />
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Costo fijo mensual" valor={clp(mensual)} detalle="Anuales y trimestrales prorrateados" />
        <Kpi etiqueta="Costo anual estimado" valor={clp(mensual * 12)} />
        <Kpi etiqueta="Servicios activos" valor={String(activos.length)} detalle={`Dólar a ${clp(dolar)} (se cambia en Ajustes)`} />
      </div>

      {activos.length ? (
        <Tabla>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Ciclo</th>
              <th>Costo</th>
              <th>Próximo cobro</th>
              <th>Paga</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {activos.map((s) => {
              const dias = s.proximo_cobro ? diasHasta(s.proximo_cobro) : null;
              return (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/servicios/${s.id}`} className={enlace}>
                      {s.nombre}
                    </Link>
                    <span className="block text-xs text-muted">{[s.proveedor, s.proyecto_nombre].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className="text-muted">{ciclos[s.ciclo]}</td>
                  <td className="whitespace-nowrap">
                    {dinero(s.costo, s.moneda)}
                    {s.moneda === "USD" ? <span className="block text-xs text-muted">≈ {clp(enPesos(s, dolar))}</span> : null}
                  </td>
                  <td className="whitespace-nowrap">
                    {fecha(s.proximo_cobro)}
                    {dias !== null ? (
                      <span className="ml-2">
                        <Etiqueta tono={dias < 0 ? "mal" : dias <= s.avisar_dias ? "acento" : "neutro"}>
                          {dias < 0 ? "vencido" : dias === 0 ? "hoy" : `${dias} d`}
                        </Etiqueta>
                      </span>
                    ) : null}
                  </td>
                  <td className="text-muted">{s.pagado_por_nombre ?? "Empresa"}</td>
                  <td className="text-right">
                    <form action={registrarPagoServicio}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="monto" value={enPesos(s, dolar)} />
                      <input type="hidden" name="fecha" value={s.proximo_cobro && dias !== null && dias <= 0 ? s.proximo_cobro : hoy()} />
                      <button type="submit" className="whitespace-nowrap text-xs text-accent-soft underline underline-offset-4 hover:text-fg">
                        Registrar pago
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      ) : (
        <Vacio>Todavía no hay servicios registrados.</Vacio>
      )}

      {inactivos.length ? (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-medium">Inactivos</h2>
          <ul className="divide-y divide-line border border-line text-sm">
            {inactivos.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 px-4 py-3">
                <Link href={`/admin/servicios/${s.id}`} className={enlace}>
                  {s.nombre}
                </Link>
                <span className="text-muted">{dinero(s.costo, s.moneda)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
