import { useRef } from 'react'
import { projects } from '../data/profile'
import type { Project } from '../data/types'
import { StageArt } from '../components/StageArt'
import { gsap } from '../lib/gsap'
import { SectionLabel } from '../components/SectionLabel'

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
          <p>
            Una galería que crecerá conmigo. Las fichas marcadas como provisionales son huecos de
            ejemplo.
          </p>
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
      rotateY: px * 8,
      rotateX: -py * 6,
      z: 30,
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
      aria-label={`Abrir proyecto: ${project.title}`}
    >
      <StageArt label={project.badge} tone={project.tone} />
      <span className="pcard__body">
        {project.provisional && <span className="tag">Provisional</span>}
        <span className="pcard__title">{project.title}</span>
        <span className="pcard__sum">{project.summary}</span>
        {project.technologies.length > 0 && (
          <span className="chips" style={{ display: 'flex' }}>
            {project.technologies.map((t) => (
              <span
                key={t}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  padding: '4px 10px',
                  fontSize: '0.85rem',
                }}
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}

export function ProjectDetail({ project }: { project: Project }) {
  const empty = (a: string[]) => a.length === 0
  return (
    <div className="dlg__grid">
      <div className="dlg__art dlg__in">
        <StageArt label={project.badge} tone={project.tone} />
      </div>
      <div>
        <h2 className="dlg__title dlg__in">{project.title}</h2>
        <p className="dlg__meta dlg__in">{project.context}</p>
        <p className="dlg__text dlg__in">{project.summary}</p>
        {(
          [
            ['Tecnologías', project.technologies],
            ['Objetivos', project.objectives],
            ['Funcionalidades', project.features],
            ['Retos técnicos', project.challenges],
          ] as const
        ).map(([title, list]) => (
          <section className="dlg__cat dlg__in" key={title}>
            <h3>{title}</h3>
            {empty(list as string[]) ? (
              <p className="muted">Pendiente de completar: el CV no incluye este dato.</p>
            ) : (
              <ul className="dlg__list">
                {(list as string[]).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <section className="dlg__cat dlg__in">
          <h3>Enlaces</h3>
          {project.links.length === 0 ? (
            <p className="muted">Sin enlaces publicados todavía (GitHub o demostración).</p>
          ) : (
            <ul className="dlg__list">
              {project.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
        {project.provisional && (
          <p className="dlg__note dlg__in">
            Ficha de ejemplo: no corresponde a un proyecto confirmado en el CV.
          </p>
        )}
      </div>
    </div>
  )
}
