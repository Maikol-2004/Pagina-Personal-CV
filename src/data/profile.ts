import type { Project, SkillGroup, Stage } from './types'

/**
 * FUENTE ÚNICA DE DATOS — extraída de CV_Michael_Guzman.pdf.
 * Todo lo marcado `provisional: true` NO viene del CV y debe validarse o borrarse.
 */

export const profile = {
  name: 'Michael Javier Guzmán Giraldo',
  shortName: 'Michael Guzmán',
  headline: 'Desarrollador de aplicaciones multiplataforma en formación',
  tagline:
    'Vengo del trato con el cliente y del trabajo físico; hoy construyo software con esa misma constancia.',
  location: 'Majadahonda, Madrid',
  email: 'giraldomaicol123@gmail.com',
  phone: '658170221',
  linkedin: 'https://www.linkedin.com/in/michael-guzman-giraldo',
  about: [
    'Profesional con experiencia en atención al cliente, ventas y servicios, dispuesto a ofrecer un trato cercano y de calidad.',
    'Destaco por mi afán de superación, mi interés por aprender y mi motivación por asumir nuevos retos profesionales.',
    'Busco desarrollo y experiencia profesional, aportando compromiso y una actitud positiva en cada proyecto.',
  ],
  /** Texto de filosofía/intereses: redactado a partir del perfil del CV, pendiente de validar. */
  philosophy: [
    {
      title: 'Trato cercano',
      text: 'Cada producto lo usa una persona: escuchar primero y construir después.',
      provisional: true,
    },
    {
      title: 'Aprender haciendo',
      text: 'Del mostrador al código, he aprendido cada oficio practicándolo.',
      provisional: true,
    },
    {
      title: 'Compromiso',
      text: 'Una actitud positiva y constante en cada proyecto, también en los difíciles.',
      provisional: true,
    },
  ],
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

export const stages: Stage[] = [
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
    tone: '#8E7B6B',
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
    tone: '#B08968',
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
    tone: '#C9A27E',
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
    tone: '#A9876B',
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
    tone: '#806653',
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
    tone: '#D8C7AE',
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
    tone: '#C5B5A0',
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
    tone: '#D1B89A',
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

/** Etapas con fecha: alimentan la línea temporal (la constelación usa todas). */
export const timelineStages = stages
  .filter((s) => s.start !== undefined)
  .sort((a, b) => a.start! - b.start! || (a.end ?? 9999) - (b.end ?? 9999))

export const projects: Project[] = [
  {
    id: 'gestion-proyectos',
    title: 'Aplicación de gestión de proyectos',
    summary:
      'Aplicación interna para gestionar los proyectos de AshesFire, desarrollada durante las prácticas.',
    context: 'Prácticas de programador · AshesFire · 2025',
    technologies: [],
    objectives: ['Gestionar los proyectos de la empresa desde una aplicación propia.'],
    features: [],
    challenges: [],
    links: [],
    tone: '#C5B5A0',
    provisional: false,
  },
  {
    id: 'proyecto-2',
    title: 'Proyecto académico DAM (por definir)',
    summary: 'Hueco reservado para un proyecto del ciclo formativo. Contenido de ejemplo.',
    context: 'Grado Superior DAM · 2024 – 2027',
    technologies: ['Java', 'JavaFX', 'SQL'],
    objectives: ['Describir aquí el objetivo real del proyecto.'],
    features: ['Funcionalidades pendientes de validación.'],
    challenges: ['Retos técnicos pendientes de validación.'],
    links: [],
    tone: '#B08968',
    provisional: true,
  },
  {
    id: 'proyecto-3',
    title: 'Aplicación Android (por definir)',
    summary: 'Hueco reservado para un proyecto móvil. Contenido de ejemplo.',
    context: 'Grado Superior DAM · 2024 – 2027',
    technologies: ['Android Studio', 'Firebase'],
    objectives: ['Describir aquí el objetivo real del proyecto.'],
    features: ['Funcionalidades pendientes de validación.'],
    challenges: ['Retos técnicos pendientes de validación.'],
    links: [],
    tone: '#806653',
    provisional: true,
  },
]

export const skillGroups: SkillGroup[] = [
  {
    id: 'lenguajes',
    title: 'Tecnologías',
    kind: 'tecnologias',
    note: 'Lenguajes y marcos con los que trabajo.',
    items: ['Java', 'JavaFX', 'JavaSwing', 'Python', 'JavaScript', 'HTML', 'CSS', 'XML'],
  },
  {
    id: 'datos',
    title: 'Datos',
    kind: 'conocimientos',
    note: 'Bases de datos y persistencia.',
    items: ['SQL', 'PL/SQL', 'Hibernate', 'Firebase'],
  },
  {
    id: 'herramientas',
    title: 'Herramientas',
    kind: 'herramientas',
    note: 'Entorno de trabajo diario.',
    items: ['Android Studio', 'Linux GNU', 'Git / GitHub'],
  },
  {
    id: 'competencias',
    title: 'Competencias profesionales',
    kind: 'competencias',
    note: 'Soft skills indicadas en el CV.',
    items: [
      'Resolución de problemas',
      'Trabajo en equipo',
      'Adaptabilidad',
      'Comunicación',
      'Gestión del tiempo',
      'Proactividad',
    ],
  },
]
