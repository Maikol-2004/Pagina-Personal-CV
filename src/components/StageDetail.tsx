import { useLayoutEffect, useRef } from 'react'
import { timelineStages, yearLabel } from '../data/profile'
import type { Stage } from '../data/types'
import { gsap } from '../lib/gsap'
import { StageArt } from './StageArt'

const KIND: Record<Stage['kind'], string> = {
  work: 'Experiencia',
  education: 'Formación',
  volunteer: 'Voluntariado',
}

/** Ficha completa de una etapa: cabecera, datos clave, categorías en tarjetas y navegación entre etapas. */
export function StageDetail({ stage, onStep }: { stage: Stage; onStep: (s: Stage) => void }) {
  const root = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const hasProvisional = stage.categories.some((c) => c.items.some((i) => i.provisional))
  const idx = timelineStages.findIndex((s) => s.id === stage.id)
  const newer = idx > 0 ? timelineStages[idx - 1] : null
  const older = idx >= 0 && idx < timelineStages.length - 1 ? timelineStages[idx + 1] : null

  // Al cambiar de etapa desde dentro de la ficha, el contenido entra de nuevo (la primera entrada la anima el diálogo).
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dlg__in',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06 },
      )
    }, root)
    root.current?.closest('.dlg__scroll')?.scrollTo({ top: 0 })
    return () => ctx.revert()
  }, [stage.id])

  return (
    <div ref={root} className="sd">
      <header className="sd__head">
        <p className="eyebrow dlg__in" style={{ color: 'var(--copper)' }}>
          {KIND[stage.kind]} · {stage.period}
          {idx >= 0 &&
            ` · Etapa ${String(idx + 1).padStart(2, '0')} / ${String(timelineStages.length).padStart(2, '0')}`}
        </p>
        <h2 className="dlg__title dlg__in">{stage.role}</h2>
        <p className="sd__company dlg__in">
          {stage.company}
          {stage.place ? ` · ${stage.place}` : ''}
        </p>
      </header>

      <div className="sd__body">
        <aside className="sd__side dlg__in">
          <StageArt label={yearLabel(stage)} tone={stage.tone} />
          <dl className="sd__facts">
            <div>
              <dt className="eyebrow">Organización</dt>
              <dd>{stage.company}</dd>
            </div>
            <div>
              <dt className="eyebrow">Cargo</dt>
              <dd>{stage.role}</dd>
            </div>
            <div>
              <dt className="eyebrow">Periodo</dt>
              <dd>{stage.period}</dd>
            </div>
            {stage.place && (
              <div>
                <dt className="eyebrow">Lugar</dt>
                <dd>{stage.place}</dd>
              </div>
            )}
          </dl>
        </aside>

        <div className="sd__main">
          <p className="dlg__text dlg__in">{stage.description}</p>
          <div className="sd__cats">
            {stage.categories.map((c) => (
              <section key={c.id} className="sd__cat dlg__in">
                <header>
                  <h3>{c.title}</h3>
                  <span className="sd__count">{c.items.length}</span>
                </header>
                <ul>
                  {c.items.map((i) => (
                    <li key={i.id}>
                      <span>{i.label}</span>
                      {i.provisional && <span className="dlg__tag">Por validar</span>}
                      {i.detail && <small>{i.detail}</small>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {hasProvisional && (
            <p className="dlg__note dlg__in">
              Lo marcado «Por validar» no figura en el currículum: es contenido provisional que debe
              confirmarse o eliminarse antes de publicar.
            </p>
          )}
        </div>
      </div>

      {idx >= 0 && (
        <nav className="sd__nav dlg__in" aria-label="Navegar entre etapas">
          {newer ? (
            <button className="pill" onClick={() => onStep(newer)}>
              ← Más reciente: {newer.company}
            </button>
          ) : (
            <span />
          )}
          {older ? (
            <button className="pill" onClick={() => onStep(older)}>
              Más antigua: {older.company} →
            </button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
