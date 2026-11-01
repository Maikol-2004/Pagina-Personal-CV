/**
 * Imágenes reales de cada proyecto y su composición en el escaparate.
 * Capturas: AshesFire (app Streamlit ejecutada en local con datos de ejemplo), My Journey y CV web (sitios en ejecución).
 * MatchUp: recursos gráficos reales de la app (portada y fotos de deportes).
 */
export type Layer = {
  src: string
  alt: string
  title?: string
  kind: 'window' | 'phone' | 'card'
  /** Posición y tamaño dentro del escaparate, en %. */
  left: number
  top: number
  width: number
  /** Intensidad del parallax (0 = quieto). */
  depth: number
  z: number
  rotate?: number
  /** true = sólo aparece en la galería de la ficha, no en el escaparate. */
  gallery?: boolean
}

export const PROJECT_LAYERS: Record<string, Layer[]> = {
  ashesfire: [
    {
      src: 'ashesfire-list',
      alt: 'Listado de proyectos y detalle en AshesFire',
      title: 'Consultar proyectos',
      kind: 'window',
      left: 0,
      top: 14,
      width: 74,
      depth: 1,
      z: 1,
    },
    {
      src: 'ashesfire-menu',
      alt: 'Menú principal de AshesFire',
      title: 'Menú principal',
      kind: 'window',
      left: 34,
      top: 0,
      width: 58,
      depth: 2,
      z: 2,
    },
    {
      src: 'ashesfire-costs',
      alt: 'Costes totales y rentabilidad de un proyecto',
      title: 'Costes y rentabilidad',
      kind: 'window',
      left: 38,
      top: 46,
      width: 62,
      depth: 3,
      z: 3,
    },
  ],
  matchup: [
    {
      src: 'matchup-onboarding',
      alt: 'Pantalla de bienvenida de MatchUp: Organiza, Comparte, Juega',
      kind: 'phone',
      left: 0,
      top: 14,
      width: 29,
      depth: 1,
      z: 1,
    },
    {
      src: 'matchup-inicio',
      alt: 'Inicio de MatchUp: explorar partidos por deporte',
      kind: 'phone',
      left: 33,
      top: 2,
      width: 31,
      depth: 3,
      z: 3,
    },
    {
      src: 'matchup-perfil',
      alt: 'Perfil de jugador en MatchUp con rendimiento por deporte',
      kind: 'phone',
      left: 69,
      top: 16,
      width: 29,
      depth: 2,
      z: 2,
    },
    {
      src: 'matchup-splash',
      alt: 'Pantalla de entrada de MatchUp',
      kind: 'phone',
      left: 0,
      top: 0,
      width: 0,
      depth: 0,
      z: 0,
      gallery: true,
    },
  ],
  'my-journey': [
    {
      src: 'journey-hero',
      alt: 'Portada de My Journey',
      title: 'Portada',
      kind: 'window',
      left: 0,
      top: 2,
      width: 78,
      depth: 1,
      z: 1,
    },
    {
      src: 'journey-constel-focus',
      alt: 'Constelación 3D de My Journey',
      title: 'Constelación 3D',
      kind: 'window',
      left: 24,
      top: 40,
      width: 64,
      depth: 2,
      z: 2,
    },
    {
      src: 'journey-m-timeline',
      alt: 'Línea temporal en móvil',
      kind: 'phone',
      left: 76,
      top: 12,
      width: 22,
      depth: 3,
      z: 3,
    },
  ],
  'cv-editorial': [
    {
      src: 'cv-hero',
      alt: 'Portada del CV web editorial',
      title: 'Portada',
      kind: 'window',
      left: 0,
      top: 4,
      width: 76,
      depth: 1,
      z: 1,
    },
    {
      src: 'cv-exp',
      alt: 'Sección de experiencia del CV web',
      title: 'Trayectoria',
      kind: 'window',
      left: 30,
      top: 44,
      width: 62,
      depth: 2,
      z: 2,
    },
    {
      src: 'cv-m-exp',
      alt: 'CV web en móvil',
      kind: 'phone',
      left: 78,
      top: 10,
      width: 21,
      depth: 3,
      z: 3,
    },
  ],
}
