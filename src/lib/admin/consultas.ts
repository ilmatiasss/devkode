import { db } from "./db";

// Consultas compartidas entre páginas del panel

export type Persona = { id: number; nombre: string; porcentaje: number };

export const listaUsuarios = () => db()<Persona[]>`select id, nombre, porcentaje from usuarios order by id`;

export const listaClientes = () => db()<{ id: number; nombre: string }[]>`select id, nombre from clientes order by nombre`;

export const listaProyectos = () =>
  db()<{ id: number; nombre: string; estado: string }[]>`
    select id, nombre, estado from proyectos
    order by (estado in ('terminado', 'cancelado')), nombre`;

export async function valorDolar() {
  const [fila] = await db()<{ valor: string }[]>`select valor from ajustes where clave = 'dolar'`;
  const n = Number(fila?.valor);
  return Number.isFinite(n) && n > 0 ? n : 950;
}

// Servicio con su costo convertido a pesos y su equivalente mensual
export type Servicio = {
  id: number;
  nombre: string;
  proveedor: string | null;
  categoria: string;
  moneda: string;
  costo: number;
  ciclo: "mensual" | "trimestral" | "anual" | "unico";
  proximo_cobro: string | null;
  pagado_por: number | null;
  pagado_por_nombre: string | null;
  proyecto_id: number | null;
  proyecto_nombre: string | null;
  activo: boolean;
  avisar_dias: number;
  notas: string | null;
};

export const listaServicios = () =>
  db()<Servicio[]>`
    select s.*, u.nombre as pagado_por_nombre, p.nombre as proyecto_nombre
    from servicios s
    left join usuarios u on u.id = s.pagado_por
    left join proyectos p on p.id = s.proyecto_id
    order by s.activo desc, s.proximo_cobro nulls last, s.nombre`;

export const enPesos = (s: Pick<Servicio, "costo" | "moneda">, dolar: number) =>
  s.moneda === "USD" ? Math.round(s.costo * dolar) : Math.round(s.costo);

export const mensualEnPesos = (s: Pick<Servicio, "costo" | "moneda" | "ciclo">, dolar: number) => {
  const divisor = { mensual: 1, trimestral: 3, anual: 12, unico: 0 }[s.ciclo];
  return divisor ? enPesos(s, dolar) / divisor : 0;
};

// Resumen de un período: ingresos, gastos y cuánto pasó por cada socio o por la empresa
export async function resumenPeriodo(desde: string | null, hasta: string | null) {
  const sql = db();
  const filtroI = desde && hasta ? sql`where fecha >= ${desde} and fecha < ${hasta}` : sql``;
  const [[totales], porPersonaI, porPersonaG] = await Promise.all([
    sql<{ ingresos: number; gastos: number }[]>`
      select
        (select coalesce(sum(monto), 0)::bigint from ingresos ${filtroI}) as ingresos,
        (select coalesce(sum(monto), 0)::bigint from gastos ${filtroI}) as gastos`,
    sql<{ persona: number | null; total: number }[]>`
      select recibido_por as persona, sum(monto)::bigint as total from ingresos ${filtroI} group by recibido_por`,
    sql<{ persona: number | null; total: number }[]>`
      select pagado_por as persona, sum(monto)::bigint as total from gastos ${filtroI} group by pagado_por`,
  ]);
  return { ...totales, porPersonaI, porPersonaG };
}
