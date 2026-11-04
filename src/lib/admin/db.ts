import postgres from "postgres";

// Conexión a PostgreSQL (Neon). En Vercel usa la cadena "pooled" de Neon en DATABASE_URL.
// prepare: false es necesario con el pooler de Neon (PgBouncer en modo transacción).
const url = process.env.DATABASE_URL;

export const dbConfigurada = Boolean(url);

function conectar() {
  return postgres(url!, {
    prepare: false,
    max: 5,
    // Las conexiones se reutilizan entre visitas: abrir una nueva hacia Neon cuesta varias idas y
    // vueltas (TLS + autenticación), que es justo lo que se sentía lento al navegar
    idle_timeout: 300,
    max_lifetime: 60 * 30,
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

// Aplica el esquema si la base quedó en una versión anterior. Se revisa una vez por instancia
// del servidor (una consulta) y solo si hace falta corre las migraciones, que son idempotentes.
let migracion: Promise<void> | null = null;
export function asegurarEsquema() {
  return (migracion ??= (async () => {
    const sql = db();
    const { ESQUEMA, VERSION_ESQUEMA } = await import("./esquema");
    try {
      const [fila] = await sql<{ valor: string }[]>`select valor from ajustes where clave = 'esquema'`;
      if (fila?.valor === VERSION_ESQUEMA) return;
    } catch {
      return; // la base aún no tiene tablas: las crea la configuración inicial
    }
    await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(727274)`;
      await tx.unsafe(ESQUEMA);
    });
  })().catch((error) => {
    migracion = null;
    throw error;
  }));
}
