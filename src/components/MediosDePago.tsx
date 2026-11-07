import Image, { type StaticImageData } from "next/image";
import flow from "@/assets/pagos/flow.png";
import klap from "@/assets/pagos/klap.png";
import mercadopago from "@/assets/pagos/mercadopago.png";
import webpay from "@/assets/pagos/webpay.png";

// Logos de los medios de pago en fichas blancas, como se ven en las tiendas donde la gente compra
const logos: Record<string, StaticImageData> = { Webpay: webpay, "Mercado Pago": mercadopago, Flow: flow, Klap: klap };

export function MediosDePago({ nombres, grande = false }: { nombres: string[]; grande?: boolean }) {
  const lista = nombres.filter((n) => logos[n]);
  if (!lista.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Medios de pago">
      {lista.map((n) => (
        <li key={n} className={`flex items-center justify-center rounded-md bg-white ${grande ? "h-12 px-4" : "h-10 px-3"}`}>
          <Image src={logos[n]} alt={n} className={`w-auto ${grande ? "h-7" : "h-5"}`} sizes="120px" />
        </li>
      ))}
    </ul>
  );
}
