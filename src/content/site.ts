// Todo el contenido de la página vive aquí: edita este archivo y se actualiza el sitio.

export const site = {
  name: "DevKode",
  url: "https://devkode.cl",
  tagline: "Desarrollo web a medida",
  description:
    "Creo tiendas online, landing pages, webs corporativas, aplicaciones web y software a medida para negocios en Chile.",
  location: "Chile",
};

// TODO: reemplaza por tus datos reales. El botón de WhatsApp solo aparece si defines `whatsapp`
// (formato internacional sin "+", ej. "56912345678").
export const contact = {
  email: "tu-correo@ejemplo.cl",
  whatsapp: null as string | null,
};

export const nav = [
  { label: "Servicios", href: "#servicios" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Tecnologías", href: "#tecnologias" },
  { label: "Proceso", href: "#proceso" },
  { label: "Contacto", href: "#contacto" },
];

export type ServiceIcon = "store" | "layout" | "building" | "app" | "code";

export const services: {
  icon: ServiceIcon;
  title: string;
  description: string;
  points: string[];
}[] = [
  {
    icon: "store",
    title: "Tiendas online",
    description:
      "Ecommerce hecho para vender: catálogo, carrito, pagos y despacho, adaptado a cómo funciona tu negocio.",
    points: ["Catálogo y stock", "Pagos locales", "Panel de administración"],
  },
  {
    icon: "layout",
    title: "Landing pages",
    description:
      "Páginas rápidas y enfocadas en una sola acción: captar clientes, lanzar un producto o promocionar una campaña.",
    points: ["Carga veloz", "Formularios y WhatsApp", "Lista para campañas"],
  },
  {
    icon: "building",
    title: "Webs corporativas",
    description:
      "El sitio de tu empresa o marca, claro, ordenado y fácil de actualizar, con la imagen que mereces.",
    points: ["Diseño propio", "Optimizado para SEO", "Responsive"],
  },
  {
    icon: "app",
    title: "Aplicaciones web",
    description:
      "Plataformas con usuarios, paneles y lógica de negocio para operar tu servicio directamente desde el navegador.",
    points: ["Cuentas y roles", "Paneles y reportes", "Integraciones"],
  },
  {
    icon: "code",
    title: "Software a medida",
    description:
      "Cuando una herramienta genérica no alcanza, desarrollo el sistema que resuelve tu problema específico.",
    points: ["Análisis del problema", "Automatización", "Escalable"],
  },
];

export type ProjectStatus = "En desarrollo";

export const projects: {
  name: string;
  kind: string;
  description: string;
  status: ProjectStatus;
  href?: string;
  domain?: string;
  tags: string[];
}[] = [
  {
    name: "RutaFood",
    kind: "Plataforma web",
    description:
      "Plataforma para que los restaurantes gestionen la logística de sus despachos en un solo lugar.",
    status: "En desarrollo",
    tags: ["Logística", "Restaurantes", "Aplicación web"],
  },
  {
    name: "Fruterra",
    kind: "Tienda online",
    description: "Tienda online de frutas y verduras.",
    status: "En desarrollo",
    href: "https://fruterra.cl",
    domain: "fruterra.cl",
    tags: ["Ecommerce", "Alimentos"],
  },
  {
    name: "Solis Racing",
    kind: "Tienda online",
    description:
      "Tienda online de autopartes de alto rendimiento y programación de ECU, desarrollada junto a Diego Solis, reconocido en el motorsport chileno por sus récords en Time Attack.",
    status: "En desarrollo",
    href: "https://solisracingparts.cl",
    domain: "solisracingparts.cl",
    tags: ["Ecommerce", "Autopartes", "Performance"],
  },
];

// Las tecnologías más habituales; quita las que no uses.
export const stack: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "PostgreSQL", "APIs REST"] },
  { group: "Ecommerce", items: ["Shopify", "WooCommerce"] },
  { group: "Pagos", items: ["Webpay Plus", "Mercado Pago", "Flow", "Stripe"] },
  { group: "Infraestructura", items: ["Vercel", "Git y GitHub"] },
];

export const process: { title: string; description: string }[] = [
  {
    title: "Conversamos",
    description:
      "Entiendo tu negocio, qué quieres lograr y qué necesitas, y te propongo el camino más simple para llegar ahí.",
  },
  {
    title: "Diseño",
    description:
      "Defino la estructura y el diseño del sitio. Lo revisamos juntos antes de escribir código.",
  },
  {
    title: "Desarrollo",
    description:
      "Construyo el sitio con tecnología moderna y te muestro avances para que veas cómo va tomando forma.",
  },
  {
    title: "Lanzamiento y soporte",
    description:
      "Publico el sitio, te dejo todo funcionando y sigo disponible para mejoras y mantenimiento.",
  },
];
