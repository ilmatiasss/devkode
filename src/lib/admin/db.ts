import postgres from "postgres";

// Conexión a PostgreSQL (Neon). En Vercel usa la cadena "pooled" de Neon en DATABASE_URL.
// prepare: false es necesario con el pooler de Neon (PgBouncer en modo transacción).
const url = process.env.DATABASE_URL;

export const dbConfigurada = Boolean(url);

function conectar() {
  return postgres(url!, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
    types: {
      // Las fechas (sin hora) se manejan como texto "AAAA-MM-DD", sin conversiones de zona horaria
      fecha: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
      // Sumas y conteos (bigint) y montos con decimales (numeric) llegan como número
      grande: { to: 20, from: [20], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
      decimal: { to: 1700, from: [1700], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
    },
  });
}

const global = globalThis as unknown as { __devkodeSql?: ReturnType<typeof conectar> };

export function db() {
  if (!url) throw new Error("Falta la variable DATABASE_URL");
  return (global.__devkodeSql ??= conectar());
}
