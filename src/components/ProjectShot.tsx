import type { Project } from '../data/types'
import { makeRng } from '../lib/rng'

const MENU = [
  'Agregar Nuevo Proyecto',
  'Registrar Día',
  'Modificar Proyecto',
  'Finalizar Proyecto',
  'Consultar Proyectos',
  'Eliminar Proyecto',
]

/** Mini constelación determinista (mismo lenguaje visual que la escena 3D). */
function MiniConstellation() {
  const rng = makeRng('mini')
  const branches = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + 0.4
    const len = 62 + rng.range(-8, 14)
    const x = 160 + Math.cos(a) * len * 1.5
    const y = 100 + Math.sin(a) * len * 0.85
    const kids = Array.from({ length: 3 }, (_, k) => {
      const b = a + (k - 1) * 0.7
      return { x: x + Math.cos(b) * 24, y: y + Math.sin(b) * 16 }
    })
    return { x, y, kids }
  })
  return (
    <svg viewBox="0 0 320 200" className="shot__svg" aria-hidden="true">
      {branches.map((b, i) => (
        <g key={i}>
          <path
            d={`M160 100 Q ${(160 + b.x) / 2 + 8} ${(100 + b.y) / 2 - 10} ${b.x} ${b.y}`}
            className="shot__line"
          />
          {b.kids.map((k, j) => (
            <g key={j}>
              <path d={`M${b.x} ${b.y} L${k.x} ${k.y}`} className="shot__line shot__line--thin" />
              <circle
                cx={k.x}
                cy={k.y}
                r="2"
                className="shot__dot"
                style={{ animationDelay: `${(i + j) * 0.3}s` }}
              />
            </g>
          ))}
          <circle cx={b.x} cy={b.y} r="4.5" className="shot__node" />
        </g>
      ))}
      <circle cx="160" cy="100" r="8" className="shot__core" />
    </svg>
  )
}

/** Ilustración del proyecto dentro de un marco de ventana. No es una captura: reconstruye la interfaz real. */
export function ProjectShot({ project, className = '' }: { project: Project; className?: string }) {
  return (
    <div className={`shot ${className}`} aria-hidden="true">
      <div className="shot__bar">
        <i />
        <i />
        <i />
        <span>
          {project.visual === 'ashesfire' && 'Ashes Fire — Proyectos'}
          {project.visual === 'journey' && 'My Journey'}
          {project.visual === 'cv' && 'Michael Guzmán — Desarrollo & personas'}
        </span>
      </div>
      <div className="shot__body">
        {project.visual === 'ashesfire' && (
          <div className="shot__menu">
            <p className="shot__h">Menú Principal - Ashes Fire</p>
            {MENU.map((m, i) => (
              <span key={m} className="shot__btn">
                {i + 1}. {m}
              </span>
            ))}
          </div>
        )}
        {project.visual === 'journey' && <MiniConstellation />}
        {project.visual === 'cv' && (
          <div className="shot__cv">
            <div>
              <p className="shot__big">Michael</p>
              <p className="shot__big shot__big--em">Guzmán.</p>
            </div>
            <span className="shot__sphere" />
          </div>
        )}
      </div>
    </div>
  )
}
