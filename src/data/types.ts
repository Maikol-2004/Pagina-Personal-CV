/** Tipos del contenido profesional. Edita sólo `profile.ts`; los componentes leen estos datos. */

export type CategoryKind =
  'funciones' | 'proyectos' | 'habilidades' | 'tecnologias' | 'aprendizajes'
export type StageKind = 'work' | 'education' | 'volunteer'

export interface Item {
  id: string
  label: string
  detail?: string
  /** true = contenido orientativo que NO figura en el CV y está pendiente de validación. */
  provisional?: boolean
}

export interface Category {
  id: string
  kind: CategoryKind
  title: string
  items: Item[]
}

export interface Stage {
  id: string
  kind: StageKind
  company: string
  role: string
  place?: string
  /** Año de inicio y fin (null = en curso, undefined = sin fecha en el CV). */
  start?: number
  end?: number | null
  period: string
  summary: string
  description: string
  /** Tono dentro de la gama cromática del portafolio. */
  tone: string
  categories: Category[]
}

export interface Project {
  id: string
  title: string
  summary: string
  context: string
  technologies: string[]
  objectives: string[]
  features: string[]
  challenges: string[]
  links: { label: string; href: string }[]
  tone: string
  /** Texto corto que se muestra en la placa de color. */
  badge: string
  /** true = ficha de ejemplo pendiente de validación. */
  provisional: boolean
}

export interface SkillGroup {
  id: string
  title: string
  kind: 'tecnologias' | 'herramientas' | 'conocimientos' | 'competencias'
  note: string
  items: string[]
}
