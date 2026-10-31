import { useRef } from 'react'
import { projects } from '../data/profile'
import type { Project } from '../data/types'
import { StageArt } from '../components/StageArt'
import { gsap } from '../lib/gsap'

interface Props {
  onOpen: (p: Project, rect: DOMRect | null) => void
}

export function Projects({ onOpen }: Props) {
  return (
    <section className="section projects" id="proyectos" aria-labelledby="pr-title">
      <h2 id="pr-title" data-reveal>
        Proyectos destacados
      </h2>
      <p className="lead muted projects__lede" data-reveal>
        Una galería que crecerá conmigo. Las fichas marcadas como provisionales son huecos de
        ejemplo.
      </p>
      <ul className="projects__grid">
        {projects.map((p, i) => (
          <li key={p.id} className={`projects__item projects__item--${i + 1}`} data-reveal>
            <ProjectCard project={p} onOpen={onOpen} />
          </li>
        ))}
      </ul>
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
      rotateY: px * 10,
      rotateX: -py * 8,
      z: 40,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    gsap.to(el.querySelector('.pcard__art'), {
      x: -px * 18,
      y: -py * 14,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      z: 0,
      duration: 0.9,
      ease: 'expo.out',
      overwrite: 'auto',
    })
    gsap.to(el.querySelector('.pcard__art'), {
      x: 0,
      y: 0,
      duration: 0.9,
      ease: 'expo.out',
      overwrite: 'auto',
    })
  }
  return (
    <button
      ref={ref}
      className="pcard"
      style={{ ['--tone' as string]: project.tone }}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={(e) => onOpen(project, e.currentTarget.getBoundingClientRect())}
      aria-label={`Abrir proyecto: ${project.title}`}
    >
      <span className="pcard__art">
        <StageArt label={project.badge} tone={project.tone} />
      </span>
      <span className="pcard__body">
        <span className="pcard__title">{project.title}</span>
        <span className="pcard__sum">{project.summary}</span>
        {project.provisional && <span className="chip chip--provisional">Provisional</span>}
        {project.technologies.length > 0 && (
          <span className="pcard__tech">
            {project.technologies.map((t) => (
              <span className="chip" key={t}>
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
