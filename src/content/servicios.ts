// Servicios de DevKode: lo que aparece en la portada y el contenido de cada página /servicios/<slug>.
// Sin precios: cada proyecto se cotiza según lo que necesita.

export type Servicio = {
  slug: string;
  titulo: string;
  resumen: string; // una línea, para la lista de la portada
  etiquetas?: string[];
  // Página del servicio
  bajada: string; // primer párrafo bajo el título
  queEsTitulo: string;
  queEs: string[];
  paraQue: string[];
  paraQuien: string[];
  potencia: { titulo: string; texto: string }[];
  incluye: string[];
  cuandoNo?: string; // cuándo no es lo que necesitas (honestidad > venta)
  preguntas: { pregunta: string; respuesta: string }[];
};

export const servicios: Servicio[] = [
  {
    slug: "landing-pages",
    queEsTitulo: "¿Qué es una landing page?",
    titulo: "Landing pages",
    resumen: "Una página con un solo objetivo: que te escriban, que se inscriban o que compren.",
    bajada:
      "Una landing page es una página enfocada en una sola acción. Sin menús que distraigan ni secciones de relleno: todo lo que hay en ella empuja al visitante a escribirte, inscribirse o comprar.",
    queEs: [
      "Es una página de destino: el lugar al que llega alguien que hizo clic en un anuncio, en un enlace de Instagram o en un código QR.",
      "A diferencia de una web completa, no intenta contarlo todo. Presenta una oferta, responde las dudas más comunes y termina en un botón claro: escribir por WhatsApp, dejar los datos o comprar.",
    ],
    paraQue: [
      "Lanzar un producto o servicio nuevo sin esperar a tener una web completa.",
      "Darle un destino a tus campañas en Meta, Google o TikTok, para que el dinero que pagas en publicidad no se pierda en una página genérica.",
      "Captar contactos para una preventa, un evento, un curso o una lista de espera.",
      "Probar si una idea funciona antes de invertir en algo más grande.",
    ],
    paraQuien: [
      "Emprendimientos que necesitan estar en línea rápido y con una sola oferta clara.",
      "Negocios que hacen publicidad pagada y quieren que se convierta en mensajes o ventas.",
      "Profesionales independientes que ofrecen un servicio puntual: asesorías, clases, consultas.",
      "Empresas que lanzan una campaña o producto y no quieren mezclarlo con su web principal.",
    ],
    potencia: [
      { titulo: "Más contactos por el mismo presupuesto", texto: "Una página enfocada convierte más visitas en mensajes que una portada con diez opciones." },
      { titulo: "Campañas medibles", texto: "Sabes cuánta gente llegó, cuánta escribió y desde qué anuncio, para invertir donde funciona." },
      { titulo: "Confianza al primer vistazo", texto: "Un diseño cuidado y rápido en el celular hace que tu oferta se vea seria desde el primer segundo." },
      { titulo: "Lista en días", texto: "Una landing la tenemos funcionando en días, así que puedes salir al mercado casi de inmediato." },
    ],
    incluye: [
      "Estructura y textos pensados para que la persona termine haciendo la acción que buscas.",
      "Diseño a medida, adaptado al celular, que es desde donde llega la mayoría.",
      "Botón de WhatsApp, formulario de contacto o enlace de pago, según el objetivo.",
      "Carga rápida y buenas prácticas para Google.",
      "Medición de visitas y conversiones, si la necesitas para tus campañas.",
      "Publicación en tu dominio.",
    ],
    cuandoNo:
      "Si necesitas mostrar muchos servicios distintos, tener un blog o vender un catálogo de productos, una landing se queda corta: ahí conviene una web corporativa o una tienda online.",
    preguntas: [
      {
        pregunta: "¿Cuánto demora una landing page?",
        respuesta: "Días. Si tienes listo el contenido (textos, fotos, logo), la landing queda publicada en pocos días. En la propuesta te damos la fecha exacta.",
      },
      {
        pregunta: "¿Puedo usarla después como parte de una web más grande?",
        respuesta: "Sí. Se puede integrar más adelante a tu web o mantenerla como página de campañas.",
      },
      {
        pregunta: "¿Ustedes escriben los textos?",
        respuesta: "Te ayudamos a ordenarlos y a escribirlos para que vayan directo al punto. Tú nos das la información de tu negocio y la revisamos juntos.",
      },
    ],
  },
  {
    slug: "tiendas-online",
    queEsTitulo: "¿Qué es una tienda online?",
    titulo: "Tiendas online",
    resumen:
      "Catálogo, carrito, pagos y despacho, más un panel para que tú mismo cargues productos y revises pedidos, sin tener que llamarnos cada vez.",
    etiquetas: ["Webpay", "Mercado Pago", "Flow"],
    bajada:
      "Una tienda online (e-commerce) es tu local abierto las 24 horas: tus clientes ven el catálogo, eligen, pagan con tarjeta y tú recibes el pedido listo para despachar.",
    queEs: [
      "Es un sitio donde tus productos se pueden comprar de principio a fin: catálogo con fotos y precios, carrito, pago en línea y confirmación del pedido.",
      "Detrás hay un panel de administración donde tú cargas productos, cambias precios y stock, y revisas los pedidos, sin depender de nosotros para el día a día.",
    ],
    paraQue: [
      "Vender sin tener que responder cada consulta por mensaje ni coordinar transferencias una por una.",
      "Llegar a clientes de todo Chile, no solo a los que pasan por tu local.",
      "Ordenar el negocio: pedidos, pagos y stock en un solo lugar.",
      "Dejar de depender solo de Instagram o Marketplace, donde las reglas cambian sin aviso.",
    ],
    paraQuien: [
      "Negocios que ya venden por redes sociales o WhatsApp y se están quedando cortos de tiempo.",
      "Tiendas físicas que quieren sumar un canal de venta en línea.",
      "Marcas que lanzan productos propios y necesitan un lugar oficial para venderlos.",
      "Distribuidores o talleres con un catálogo de productos o repuestos.",
    ],
    potencia: [
      { titulo: "Ventas mientras duermes", texto: "La tienda recibe pedidos y pagos a cualquier hora, sin que estés pendiente del celular." },
      { titulo: "Menos trabajo manual", texto: "El cliente paga en línea y el pedido llega ordenado: se acaban las capturas de transferencias y los mensajes de ida y vuelta." },
      { titulo: "Ticket promedio más alto", texto: "Productos relacionados, promociones y despacho gratis desde cierto monto ayudan a que cada compra sea más grande." },
      { titulo: "Datos para decidir", texto: "Sabes qué se vende, cuándo y a quién, para reponer stock y planificar mejor." },
    ],
    incluye: [
      "Catálogo con categorías, fotos, variantes (tallas, colores) y buscador.",
      "Carrito y pago en línea con Webpay, Mercado Pago o Flow.",
      "Opciones de despacho y retiro en tienda.",
      "Panel de administración para productos, stock, precios y pedidos.",
      "Correos automáticos de confirmación de compra.",
      "Diseño a medida y adaptado al celular.",
      "Buenas prácticas para Google, para que tus productos se puedan encontrar.",
    ],
    cuandoNo:
      "Si vendes uno o dos productos y quieres probar antes de invertir, puede que te baste una landing page con un enlace de pago. Te lo decimos en la primera conversación.",
    preguntas: [
      {
        pregunta: "¿Cuánto demora?",
        respuesta: "Trabajamos con plazos breves. Depende de cuántos productos y funciones necesites; en la propuesta te damos la fecha exacta de entrega.",
      },
      {
        pregunta: "¿Qué medios de pago puedo tener?",
        respuesta: "Trabajamos con las pasarelas más usadas en Chile, como Webpay, Mercado Pago y Flow. Te ayudamos a elegir la que mejor calce con tu negocio.",
      },
      {
        pregunta: "¿Puedo cargar los productos yo mismo?",
        respuesta: "Sí. La tienda trae un panel pensado para que tú o tu equipo carguen productos, cambien precios y revisen pedidos sin conocimientos técnicos.",
      },
      {
        pregunta: "¿Y si ya tengo una tienda en otra plataforma?",
        respuesta: "Podemos rediseñarla o migrarla. Revisamos qué tienes hoy y te proponemos el camino más conveniente.",
      },
    ],
  },
  {
    slug: "webs-corporativas",
    queEsTitulo: "¿Qué es una web corporativa?",
    titulo: "Webs corporativas",
    resumen: "Quiénes son, qué hacen y cómo contactarlos, bien contado y fácil de actualizar.",
    bajada:
      "Una web corporativa es la carta de presentación de tu empresa en internet. Es lo que revisa un cliente antes de llamarte, y lo que hace que te elija a ti y no a la competencia.",
    queEs: [
      "Es el sitio oficial de tu empresa: quiénes son, qué servicios ofrecen, trabajos realizados, cómo contactarlos y dónde encontrarlos.",
      "Tiene varias secciones o páginas, y se puede actualizar a medida que el negocio crece.",
    ],
    paraQue: [
      "Que te encuentren en Google cuando alguien busca lo que haces.",
      "Generar confianza: hoy un negocio sin web (o con una web antigua) pierde clientes antes de que lo llamen.",
      "Explicar bien tus servicios y no repetir lo mismo en cada conversación.",
      "Recibir consultas ordenadas por formulario, correo o WhatsApp.",
    ],
    paraQuien: [
      "Empresas de servicios: talleres, constructoras, consultoras, clínicas, estudios.",
      "Negocios que tienen una web antigua, lenta o que no se ve bien en el celular.",
      "Empresas que trabajan con otras empresas y necesitan verse profesionales.",
      "Quienes recién parten y quieren presencia seria desde el principio.",
    ],
    potencia: [
      { titulo: "Credibilidad", texto: "Una web moderna y bien escrita hace que tu empresa se vea del tamaño y la calidad que tiene." },
      { titulo: "Presencia en Google", texto: "Una web rápida y bien estructurada tiene más posibilidades de aparecer cuando te buscan." },
      { titulo: "Más consultas", texto: "Caminos claros para contactarte desde cualquier página." },
      { titulo: "Tu propio canal", texto: "A diferencia de las redes sociales, tu web es tuya y no depende de algoritmos." },
    ],
    incluye: [
      "Las páginas que tu empresa necesite: inicio, servicios, nosotros, proyectos, contacto.",
      "Diseño a medida con tu identidad, adaptado al celular.",
      "Formulario de contacto y botón de WhatsApp.",
      "Carga rápida, seguridad y buenas prácticas para Google.",
      "Textos ordenados para que se entienda qué haces en pocos segundos.",
      "Publicación en tu dominio y correo corporativo, si lo necesitas.",
    ],
    preguntas: [
      {
        pregunta: "¿Cuánto demora?",
        respuesta: "Trabajamos con plazos breves. Depende de cuántas páginas y del contenido que tengas listo; en la propuesta te damos la fecha exacta.",
      },
      {
        pregunta: "¿Puedo actualizar la web después?",
        respuesta: "Sí. Según lo que necesites cambiar seguido, dejamos un panel para editar contenidos o nos encargamos nosotros con el plan de mantención.",
      },
      {
        pregunta: "Ya tengo una web, ¿la pueden rediseñar?",
        respuesta: "Sí. Revisamos qué funciona y qué no, y la renovamos manteniendo lo que ya tiene valor, como tu dominio y tu posicionamiento.",
      },
      {
        pregunta: "¿El dominio queda a mi nombre?",
        respuesta: "Sí. El dominio y el contenido son tuyos; nosotros te ayudamos a configurarlo.",
      },
    ],
  },
  {
    slug: "aplicaciones-web",
    queEsTitulo: "¿Qué es una aplicación web?",
    titulo: "Aplicaciones web",
    resumen: "Sistemas con usuarios, permisos y paneles que tu equipo usa desde el navegador.",
    bajada:
      "Una aplicación web es una herramienta de trabajo que funciona en el navegador: tu equipo o tus clientes inician sesión y hacen cosas, como agendar, cotizar, gestionar pedidos o revisar información.",
    queEs: [
      "Es un sistema con usuarios y permisos, no solo una página para mirar. Cada persona entra con su cuenta y ve lo que le corresponde.",
      "Funciona desde el computador o el celular, sin instalar nada, y la información queda centralizada en un solo lugar.",
    ],
    paraQue: [
      "Reemplazar planillas que se pasan por correo y procesos que dependen de una sola persona.",
      "Dar a tus clientes un portal para hacer reservas, seguir pedidos o descargar documentos.",
      "Tener paneles con los números de tu negocio al día.",
      "Coordinar a un equipo con tareas, estados y responsables.",
    ],
    paraQuien: [
      "Empresas que crecieron y ya no les alcanza con Excel y WhatsApp.",
      "Negocios que quieren ofrecer un portal o área privada a sus clientes.",
      "Equipos que repiten el mismo proceso todos los días y quieren automatizarlo.",
    ],
    potencia: [
      { titulo: "Ahorro de tiempo", texto: "Lo que hoy se hace a mano, copiando y pegando, pasa a hacerse con un clic." },
      { titulo: "Menos errores", texto: "Datos en un solo lugar, con validaciones, en vez de versiones distintas de la misma planilla." },
      { titulo: "Control", texto: "Sabes quién hizo qué y cuándo, y cada persona ve solo lo que le corresponde." },
      { titulo: "Mejor servicio", texto: "Tus clientes pueden resolver cosas por su cuenta, sin esperar a que les respondas." },
    ],
    incluye: [
      "Levantamiento del proceso que quieres resolver.",
      "Inicio de sesión, usuarios y permisos.",
      "Paneles, formularios, listados y reportes a la medida.",
      "Base de datos segura y respaldos.",
      "Diseño pensado para que se use fácil, también en el celular.",
      "Entrega por etapas, para que empieces a usarla antes.",
    ],
    preguntas: [
      {
        pregunta: "¿Cuánto demora?",
        respuesta: "Trabajamos con plazos breves y por etapas: la primera parte la puedes usar pronto y el resto se suma después. En la propuesta te damos las fechas de cada etapa.",
      },
      {
        pregunta: "¿En qué se diferencia de una web normal?",
        respuesta: "Una web muestra información. Una aplicación web permite hacer cosas: registrar, aprobar, calcular, reservar. Tiene usuarios, datos y reglas.",
      },
      {
        pregunta: "¿Se puede empezar con algo pequeño?",
        respuesta: "Sí, y lo recomendamos. Partimos por lo que más tiempo te quita y la vamos ampliando por etapas.",
      },
    ],
  },
  {
    slug: "software-a-medida",
    queEsTitulo: "¿Qué es el software a medida?",
    titulo: "Software a medida",
    resumen: "Cuando ninguna herramienta del mercado calza con tu forma de trabajar, la construimos.",
    bajada:
      "Software a medida es una solución diseñada para tu negocio, en vez de adaptar tu negocio a un programa genérico. Se construye alrededor de cómo trabajas tú.",
    queEs: [
      "Es un sistema hecho desde cero (o sobre piezas existentes) para resolver un problema específico de tu empresa.",
      "Puede conectarse con lo que ya usas, como tu sistema de facturación, tu tienda o tus planillas, para que la información fluya sola.",
    ],
    paraQue: [
      "Resolver un proceso que ninguna herramienta del mercado cubre bien.",
      "Conectar sistemas que hoy no se hablan entre sí.",
      "Automatizar tareas repetitivas: reportes, cálculos, avisos, cotizaciones.",
      "Dejar de pagar varias suscripciones que usas a medias.",
    ],
    paraQuien: [
      "Empresas con procesos propios que las hacen distintas de la competencia.",
      "Negocios que ya probaron herramientas genéricas y no les calzaron.",
      "Equipos que pierden horas en tareas que se podrían automatizar.",
    ],
    potencia: [
      { titulo: "Ventaja propia", texto: "Una herramienta que la competencia no tiene, hecha para tu forma de trabajar." },
      { titulo: "Automatización", texto: "Las tareas repetitivas pasan a hacerse solas, y tu equipo se enfoca en lo importante." },
      { titulo: "Crecimiento ordenado", texto: "El sistema crece con tu negocio en vez de ponerle límites." },
      { titulo: "Independencia", texto: "No dependes de que un proveedor externo agregue la función que necesitas." },
    ],
    incluye: [
      "Conversación para entender el problema antes de proponer una solución.",
      "Propuesta por etapas, con alcance y plazos por escrito.",
      "Desarrollo con avances que puedes revisar.",
      "Integraciones con los sistemas que ya usas, cuando es posible.",
      "Documentación y acompañamiento al empezar a usarlo.",
    ],
    cuandoNo:
      "Si existe una herramienta en el mercado que resuelve bien lo que necesitas, te lo vamos a decir. Construir a medida tiene sentido cuando lo existente no calza.",
    preguntas: [
      {
        pregunta: "¿Cuánto demora?",
        respuesta: "Trabajamos con plazos breves y por etapas, para que empieces a usarlo lo antes posible. En la propuesta te damos las fechas de cada etapa.",
      },
      {
        pregunta: "¿Cómo saben qué construir?",
        respuesta: "Partimos conversando sobre cómo trabajas hoy, qué te quita tiempo y qué quieres lograr. Con eso armamos una propuesta por etapas.",
      },
      {
        pregunta: "¿El código queda para mí?",
        respuesta: "Lo conversamos en la propuesta, donde queda por escrito qué se entrega y en qué condiciones.",
      },
    ],
  },
  {
    slug: "mantencion",
    queEsTitulo: "¿Qué es la mantención mensual?",
    titulo: "Mantención mensual",
    resumen: "Hosting, dominio, cambios y soporte: tu web funcionando y al día, sin que tengas que preocuparte.",
    bajada:
      "La mantención mensual es nuestro acompañamiento después de publicar: nos encargamos de que tu web, tienda o sistema siga funcionando, seguro y al día, y de los cambios que vayas necesitando.",
    queEs: [
      "Es un plan mensual en el que nos hacemos cargo de la parte técnica de tu sitio: que esté en línea, que el dominio y el hosting estén al día, y que los problemas se resuelvan rápido.",
      "Incluye un canal directo con nosotros para pedir cambios y ajustes, sin cotizar cada vez.",
    ],
    paraQue: [
      "Que tu sitio no se caiga por un dominio vencido o un servicio impago.",
      "Tener a quién llamar cuando algo falla o necesitas un cambio.",
      "Mantener la web actualizada: precios, fotos, textos, promociones.",
      "Olvidarte de pagar y renovar servicios técnicos por separado.",
    ],
    paraQuien: [
      "Clientes que no quieren ocuparse de la parte técnica de su web.",
      "Tiendas online, donde cada hora sin funcionar es venta perdida.",
      "Negocios que cambian contenido seguido y prefieren delegarlo.",
    ],
    potencia: [
      { titulo: "Tranquilidad", texto: "Tu web funciona y está respaldada; si algo pasa, lo resolvemos nosotros." },
      { titulo: "Siempre al día", texto: "El contenido se mantiene vigente, lo que da confianza a quien te visita." },
      { titulo: "Costo predecible", texto: "Un monto mensual en lugar de cobros sorpresa por cada ajuste." },
      { titulo: "Mejora continua", texto: "Con el tiempo te proponemos mejoras según cómo se usa tu sitio." },
    ],
    incluye: [
      "Hosting y dominio administrados (o la gestión de los que ya tengas).",
      "Monitoreo para que el sitio siga en línea.",
      "Respaldos y actualizaciones de seguridad.",
      "Cambios de contenido y ajustes menores cada mes.",
      "Soporte directo por WhatsApp o correo.",
    ],
    preguntas: [
      {
        pregunta: "¿Es obligatoria?",
        respuesta: "No. Puedes encargarte tú de tu sitio o contratarla más adelante. La recomendamos sobre todo para tiendas online y sitios que cambian seguido.",
      },
      {
        pregunta: "¿Qué pasa si necesito un cambio grande?",
        respuesta: "Los ajustes menores están incluidos. Si se trata de una función nueva o un cambio grande, te lo cotizamos aparte antes de hacerlo.",
      },
      {
        pregunta: "¿Puedo contratarla si mi web no la hicieron ustedes?",
        respuesta: "Puede ser. Primero revisamos cómo está hecha y te decimos si podemos hacernos cargo.",
      },
    ],
  },
];

export const servicioPorSlug = (slug: string) => servicios.find((s) => s.slug === slug);
