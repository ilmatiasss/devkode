import type { Metadata } from "next";

// Todo lo que está bajo /admin es privado: no se indexa ni se guarda en caché
export const metadata: Metadata = {
  title: { default: "Panel | DevKode", template: "%s | Panel DevKode" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
