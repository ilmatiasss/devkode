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
`;
