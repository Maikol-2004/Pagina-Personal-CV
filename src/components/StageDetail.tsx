import type { Stage } from '../data/types'
import { StageArt } from './StageArt'

const KIND: Record<Stage['kind'], string> = {
  work: 'Experiencia',
  education: 'Formación',
  volunteer: 'Voluntariado',
}

/** Contenido de la vista detallada de una etapa (línea temporal y constelación). */
export function StageDetail({ stage }: { stage: Stage }) {
  const hasProvisional = stage.categories.some((c) => c.items.some((i) => i.provisional))
  return (
    <div className="dlg__grid">
      <div className="dlg__art dlg__in">
        <StageArt label={stage.start ? String(stage.start) : stage.company} tone={stage.tone} />
      </div>
      <div>
        <h2 className="dlg__title dlg__in">{stage.role}</h2>
        <p className="dlg__meta dlg__in">
          {stage.company} · {stage.period}
          {stage.place ? ` · ${stage.place}` : ''} · {KIND[stage.kind]}
        </p>
        <p className="dlg__text dlg__in">{stage.description}</p>
        {stage.categories.map((c) => (
          <section key={c.id} className="dlg__cat dlg__in">
            <h3>{c.title}</h3>
            <ul className="dlg__list">
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
        {hasProvisional && (
          <p className="dlg__note dlg__in">
            Lo marcado «Por validar» no figura en el currículum: es contenido provisional que debe
            confirmarse o eliminarse antes de publicar.
          </p>
        )}
      </div>
    </div>
  )
}
