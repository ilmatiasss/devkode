import type { Metadata } from "next";

// Todo lo que está bajo /admin es privado: no se indexa ni se guarda en caché
export const metadata: Metadata = {
  title: { default: "Panel | DevKode", template: "%s | Panel DevKode" },
  robots: { index: false, follow: false, nocache: true },
};

// Ninguna página del panel se genera al desplegar: siempre se arma en cada visita, con la sesión
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
