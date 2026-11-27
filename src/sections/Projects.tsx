import { Component, lazy, Suspense, type ReactNode } from 'react'
import { projects } from '../data/profile'
import { ProjectExperience } from '../components/ProjectExperience'
import type { Project } from '../data/types'
import { SectionLabel } from '../components/SectionLabel'
const ProjectGallery = lazy(() => import('../three/ProjectGallery'))
class GalleryBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}

interface Props {
  onOpen: (p: Project, rect: DOMRect | null) => void
  activeProjectId?: string
  paused?:boolean
}

export const shotUrl = (name: string) => `${import.meta.env.BASE_URL}projects/${name}.webp`

const Out = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" />
  </svg>
)

/**
 * Escaparate de proyectos: un proyecto destacado a la vez, con su texto a un lado y una composición de
 * pantallas reales (ventanas, móvil, tarjetas) al otro. Las capas se mueven con el cursor a distinta profundidad
 * y se recomponen con una entrada escalonada al cambiar de proyecto.
 */
export function Projects({ onOpen, activeProjectId, paused=false }: Props) {
  const direct=<div className="container gallery-access" aria-label="Acceso directo a proyectos">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title}</button>)}</div>
  return <section className="section projects" id="proyectos" aria-labelledby="pr-title">
    <div className="container projects-intro">
      <SectionLabel n="04" left="Proyectos" right="Lo que construyo" />
      <div className="section-heading" data-reveal>
        <h2 id="pr-title">Proyectos<br/><em>destacados.</em></h2>
        <div className="projects-intro-copy"><p>Cinco proyectos reales, una exposición interactiva. Descubre sus soluciones, tecnologías y demostraciones.</p><a className="projects-intro-link" href="#galeria-inmersiva">Entrar en la exposición <span aria-hidden="true">↓</span></a></div>
      </div>
    </div>
    <GalleryBoundary fallback={direct}><Suspense fallback={direct}>
      <ProjectGallery onOpen={onOpen} activeProjectId={activeProjectId} paused={paused}/>
    </Suspense></GalleryBoundary>
  </section>
}

/** Ficha completa de un proyecto (diálogo cinematográfico) con galería de imágenes reales. */
export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="pd">
      <ProjectExperience key={project.id} project={project}/>
      <div className="pd__links">
        {project.links.map((l) => (
          <a
            key={l.href}
            className="pill pill--solid"
            href={l.href}
            target="_blank"
            rel="noreferrer"
          >
            {l.label} <Out />
          </a>
        ))}
        {project.links.length === 0 && <p className="muted">Sin enlace público en esta ficha.</p>}
      </div>
    </div>
  )
}
