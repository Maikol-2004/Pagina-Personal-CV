import { Component, lazy, Suspense, useState, useEffect, type ReactNode } from 'react'
import { projects } from '../data/profile'
import { posterUrl } from '../lib/projectTransition'
import { CaseStudy } from '../components/CaseStudy'
import { ProjectExperience } from '../components/ProjectExperience'
import type { Project } from '../data/types'
import { ScrollTrigger } from '../lib/gsap'
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
  const [immersive,setImmersive]=useState(true)
  useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[immersive])
  const openGallery=()=>{setImmersive(true);requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('gallery-mount')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})))}
  const direct=<p className="container gallery-unavailable" role="status">Puedes abrir las fichas desde el índice superior.</p>
  return <section className="section projects" id="proyectos" aria-labelledby="pr-title">
    <div className="container projects-intro">
      <SectionLabel n="04" left="Proyectos" right="Lo que construyo" />
      <div className="section-heading" data-reveal>
        <h2 id="pr-title">Proyectos<br/><em>destacados.</em></h2>
        <div className="projects-intro-copy"><p>Siete proyectos, una exposición interactiva. Descubre sus soluciones, tecnologías y demostraciones.</p><button className="projects-intro-link" onClick={openGallery}>Entrar en la exposición <span aria-hidden="true">↓</span></button></div>
      </div>
      <div className="reception-heading"><span className="eyebrow">01—07 / CATÁLOGO DE LA EXPOSICIÓN</span><span className="muted">Elige una obra o recorre el museo.</span></div>
      <div className="gallery-access reception-grid" aria-label="Acceso directo a proyectos">{projects.map((p,i)=><button id={'ficha-'+p.id} key={p.id} className="reception-project" aria-disabled={p.detailMode==='announcement'} onClick={e=>{if(p.detailMode!=='announcement')onOpen(p,e.currentTarget.querySelector('img')?.getBoundingClientRect()??e.currentTarget.getBoundingClientRect())}}>
        <span className="reception-art"><img src={posterUrl(p.id)} alt="" loading="lazy" decoding="async"/><span className="reception-index">{String(i+1).padStart(2,'0')}</span><span className="reception-arrow" aria-hidden="true">{p.detailMode==='announcement'?'·':'↗'}</span></span>
        <span className="reception-meta"><span className="eyebrow muted">{p.status}</span><strong>{p.title}</strong><span>{p.detailMode==='announcement'?'Próximamente · '+p.accent:p.accent.replace(/\.$/,'')}</span></span>
      </button>)}</div>
      <div className="reception-controls"><button className="pill pill--solid" onClick={openGallery}>Recorrer museo 3D ↓</button><button className="pill" aria-pressed={!immersive} onClick={()=>setImmersive(v=>!v)}>{immersive?'Ocultar recorrido 3D':'Mostrar recorrido 3D'}</button><a className="text-link" href="#habilidades">Ir a competencias →</a></div>
    </div>
    {immersive&&<div id="gallery-mount"><GalleryBoundary fallback={direct}><Suspense fallback={direct}>
      <ProjectGallery onOpen={onOpen} activeProjectId={activeProjectId} paused={paused}/>
    </Suspense></GalleryBoundary></div>}
  </section>
}

/** Ficha completa de un proyecto (diálogo cinematográfico) con galería de imágenes reales. */
export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="pd">
      {project.detailMode==='case-study'?<CaseStudy project={project}/>:<ProjectExperience key={project.id} project={project}/> }
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
