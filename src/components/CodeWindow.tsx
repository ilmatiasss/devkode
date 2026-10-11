// Editor de código decorativo: el "código" describe lo que ofrecemos, en español.

type Token = [string, string];

const k = "text-[#ff7a45]"; // palabras clave
const c = "text-[#e8c07a]"; // componentes y funciones
const a = "text-[#a3b8d0]"; // atributos
const s = "text-[#c5d39b]"; // textos
const p = "text-muted"; // puntuación

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
    <div
      role="img"
      aria-label="Editor de código con un ejemplo de tienda online hecha a medida"
      className={`overflow-hidden rounded-[3px] border border-line bg-[#0e0e10]/85 ${className}`}
    >
      <div className="flex items-center border-b border-line font-mono text-xs">
        <span className="border-r border-line bg-bg px-4 py-2.5 text-fg">tu-negocio.tsx</span>
        <span className="px-4 py-2.5 text-muted">pagos.ts</span>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.8] sm:p-5 sm:text-[13px]" aria-hidden="true">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-6 shrink-0 select-none text-right text-white/20 sm:w-8">{i + 1}</span>
            <span className="whitespace-pre pl-3 sm:pl-5">
              {line.map(([cls, text], j) => (
                <span key={j} className={cls}>
                  {text}
                </span>
              ))}
              {i === lines.length - 1 ? <span className="caret text-fg">▌</span> : null}
            </span>
          </div>
        ))}
      </pre>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
        <span>En línea</span>
        <span>tu-negocio.cl</span>
      </div>
    </div>
  );
}
