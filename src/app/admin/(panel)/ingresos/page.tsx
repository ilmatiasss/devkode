import type { Metadata } from "next";
import Link from "next/link";
import { Icono } from "@/components/admin/Icono";
import { ListaMovimientos } from "@/components/admin/Movimientos";
import { botonPrimario, Encabezado, Kpi, SelectorMes, Vacio } from "@/components/admin/ui";
import { sesionEnParalelo } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { clp, esMes, mesActual, moverMes, nombreMes } from "@/lib/admin/formato";

export const metadata: Metadata = { title: "Ingresos" };

type Fila = { id: number; fecha: string; descripcion: string; monto: number; detalle: string | null; persona: string | null };

export default async function Ingresos({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sesion = sesionEnParalelo();
  const q = await searchParams;
  const mes = esMes(q.mes) ? q.mes : mesActual();
  const sql = db();
  const [filas, [anterior]] = await Promise.all([
    sql<Fila[]>`
      select i.id, i.fecha, i.descripcion, i.monto, p.nombre as detalle, u.nombre as persona
      from ingresos i left join proyectos p on p.id = i.proyecto_id left join usuarios u on u.id = i.recibido_por
      where i.fecha >= ${`${mes}-01`} and i.fecha < ${`${moverMes(mes, 1)}-01`}
      order by i.fecha desc, i.id desc`,
    sql<{ total: number }[]>`select coalesce(sum(monto), 0)::bigint as total from ingresos where fecha >= ${`${moverMes(mes, -1)}-01`} and fecha < ${`${mes}-01`}`,
  ]);
  const total = filas.reduce((s, f) => s + f.monto, 0);
  const enEmpresa = filas.filter((f) => !f.persona).reduce((s, f) => s + f.monto, 0);

  await sesion;
  return (
    <>
      <Encabezado
        titulo="Ingresos"
        descripcion="Pagos recibidos de clientes."
        accion={
          <Link href="/admin/ingresos/nuevo" className={botonPrimario}>
            <Icono nombre="mas2" className="size-4" /> Registrar ingreso
          </Link>
        }
      />
      <div className="mb-6">
        <SelectorMes ruta="/admin/ingresos" anterior={moverMes(mes, -1)} siguiente={moverMes(mes, 1)} nombre={nombreMes(mes)} />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <Kpi
          etiqueta="Total del mes"
          valor={clp(total)}
          icono="ingresos"
          tono="bien"
          variacion={anterior.total > 0 ? ((total - anterior.total) / anterior.total) * 100 : null}
          detalle="vs mes anterior"
        />
        <Kpi etiqueta="Pagos recibidos" valor={String(filas.length)} icono="billetera" />
        <div className="col-span-2 md:col-span-1">
          <Kpi etiqueta="A la cuenta de la empresa" valor={clp(enEmpresa)} icono="candado" detalle={`${clp(total - enEmpresa)} a cuentas personales`} />
        </div>
      </div>
      {filas.length ? (
        <ListaMovimientos filas={filas} tipo="ingresos" />
      ) : (
        <Vacio
          icono="ingresos"
          titulo="Sin ingresos este mes"
          accion={
            <Link href="/admin/ingresos/nuevo" className={botonPrimario}>
              Registrar ingreso
            </Link>
          }
        />
      )}
    </>
  );
}
