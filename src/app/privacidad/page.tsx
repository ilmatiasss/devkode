import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { contact, legal, privacy, site } from "@/content/site";

export const metadata: Metadata = {
  title: `Política de privacidad | ${site.name}`,
  description: `Cómo ${site.name} trata los datos personales que recibe a través del formulario de contacto, y cómo ejercer tus derechos.`,
  alternates: { canonical: "/privacidad" },
};

const rightsMail = `mailto:${contact.email}?subject=${encodeURIComponent("Ejercicio de derechos sobre mis datos personales")}`;

const link = "font-medium text-fg underline decoration-accent decoration-2 underline-offset-4";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-xl font-medium tracking-tight text-fg md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Privacidad() {
  const responsable = legal.name
    ? `${legal.name}${legal.rut ? `, RUT ${legal.rut}` : ""}, que opera bajo el nombre ${site.name}`
    : site.name;

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <a href="/" aria-label={`${site.name}, ir al inicio`}>
            <Logo />
          </a>
          <a href="/" className="text-sm text-muted transition-colors hover:text-fg">
            <span aria-hidden="true">← </span>Volver al inicio
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <article className="max-w-3xl text-muted">
          <p className="flex items-center gap-3 font-mono text-xs text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Versión {privacy.version} · Actualizada el {privacy.updated}
          </p>
          <h1 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
            Política de privacidad
          </h1>
          <p className="mt-6 text-lg leading-relaxed">
            Aquí te contamos, sin letra chica, qué datos tuyos recibimos cuando nos escribes desde este sitio, para qué los
            usamos y cómo puedes controlarlos. Cumplimos la Ley N° 19.628 sobre protección de la vida privada, tal como la
            modificó la Ley N° 21.719.
          </p>

          <div className="mt-12 space-y-10">
            <Block title="1. Quién es el responsable">
              <p>
                El responsable del tratamiento de tus datos es {responsable}. Puedes escribirnos para cualquier consulta o
                solicitud sobre tus datos a{" "}
                <a href={`mailto:${contact.email}`} className={link}>
                  {contact.email}
                </a>
                .
              </p>
            </Block>

            <Block title="2. Qué datos recibimos">
              <p>Solo recibimos los datos que tú nos entregas al completar el formulario de cotización:</p>
              <List
                items={[
                  "Tu nombre y tu correo electrónico, para saber quién eres y poder responderte.",
                  "Tu teléfono, que es opcional.",
                  "El tipo de proyecto que necesitas y el mensaje que escribas.",
                  `La fecha en que aceptaste esta política y su versión, como respaldo de tu consentimiento.`,
                ]}
              />
              <p>
                No te pedimos RUT, dirección ni ningún dato sensible. Te pedimos que tampoco los incluyas en el mensaje.
              </p>
              <p>
                Además, como cualquier sitio, el proveedor donde está alojada la página (Vercel) registra datos técnicos de
                cada visita, como la dirección IP, el navegador y la hora, para mantener el sitio seguro y funcionando.
                Nosotros no usamos esos datos para identificarte ni para hacer perfiles. Para frenar el abuso del
                formulario, contamos los envíos por dirección IP, pero ese conteo solo vive unas horas en la memoria del
                servidor y no se guarda.
              </p>
            </Block>

            <Block title="3. Cookies y analítica">
              <p>
                Este sitio no usa cookies, ni herramientas de analítica o publicidad, y no carga recursos de terceros: hasta
                las tipografías son propias. Por eso no verás un aviso de cookies. Si algún día lo cambiamos, te lo
                informaremos y te pediremos tu autorización antes.
              </p>
            </Block>

            <Block title="4. Para qué los usamos y con qué fundamento">
              <p>
                Usamos tus datos únicamente para leer tu solicitud, responderte y preparar una cotización. El fundamento es
                tu consentimiento, que nos das al marcar la casilla y enviar el formulario, y las gestiones previas a un
                posible contrato que tú mismo nos pides.
              </p>
              <p>
                No los usamos para enviarte publicidad, no los vendemos, no armamos perfiles ni tomamos decisiones
                automatizadas sobre ti. Si en el futuro quisiéramos escribirte para otra cosa, te lo pediremos aparte.
              </p>
            </Block>

            <Block title="5. Con quién los compartimos">
              <p>Solo con los proveedores que necesitamos para recibir tu mensaje, y que lo tratan por cuenta nuestra:</p>
              <List
                items={[
                  "Vercel Inc.: aloja este sitio y ejecuta el formulario. El mensaje pasa por sus servidores, pero no queda guardado en ninguna base de datos nuestra.",
                  "Spacemail: el servicio de correo donde recibimos tu mensaje y guardamos las conversaciones.",
                ]}
              />
              <p>No cedemos tus datos a nadie más, salvo que una autoridad competente nos lo exija por ley.</p>
            </Block>

            <Block title="6. Transferencias fuera de Chile">
              <p>
                Estos proveedores operan fuera de Chile, por lo que tus datos pueden ser tratados y almacenados en otros
                países, como Estados Unidos. Elegimos proveedores reconocidos, que aplican medidas de seguridad para
                proteger los datos que les confiamos.
              </p>
            </Block>

            <Block title="7. Cuánto tiempo los conservamos">
              <List
                items={[
                  `Si no llegamos a trabajar juntos, borramos tu mensaje a los ${privacy.retentionMonths} meses desde nuestro último contacto.`,
                  "Si trabajamos juntos, los conservamos mientras dure el proyecto y durante los plazos que la ley nos exige guardar documentos, por ejemplo los tributarios.",
                  "Puedes pedirnos que los borremos antes, cuando quieras.",
                ]}
              />
            </Block>

            <Block title="8. Cómo los protegemos">
              <p>
                La página funciona solo con conexión cifrada (HTTPS) y con cabeceras de seguridad que impiden que otros
                sitios la incrusten o le inyecten contenido. El formulario valida y limpia lo que recibes, rechaza envíos
                que no vengan de esta misma página y no revela detalles internos si algo falla. El acceso al buzón donde
                llegan los mensajes está protegido con contraseña y solo lo usamos nosotros.
              </p>
              <p>
                Si ocurriera una vulneración de seguridad que afecte tus datos y te ponga en riesgo, la informaremos a la
                Agencia de Protección de Datos Personales y a ti, según lo que exige la ley.
              </p>
            </Block>

            <Block title="9. Tus derechos">
              <p>Sobre tus datos personales tienes derecho a:</p>
              <List
                items={[
                  "Acceso: saber si tenemos datos tuyos y recibir una copia.",
                  "Rectificación: corregirlos si están equivocados o incompletos.",
                  "Supresión: pedir que los borremos.",
                  "Oposición: negarte a que los usemos para una finalidad determinada.",
                  "Portabilidad: recibirlos en un formato que puedas llevar a otro proveedor.",
                  "Bloqueo temporal: pedir que dejemos de tratarlos mientras se resuelve una duda o reclamo.",
                  "Retirar tu consentimiento en cualquier momento, tan fácil como lo diste: escribiéndonos.",
                ]}
              />
              <p>
                Para ejercerlos, escríbenos a{" "}
                <a href={rightsMail} className={link}>
                  {contact.email}
                </a>{" "}
                indicando qué quieres y desde qué correo nos escribiste, para poder verificar que eres tú. Es gratis. Te
                confirmamos la recepción y te respondemos a más tardar dentro de 30 días corridos, plazo que podemos
                prorrogar una sola vez por otros 30 días si la solicitud es compleja, avisándote antes.
              </p>
              <p>
                Si no quedas conforme con nuestra respuesta, puedes reclamar ante la Agencia de Protección de Datos
                Personales.
              </p>
            </Block>

            <Block title="10. Menores de edad">
              <p>
                Este sitio está dirigido a personas que contratan servicios web. No recopilamos a sabiendas datos de menores
                de edad. Si crees que un menor nos escribió, avísanos y los borraremos.
              </p>
            </Block>

            <Block title="11. Cambios en esta política">
              <p>
                Si la modificamos, publicaremos la nueva versión en esta misma página con su fecha y número de versión. Cada
                solicitud que recibimos queda registrada con la versión que aceptaste.
              </p>
            </Block>
          </div>
        </article>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-5 py-8 font-mono text-xs text-muted md:px-8">
          © {new Date().getFullYear()} {site.name} · {site.location}
        </div>
      </footer>
    </>
  );
}
