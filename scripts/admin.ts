// Herramientas de línea de comandos del panel. Leen DATABASE_URL del entorno o de .env.local.
//   npm run admin:migrar                 aplica el esquema (crea o completa las tablas)
//   npm run admin:clave -- correo@x.cl   fija una contraseña nueva para esa cuenta (y la desbloquea)

import { createInterface } from "node:readline";
import postgres from "postgres";
import { CLAVE_MINIMA, hashClave } from "../src/lib/admin/clave.ts";
import { ESQUEMA } from "../src/lib/admin/esquema.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL (en el entorno o en .env.local).");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1, onnotice: () => {} });

// Pide una contraseña sin mostrarla en pantalla
function preguntarOculto(pregunta: string) {
  return new Promise<string>((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const escribir = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => escribir(s.includes(pregunta) ? s : "");
    rl.question(pregunta, (respuesta) => {
      rl.close();
      process.stdout.write("\n");
      resolve(respuesta);
    });
  });
}

const [comando, email] = process.argv.slice(2);
try {
  if (comando === "migrar") {
    await sql.unsafe(ESQUEMA);
    console.log("Esquema aplicado.");
  } else if (comando === "clave" && email) {
    const [usuario] = await sql`select id, nombre from usuarios where email = ${email.toLowerCase()}`;
    if (!usuario) throw new Error(`No existe una cuenta con el correo ${email}.`);
    const clave = await preguntarOculto(`Nueva contraseña para ${usuario.nombre}: `);
    if (clave.length < CLAVE_MINIMA) throw new Error(`Debe tener al menos ${CLAVE_MINIMA} caracteres.`);
    if ((await preguntarOculto("Repítela: ")) !== clave) throw new Error("No coinciden.");
    await sql`update usuarios set hash_clave = ${await hashClave(clave)}, intentos_fallidos = 0, bloqueado_hasta = null where id = ${usuario.id}`;
    await sql`delete from sesiones where usuario_id = ${usuario.id}`;
    console.log("Contraseña actualizada. Se cerraron sus sesiones abiertas.");
  } else {
    console.log("Uso: npm run admin:migrar  |  npm run admin:clave -- correo@dominio.cl");
  }
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
