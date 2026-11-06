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

// Servicios activos que se pagan para un proyecto (los cubre su mantención)
export type ServicioDeProyecto = Pick<Servicio, "id" | "nombre" | "costo" | "moneda" | "ciclo" | "proyecto_id">;
export const serviciosDeProyectos = () =>
  db()<ServicioDeProyecto[]>`select id, nombre, costo, moneda, ciclo, proyecto_id from servicios where activo and proyecto_id is not null order by nombre`;

// Resumen de un período: ingresos, gastos y cuánto pasó por cada socio o por la empresa
export async function resumenPeriodo(desde: string | null, hasta: string | null) {
  const sql = db();
  const filtroI = desde && hasta ? sql`where fecha >= ${desde} and fecha < ${hasta}` : sql``;
  const enRango = desde && hasta ? sql`fecha >= ${desde} and fecha < ${hasta}` : sql`true`;
  const [[totales], porPersonaI, porPersonaG] = await Promise.all([
    sql<{ ingresos: number; gastos: number }[]>`
      select
        (select coalesce(sum(monto), 0)::bigint from ingresos ${filtroI}) as ingresos,
        (select coalesce(sum(monto), 0)::bigint from gastos ${filtroI}) as gastos`,
    sql<{ persona: number | null; total: number }[]>`
      select persona, sum(total)::bigint as total from (
        select recibido_por as persona, monto as total from ingresos where recibido_detalle is null and ${enRango}
        union all
        -- Pagos que llegaron repartidos entre varias cuentas
        select nullif(d.key, 'empresa')::int as persona, d.value::bigint as total
        from ingresos i cross join lateral jsonb_each_text(i.recibido_detalle) d
        where i.recibido_detalle is not null and ${enRango}
      ) x group by persona`,
    sql<{ persona: number | null; total: number }[]>`
      select pagado_por as persona, sum(monto)::bigint as total from gastos ${filtroI} group by pagado_por`,
  ]);
  return { ...totales, porPersonaI, porPersonaG };
}

// ---------------- Reparto entre socios ----------------

export type Transferencia = { id: number; fecha: string; de_usuario: number | null; a_usuario: number | null; monto: number; notas: string | null };

// Plata que se pasaron entre socios (o con la cuenta de la empresa) para quedar parejos
export function listaTransferencias(desde: string | null, hasta: string | null) {
  const sql = db();
  const filtro = desde && hasta ? sql`where fecha >= ${desde} and fecha < ${hasta}` : sql``;
  return sql<Transferencia[]>`select id, fecha, de_usuario, a_usuario, monto, notas from transferencias ${filtro} order by fecha desc, id desc`;
}

// ---------------- Reparto en pesos ----------------
// Cada ingreso dice cuánto es para cada socio ("para") y cada gasto cuánto pone cada uno ("pone"),
// en pesos. Si no se indicó, se divide en partes iguales.

export type Partes = Record<string, number>;

// Partes iguales entre los socios (lo que sobra del redondeo va al primero)
export function partesIguales(monto: number, usuarios: { id: number }[]): Partes {
  if (!usuarios.length) return {};
  const base = Math.floor(monto / usuarios.length);
  return Object.fromEntries(usuarios.map((u, i) => [String(u.id), base + (i === 0 ? monto - base * usuarios.length : 0)]));
}

export const partesDe = (guardadas: Partes | null, monto: number, usuarios: { id: number }[]): Partes =>
  guardadas && Object.keys(guardadas).length ? guardadas : partesIguales(monto, usuarios);

// Reparte un total en la misma proporción que unas partes (lo que sobra del redondeo va a la mayor)
export function escalar(partes: Partes, total: number): Partes {
  const base = Object.values(partes).reduce((a, b) => a + b, 0);
  const claves = Object.keys(partes);
  if (!base || !claves.length) return {};
  const res = Object.fromEntries(claves.map((k) => [k, Math.floor((partes[k] * total) / base)]));
  const mayor = claves.reduce((a, b) => (partes[b] > partes[a] ? b : a));
  res[mayor] += total - Object.values(res).reduce((a, b) => a + b, 0);
  return res;
}

type MovReparto = {
  tipo: "ingreso" | "gasto";
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  proyecto_id: number | null;
  proyecto: string | null;
  persona: number | null; // a quién llegó o quién pagó; null = cuenta de la empresa
  dividido: Partes | null; // ingreso que llegó repartido entre varias cuentas
  partes: Partes | null;
  mant_mes: string | null; // gasto pagado con la mantención de ese mes
  // La mantención con que se pagó el gasto (si ya está registrada)
  mi_monto: number | null;
  mi_para: Partes | null;
  mi_persona: number | null;
  mi_dividido: Partes | null;
};

export type MovimientoReparto = Omit<MovReparto, "partes" | "mi_monto" | "mi_para" | "mi_persona" | "mi_dividido"> & {
  partes: Partes;
  iguales: boolean;
  cuentas: Partes; // a qué cuentas llegó (ingreso) o de qué cuentas salió (gasto); "empresa" = la empresa
  sinMantencion: boolean; // pagado con una mantención que aún no se registra
};

// De qué cuentas llegó o salió la plata: {"<id>" | "empresa": pesos}
const cuentasDe = (persona: number | null, dividido: Partes | null, monto: number): Partes =>
  dividido && Object.keys(dividido).length ? dividido : { [persona === null ? "empresa" : String(persona)]: monto };

// Cuánto le toca a cada socio en un período (lo que es para él menos lo que pone en gastos), cuánto
// llegó o salió de cada cuenta, y el detalle por proyecto
export async function calcularReparto(desde: string | null, hasta: string | null, usuarios: Persona[]) {
  const sql = db();
  const filtro = desde && hasta ? sql`where m.fecha >= ${desde} and m.fecha < ${hasta}` : sql``;
  const movs = await sql<MovReparto[]>`
    select 'ingreso' as tipo, m.id, m.fecha, m.descripcion, m.monto, m.proyecto_id, p.nombre as proyecto,
      m.recibido_por as persona, m.recibido_detalle as dividido, m.para as partes, null as mant_mes,
      null::int as mi_monto, null::jsonb as mi_para, null::int as mi_persona, null::jsonb as mi_dividido
    from ingresos m left join proyectos p on p.id = m.proyecto_id ${filtro}
    union all
    select 'gasto' as tipo, m.id, m.fecha, m.descripcion, m.monto, m.proyecto_id, p.nombre as proyecto,
      m.pagado_por as persona, null as dividido, m.pone as partes, m.mant_mes,
      mi.monto, mi.para, mi.recibido_por, mi.recibido_detalle
    from gastos m left join proyectos p on p.id = m.proyecto_id
      left join ingresos mi on m.mant_mes is not null and mi.proyecto_id = m.proyecto_id and mi.mant_mes = m.mant_mes
    ${filtro}
    order by fecha desc, id desc`;

  const leToca = new Map(usuarios.map((u) => [u.id, 0]));
  const entro = new Map<string, number>(); // lo que llegó a cada cuenta ("<id>" o "empresa")
  const salio = new Map<string, number>(); // lo que se pagó desde cada cuenta
  const porProyecto = new Map<string, { nombre: string; id: number | null; utilidad: number; partes: Map<number, number>; movimientos: MovimientoReparto[] }>();
  for (const m of movs) {
    const signo = m.tipo === "ingreso" ? 1 : -1;
    const clave = m.proyecto_id === null ? "general" : String(m.proyecto_id);
    const grupo = porProyecto.get(clave) ?? { nombre: m.proyecto ?? "Sin proyecto", id: m.proyecto_id, utilidad: 0, partes: new Map(usuarios.map((u) => [u.id, 0])), movimientos: [] };

    let partes: Partes;
    let deCuentas: Partes;
    let sinMantencion = false;
    if (m.mant_mes) {
      // Pagado con la plata de la mantención: se descuenta en la misma proporción en que se reparte
      // esa mantención, y sale de la(s) cuenta(s) donde llegó
      if (m.mi_monto) {
        partes = escalar(partesDe(m.mi_para, m.mi_monto, usuarios), m.monto);
        deCuentas = escalar(cuentasDe(m.mi_persona, m.mi_dividido, m.mi_monto), m.monto);
      } else {
        partes = partesIguales(m.monto, usuarios);
        deCuentas = { empresa: m.monto };
        sinMantencion = true;
      }
    } else {
      partes = partesDe(m.partes, m.monto, usuarios);
      deCuentas = cuentasDe(m.persona, m.dividido, m.monto);
    }
    const { mi_monto, mi_para, mi_persona, mi_dividido, ...resto } = m;
    grupo.movimientos.push({ ...resto, partes, iguales: !m.partes && !m.mant_mes, cuentas: deCuentas, sinMantencion });
    grupo.utilidad += signo * m.monto;
    for (const u of usuarios) {
      const parte = signo * Number(partes[String(u.id)] ?? 0);
      leToca.set(u.id, leToca.get(u.id)! + parte);
      grupo.partes.set(u.id, grupo.partes.get(u.id)! + parte);
    }
    const destino = m.tipo === "ingreso" ? entro : salio;
    for (const [k, v] of Object.entries(deCuentas)) destino.set(k, (destino.get(k) ?? 0) + v);
    porProyecto.set(clave, grupo);
  }
  return {
    leToca,
    entro,
    salio,
    porProyecto: [...porProyecto.values()].sort((a, b) => (a.id === null ? 1 : b.id === null ? -1 : b.utilidad - a.utilidad)),
  };
}

// Mantención de cada mes: lo cobrado, los servicios pagados con ella y lo que queda para repartir
export type MesMantencion = { proyecto_id: number; mes: string; cobrado: number | null; para: Partes | null; servicios: { id: number; descripcion: string; monto: number }[] };
export const mesesMantencion = (proyectoId?: number) => {
  const sql = db();
  const filtro = proyectoId ? sql`where m.proyecto_id = ${proyectoId}` : sql``;
  return sql<MesMantencion[]>`
    select m.proyecto_id, m.mes, i.monto as cobrado, i.para,
      coalesce((select json_agg(json_build_object('id', g.id, 'descripcion', g.descripcion, 'monto', g.monto) order by g.fecha)
        from gastos g where g.proyecto_id = m.proyecto_id and g.mant_mes = m.mes), '[]') as servicios
    from (select proyecto_id, mant_mes as mes from ingresos where mant_mes is not null
          union select proyecto_id, mant_mes from gastos where mant_mes is not null) m
    left join ingresos i on i.proyecto_id = m.proyecto_id and i.mant_mes = m.mes
    ${filtro}
    order by m.mes desc`;
};

// ---------------- Mantención mensual ----------------

export type ProyectoMantencion = {
  id: number;
  nombre: string;
  cliente: string | null;
  telefono: string | null;
  mant_monto: number;
  mant_dia: number;
  mant_desde: string | null;
  inicio: string | null;
  estado: string;
  pagados: string[]; // meses "AAAA-MM" ya cobrados
};

export const listaMantenciones = () =>
  db()<ProyectoMantencion[]>`
    select p.id, p.nombre, c.nombre as cliente, c.telefono, p.mant_monto, p.mant_dia, p.mant_desde, p.inicio, p.estado,
      coalesce((select array_agg(i.mant_mes order by i.mant_mes) from ingresos i where i.proyecto_id = p.id and i.mant_mes is not null), '{}') as pagados
    from proyectos p left join clientes c on c.id = p.cliente_id
    where p.mant_activa
    order by p.nombre`;

// Meses que ya se debieron cobrar (desde el inicio de la mantención hasta hoy, según el día de cobro)
// y los que faltan por pagar
export function estadoMantencion(p: Pick<ProyectoMantencion, "mant_desde" | "inicio" | "mant_dia" | "pagados">, hoyStr: string) {
  const mesHoy = hoyStr.slice(0, 7);
  const desde = (p.mant_desde ?? p.inicio ?? hoyStr).slice(0, 7);
  const vencidos: string[] = [];
  for (let m = desde; m <= mesHoy && vencidos.length < 120; ) {
    if (m < mesHoy || Number(hoyStr.slice(8, 10)) >= p.mant_dia) vencidos.push(m);
    const [a, mm] = m.split("-").map(Number);
    m = mm === 12 ? `${a + 1}-01` : `${a}-${String(mm + 1).padStart(2, "0")}`;
  }
  const pagados = new Set(p.pagados);
  const pendientes = vencidos.filter((m) => !pagados.has(m));
  const mesActualPagado = pagados.has(mesHoy);
  const mesActualVencido = vencidos.includes(mesHoy);
  // Próximo mes a cobrar: el pendiente más antiguo, o el actual si aún no vence
  const siguiente = pendientes[0] ?? (mesActualPagado ? null : mesHoy >= desde ? mesHoy : desde);
  return { pendientes, mesActualPagado, mesActualVencido, siguiente };
}
