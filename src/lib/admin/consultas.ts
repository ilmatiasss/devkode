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

// {"<id usuario>": porcentaje}. Null = usar el reparto del proyecto o el general
export type Reparto = Record<string, number> | null;

export const repartoValido = (r: unknown): r is Record<string, number> =>
  typeof r === "object" && r !== null && Object.values(r).reduce<number>((s, v) => s + Number(v), 0) === 100;

// Porcentaje que le toca a un socio en un movimiento: el del movimiento, si no el del proyecto,
// si no el porcentaje general del socio
export function porcentajeDe(usuario: Persona, propio: Reparto, delProyecto: Reparto) {
  if (repartoValido(propio)) return Number(propio[String(usuario.id)] ?? 0);
  if (repartoValido(delProyecto)) return Number(delProyecto[String(usuario.id)] ?? 0);
  return usuario.porcentaje;
}

type MovReparto = {
  tipo: "ingreso" | "gasto";
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  reparto: Reparto;
  reparto_proyecto: Reparto;
  proyecto_id: number | null;
  proyecto: string | null;
  persona: number | null; // quién lo recibió o pagó; null = cuenta de la empresa
  dividido: Record<string, number> | null;
};

// Un movimiento dentro del detalle de Reparto, con el porcentaje que se le aplicó a cada socio
export type MovimientoReparto = Omit<MovReparto, "reparto" | "reparto_proyecto"> & { porcentajes: number[]; propio: boolean };

// Cuánto le corresponde a cada socio en un período, y el detalle por proyecto
export async function calcularReparto(desde: string | null, hasta: string | null, usuarios: Persona[]) {
  const sql = db();
  const filtro = desde && hasta ? sql`where m.fecha >= ${desde} and m.fecha < ${hasta}` : sql``;
  const movs = await sql<MovReparto[]>`
    select 'ingreso' as tipo, m.id, m.fecha, m.descripcion, m.monto, m.reparto, p.reparto as reparto_proyecto, m.proyecto_id, p.nombre as proyecto,
      m.recibido_por as persona, m.recibido_detalle as dividido
    from ingresos m left join proyectos p on p.id = m.proyecto_id ${filtro}
    union all
    select 'gasto' as tipo, m.id, m.fecha, m.descripcion, m.monto, m.reparto, p.reparto as reparto_proyecto, m.proyecto_id, p.nombre as proyecto,
      m.pagado_por as persona, null as dividido
    from gastos m left join proyectos p on p.id = m.proyecto_id ${filtro}
    order by fecha desc, id desc`;

  const corresponde = new Map(usuarios.map((u) => [u.id, 0]));
  const porProyecto = new Map<
    string,
    { nombre: string; id: number | null; utilidad: number; partes: Map<number, number>; personalizado: boolean; reparto: Reparto; movimientos: MovimientoReparto[] }
  >();
  for (const m of movs) {
    const signo = m.tipo === "ingreso" ? 1 : -1;
    const clave = m.proyecto_id === null ? "general" : String(m.proyecto_id);
    const grupo = porProyecto.get(clave) ?? {
      nombre: m.proyecto ?? "Generales (sin proyecto)",
      id: m.proyecto_id,
      utilidad: 0,
      partes: new Map(usuarios.map((u) => [u.id, 0])),
      personalizado: false,
      reparto: repartoValido(m.reparto_proyecto) ? m.reparto_proyecto : null,
      movimientos: [],
    };
    const { reparto, reparto_proyecto, ...resto } = m;
    grupo.movimientos.push({ ...resto, porcentajes: usuarios.map((u) => porcentajeDe(u, reparto, reparto_proyecto)), propio: repartoValido(reparto) });
    grupo.utilidad += signo * m.monto;
    if (repartoValido(m.reparto) || repartoValido(m.reparto_proyecto)) grupo.personalizado = true;
    for (const u of usuarios) {
      const parte = (signo * m.monto * porcentajeDe(u, m.reparto, m.reparto_proyecto)) / 100;
      corresponde.set(u.id, corresponde.get(u.id)! + parte);
      grupo.partes.set(u.id, grupo.partes.get(u.id)! + parte);
    }
    porProyecto.set(clave, grupo);
  }
  return {
    corresponde,
    porProyecto: [...porProyecto.values()].sort((a, b) => (a.id === null ? 1 : b.id === null ? -1 : b.utilidad - a.utilidad)),
  };
}

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
