// Listas cerradas del panel. Las claves se guardan en la base de datos; las etiquetas se muestran.

export const claves = <T extends object>(o: T) => Object.keys(o) as (keyof T & string)[];

export const estadosProyecto = {
  propuesta: "Propuesta",
  en_curso: "En curso",
  pausado: "Pausado",
  terminado: "Terminado",
  cancelado: "Cancelado",
} as const;
export type EstadoProyecto = keyof typeof estadosProyecto;

export const categoriasGasto = {
  hosting: "Hosting y servidores",
  dominios: "Dominios",
  correo: "Correo",
  software: "Software y suscripciones",
  publicidad: "Publicidad",
  equipos: "Equipos",
  freelance: "Freelance y colaboradores",
  impuestos: "Impuestos y trámites",
  banco: "Comisiones bancarias",
  otros: "Otros",
} as const;
export type CategoriaGasto = keyof typeof categoriasGasto;
export const etiquetaCategoria = (c: string) => categoriasGasto[c as CategoriaGasto] ?? c;

export const ciclos = { mensual: "Mensual", trimestral: "Trimestral", anual: "Anual", unico: "Pago único" } as const;
export type Ciclo = keyof typeof ciclos;
export const mesesPorCiclo: Record<Ciclo, number> = { mensual: 1, trimestral: 3, anual: 12, unico: 0 };

export const monedas = ["CLP", "USD"] as const;

// Color de cada categoría en gráficos y listas
export const colorCategoria: Record<string, string> = {
  hosting: "#9b72ff",
  dominios: "#60a5fa",
  correo: "#34d399",
  software: "#f472b6",
  publicidad: "#fbbf24",
  equipos: "#22d3ee",
  freelance: "#fb923c",
  impuestos: "#f87171",
  banco: "#94a3b8",
  otros: "#6b7280",
};
export const colorDeCategoria = (c: string) => colorCategoria[c] ?? "#6b7280";

export const tonoEstado: Record<string, "acento" | "neutro" | "bien" | "mal" | "aviso"> = {
  propuesta: "aviso",
  en_curso: "acento",
  pausado: "neutro",
  terminado: "bien",
  cancelado: "mal",
};
