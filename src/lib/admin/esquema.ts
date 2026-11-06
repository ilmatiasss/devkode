// Esquema de la base de datos del panel (PostgreSQL / Neon). Es idempotente: se puede aplicar
// varias veces sin perder datos. Lo aplican la página de configuración inicial y `npm run admin:migrar`.
export const ESQUEMA = `
create table if not exists usuarios (
  id serial primary key,
  email text not null unique,
  nombre text not null,
  hash_clave text not null,
  -- Parte de las utilidades que le corresponde (entre todos deben sumar 100)
  porcentaje integer not null default 50 check (porcentaje between 0 and 100),
  intentos_fallidos integer not null default 0,
  bloqueado_hasta timestamptz,
  creado timestamptz not null default now()
);

create table if not exists sesiones (
  id text primary key, -- huella SHA-256 del token; el token real solo vive en la cookie
  usuario_id integer not null references usuarios(id) on delete cascade,
  expira timestamptz not null,
  creada timestamptz not null default now()
);
create index if not exists sesiones_usuario on sesiones(usuario_id);

create table if not exists clientes (
  id serial primary key,
  nombre text not null,
  contacto text,
  email text,
  telefono text,
  rut text,
  notas text,
  creado timestamptz not null default now()
);

create table if not exists proyectos (
  id serial primary key,
  nombre text not null,
  cliente_id integer references clientes(id) on delete set null,
  estado text not null default 'en_curso'
    check (estado in ('propuesta', 'en_curso', 'pausado', 'terminado', 'cancelado')),
  monto integer not null default 0 check (monto >= 0), -- valor acordado, en pesos
  inicio date,
  entrega date,
  notas text,
  creado timestamptz not null default now()
);

create table if not exists servicios (
  id serial primary key,
  nombre text not null,
  proveedor text,
  categoria text not null default 'otros',
  moneda text not null default 'CLP' check (moneda in ('CLP', 'USD')),
  costo numeric(12, 2) not null default 0 check (costo >= 0),
  ciclo text not null default 'mensual' check (ciclo in ('mensual', 'trimestral', 'anual', 'unico')),
  proximo_cobro date,
  pagado_por integer references usuarios(id) on delete set null, -- vacío = cuenta de la empresa
  proyecto_id integer references proyectos(id) on delete set null,
  activo boolean not null default true,
  avisar_dias integer not null default 5 check (avisar_dias between 0 and 60),
  notas text,
  creado timestamptz not null default now()
);

create table if not exists gastos (
  id serial primary key,
  fecha date not null,
  descripcion text not null,
  categoria text not null default 'otros',
  monto integer not null check (monto > 0), -- en pesos
  pagado_por integer references usuarios(id) on delete set null, -- vacío = cuenta de la empresa
  proyecto_id integer references proyectos(id) on delete set null,
  servicio_id integer references servicios(id) on delete set null,
  notas text,
  creado timestamptz not null default now()
);
create index if not exists gastos_fecha on gastos(fecha);

create table if not exists ingresos (
  id serial primary key,
  fecha date not null,
  descripcion text not null,
  monto integer not null check (monto > 0), -- en pesos
  proyecto_id integer references proyectos(id) on delete set null,
  recibido_por integer references usuarios(id) on delete set null, -- vacío = cuenta de la empresa
  notas text,
  creado timestamptz not null default now()
);
create index if not exists ingresos_fecha on ingresos(fecha);

create table if not exists ajustes (
  clave text primary key,
  valor text not null
);
insert into ajustes (clave, valor) values ('dolar', '950') on conflict (clave) do nothing;

-- Evita mandar dos veces el mismo aviso de cobro
create table if not exists avisos_enviados (
  servicio_id integer not null references servicios(id) on delete cascade,
  fecha_cobro date not null,
  enviado timestamptz not null default now(),
  primary key (servicio_id, fecha_cobro)
);

-- Versión 2: mantención mensual, reparto por proyecto o movimiento y gastos más detallados
alter table proyectos add column if not exists mant_activa boolean not null default false;
alter table proyectos add column if not exists mant_monto integer not null default 0;
alter table proyectos add column if not exists mant_dia integer not null default 5;
alter table proyectos add column if not exists mant_desde date;
-- Reparto personalizado: {"<id de usuario>": porcentaje}. Vacío = se usan los porcentajes generales
alter table proyectos add column if not exists reparto jsonb;
alter table ingresos add column if not exists reparto jsonb;
-- Mes ("AAAA-MM") que paga, cuando el ingreso es una mantención mensual
alter table ingresos add column if not exists mant_mes text;
create unique index if not exists ingresos_mantencion on ingresos (proyecto_id, mant_mes) where mant_mes is not null;
alter table gastos add column if not exists reparto jsonb;
alter table gastos add column if not exists proveedor text;
alter table gastos add column if not exists documento text;

create table if not exists avisos_mantencion (
  proyecto_id integer not null references proyectos(id) on delete cascade,
  mes text not null,
  enviado timestamptz not null default now(),
  primary key (proyecto_id, mes)
);

-- Versión 3: transferencias entre socios (o entre un socio y la cuenta de la empresa) para saldar el reparto
create table if not exists transferencias (
  id serial primary key,
  fecha date not null,
  de_usuario integer references usuarios(id) on delete set null, -- vacío = cuenta de la empresa
  a_usuario integer references usuarios(id) on delete set null, -- vacío = cuenta de la empresa
  monto integer not null check (monto > 0), -- en pesos
  notas text,
  creado timestamptz not null default now()
);
create index if not exists transferencias_fecha on transferencias(fecha);

-- Versión 4: un pago que llegó repartido entre varias cuentas: {"<id usuario>" | "empresa": monto}
alter table ingresos add column if not exists recibido_detalle jsonb;

-- Versión 5: porcentajes con decimales y repartos distintos por rango de meses
alter table usuarios alter column porcentaje type numeric(5, 2);
create table if not exists periodos_reparto (
  id serial primary key,
  desde date not null, -- primer día del mes inicial
  hasta date,          -- último día del mes final; vacío = sin fin
  reparto jsonb not null, -- {"<id de usuario>": porcentaje}
  nota text,
  creado timestamptz not null default now()
);

-- Versión 6: reparto en pesos. Cada ingreso dice cuánto es para cada socio y cada gasto cuánto pone
-- cada uno: {"<id de usuario>": pesos}. Vacío = mitad y mitad. Reemplaza a los porcentajes y reglas.
alter table ingresos add column if not exists para jsonb;
alter table gastos add column if not exists pone jsonb;
-- Pasa a pesos los porcentajes propios que ya existían (del movimiento o de su proyecto)
update ingresos i set para = (select jsonb_object_agg(e.key, round(i.monto * e.value::numeric / 100)) from jsonb_each_text(coalesce(i.reparto, p.reparto)) e)
  from proyectos p where i.para is null and p.id = i.proyecto_id and coalesce(i.reparto, p.reparto) is not null;
update ingresos i set para = (select jsonb_object_agg(e.key, round(i.monto * e.value::numeric / 100)) from jsonb_each_text(i.reparto) e)
  where i.para is null and i.reparto is not null;
update gastos g set pone = (select jsonb_object_agg(e.key, round(g.monto * e.value::numeric / 100)) from jsonb_each_text(coalesce(g.reparto, p.reparto)) e)
  from proyectos p where g.pone is null and p.id = g.proyecto_id and coalesce(g.reparto, p.reparto) is not null;
update gastos g set pone = (select jsonb_object_agg(e.key, round(g.monto * e.value::numeric / 100)) from jsonb_each_text(g.reparto) e)
  where g.pone is null and g.reparto is not null;
-- Los porcentajes ya quedaron pasados a pesos: se limpian para no volver a convertirlos
update ingresos set reparto = null where reparto is not null and para is not null;
update gastos set reparto = null where reparto is not null and pone is not null;
update proyectos set reparto = null where reparto is not null;

-- Versión 7: gasto pagado con la plata de la mantención de un mes ("AAAA-MM") de su proyecto.
-- Se descuenta de esa mantención y lo que queda se reparte como ella.
alter table gastos add column if not exists mant_mes text;

insert into ajustes (clave, valor) values ('esquema', '7') on conflict (clave) do update set valor = excluded.valor;
`;

// Se sube cada vez que el esquema cambia: el panel lo aplica solo la primera vez que lo necesita
export const VERSION_ESQUEMA = "7";
