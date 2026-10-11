// Todo el contenido de la página vive aquí: edita este archivo y se actualiza el sitio.

export const site = {
  name: "DevKode",
  url: "https://devkode.cl",
  title: "DevKode | Desarrollo web a medida en Chile",
  description:
    "Diseñamos y programamos tiendas online, landing pages, webs corporativas, aplicaciones web y software a medida para negocios en Chile.",
  location: "Chile",
};

// TODO: reemplaza por tus datos reales. El enlace de WhatsApp solo aparece si defines `whatsapp`
// (formato internacional sin "+", ej. "56912345678").
export const contact = {
  email: "tu-correo@ejemplo.cl",
  whatsapp: null as string | null,
};

export const nav = [
  { label: "Qué hago", href: "#servicios" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Cómo trabajamos", href: "#proceso" },
];

export const services: { title: string; description: string }[] = [
  {
    title: "Tiendas online",
    description:
      "Catálogo, carrito, pagos con Webpay o Mercado Pago y despacho. Además, un panel para que tú mismo cargues productos y revises pedidos, sin tener que llamarnos cada vez.",
  },
  {
    title: "Landing pages",
    description:
      "Una página con un solo objetivo: que te escriban, que se inscriban o que compren. Pensada para tus campañas en redes sociales y Google.",
  },
  {
    title: "Webs corporativas",
    description:
      "Quiénes son, qué hacen y cómo contactarlos, bien contado y fácil de actualizar. Es lo primero que revisa un cliente antes de llamarte.",
  },
  {
    title: "Aplicaciones web",
    description:
      "Sistemas que se usan desde el navegador, con usuarios, permisos y paneles. RutaFood, por ejemplo, ordena la logística de despachos de restaurantes.",
  },
  {
    title: "Software a medida",
    description:
      "Para cuando ninguna herramienta del mercado calza con la forma en que trabajas. Lo diseñamos en torno a tu proceso.",
  },
];

export const projects: {
  name: string;
  kind: string;
  status: string;
  description: string;
  href?: string;
  domain?: string;
}[] = [
  {
    name: "RutaFood",
    kind: "Plataforma web",
    status: "En desarrollo",
    description: "Plataforma para que los restaurantes gestionen la logística de sus despachos.",
  },
  {
    name: "Fruterra",
    kind: "Tienda online",
    status: "En desarrollo",
    description: "Tienda online de frutas y verduras.",
    href: "https://fruterra.cl",
    domain: "fruterra.cl",
  },
  {
    name: "Solis Racing",
    kind: "Tienda online",
    status: "En desarrollo",
    description:
      "Autopartes de performance y programación de ECU. La estamos haciendo junto a Diego Solis, conocido en el automovilismo chileno por sus récords en Time Attack.",
    href: "https://solisracingparts.cl",
    domain: "solisracingparts.cl",
  },
];

export const stack: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", items: ["Node.js", "APIs REST"] },
  { group: "Ecommerce", items: ["Shopify", "WooCommerce"] },
  { group: "Pagos", items: ["Webpay Plus", "Mercado Pago", "Flow"] },
  { group: "Publicación", items: ["Vercel", "GitHub"] },
];

export const steps: { title: string; description: string }[] = [
  {
    title: "Conversamos",
    description: "Nos cuentas qué necesitas y qué quieres lograr. Si con algo simple te basta, te lo decimos.",
  },
  {
    title: "Propuesta",
    description:
      "Te enviamos por escrito el alcance, los plazos y la cotización, para que sepas exactamente qué vas a recibir.",
  },
  {
    title: "Diseño y desarrollo",
    description: "Te mostramos avances durante el proceso, así puedes opinar antes de que algo quede terminado.",
  },
  {
    title: "Publicación",
    description: "Dejamos el sitio funcionando en tu dominio y seguimos disponibles para cambios y mantención.",
  },
];
