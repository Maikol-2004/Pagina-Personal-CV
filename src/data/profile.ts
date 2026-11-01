import type { Project, SkillGroup, Stage } from './types'

/**
 * FUENTE ÚNICA DE DATOS — extraída de CV_Michael_Guzman.pdf.
 * Todo lo marcado `provisional: true` NO viene del CV y debe validarse o borrarse.
 */

export const profile = {
  name: 'Michael Javier Guzmán Giraldo',
  shortName: 'Michael Guzmán',
  headline: 'Estudiante de Desarrollo de Aplicaciones Multiplataforma',
  tagline: 'Una mirada humana al mundo de la tecnología.',
  location: 'Majadahonda, Madrid',
  email: 'giraldomaicol123@gmail.com',
  phone: '658170221',
  linkedin: 'https://www.linkedin.com/in/michael-guzman-giraldo',
  about: [
    'Mi trayectoria conecta la atención al cliente, las ventas y los servicios con una nueva etapa en el desarrollo de aplicaciones.',
    'Me gusta resolver problemas, aprender y asumir nuevos retos. Aporto un trato cercano, compromiso y una actitud positiva a cada proyecto, con la motivación de seguir creciendo profesionalmente.',
  ],
  values: ['Curiosidad constante', 'Actitud proactiva', 'Trabajo en equipo', 'Trato cercano'],
  languages: [
    { name: 'Español', level: 'Nativo' },
    { name: 'Inglés', level: 'Medio' },
  ],
} as const

const pendienteReto = {
  id: 'reto',
  kind: 'aprendizajes',
  title: 'Retos y aprendizajes',
} as const

const rawStages: Stage[] = [
  {
    id: 'bachillerato',
    kind: 'education',
    company: 'Tecnosistemas',
    role: 'Bachillerato',
    period: '2018 – 2020',
    start: 2018,
    end: 2020,
    summary: 'Etapa de formación previa a los estudios de desarrollo de software.',
    description:
      'Estudios de Bachillerato cursados en Tecnosistemas entre 2018 y 2020, de forma paralela a los primeros trabajos.',
    tone: '#a07a5a',
    categories: [
      {
        id: 'estudios',
        kind: 'funciones',
        title: 'Estudios',
        items: [{ id: 'b1', label: 'Bachillerato en Tecnosistemas (2018 – 2020)' }],
      },
      {
        ...pendienteReto,
        items: [
          {
            id: 'b2',
            label: 'Compaginar estudios y trabajo',
            detail: 'Pendiente de validación: confirmar con el titular.',
            provisional: true,
          },
        ],
      },
    ],
  },
  {
    id: 'camarero',
    kind: 'work',
    company: 'Fonda y Asadero',
    role: 'Camarero',
    place: 'Acacías, Colombia',
    period: '2018 – 2020',
    start: 2018,
    end: 2020,
    summary: 'Atención al cliente y servicio de mesas.',
    description:
      'Primer contacto con el trabajo de cara al público: atender, servir y cobrar en un establecimiento de comidas.',
    tone: '#b98a63',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          { id: 'c1', label: 'Atención al cliente' },
          { id: 'c2', label: 'Toma y servicio de pedidos' },
          { id: 'c3', label: 'Preparación de mesas' },
          { id: 'c4', label: 'Cobro' },
          { id: 'c5', label: 'Mantenimiento de la limpieza' },
        ],
      },
      {
        id: 'habilidades',
        kind: 'habilidades',
        title: 'Habilidades puestas en práctica',
        items: [
          { id: 'c6', label: 'Comunicación', provisional: true },
          { id: 'c7', label: 'Trabajo en equipo', provisional: true },
          { id: 'c8', label: 'Gestión del tiempo', provisional: true },
        ],
      },
      {
        ...pendienteReto,
        items: [
          {
            id: 'c9',
            label: 'Trabajar bajo ritmo alto de servicio',
            detail: 'Pendiente de validación.',
            provisional: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dr-frog',
    kind: 'work',
    company: 'Dr. Frog',
    role: 'Comerciante independiente',
    place: 'Bogotá, Colombia',
    period: '2019 – 2022',
    start: 2019,
    end: 2022,
    summary: 'Venta y asesoramiento en productos tecnológicos.',
    description:
      'Gestión de un punto de venta de productos tecnológicos: del asesoramiento al cliente a la organización del espacio.',
    tone: '#d2a27e',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          { id: 'd1', label: 'Atención y asesoramiento al cliente en productos tecnológicos' },
          { id: 'd2', label: 'Reposición de mercancía' },
          { id: 'd3', label: 'Gestión de ventas' },
          { id: 'd4', label: 'Mantenimiento del orden y la organización de la tienda' },
        ],
      },
      {
        id: 'habilidades',
        kind: 'habilidades',
        title: 'Habilidades puestas en práctica',
        items: [
          { id: 'd5', label: 'Proactividad', provisional: true },
          { id: 'd6', label: 'Comunicación', provisional: true },
          { id: 'd7', label: 'Resolución de problemas', provisional: true },
        ],
      },
      {
        ...pendienteReto,
        items: [
          {
            id: 'd8',
            label: 'Primer contacto con la tecnología como producto',
            detail: 'Pendiente de validación.',
            provisional: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dependiente',
    kind: 'work',
    company: 'Tienda de ropa',
    role: 'Dependiente',
    place: 'Medellín, Colombia',
    period: '2020 – 2022',
    start: 2020,
    end: 2022,
    summary: 'Atención, asesoramiento y organización de producto.',
    description:
      'Trabajo en tienda de ropa atendiendo y asesorando al cliente y manteniendo el espacio ordenado.',
    tone: '#c4936a',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          { id: 'e1', label: 'Atención y asesoramiento al cliente' },
          { id: 'e2', label: 'Reposición y organización de productos' },
          { id: 'e3', label: 'Mantenimiento del orden en la tienda' },
        ],
      },
      {
        id: 'habilidades',
        kind: 'habilidades',
        title: 'Habilidades puestas en práctica',
        items: [
          { id: 'e4', label: 'Comunicación', provisional: true },
          { id: 'e5', label: 'Adaptabilidad', provisional: true },
        ],
      },
    ],
  },
  {
    id: 'obra',
    kind: 'work',
    company: 'Construcción y reformas',
    role: 'Ayudante de obra',
    place: 'Empresa no indicada en el CV',
    period: '2022 – 2024',
    start: 2022,
    end: 2024,
    summary: 'Apoyo en tareas de construcción y reforma.',
    description:
      'Trabajo físico en equipo en obras de construcción y reforma, con responsabilidad en materiales y preparación de mezclas.',
    tone: '#9c6f4d',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          { id: 'o1', label: 'Apoyo en tareas de construcción y reforma' },
          { id: 'o2', label: 'Carga y descarga de materiales' },
          { id: 'o3', label: 'Preparación de mezclas' },
        ],
      },
      {
        id: 'habilidades',
        kind: 'habilidades',
        title: 'Habilidades puestas en práctica',
        items: [
          { id: 'o4', label: 'Trabajo en equipo', provisional: true },
          { id: 'o5', label: 'Adaptabilidad', provisional: true },
        ],
      },
      {
        ...pendienteReto,
        items: [
          {
            id: 'o6',
            label: 'Constancia en trabajo físico',
            detail: 'Pendiente de validación.',
            provisional: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dam',
    kind: 'education',
    company: 'IES María de Zayas y Sotomayor',
    role: 'Grado Superior en Desarrollo de Aplicaciones Multiplataforma',
    period: '2024 – 2027',
    start: 2024,
    end: null,
    summary: 'Formación en desarrollo de software, en curso.',
    description:
      'Ciclo formativo de grado superior en el que se desarrolla la base técnica actual: lenguajes, bases de datos y desarrollo móvil.',
    tone: '#e0b892',
    categories: [
      {
        id: 'estudios',
        kind: 'funciones',
        title: 'Estudios',
        items: [{ id: 'f1', label: 'Grado Superior DAM (2024 – 2027, en curso)' }],
      },
      {
        id: 'tec',
        kind: 'tecnologias',
        title: 'Competencias digitales',
        items: [
          { id: 'f2', label: 'Java · JavaFX · JavaSwing' },
          { id: 'f3', label: 'Python' },
          { id: 'f4', label: 'SQL · PL/SQL · Hibernate · Firebase' },
          { id: 'f5', label: 'HTML · CSS · XML · JavaScript' },
          { id: 'f6', label: 'Android Studio' },
          { id: 'f7', label: 'Linux GNU · Git / GitHub' },
        ],
      },
    ],
  },
  {
    id: 'ashesfire',
    kind: 'work',
    company: 'AshesFire',
    role: 'Prácticas de programador',
    period: '2025',
    start: 2025,
    end: 2025,
    summary: 'Desarrollo de una aplicación de gestión de proyectos.',
    description:
      'Prácticas como programador en las que se desarrolla una aplicación para la gestión de los proyectos de la empresa.',
    tone: '#d9ad88',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          {
            id: 'a1',
            label: 'Desarrollar una aplicación para la gestión de proyectos de la empresa',
          },
        ],
      },
      {
        id: 'proyectos',
        kind: 'proyectos',
        title: 'Proyectos',
        items: [
          {
            id: 'a2',
            label: 'Aplicación de gestión de proyectos',
            detail: 'Ver la ficha en la sección Proyectos.',
          },
        ],
      },
      {
        id: 'tecnologias',
        kind: 'tecnologias',
        title: 'Tecnologías',
        items: [
          {
            id: 'a3',
            label: 'Tecnologías concretas por confirmar',
            detail: 'El CV no detalla la pila usada en las prácticas. Pendiente de validación.',
            provisional: true,
          },
        ],
      },
      {
        ...pendienteReto,
        items: [
          {
            id: 'a4',
            label: 'Primer entorno profesional de desarrollo',
            detail: 'Pendiente de validación.',
            provisional: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dadoris',
    kind: 'volunteer',
    company: 'Fundación Dádoris',
    role: 'Voluntario',
    period: 'Voluntariado',
    summary: 'Organización de eventos y captación de socios.',
    description: 'Colaboración como voluntario en la fundación.',
    tone: '#caa07c',
    categories: [
      {
        id: 'funciones',
        kind: 'funciones',
        title: 'Responsabilidades',
        items: [
          { id: 'v1', label: 'Preparación y organización de eventos' },
          { id: 'v2', label: 'Captación de socios' },
        ],
      },
    ],
  },
]

/**
 * Orden de lectura de un currículum: lo más reciente primero (la formación en curso, luego las
 * experiencias de más reciente a más antigua). El voluntariado, sin fechas, va al final.
 */
const recency = (s: Stage) => (s.start === undefined ? -1 : s.end === null ? 9999 : s.end!)
export const stages: Stage[] = [...rawStages].sort(
  (a, b) =>
    recency(b) - recency(a) ||
    (b.start ?? 0) - (a.start ?? 0) ||
    Number(a.kind === 'education') - Number(b.kind === 'education'),
)

/** Etiqueta compacta para la barra de años: «’22–’24», «’24–hoy» o el año suelto. */
export const rangeLabel = (s: Stage) => {
  const yy = (n: number) => `’${String(n).slice(2)}`
  if (s.start === undefined) return ''
  if (s.end === s.start) return String(s.start)
  return `${yy(s.start)}–${s.end === null ? 'hoy' : yy(s.end ?? s.start)}`
}

/** Etiqueta corta de año para la línea temporal ("Hoy" si sigue en curso). */
export const yearLabel = (s: Stage) => (s.end === null ? 'Hoy' : String(s.end ?? s.start ?? ''))

/** Etapas con fecha: alimentan la línea temporal (la constelación usa todas). */
export const timelineStages = stages.filter((s) => s.start !== undefined)

export const projects: Project[] = [
  {
    id: 'ashesfire',
    title: 'AshesFire',
    accent: 'gestión de proyectos.',
    summary:
      'Aplicación web interna para dar de alta proyectos, registrar el seguimiento diario de horas y gastos y consultar costes y rentabilidad.',
    context: 'Prácticas de programador · AshesFire · 2025',
    role: 'Desarrollo de la aplicación',
    status: 'Prácticas completadas',
    technologies: ['Python', 'Streamlit', 'SQLAlchemy', 'PostgreSQL', 'pandas'],
    objectives: [
      'Sustituir el control manual de proyectos por una aplicación propia de la empresa.',
      'Saber en cualquier momento cuánto cuesta un proyecto y si es rentable.',
    ],
    features: [
      'Alta, modificación, finalización y eliminación de proyectos.',
      'Registro diario de horas (jefe y proyectista), subcontratación y gastos.',
      'Listado de proyectos con detalle, costes totales y rentabilidad.',
      'Menú principal que enlaza las seis vistas de la aplicación.',
    ],
    technical: [
      'Modelo relacional con dos entidades: Proyecto y SeguimientoDiario, creado con SQLAlchemy sobre PostgreSQL.',
      'Coste total = horas × tarifa (jefe y proyectista) + subcontratación + gastos; rentabilidad = (ingreso − coste) / coste.',
      'Navegación entre vistas mediante el estado de sesión de Streamlit; datos tabulares con pandas.',
    ],
    links: [
      { label: 'Código en GitHub', href: 'https://github.com/Maikol-2004/AshesFire-appPrueba' },
    ],
    tone: '#d2a27e',
    visual: 'ashesfire',
    provisional: false,
  },
  {
    id: 'matchup',
    title: 'MatchUp',
    accent: 'app Android de partidos.',
    summary:
      'Aplicación Android para organizar y unirse a partidos de fútbol, pádel y basket: crear partidos, pedir plaza, añadir amigos y seguir las invitaciones desde el móvil.',
    context: 'Proyecto personal · Android · 2026',
    role: 'Diseño y desarrollo',
    status: 'En desarrollo',
    technologies: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Android Studio'],
    objectives: [
      'Facilitar que un grupo organice un partido y que otros jugadores encuentren plaza cerca.',
      'Reunir en una sola app el partido, los jugadores, las solicitudes y las notificaciones.',
    ],
    features: [
      'Introducción y onboarding animados, acceso con cuentas locales y creación de avatar.',
      'Inicio con categorías por deporte, partidos recomendados y barra de ocupación por partido.',
      'Creación de partidos con nivel, lugar, fecha, capacidad, precio, vestuarios, material y modo privado.',
      'Solicitudes de plaza, invitaciones, amigos, notificaciones y perfil público de cada jugador.',
    ],
    technical: [
      'Interfaz íntegra con Jetpack Compose y Material 3 sobre Android (minSdk 26), unas 10.800 líneas de Kotlin.',
      'Persistencia local con SharedPreferences: partidos, cuentas, amistades, solicitudes y categorías.',
      'Pantallas separadas por responsabilidad y repositorios locales para categorías, social y notificaciones.',
    ],
    links: [],
    tone: '#e0b892',
    visual: 'matchup',
    provisional: false,
  },
  {
    id: 'my-journey',
    title: 'My Journey',
    accent: 'portafolio interactivo.',
    summary:
      'Este portafolio: currículum interactivo con una línea temporal guiada por el scroll y una constelación 3D que representa la trayectoria como una red.',
    context: 'Proyecto personal · 2026',
    role: 'Diseño y desarrollo',
    status: 'En desarrollo',
    technologies: [
      'React',
      'TypeScript',
      'Vite',
      'GSAP',
      'Three.js',
      'React Three Fiber',
      'Vitest',
    ],
    objectives: [
      'Contar la trayectoria profesional como una experiencia, no como una lista.',
      'Mantener todo el contenido en un único archivo de datos fácil de editar.',
    ],
    features: [
      'Constelación 3D con niveles: experiencias, categorías y detalles, con cámara animada.',
      'Línea temporal en profundidad con barra de años que se rellena con el scroll.',
      'Vista de lista accesible equivalente a la escena 3D y soporte de movimiento reducido.',
      'Diseño adaptado a escritorio y móvil, con interacciones táctiles.',
    ],
    technical: [
      'Generador determinista de la estructura orgánica (ramas recursivas) a partir de los datos, probado con Vitest.',
      'Shaders propios: dibujado progresivo ligado al scroll, reactividad al cursor y render pausado fuera de pantalla.',
      'Un solo sistema de animación (GSAP) y carga diferida del chunk de Three.js.',
    ],
    links: [
      { label: 'Código en GitHub', href: 'https://github.com/Maikol-2004/Pagina-Personal-CV' },
    ],
    tone: '#c4936a',
    visual: 'journey',
    provisional: false,
  },
  {
    id: 'cv-editorial',
    title: 'CV web',
    accent: 'editorial.',
    summary:
      'Primera versión de mi currículum en la web: composición editorial con una esfera de cobre construida solo con CSS y escenas que se abren al pulsar.',
    context: 'Proyecto personal · 2026',
    role: 'Diseño y desarrollo',
    status: 'Publicado',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    objectives: ['Presentar el CV con una identidad visual propia y sin dependencias externas.'],
    features: [
      'Filtros de experiencia y desplegables nativos accesibles con teclado.',
      'Escenas con iluminación por proximidad del cursor y foco táctil en móvil.',
      'Adaptación a distintos anchos, movimiento reducido e impresión.',
    ],
    technical: [
      'Sin dependencias de ejecución ni peticiones externas; fuentes alojadas en local.',
      'Controlador único para abrir y cerrar escenas, con transiciones reversibles.',
    ],
    links: [
      { label: 'Ver la web', href: 'https://maikol-2004.github.io/Prueba/' },
      { label: 'Código en GitHub', href: 'https://github.com/Maikol-2004/Prueba' },
    ],
    tone: '#b98a63',
    visual: 'cv',
    provisional: false,
  },
  {
    id: 'portfolio-narrativo',
    title: 'Portfolio narrativo',
    accent: 'para otra persona.',
    summary:
      'Portafolio web que desarrollé para Alba De Vicente (ingeniera de software fullstack): su currículum convertido en una experiencia interactiva con línea del tiempo, vistas de detalle y versión móvil propia.',
    context: 'Proyecto para un tercero · Alba De Vicente · 2026',
    role: 'Desarrollo del portafolio',
    status: 'Publicado',
    technologies: ['React 19', 'TypeScript', 'Vite', 'GSAP + ScrollTrigger', 'Lenis', 'Motion'],
    objectives: [
      'Convertir el currículum en PDF, que es la versión resumida, en una web que es la versión extendida.',
      'Que cada etapa profesional sea un capítulo que se descubre con el scroll y se explora en detalle.',
    ],
    features: [
      'Línea del tiempo acoplada al scroll, con hitos que se acercan y se retiran en profundidad.',
      'Vista de detalle en cuatro capítulos, con transición cinematográfica desde el propio hito y vuelta al mismo punto.',
      'Accesible: navegación por teclado, foco gestionado, reduced motion y sin violaciones en las pruebas con axe-core.',
      'Experiencia táctil propia en móvil, no una versión reducida de la de escritorio.',
    ],
    technical: [
      'Contenido separado de la presentación: se actualiza editando un único archivo de datos.',
      'Animación del scroll con GSAP y ScrollTrigger, desplazamiento suave con Lenis y transiciones con Motion.',
    ],
    links: [{ label: 'Ver la web', href: 'https://pagina-personal-cv.vercel.app/' }],
    tone: '#c9a27e',
    visual: 'portfolio',
    provisional: false,
  },
]

/** Los proyectos como ramas de la constelación (mismos datos que la galería, sin duplicar contenido). */
export const projectStages: Stage[] = projects.map((p) => ({
  id: `proj-${p.id}`,
  kind: 'project',
  company: p.title + (stages.some((s) => s.company === p.title) ? ' (app)' : ''),
  role: p.accent.replace(/\.$/, ''),
  period: p.status,
  summary: p.summary,
  description: p.summary,
  tone: p.tone,
  categories: [
    {
      id: 'obj',
      kind: 'funciones',
      title: 'Objetivos',
      items: p.objectives.map((t, i) => ({ id: `${p.id}-o${i}`, label: t })),
    },
    {
      id: 'fun',
      kind: 'proyectos',
      title: 'Funcionalidades',
      items: p.features.map((t, i) => ({ id: `${p.id}-f${i}`, label: t })),
    },
    {
      id: 'tec',
      kind: 'tecnologias',
      title: 'Tecnologías',
      items: p.technologies.map((t, i) => ({ id: `${p.id}-t${i}`, label: t })),
    },
    {
      id: 'asp',
      kind: 'aprendizajes',
      title: 'Aspectos técnicos',
      items: p.technical.map((t, i) => ({ id: `${p.id}-a${i}`, label: t })),
    },
  ],
}))

/** Todo lo que muestra la constelación: etapas profesionales y proyectos. */
export const constellationStages: Stage[] = [...stages, ...projectStages]

export const skillGroups: SkillGroup[] = [
  {
    id: 'desarrollo',
    title: 'Código &',
    accent: 'aplicaciones.',
    label: 'DESARROLLO',
    kind: 'tecnologias',
    note: 'Del lenguaje a la interfaz.',
    items: ['Java', 'JavaFX', 'Java Swing', 'Python', 'JavaScript', 'HTML', 'CSS', 'XML'],
  },
  {
    id: 'datos',
    title: 'Datos &',
    accent: 'conexiones.',
    label: 'DATOS Y ENTORNO',
    kind: 'herramientas',
    note: 'La estructura detrás de cada idea.',
    items: [
      'SQL',
      'PL/SQL',
      'Hibernate',
      'Firebase',
      'Android Studio',
      'GNU/Linux',
      'Git / GitHub',
    ],
  },
  {
    id: 'personas',
    title: 'Personas &',
    accent: 'soluciones.',
    label: 'HABILIDADES HUMANAS',
    kind: 'competencias',
    note: 'La forma de afrontar cada reto.',
    items: [
      'Resolución de problemas',
      'Trabajo en equipo',
      'Adaptabilidad',
      'Comunicación',
      'Gestión del tiempo',
      'Proactividad',
    ],
  },
  {
    id: 'idiomas',
    title: 'Palabras &',
    accent: 'conversaciones.',
    label: 'IDIOMAS',
    kind: 'conocimientos',
    note: 'Conectar también es comunicar.',
    items: ['Español · nativo', 'Inglés · nivel medio'],
  },
]
