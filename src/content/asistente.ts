// Lo que el asistente puede recomendar. Todo lo que ve el visitante sale de aquí: la IA solo elige
// qué módulos aplican (por su id) y explica por qué, nunca inventa funciones ni promete valores.
// Para sumar una función nueva, agrégala a `modulos` y, si quieres, a los presets y palabras clave.

import { projectTypes } from "./site";

export type Modulo = {
  id: string;
  titulo: string;
  // Qué es, en palabras de cliente
  descripcion: string;
  // Palabras que, si el cliente las menciona, hacen que el modo sin IA lo recomiende
  palabras?: RegExp;
};

export const modulos: Modulo[] = [
  {
    id: "catalogo",
    titulo: "Catálogo de productos",
    descripcion: "Tus productos ordenados por categorías, con fotos, precios y buscador.",
    palabras: /cat[aá]logo|productos|inventario de|vitrina/i,
  },
  {
    id: "carrito",
    titulo: "Carrito y compra",
    descripcion: "Que tus clientes elijan productos y compren en pocos pasos, desde el celular o el computador.",
    palabras: /carrito|comprar|compra online|vender online|tienda/i,
  },
  {
    id: "pagos",
    titulo: "Pasarela de pagos",
    descripcion: "Cobrar online con tarjeta o transferencia, con medios como Webpay, Mercado Pago o Flow.",
    palabras: /pago|pagar|cobrar|webpay|tarjeta|mercado ?pago|flow|transferencia/i,
  },
  {
    id: "despachos",
    titulo: "Despachos y retiro",
    descripcion: "Definir cómo llega el pedido: envío a domicilio por comuna o región, o retiro en tienda.",
    palabras: /despacho|env[ií]o|delivery|reparto|retiro|courier|chilexpress|starken/i,
  },
  {
    id: "inventario",
    titulo: "Control de inventario",
    descripcion: "El stock se descuenta solo con cada venta, y te avisa cuando un producto se está acabando.",
    palabras: /inventario|stock|bodega/i,
  },
  {
    id: "panel",
    titulo: "Panel de administración",
    descripcion: "Un panel privado para que cargues productos, revises pedidos y edites contenido sin depender de nadie.",
    palabras: /panel|administrar|administraci[oó]n|gestionar|gesti[oó]n|cargar productos/i,
  },
  {
    id: "cuentas",
    titulo: "Cuentas de clientes",
    descripcion: "Que tus clientes se registren, vean su historial de pedidos y vuelvan a comprar más rápido.",
    palabras: /cuenta|registr|login|iniciar sesi[oó]n|clientes frecuentes|usuarios/i,
  },
  {
    id: "roles",
    titulo: "Usuarios y permisos",
    descripcion: "Accesos distintos para tu equipo, por ejemplo administrador, vendedor o repartidor.",
    palabras: /roles?|permisos|equipo|vendedores|repartidores|trabajadores/i,
  },
  {
    id: "documentos",
    titulo: "Boleta y factura electrónica",
    descripcion: "Emitir documentos tributarios automáticamente al vender, conectado al SII o a un proveedor de facturación.",
    palabras: /boleta|factura|sii|tributari|dte/i,
  },
  {
    id: "reservas",
    titulo: "Reservas y agenda",
    descripcion: "Que tus clientes reserven o agenden una hora online, con confirmación y recordatorios.",
    palabras: /reserva|agenda|agendar|horas?\b|citas?\b|turnos?/i,
  },
  {
    id: "seguimiento",
    titulo: "Seguimiento de entregas",
    descripcion: "Ver en qué estado va cada pedido o despacho, y que tu cliente también pueda seguirlo.",
    palabras: /seguimiento|tracking|ruta|repartidor|log[ií]stica|entregas?/i,
  },
  {
    id: "contenido",
    titulo: "Blog o noticias",
    descripcion: "Publicar artículos, novedades o casos de éxito de forma fácil, para atraer visitas y generar confianza.",
    palabras: /blog|noticias|art[ií]culos|novedades/i,
  },
  {
    id: "formulario",
    titulo: "Formularios y contacto",
    descripcion: "Que te escriban o pidan una cotización desde la página, con aviso directo a tu correo.",
    palabras: /contacto|cotiza|formulario|whatsapp|consultas/i,
  },
  {
    id: "seo",
    titulo: "Posicionamiento en Google (SEO)",
    descripcion: "Que tu sitio cargue rápido y esté bien preparado para aparecer cuando te busquen en Google.",
    palabras: /google|seo|posicion|aparecer|buscador/i,
  },
  {
    id: "idiomas",
    titulo: "Varios idiomas",
    descripcion: "Mostrar el sitio en más de un idioma, por ejemplo español e inglés.",
    palabras: /idiomas?|ingl[eé]s|extranjer|internacional|exportar/i,
  },
  {
    id: "reportes",
    titulo: "Reportes y estadísticas",
    descripcion: "Ver cuánto vendes, qué se vende más y cómo avanza tu negocio, con gráficos fáciles de leer.",
    palabras: /reporte|estad[ií]stica|m[eé]tricas|gr[aá]ficos|dashboard|an[aá]lisis/i,
  },
  {
    id: "avisos",
    titulo: "Avisos automáticos",
    descripcion: "Correos o mensajes automáticos: confirmación de compra, cambio de estado del pedido, recordatorios.",
    palabras: /aviso|notifica|recordatorio|alerta|confirmaci[oó]n/i,
  },
  {
    id: "integraciones",
    titulo: "Conexión con otros sistemas",
    descripcion: "Conectar el sitio con lo que ya usas: ERP, CRM, contabilidad, marketplaces o planillas.",
    palabras: /erp|crm|integr|conectar|contabilidad|marketplace|mercado ?libre|excel|planilla/i,
  },
];

export const moduloIds = modulos.map((m) => m.id) as [string, ...string[]];
export const moduloPorId = (id: string) => modulos.find((m) => m.id === id);

// Qué se recomienda de base según el tipo de proyecto (lo "esencial" y lo "recomendado")
export const presets: Record<string, { esencial: string[]; recomendado: string[] }> = {
  "Tienda online": {
    esencial: ["catalogo", "carrito", "pagos", "despachos", "panel"],
    recomendado: ["inventario", "cuentas", "documentos", "avisos", "seo", "reportes"],
  },
  "Landing page": {
    esencial: ["formulario", "seo"],
    recomendado: ["reportes", "avisos"],
  },
  "Web corporativa": {
    esencial: ["formulario", "seo", "panel"],
    recomendado: ["contenido", "idiomas", "reportes"],
  },
  "Aplicación web": {
    esencial: ["cuentas", "roles", "panel"],
    recomendado: ["avisos", "reportes", "integraciones"],
  },
  "Software a medida": {
    esencial: ["roles", "panel"],
    recomendado: ["integraciones", "reportes", "avisos"],
  },
  "Aún no lo sé": { esencial: [], recomendado: [] },
};

// Palabras que delatan el tipo de proyecto (modo sin IA). Se evalúan en este orden.
export const tiposPorPalabras: [string, RegExp][] = [
  ["Tienda online", /tienda|vender|venta|e-?commerce|productos|carrito|cat[aá]logo/i],
  ["Aplicación web", /sistema|aplicaci[oó]n|app\b|plataforma|panel|gesti[oó]n|usuarios|reservas|agenda/i],
  ["Landing page", /landing|campa[nñ]a|promoci[oó]n|lanzamiento|una sola p[aá]gina/i],
  ["Web corporativa", /empresa|corporativ|institucional|sitio web|p[aá]gina web|presentar|servicios/i],
  ["Software a medida", /a medida|software|automatizar|erp|procesos/i],
];

// Preguntas para afinar la cotización, según el tipo (se usan cuando no hay IA)
export const preguntasPorTipo: Record<string, string[]> = {
  "Tienda online": [
    "¿Cuántos productos tienes, aproximadamente?",
    "¿Despachas a todo Chile o solo a algunas zonas?",
    "¿Ya vendes por otro medio (redes sociales, local) o parte de cero?",
  ],
  "Landing page": [
    "¿Cuál es el objetivo principal: que te escriban, se inscriban o compren?",
    "¿Ya tienes logo, textos y fotos, o necesitas apoyo con eso?",
  ],
  "Web corporativa": [
    "¿Cuántas secciones o páginas imaginas?",
    "¿Ya tienes un sitio que haya que rehacer, o es el primero?",
  ],
  "Aplicación web": [
    "¿Quiénes la usarían y qué haría cada tipo de usuario?",
    "¿Reemplaza algo que hoy haces en planillas o a mano?",
  ],
  "Software a medida": [
    "¿Qué proceso quieres automatizar y quién lo hace hoy?",
    "¿Tiene que conectarse con algún sistema que ya usas?",
  ],
  "Aún no lo sé": [
    "¿Qué quieres lograr con tu sitio: vender, mostrar tu trabajo o recibir contactos?",
    "¿Para cuándo lo necesitas, aproximadamente?",
  ],
};

export const tipoValido = (tipo: unknown): tipo is string => typeof tipo === "string" && projectTypes.includes(tipo);

// Respuesta del asistente (la misma para el modo con IA y el modo sin IA)
export type Orientacion = {
  modo: "ia" | "reglas";
  proyecto: string;
  resumen: string;
  modulos: { id: string; titulo: string; descripcion: string; motivo: string; prioridad: "esencial" | "recomendado" }[];
  preguntas: string[];
};
