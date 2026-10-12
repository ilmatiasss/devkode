import type { Metadata } from "next";
import { Block, LegalLayout, List, Titular, legalLink, responsable } from "@/components/LegalLayout";
import { contact, projects, site, terms } from "@/content/site";

export const metadata: Metadata = {
  title: `Términos y condiciones | ${site.name}`,
  description: `Condiciones de uso del sitio de ${site.name} y alcance de las cotizaciones que enviamos.`,
  alternates: { canonical: "/terminos" },
};

export default function Terminos() {
  const nombres = projects.map((project) => project.name).join(", ");

  return (
    <LegalLayout
      title="Términos y condiciones"
      meta={`Versión ${terms.version} · Actualizados el ${terms.updated}`}
      intro="Estas son las reglas de uso de este sitio y el alcance de una cotización nuestra. Las escribimos para que ninguna de las dos partes tenga dudas."
    >
      <Block title="1. Titular del sitio">
        <p>
          Este sitio es operado por {responsable}. «{site.name}» es el nombre comercial con el que ofrecemos nuestros
          servicios. Puedes escribirnos a{" "}
          <a href={`mailto:${contact.email}`} className={legalLink}>
            {contact.email}
          </a>
          .
        </p>
        <Titular />
        <p>
          Al usar este sitio aceptas estos términos. Si no estás de acuerdo con ellos, te pedimos que no lo uses.
        </p>
      </Block>

      <Block title="2. Qué ofrece este sitio">
        <p>
          Este sitio presenta nuestros servicios de desarrollo web a medida y te permite pedirnos una cotización a través
          de un formulario. No se pueden contratar servicios ni hacer pagos desde aquí.
        </p>
      </Block>

      <Block title="3. Una cotización no es una oferta">
        <p>
          Lo que te respondamos tras tu solicitud, ya sea por correo, mensaje o llamada, es una propuesta orientativa. No es
          una oferta contractual vinculante ni nos obliga a prestarte el servicio, ni a mantener un precio o un plazo,
          mientras no quede en una propuesta o contrato escrito y aceptado por ambas partes.
        </p>
        <p>
          El valor y los plazos definitivos se fijan después de entender bien tu proyecto. Cada propuesta formal indica su
          vigencia, la moneda y si el valor incluye IVA. Hasta que ambas partes la acepten no existe relación contractual
          entre nosotros.
        </p>
      </Block>

      <Block title="4. Proyectos que mostramos">
        <p>
          En el sitio mostramos proyectos en los que hemos trabajado ({nombres}) para ilustrar nuestro trabajo. Sus nombres,
          logos y marcas pertenecen a sus respectivos titulares, y su aparición no significa que ellos patrocinen o respalden
          este sitio. Si eres titular de alguna de estas marcas y prefieres que la retiremos, escríbenos y lo haremos a la
          brevedad.
        </p>
        <p>
          Los enlaces a esos y otros sitios nos llevan a páginas de terceros. No controlamos su contenido ni sus políticas, y
          no nos hacemos responsables de ellos.
        </p>
      </Block>

      <Block title="5. Uso del sitio">
        <p>Te pedimos usar el sitio conforme a la ley y de buena fe. En particular, no puedes:</p>
        <List
          items={[
            "Dañar el sitio, sobrecargarlo o impedir su funcionamiento normal.",
            "Intentar acceder a partes del sistema que no son públicas.",
            "Usar el formulario para enviar spam, contenido ilícito o datos de otras personas sin derecho a hacerlo.",
            "Hacer un acceso automatizado y masivo, por ejemplo con robots.",
          ]}
        />
        <p>
          Podemos bloquear los accesos que abusen del sitio. Procuramos que esté disponible de forma continua, pero no
          garantizamos que funcione sin interrupciones ni sin errores, y podemos modificarlo o suspenderlo por mantenimiento
          o por razones técnicas.
        </p>
      </Block>

      <Block title="6. Propiedad intelectual">
        <p>
          Los contenidos de este sitio (textos, diseño, gráficos, código y signos distintivos, incluido el logo de{" "}
          {site.name}) nos pertenecen o los usamos con autorización de sus titulares. No puedes reproducirlos, distribuirlos
          ni transformarlos sin nuestro permiso previo y escrito, salvo los usos que la ley permite.
        </p>
        <p>
          Los sitios y sistemas que desarrollamos para nuestros clientes se rigen por el contrato que firmemos con cada uno,
          no por estos términos.
        </p>
      </Block>

      <Block title="7. Responsabilidad">
        <p>
          La información de este sitio es general y puede cambiar sin aviso. No respondemos por decisiones que tomes basándote
          solo en ella, ni por daños indirectos derivados del uso del sitio o de fallas que no dependen de nosotros, como tu
          conexión o la de nuestros proveedores.
        </p>
        <p>
          Esto se aplica en la medida que la ley lo permita y no excluye las responsabilidades ni los derechos que la ley
          declara irrenunciables, como los de los consumidores.
        </p>
      </Block>

      <Block title="8. Protección de datos">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <a href="/privacidad" className={legalLink}>
            política de privacidad
          </a>
          , que forma parte de estos términos.
        </p>
      </Block>

      <Block title="9. Ley aplicable y tribunales">
        <p>
          Estos términos se rigen por la ley chilena. Cualquier controversia se someterá a los tribunales ordinarios de
          justicia con asiento en la comuna de Santiago, sin perjuicio de los derechos que correspondan a quienes tengan la
          calidad de consumidores según la Ley N° 19.496.
        </p>
      </Block>

      <Block title="10. Cambios en estos términos">
        <p>
          Podemos actualizarlos. La versión vigente es siempre la publicada en esta página, con su fecha y número de versión.
          Si sigues usando el sitio después de un cambio, entendemos que lo aceptas.
        </p>
      </Block>
    </LegalLayout>
  );
}
