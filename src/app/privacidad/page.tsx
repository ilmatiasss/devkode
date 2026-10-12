import type { Metadata } from "next";
import { Block, LegalLayout, List, Titular, legalLink, responsable } from "@/components/LegalLayout";
import { contact, privacy, site } from "@/content/site";
import { iaActiva, versionPrivacidad } from "@/lib/funciones";

export const metadata: Metadata = {
  title: `Política de privacidad | ${site.name}`,
  description: `Cómo ${site.name} trata los datos personales que recibe a través del formulario de contacto, y cómo ejercer tus derechos.`,
  alternates: { canonical: "/privacidad" },
};

const rightsMail = `mailto:${contact.email}?subject=${encodeURIComponent("Ejercicio de derechos sobre mis datos personales")}`;

export default function Privacidad() {
  return (
    <LegalLayout
      title="Política de privacidad"
      meta={`Versión ${versionPrivacidad} · Actualizada el ${privacy.updated}`}
      intro="Aquí te contamos, sin letra chica, qué datos tuyos recibimos cuando nos escribes desde este sitio, para qué los usamos y cómo puedes controlarlos. Cumplimos la Ley N° 19.628 sobre protección de la vida privada, tal como la modificó la Ley N° 21.719."
    >
      <Block title="1. Quién es el responsable">
        <p>
          El responsable del tratamiento de tus datos es {responsable}. Puedes escribirnos para cualquier consulta o
          solicitud sobre tus datos a{" "}
          <a href={`mailto:${contact.email}`} className={legalLink}>
            {contact.email}
          </a>
          . Esta política se aplica al sitio {site.url.replace("https://", "")}.
        </p>
        <Titular />
      </Block>

      <Block title="2. Qué datos recibimos">
        <p>Solo recibimos los datos que tú nos entregas al completar el formulario de cotización:</p>
        <List
          items={[
            "Tu nombre y tu correo electrónico, para saber quién eres y poder responderte.",
            "Tu teléfono, que es opcional.",
            "El tipo de proyecto que necesitas y el mensaje que escribas.",
            "La fecha en que aceptaste esta política y su versión, como respaldo de tu consentimiento.",
          ]}
        />
        <p>
          No te pedimos RUT, dirección ni ningún dato sensible. Te pedimos que tampoco los incluyas en el mensaje.
        </p>
        <p>
          Además, como cualquier sitio, el proveedor donde está alojada la página (Vercel) registra datos técnicos de cada
          visita, como la dirección IP, el navegador y la hora, para mantener el sitio seguro y funcionando. Nosotros no
          usamos esos datos para identificarte ni para hacer perfiles. Para frenar el abuso del formulario, contamos los
          envíos por dirección IP, pero ese conteo solo vive unas horas en la memoria del servidor y no se guarda.
        </p>
      </Block>

      <Block title="3. El asistente de orientación">
        <p>
          En la sección «Asistente» puedes conversar sobre tu idea para que te orientemos sobre qué necesitaría tu proyecto.
          Solo recibimos los mensajes que escribas ahí. Te pedimos que no incluyas datos personales, porque no los necesitamos para
          orientarte.
        </p>
        {iaActiva ? (
          <p>
            Para analizarlo, tu texto se envía a Anthropic, una empresa de inteligencia artificial con sede en Estados Unidos,
            a través de su servicio de programación (API), solo para generar la orientación. Anthropic puede conservar lo que
            recibe por un tiempo limitado, según sus propias condiciones. Si ese servicio no responde, el análisis se hace
            con reglas simples en nuestro propio servidor.
          </p>
        ) : (
          <p>
            El análisis se hace con reglas simples en nuestro propio servidor: tu texto no se envía a ningún proveedor de
            inteligencia artificial.
          </p>
        )}
        <p>
          No guardamos la conversación en ninguna base de datos ni en nuestros registros, solo datos técnicos de
          funcionamiento. Para evitar abusos limitamos las consultas por dirección IP, y ese conteo vive unas horas en la
          memoria del servidor. La orientación es solo informativa y no toma decisiones sobre ti. Si luego nos pides una
          cotización con ese resumen, lo que envíes por el formulario se rige por el resto de esta política.
        </p>
      </Block>

      <Block title="4. Qué no utilizamos">
        <p>Para que sepas exactamente a qué atenerte, esto es lo que este sitio no hace:</p>
        <List
          items={[
            "No usa cookies de ningún tipo, ni propias ni de terceros.",
            "No guarda información en el almacenamiento local de tu navegador.",
            "No usa herramientas de analítica, medición de audiencia ni perfilado.",
            "No incluye píxeles de seguimiento ni redes publicitarias.",
            "No carga recursos de terceros: hasta las tipografías se sirven desde nuestro propio dominio, así que tu visita no genera peticiones a otros servidores.",
          ]}
        />
        <p>
          Por eso no verás un aviso de cookies: no hay nada que consentir. Si algún día esto cambia, te lo informaremos y te
          pediremos tu autorización antes.
        </p>
      </Block>

      <Block title="5. Para qué los usamos y con qué fundamento">
        <p>
          Usamos tus datos únicamente para leer tu solicitud, responderte y preparar una cotización. El fundamento es tu
          consentimiento, que nos das al marcar la casilla y enviar el formulario, y las gestiones previas a un posible
          contrato que tú mismo nos pides.
        </p>
        <p>
          No los usamos para enviarte publicidad, no los vendemos, no armamos perfiles ni tomamos decisiones automatizadas
          sobre ti (la orientación del asistente es solo informativa). Si en el futuro quisiéramos escribirte para otra cosa, te lo pediremos aparte.
        </p>
      </Block>

      <Block title="6. Con quién los compartimos">
        <p>Solo con los proveedores que necesitamos para recibir tu mensaje, y que lo tratan por cuenta nuestra:</p>
        <List
          items={[
            "Vercel Inc.: aloja este sitio y ejecuta el formulario. El mensaje pasa por sus servidores, pero no queda guardado en ninguna base de datos nuestra.",
            "Spacemail: el servicio de correo donde recibimos tu mensaje y guardamos las conversaciones.",
            ...(iaActiva
              ? ["Anthropic: analiza el texto que escribes en el asistente de orientación, solo para generar la orientación."]
              : []),
          ]}
        />
        <p>No cedemos tus datos a nadie más, salvo que una autoridad competente nos lo exija por ley.</p>
      </Block>

      <Block title="7. Transferencias fuera de Chile">
        <p>
          Estos proveedores operan fuera de Chile, por lo que tus datos pueden ser tratados y almacenados en otros países,
          como Estados Unidos. Elegimos proveedores reconocidos, que aplican medidas de seguridad para proteger los datos
          que les confiamos.
          {iaActiva ? " Lo mismo ocurre con el texto del asistente, que viaja a los servidores de Anthropic en Estados Unidos." : ""}
        </p>
      </Block>

      <Block title="8. Cuánto tiempo los conservamos">
        <List
          items={[
            `Si no llegamos a trabajar juntos, borramos tu mensaje a los ${privacy.retentionMonths} meses desde nuestro último contacto.`,
            "Si trabajamos juntos, los conservamos mientras dure el proyecto y durante los plazos que la ley nos exige guardar documentos, por ejemplo los tributarios.",
            "Puedes pedirnos que los borremos antes, cuando quieras.",
          ]}
        />
      </Block>

      <Block title="9. Cómo los protegemos">
        <p>
          La página funciona solo con conexión cifrada (HTTPS) y con cabeceras de seguridad que impiden que otros sitios la
          incrusten o le inyecten contenido. El formulario valida y limpia lo que recibe, rechaza envíos que no vengan de
          esta misma página y no revela detalles internos si algo falla. El acceso al buzón donde llegan los mensajes está
          protegido con contraseña y solo lo usamos nosotros.
        </p>
        <p>
          Si ocurriera una vulneración de seguridad que afecte tus datos y te ponga en riesgo, la informaremos a la Agencia
          de Protección de Datos Personales y a ti, según lo que exige la ley.
        </p>
      </Block>

      <Block title="10. Tus derechos">
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
          <a href={rightsMail} className={legalLink}>
            {contact.email}
          </a>{" "}
          indicando qué quieres y desde qué correo nos escribiste, para poder verificar que eres tú. Es gratis. Te
          confirmamos la recepción y te respondemos a más tardar dentro de 30 días corridos, plazo que podemos prorrogar una
          sola vez por otros 30 días si la solicitud es compleja, avisándote antes.
        </p>
        <p>
          Si no quedas conforme con nuestra respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales.
        </p>
      </Block>

      <Block title="11. Menores de edad">
        <p>
          Este sitio está dirigido a personas que contratan servicios web. No recopilamos a sabiendas datos de menores de
          edad. Si crees que un menor nos escribió, avísanos y los borraremos.
        </p>
      </Block>

      <Block title="12. Cambios en esta política">
        <p>
          Si la modificamos, publicaremos la nueva versión en esta misma página con su fecha y número de versión. Cada
          solicitud que recibimos queda registrada con la versión que aceptaste.
        </p>
        <p>
          El uso general de este sitio se rige además por nuestros{" "}
          <a href="/terminos" className={legalLink}>
            términos y condiciones
          </a>
          .
        </p>
      </Block>
    </LegalLayout>
  );
}
