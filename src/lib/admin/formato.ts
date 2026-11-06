// Formatos y lectura de formularios del panel

const ZONA = "America/Santiago";

const pesos = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const dolares = new Intl.NumberFormat("es-CL", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const clp = (n: number) => (n < 0 ? `−${pesos.format(Math.round(-n))}` : pesos.format(Math.round(n)));
export const usd = (n: number) => dolares.format(n);
export const dinero = (n: number, moneda: string) => (moneda === "USD" ? usd(n) : clp(n));

// "Hoy" según la hora de Chile, como "AAAA-MM-DD"
export const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
export const mesActual = () => hoy().slice(0, 7);

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function fecha(valor: string | null | undefined) {
  if (!valor) return "—";
  const [a, m, d] = valor.split("-").map(Number);
  return `${d} ${meses[m - 1].slice(0, 3)} ${a}`;
}

export const nombreMes = (mes: string) => {
  const [a, m] = mes.split("-").map(Number);
  return `${meses[m - 1]} ${a}`;
};

export function moverMes(mes: string, delta: number) {
  const [a, m] = mes.split("-").map(Number);
  const total = a * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export const esMes = (valor: unknown): valor is string => typeof valor === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(valor);

export function diasHasta(valor: string) {
  const [a, m, d] = valor.split("-").map(Number);
  const [ha, hm, hd] = hoy().split("-").map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ha, hm - 1, hd)) / 86_400_000);
}

// Suma meses a una fecha "AAAA-MM-DD"; si el día no existe en el mes de destino, usa el último
export function sumarMeses(valor: string, cantidad: number) {
  const [a, m, d] = valor.split("-").map(Number);
  const destino = new Date(Date.UTC(a, m - 1 + cantidad, 1));
  const ultimo = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
  destino.setUTCDate(Math.min(d, ultimo));
  return destino.toISOString().slice(0, 10);
}

// ---- Lectura de formularios ----

// Mensajes de validación. Solo estos se muestran al volver al formulario (no se refleja texto arbitrario).
export const MENSAJES = {
  faltan: "Faltan datos obligatorios",
  monto: "Revisa el monto: solo números, sin decimales",
  rango: "El monto está fuera de rango",
  decimal: "Revisa el monto: hasta dos decimales",
  fecha: "Revisa la fecha",
  porcentajes: "Los porcentajes deben sumar 100",
  clave: "La contraseña actual no es correcta",
  claveCorta: "La nueva contraseña debe tener al menos 12 caracteres",
  claveDistinta: "Las contraseñas nuevas no coinciden",
  mantencionRepetida: "Esa mantención ya estaba registrada para ese mes",
  transferencia: "Quien entrega y quien recibe deben ser distintos",
  division: "Lo que llegó a cada cuenta debe sumar el monto total",
  partes: "Lo que le corresponde a cada uno debe sumar el monto total",
  mantencionProyecto: "Para pagarlo con la mantención, elige el proyecto",
} as const;
export type CodigoError = keyof typeof MENSAJES;
export const mensajeDe = (codigo: unknown) => (typeof codigo === "string" && codigo in MENSAJES ? MENSAJES[codigo as CodigoError] : null);

export class ErrorDeDatos extends Error {
  constructor(public codigo: CodigoError) {
    super(MENSAJES[codigo]);
  }
}

export function texto(fd: FormData, campo: string, max = 200, obligatorio = false) {
  const valor = String(fd.get(campo) ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
  if (obligatorio && !valor) throw new ErrorDeDatos("faltan");
  return valor;
}

export const opcional = (fd: FormData, campo: string, max = 2000) => texto(fd, campo, max) || null;

// Montos en pesos: acepta "1.250.000", "$ 1250000" o "1250000"
export function pesosDe(fd: FormData, campo: string, minimo = 0) {
  const limpio = String(fd.get(campo) ?? "").replace(/[$\s.]/g, "");
  if (!/^\d{1,10}$/.test(limpio)) throw new ErrorDeDatos("monto");
  const n = Number(limpio);
  if (n < minimo || n > 2_000_000_000) throw new ErrorDeDatos("rango");
  return n;
}

// Montos con decimales (para servicios en dólares): acepta "12,50" o "12.50"
export function decimalDe(fd: FormData, campo: string) {
  const limpio = String(fd.get(campo) ?? "").replace(/[$\s]/g, "").replace(",", ".");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(limpio)) throw new ErrorDeDatos("decimal");
  return Number(limpio);
}

export function fechaDe(fd: FormData, campo: string, obligatorio = true) {
  const valor = String(fd.get(campo) ?? "").trim();
  if (!valor && !obligatorio) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) throw new ErrorDeDatos("fecha");
  return valor;
}

export function idDe(fd: FormData, campo: string) {
  const valor = String(fd.get(campo) ?? "");
  return /^\d{1,9}$/.test(valor) ? Number(valor) : null;
}

export function opcionDe<T extends string>(fd: FormData, campo: string, validas: readonly T[], porDefecto: T): T {
  const valor = String(fd.get(campo) ?? "");
  return (validas as readonly string[]).includes(valor) ? (valor as T) : porDefecto;
}
