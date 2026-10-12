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
    titulo: "Carrito de compras",
    descripcion: "Que tus clientes elijan productos y compren en pocos pasos, desde el celular o el computador.",
    palabras: /carrito|comprar|compra online|vender online|tienda/i,
  },
  {
    id: "pagos",
    titulo: "Pasarela de pagos",
    descripcion: "Cobrar online con tarjeta o transferencia, con medios como Webpay, Mercado Pago o Flow.",
    palabras: /\bpago|\bpagar|\bcobrar|webpay|tarjeta|mercado ?pago|\bflow\b|transferencia/i,
  },
  {
    id: "despachos",
    titulo: "Despachos",
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
    palabras: /\bcuentas?\b|registr|login|iniciar sesi[oó]n|clientes frecuentes|usuarios/i,
  },
  {
    id: "roles",
    titulo: "Usuarios con permisos",
    descripcion: "Accesos distintos para tu equipo, por ejemplo administrador, vendedor o repartidor.",
    palabras: /\broles?\b|permisos|equipo|vendedores|repartidores|trabajadores/i,
  },
  {
    id: "documentos",
    titulo: "Boleta electrónica",
    descripcion: "Emitir documentos tributarios automáticamente al vender, conectado al SII o a un proveedor de facturación.",
    palabras: /boleta|factura|\bsii\b|tributari|\bdte\b/i,
  },
  {
    id: "reservas",
    titulo: "Reservas online",
    descripcion: "Que tus clientes reserven o agenden una hora online, con confirmación y recordatorios.",
    palabras: /reserva|\bagenda|agendar|\bhoras?\b|\bcitas?\b|\bturnos?\b/i,
  },
  {
    id: "seguimiento",
    titulo: "Seguimiento de entregas",
    descripcion: "Ver en qué estado va cada pedido o despacho, y que tu cliente también pueda seguirlo.",
    palabras: /seguimiento|tracking|\brutas?\b|repartidor|log[ií]stica|\bentregas?\b/i,
  },
  {
    id: "contenido",
    titulo: "Blog o noticias",
    descripcion: "Publicar artículos, novedades o casos de éxito de forma fácil, para atraer visitas y generar confianza.",
    palabras: /blog|noticias|art[ií]culos|novedades/i,
  },
  {
    id: "formulario",
    titulo: "Formulario de contacto",
    descripcion: "Que te escriban o pidan una cotización desde la página, con aviso directo a tu correo.",
    palabras: /contacto|cotiza|formulario|whatsapp|consultas/i,
  },
  {
    id: "seo",
    titulo: "Posicionamiento en Google",
    descripcion: "Que tu sitio cargue rápido y esté bien preparado para aparecer cuando te busquen en Google.",
    palabras: /google|\bseo\b|posicion|aparecer|buscador/i,
  },
  {
    id: "idiomas",
    titulo: "Varios idiomas",
    descripcion: "Mostrar el sitio en más de un idioma, por ejemplo español e inglés.",
    palabras: /idiomas?|ingl[eé]s|extranjer|internacional|exportar/i,
  },
  {
    id: "reportes",
    titulo: "Estadísticas del negocio",
    descripcion: "Ver cuánto vendes, qué se vende más y cómo avanza tu negocio, con gráficos fáciles de leer.",
    palabras: /reporte|estad[ií]stica|m[eé]tricas|gr[aá]ficos|dashboard|an[aá]lisis/i,
  },
  {
    id: "avisos",
    titulo: "Avisos automáticos",
    descripcion: "Correos o mensajes automáticos: confirmación de compra, cambio de estado del pedido, recordatorios.",
    palabras: /\baviso|notifica|recordatorio|\balerta|confirmaci[oó]n/i,
  },
  {
    id: "integraciones",
    titulo: "Conexión con otros sistemas",
    descripcion: "Conectar el sitio con lo que ya usas: ERP, CRM, contabilidad, marketplaces o planillas.",
    palabras: /\berp\b|\bcrm\b|integr|conectar|contabilidad|marketplace|mercado ?libre|\bexcel\b|planilla/i,
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

// Preguntas que el asistente hace una a una cuando no hay IA, con respuestas rápidas sugeridas
export type PreguntaGuiada = { pregunta: string; sugerencias: string[] };

export const preguntasPorTipo: Record<string, PreguntaGuiada[]> = {
  "Tienda online": [
    { pregunta: "¿Cuántos productos tienes, más o menos?", sugerencias: ["Menos de 50", "Entre 50 y 500", "Más de 500"] },
    { pregunta: "¿Despachas a todo Chile o solo a algunas zonas?", sugerencias: ["A todo Chile", "Solo mi ciudad", "También retiro en tienda"] },
    { pregunta: "¿Ya vendes por otro medio, como redes sociales o un local, o partes de cero?", sugerencias: ["Vendo por Instagram", "Tengo un local", "Parto de cero"] },
  ],
  "Landing page": [
    { pregunta: "¿Cuál es el objetivo principal de la página?", sugerencias: ["Que me escriban", "Que se inscriban", "Que compren"] },
    { pregunta: "¿Ya tienes logo, textos y fotos, o necesitas apoyo con eso?", sugerencias: ["Ya tengo todo", "Necesito apoyo"] },
  ],
  "Web corporativa": [
    { pregunta: "¿Cuántas secciones o páginas imaginas, más o menos?", sugerencias: ["Pocas, de 3 a 5", "Unas 10", "No sé"] },
    { pregunta: "¿Ya tienes un sitio que haya que rehacer, o sería el primero?", sugerencias: ["Hay que rehacerlo", "Sería el primero"] },
  ],
  "Aplicación web": [
    { pregunta: "¿Quiénes la usarían y qué haría cada uno?", sugerencias: ["Mi equipo", "Mis clientes", "Ambos"] },
    { pregunta: "¿Reemplaza algo que hoy haces en planillas o a mano?", sugerencias: ["Sí, en planillas", "Sí, a mano", "Es algo nuevo"] },
  ],
  "Software a medida": [
    { pregunta: "¿Qué proceso quieres automatizar y quién lo hace hoy?", sugerencias: [] },
    { pregunta: "¿Tiene que conectarse con algún sistema que ya usas?", sugerencias: ["Sí", "No", "No estoy seguro"] },
  ],
  "Aún no lo sé": [
    {
      pregunta: "¿Qué quieres lograr con tu sitio?",
      sugerencias: ["Vender mis productos", "Mostrar mi trabajo", "Recibir consultas", "Gestionar mi negocio"],
    },
    { pregunta: "¿Para cuándo lo necesitas, más o menos?", sugerencias: ["Lo antes posible", "En unos meses", "Sin apuro"] },
  ],
};

export const tipoValido = (tipo: unknown): tipo is string => typeof tipo === "string" && projectTypes.includes(tipo);

// Una conversación: lo que escribe el visitante y lo que responde el asistente
export type Mensaje = { rol: "usuario" | "asistente"; texto: string };

// Lo que devuelve la API en cada turno (igual con IA y sin IA)
export type Respuesta = {
  modo: "ia" | "reglas";
  texto: string;
  // Respuestas rápidas que el visitante puede tocar en vez de escribir
  sugerencias: string[];
  // Ya hay información suficiente para ofrecer la cotización
  listo: boolean;
  // Lectura actual del asistente sobre el proyecto (puede cambiar a medida que conversan)
  proyecto: string;
  funciones: { id: string; titulo: string }[];
};
