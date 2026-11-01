import { useLayoutEffect, useRef, useState } from 'react'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import { SectionLabel } from '../components/SectionLabel'
import { gsap } from '../lib/gsap'

interface Props {
  onOpen: (p: Project, rect: DOMRect | null) => void
}

export const shotUrl = (name: string) => `${import.meta.env.BASE_URL}projects/${name}.webp`
const pad = (n: number) => String(n).padStart(2, '0')

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
  const [idx, setIdx] = useState(0)
  const project = projects[idx]
  const stage = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLDivElement>(null)

  // Entrada al cambiar de proyecto
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(
      () => {
        gsap.fromTo(
          '.dev',
          { y: 70, opacity: 0, scale: 0.93 },
          { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', stagger: 0.12 },
        )
        gsap.fromTo(
          '.showcase__text > *',
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
        )
      },
      stage.current?.closest('.showcase') as Element,
    )
    return () => ctx.revert()
  }, [idx])

  // Parallax: cada capa se desplaza según su profundidad
  useLayoutEffect(() => {
    const el = stage.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      el.querySelectorAll<HTMLElement>('.dev__in').forEach((d) => {
        const k = Number(d.dataset.depth)
        gsap.to(d, {
          x: -nx * k * 22,
          y: -ny * k * 16,
          rotateY: nx * k * 2,
          rotateX: -ny * k * 2,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }
    const leave = () =>
      gsap.to(el.querySelectorAll('.dev__in'), {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 1,
        ease: 'expo.out',
      })
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [idx])

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

        <div className="showcase" data-reveal>
          <div className="showcase__tabs" role="tablist" aria-label="Proyectos">
            {projects.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={i === idx}
                aria-controls="showcase-panel"
                className="showcase__tab"
                onClick={() => setIdx(i)}
              >
                <span className="showcase__n">{pad(i + 1)}</span>
                {p.title}
              </button>
            ))}
          </div>

          <div
            id="showcase-panel"
            role="tabpanel"
            aria-labelledby={`tab-${project.id}`}
            className="showcase__panel"
          >
            <div ref={text} className="showcase__text">
              <p className="eyebrow showcase__meta">
                <span>
                  Proyecto {pad(idx + 1)} / {pad(projects.length)}
                </span>
                <span className="tag">{project.status}</span>
              </p>
              <h3>
                {project.title}
                <br />
                <em>{project.accent}</em>
              </h3>
              <p className="showcase__sum">{project.summary}</p>

              <div>
                <p className="eyebrow muted showcase__h">Lo más destacado</p>
                <ul className="showcase__list">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow muted showcase__h">Tecnologías</p>
                <ul className="chips">
                  {project.technologies.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <p className="showcase__role">
                <span className="eyebrow muted">Mi rol</span>
                {project.role} · {project.context}
              </p>

              <div className="showcase__actions">
                <button
                  className="pill pill--solid"
                  onClick={(e) => onOpen(project, e.currentTarget.getBoundingClientRect())}
                >
                  Ficha completa <Out />
                </button>
                {project.links.map((l) => (
                  <a key={l.href} className="pill" href={l.href} target="_blank" rel="noreferrer">
                    {l.label} <Out />
                  </a>
                ))}
              </div>
            </div>

            <div ref={stage} className="showcase__stage" data-project={project.id}>
              {PROJECT_LAYERS[project.id]
                ?.filter((l) => !l.gallery)
                .map((l) => (
                  <div
                    key={l.src}
                    className={`dev dev--${l.kind}`}
                    style={{
                      left: `${l.left}%`,
                      top: `${l.top}%`,
                      width: `${l.width}%`,
                      zIndex: l.z,
                    }}
                  >
                    <div
                      className="dev__in"
                      data-depth={l.depth}
                      style={{ transform: l.rotate ? `rotate(${l.rotate}deg)` : undefined }}
                    >
                      {l.kind === 'window' && (
                        <div className="dev__bar">
                          <i />
                          <i />
                          <i />
                          <span>{l.title}</span>
                        </div>
                      )}
                      <img src={shotUrl(l.src)} alt={l.alt} loading="lazy" decoding="async" />
                      {l.kind === 'card' && <span className="dev__cap">{l.title}</span>}
                    </div>
                  </div>
                ))}
              <p className="showcase__note">
                {project.id === 'ashesfire' &&
                  'Capturas de la app en ejecución con datos de ejemplo.'}
                {project.id === 'matchup' && 'Capturas reales de la app en un móvil Android.'}
                {project.id === 'portfolio-narrativo' && 'Imágenes de la web publicada.'}
                {['my-journey', 'cv-editorial'].includes(project.id) &&
                  'Capturas del sitio en ejecución.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
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
