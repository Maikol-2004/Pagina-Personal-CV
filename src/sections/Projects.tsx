import { lazy, Suspense, useState } from 'react'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import { SectionLabel } from '../components/SectionLabel'
const ProjectGallery = lazy(() => import('../three/ProjectGallery'))

interface Props {
  onOpen: (p: Project, rect: DOMRect | null) => void
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
export function Projects({ onOpen }: Props) {
  return <section className="section projects" id="proyectos" aria-labelledby="pr-title">
    <div className="container">
      <SectionLabel n="04" left="Proyectos" right="Lo que construyo" />
      <div className="section-heading" data-reveal>
        <h2 id="pr-title">Proyectos<br/><em>destacados.</em></h2>
        <p>Una exposición de software real. Recorre la galería y descubre cada proyecto.</p>
      </div>
    </div>
    <Suspense fallback={<div className="container">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title}</button>)}</div>}>
      <ProjectGallery onOpen={onOpen}/>
    </Suspense>
  </section>
}

const Block = ({ title, items }: { title: string; items: string[] }) => (
  <section className="pd__block dlg__in">
    <h3>{title}</h3>
    <ul className="pd__list">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  </section>
)

/** Ficha completa de un proyecto (diálogo cinematográfico) con galería de imágenes reales. */
export function ProjectDetail({ project }: { project: Project }) {
  const shots = PROJECT_LAYERS[project.id] ?? []
  const [i, setI] = useState(0)
  const cur = shots[i]
  return (
    <div className="pd">
      <div className="pd__top">
        <p className="eyebrow dlg__in" style={{ color: 'var(--copper)' }}>
          {project.context}
        </p>
        <h2 className="dlg__title dlg__in">
          {project.title}
          <br />
          <em>{project.accent}</em>
        </h2>
        <p className="dlg__text dlg__in">{project.summary}</p>
      </div>

      {cur && (
        <div className="pd__gallery dlg__in">
          <figure className={`pd__frame pd__frame--${cur.kind}`}>
            <img key={cur.src} src={shotUrl(cur.src)} alt={cur.alt} />
          </figure>
          <div className="pd__thumbs" role="group" aria-label="Imágenes del proyecto">
            {shots.map((s, k) => (
              <button key={s.src} aria-pressed={k === i} onClick={() => setI(k)} aria-label={s.alt}>
                <img src={shotUrl(s.src)} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}

      <dl className="pd__facts dlg__in">
        <div>
          <dt className="eyebrow">Rol</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt className="eyebrow">Estado</dt>
          <dd>{project.status}</dd>
        </div>
        <div>
          <dt className="eyebrow">Stack</dt>
          <dd>
            <ul className="chips">
              {project.technologies.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="pd__cols">
        <Block title="Objetivos" items={project.objectives} />
        <Block title="Funcionalidades" items={project.features} />
        <Block title="Aspectos técnicos" items={project.technical} />
      </div>

      <div className="pd__links dlg__in">
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
        {project.links.length === 0 && <p className="muted">Repositorio privado.</p>}
      </div>
    </div>
  )
}
