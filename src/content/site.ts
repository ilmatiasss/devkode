// Todo el contenido de la página vive aquí: edita este archivo y se actualiza el sitio.
import type { StaticImageData } from "next/image";
import fruterraLogo from "@/assets/logos/fruterra.webp";
import rutafoodLogo from "@/assets/logos/rutafood.webp";
import solisLogo from "@/assets/logos/solis-racing.webp";

export const site = {
  name: "DevKode",
  url: "https://devkode.cl",
  title: "DevKode | Desarrollo web a medida en Chile",
  description:
    "Diseñamos y programamos tiendas online, landing pages, webs corporativas, aplicaciones web y software a medida para negocios en Chile.",
  location: "Chile",
};

// TODO: reemplaza por tus datos reales. El botón de WhatsApp solo aparece si defines `whatsapp`
// (formato internacional sin "+", ej. "56912345678").
export const contact = {
  email: "tu-correo@ejemplo.cl",
  whatsapp: null as string | null,
};

export const nav = [
  { label: "Proyectos", href: "#proyectos" },
  { label: "Servicios", href: "#servicios" },
  { label: "Cómo trabajamos", href: "#proceso" },
];

export const services: { title: string; description: string; tags?: string[] }[] = [
  {
    title: "Tiendas online",
    description:
      "Catálogo, carrito, pagos y despacho, más un panel para que tú mismo cargues productos y revises pedidos, sin tener que llamarnos cada vez.",
    tags: ["Webpay", "Mercado Pago", "Flow"],
  },
  {
    title: "Landing pages",
    description: "Una página con un solo objetivo: que te escriban, que se inscriban o que compren.",
  },
  {
    title: "Webs corporativas",
    description: "Quiénes son, qué hacen y cómo contactarlos, bien contado y fácil de actualizar.",
  },
  {
    title: "Aplicaciones web",
    description: "Sistemas con usuarios, permisos y paneles que tu equipo usa desde el navegador.",
  },
  {
    title: "Software a medida",
    description: "Cuando ninguna herramienta del mercado calza con tu forma de trabajar, la construimos.",
  },
];

export type Project = {
  name: string;
  kind: string;
  // Solo para proyectos en curso. Cuando uno se termina, borra esta línea.
  status?: "En desarrollo";
  description: string;
  // Sin logo se muestra el nombre como texto
  logo?: StaticImageData;
  // Alto máximo del logo dentro de su recuadro (por defecto 86%)
  logoMaxHeight?: string;
  href?: string;
  domain?: string;
};

export const projects: Project[] = [
  {
    name: "Fruterra",
    kind: "Tienda online",
    description: "Frutas y verduras frescas con despacho a domicilio en Santiago.",
    logo: fruterraLogo,
    href: "https://fruterra.cl",
    domain: "fruterra.cl",
  },
  {
    name: "RutaFood",
    kind: "Plataforma web",
    description: "Gestión de delivery propio para restaurantes, sin comisiones por pedido.",
    logo: rutafoodLogo,
    logoMaxHeight: "70%",
    href: "https://rutafood.cl",
    domain: "rutafood.cl",
  },
  {
    name: "Solis Racing",
    kind: "Tienda online",
    status: "En desarrollo",
    description: "Autopartes de performance y programación de ECU, junto a Diego Solis.",
    logo: solisLogo,
    href: "https://solisracingparts.cl",
    domain: "solisracingparts.cl",
  },
];

export const steps: { title: string; description: string }[] = [
  {
    title: "Conversamos",
    description: "Nos cuentas qué necesitas y qué quieres lograr. Si con algo simple te basta, te lo decimos.",
  },
  {
    title: "Propuesta",
    description: "Te enviamos por escrito el alcance, los plazos y la cotización.",
  },
  {
    title: "Diseño y desarrollo",
    description: "Te mostramos avances para que puedas opinar antes de que algo quede terminado.",
  },
  {
    title: "Publicación",
    description: "Dejamos el sitio funcionando en tu dominio y seguimos disponibles para cambios y mantención.",
  },
];
