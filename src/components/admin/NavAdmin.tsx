"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/admin", etiqueta: "Resumen" },
  { href: "/admin/proyectos", etiqueta: "Proyectos" },
  { href: "/admin/clientes", etiqueta: "Clientes" },
  { href: "/admin/ingresos", etiqueta: "Ingresos" },
  { href: "/admin/gastos", etiqueta: "Gastos" },
  { href: "/admin/servicios", etiqueta: "Servicios" },
  { href: "/admin/reparto", etiqueta: "Reparto" },
  { href: "/admin/ajustes", etiqueta: "Ajustes" },
];

export function NavAdmin() {
  const ruta = usePathname();
  return (
    <nav aria-label="Panel" className="-mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col lg:overflow-visible">
      {secciones.map(({ href, etiqueta }) => {
        const activa = href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`whitespace-nowrap px-3 py-2 text-sm transition-colors ${
              activa ? "bg-accent/15 text-fg lg:border-l-2 lg:border-accent" : "text-muted hover:text-fg lg:border-l-2 lg:border-transparent"
            }`}
          >
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
