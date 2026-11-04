import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Contraseñas con scrypt (incluido en Node, sin dependencias). Se guarda el algoritmo, sus
// parámetros, la sal y la huella, así se pueden endurecer los parámetros más adelante.
const N = 32768;
const R = 8;
const P = 1;
const LARGO = 64;

export const CLAVE_MINIMA = 12;

function derivar(clave: string, sal: Buffer, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(clave.normalize("NFKC"), sal, LARGO, { N: n, r, p, maxmem: 256 * n * r }, (error, huella) =>
      error ? reject(error) : resolve(huella),
    ),
  );
}

export async function hashClave(clave: string) {
  const sal = randomBytes(16);
  const huella = await derivar(clave, sal, N, R, P);
  return `scrypt$${N}$${R}$${P}$${sal.toString("base64")}$${huella.toString("base64")}`;
}

export async function verificarClave(clave: string, guardado: string) {
  const [algoritmo, n, r, p, sal, huella] = guardado.split("$");
  if (algoritmo !== "scrypt" || !sal || !huella) return false;
  const esperado = Buffer.from(huella, "base64");
  const calculado = await derivar(clave, Buffer.from(sal, "base64"), Number(n), Number(r), Number(p));
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
