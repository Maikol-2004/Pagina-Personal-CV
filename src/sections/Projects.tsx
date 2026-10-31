import { useRef } from 'react'
import { projects } from '../data/profile'
import type { Project } from '../data/types'
import { ProjectShot } from '../components/ProjectShot'
import { SectionLabel } from '../components/SectionLabel'
import { gsap } from '../lib/gsap'

interface Props {
  onOpen: (p: Project, rect: DOMRect | null) => void
}

export function Projects({ onOpen }: Props) {
  return (
    <section className="section projects" id="proyectos" aria-labelledby="pr-title">
      <div className="container">
        <SectionLabel n="04" left="Proyectos" right="Lo que construyo" />
        <div className="section-heading" data-reveal>
          <h2 id="pr-title">
            Proyectos
            <br />
            <em>destacados.</em>
          </h2>
          <p>Software real: del control de proyectos de una empresa a mi propia web.</p>
        </div>
        <ul className="projects__grid">
          {projects.map((p) => (
            <li key={p.id} className="projects__item" data-reveal>
              <ProjectCard project={p} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: Props['onOpen'] }) {
  const ref = useRef<HTMLButtonElement>(null)
  const move = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, {
      rotateY: px * 6,
      rotateX: -py * 5,
      z: 24,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  const leave = () => {
    if (ref.current)
      gsap.to(ref.current, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.9,
        ease: 'expo.out',
        overwrite: 'auto',
      })
  }
  return (
    <button
      ref={ref}
      className="pcard scene"
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={(e) => onOpen(project, e.currentTarget.getBoundingClientRect())}
      aria-label={`Abrir proyecto: ${project.title} ${project.accent}`}
    >
      <ProjectShot project={project} />
      <span className="pcard__body">
        <span className="pcard__meta eyebrow">
          <span>{project.context}</span>
          <span className="tag">{project.status}</span>
        </span>
        <span className="pcard__title">
          {project.title} <em>{project.accent}</em>
        </span>
        <span className="pcard__sum">{project.summary}</span>
        <span className="pcard__tech">
          {project.technologies.slice(0, 5).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
        <span className="pcard__cta">
          Ver proyecto
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 19 19 5M5 5h14v14" />
          </svg>
        </span>
      </span>
    </button>
  )
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

/** Ficha completa de un proyecto (diálogo cinematográfico). */
export function ProjectDetail({ project }: { project: Project }) {
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

      <div className="pd__shot dlg__in">
        <ProjectShot project={project} />
        <p className="pd__caption">
          Reconstrucción de la interfaz a partir del código del proyecto.
        </p>
      </div>

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
            {l.label}
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 19 19 5M5 5h14v14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
