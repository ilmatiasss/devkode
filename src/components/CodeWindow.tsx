// Editor de código decorativo: el "código" describe lo que ofrecemos, en español.

type Token = [string, string];

const k = "text-[#ff7a45]"; // palabras clave
const c = "text-[#ffc861]"; // componentes y funciones
const a = "text-[#8fb8ff]"; // atributos
const s = "text-[#b5e48c]"; // textos
const p = "text-muted"; // puntuación
const t = "text-fg";

const lines: Token[][] = [
  [[k, "export default function "], [c, "TuNegocio"], [p, "() {"]],
  [[k, "  return "], [p, "("]],
  [[p, "    <"], [c, "Tienda"]],
  [[a, "      diseño"], [p, "="], [s, '"a medida"']],
  [[a, "      catalogo"], [p, "="], [s, '"autoadministrable"']],
  [[a, "      pagos"], [p, "={["]],
  [[s, '        "Webpay"'], [p, ","]],
  [[s, '        "Mercado Pago"'], [p, ","]],
  [[s, '        "Flow"'], [p, ","]],
  [[p, "      ]}"]],
  [[a, "      despacho"], [p, "="], [s, '"todo Chile"']],
  [[a, "      responsive"]],
  [[p, "    />"]],
  [[p, "  );"]],
  [[p, "}"]],
];

export function CodeWindow({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/60 via-white/10 to-transparent"
      />
      <div
        role="img"
        aria-label="Editor de código con un ejemplo de tienda online hecha a medida"
        className="relative overflow-hidden rounded-2xl bg-[#0c0d10] shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-1 border-b border-white/[0.06] bg-surface px-3 font-mono text-xs">
          <span className="flex gap-1.5 pr-3" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
          </span>
          <span className="border-b-2 border-accent px-3 py-2.5 text-fg">tu-negocio.tsx</span>
          <span className="px-3 py-2.5 text-muted">pagos.ts</span>
        </div>

        <pre
          className="overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.75] sm:p-5 sm:text-[13.5px]"
          aria-hidden="true"
        >
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-6 shrink-0 select-none text-right text-white/20 sm:w-8">{i + 1}</span>
              <span className="whitespace-pre pl-3 sm:pl-5">
                {line.map(([cls, text], j) => (
                  <span key={j} className={cls}>
                    {text}
                  </span>
                ))}
                {i === lines.length - 1 ? <span className={`caret ${t}`}>▌</span> : null}
              </span>
            </div>
          ))}
        </pre>

        <div className="flex items-center justify-between border-t border-white/[0.06] bg-surface px-4 py-2 font-mono text-[11px] text-muted">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" />
            main
          </span>
          <span>TypeScript · Next.js</span>
        </div>
      </div>
    </div>
  );
}
