"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { salir } from "@/app/admin/(panel)/acciones";
import { Logo } from "@/components/Logo";
import { Icono, type NombreIcono } from "./Icono";

type Item = { href: string; etiqueta: string; icono: NombreIcono };

const grupos: { titulo: string; items: Item[] }[] = [
  { titulo: "General", items: [{ href: "/admin", etiqueta: "Resumen", icono: "inicio" }] },
  {
    titulo: "Trabajo",
    items: [
      { href: "/admin/proyectos", etiqueta: "Proyectos", icono: "proyectos" },
      { href: "/admin/clientes", etiqueta: "Clientes", icono: "clientes" },
    ],
  },
  {
    titulo: "Finanzas",
    items: [
      { href: "/admin/ingresos", etiqueta: "Ingresos", icono: "ingresos" },
      { href: "/admin/gastos", etiqueta: "Gastos", icono: "gastos" },
      { href: "/admin/servicios", etiqueta: "Servicios", icono: "servicios" },
      { href: "/admin/reparto", etiqueta: "Reparto", icono: "reparto" },
    ],
  },
  { titulo: "Cuenta", items: [{ href: "/admin/ajustes", etiqueta: "Ajustes", icono: "ajustes" }] },
];

const nuevos: Item[] = [
  { href: "/admin/ingresos/nuevo", etiqueta: "Ingreso", icono: "ingresos" },
  { href: "/admin/gastos/nuevo", etiqueta: "Gasto", icono: "gastos" },
  { href: "/admin/proyectos/nuevo", etiqueta: "Proyecto", icono: "proyectos" },
  { href: "/admin/clientes/nuevo", etiqueta: "Cliente", icono: "clientes" },
  { href: "/admin/servicios/nuevo", etiqueta: "Servicio", icono: "servicios" },
];

const enMenuInferior = ["/admin", "/admin/proyectos", "/admin/gastos"];

function activa(ruta: string, href: string) {
  return href === "/admin" ? ruta === "/admin" : ruta === href || ruta.startsWith(`${href}/`);
}

function Hoja({ abierta, cerrar, titulo, children }: { abierta: boolean; cerrar: () => void; titulo: string; children: React.ReactNode }) {
  return (
    <div className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${abierta ? "visible" : "pointer-events-none invisible"}`} inert={!abierta}>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${abierta ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-[#111113] px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[420px] md:-translate-x-1/2 md:rounded-3xl md:border md:pb-5 ${
          abierta ? "translate-y-0 md:-translate-y-1/2 md:opacity-100" : "translate-y-full md:-translate-y-[45%] md:opacity-0"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line md:hidden" />
        <p className="mb-3 px-2 text-sm font-medium text-muted">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

export function NavAdmin({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const [hoja, setHoja] = useState<"nuevo" | "mas" | null>(null);
  useEffect(() => setHoja(null), [ruta]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setHoja(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const usuario = (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg/60 p-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-accent/15 font-display text-sm font-semibold text-accent-soft">{iniciales}</span>
      <span className="min-w-0 flex-1 truncate text-sm">{nombre}</span>
      <form action={salir}>
        <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión" className="grid size-9 place-items-center rounded-xl text-muted transition-colors hover:bg-[#2a1118] hover:text-[#ff8fa3]">
          <Icono nombre="salir" className="size-[18px]" />
        </button>
      </form>
    </div>
  );

  const masItems = grupos.flatMap((g) => g.items).filter((i) => !enMenuInferior.includes(i.href));
  const masActiva = masItems.some((i) => activa(ruta, i.href));

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-[#0d0d0f]/95 px-4 py-6 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <Logo />
          <span className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-muted uppercase">Panel</span>
        </Link>
        <button type="button" onClick={() => setHoja("nuevo")} className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent shadow-[0_8px_24px_-8px_rgb(155_114_255/0.6)] transition hover:brightness-110">
          <Icono nombre="mas2" className="size-4" /> Nuevo registro
        </button>
        <nav aria-label="Panel" className="mt-6 flex-1 space-y-5 overflow-y-auto">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="mb-1.5 px-3 font-mono text-[10px] tracking-[0.14em] text-muted/70 uppercase">{g.titulo}</p>
              <ul className="space-y-0.5">
                {g.items.map((i) => {
                  const a = activa(ruta, i.href);
                  return (
                    <li key={i.href}>
                      <Link
                        href={i.href}
                        aria-current={a ? "page" : undefined}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                          a ? "bg-accent/12 text-fg shadow-[inset_2px_0_0_var(--color-accent)]" : "text-muted hover:bg-white/[0.03] hover:text-fg"
                        }`}
                      >
                        <Icono nombre={i.icono} className={`size-[18px] ${a ? "text-accent-soft" : ""}`} />
                        {i.etiqueta}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        {usuario}
      </aside>

      {/* Celular y tablet: barra superior */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo />
        </Link>
        <span className="grid size-9 place-items-center rounded-xl bg-accent/15 font-display text-sm font-semibold text-accent-soft" aria-label={nombre}>
          {iniciales}
        </span>
      </header>

      {/* Celular y tablet: menú inferior */}
      <nav aria-label="Panel" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#0d0d0f]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="mx-auto grid h-[4.5rem] max-w-md grid-cols-5 items-center px-2">
          {[grupos[0].items[0], grupos[1].items[0]].map((i) => (
            <BotonInferior key={i.href} item={i} activo={activa(ruta, i.href)} />
          ))}
          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => setHoja("nuevo")}
              aria-label="Nuevo registro"
              className="grid size-13 -translate-y-3 place-items-center rounded-2xl bg-accent text-on-accent shadow-[0_10px_30px_-6px_rgb(155_114_255/0.75)] transition active:scale-95"
            >
              <Icono nombre="mas2" className="size-6" />
            </button>
          </li>
          <BotonInferior item={grupos[2].items[1]} activo={activa(ruta, "/admin/gastos")} />
          <li>
            <button
              type="button"
              onClick={() => setHoja("mas")}
              className={`flex w-full flex-col items-center gap-1 text-[11px] ${masActiva ? "text-fg" : "text-muted"}`}
            >
              <Icono nombre="mas" className={`size-[22px] ${masActiva ? "text-accent-soft" : ""}`} />
              Más
            </button>
          </li>
        </ul>
      </nav>

      <Hoja abierta={hoja === "nuevo"} cerrar={() => setHoja(null)} titulo="¿Qué quieres registrar?">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {nuevos.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm transition hover:border-accent/50 hover:bg-accent/5">
                <span className="grid size-9 place-items-center rounded-xl bg-accent/12 text-accent-soft">
                  <Icono nombre={n.icono} className="size-[18px]" />
                </span>
                {n.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </Hoja>

      <Hoja abierta={hoja === "mas"} cerrar={() => setHoja(null)} titulo="Más secciones">
        <ul className="space-y-1">
          {masItems.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] ${activa(ruta, i.href) ? "bg-accent/12 text-fg" : "text-[#c9c9cf] hover:bg-white/[0.03]"}`}
              >
                <Icono nombre={i.icono} className="size-5 text-accent-soft" />
                {i.etiqueta}
                <Icono nombre="adelante" className="ml-auto size-4 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4">{usuario}</div>
      </Hoja>
    </>
  );
}

function BotonInferior({ item, activo }: { item: Item; activo: boolean }) {
  return (
    <li>
      <Link href={item.href} aria-current={activo ? "page" : undefined} className={`flex flex-col items-center gap-1 text-[11px] ${activo ? "text-fg" : "text-muted"}`}>
        <Icono nombre={item.icono} className={`size-[22px] ${activo ? "text-accent-soft" : ""}`} />
        {item.etiqueta}
      </Link>
    </li>
  );
}
