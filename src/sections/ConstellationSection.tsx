import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { constellationStages as stages } from '../data/profile'
import type { Category, Item, Stage } from '../data/types'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useIsCoarse, useReducedMotion } from '../hooks/useMedia'
import { useVisibility } from '../hooks/useVisibility'
import { NO_FOCUS, type Focus } from '../three/focus'

const Constellation = lazy(() => import('../three/Constellation'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class Boundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const findStage = (id: string | null) => stages.find((s) => s.id === id) ?? null
const findCat = (s: Stage | null, key: string | null): Category | null =>
  s?.categories.find((c) => `${s.id}/${c.id}` === key) ?? null
const findItem = (c: Category | null, key: string | null): Item | null =>
  c?.items.find((i) => key?.endsWith(`/${i.id}`)) ?? null

interface Props {
  onOpenStage: (s: Stage, rect: DOMRect | null) => void
}

export function ConstellationSection({ onOpenStage }: Props) {
  const outer = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const coarse = useIsCoarse()
  const reduced = useReducedMotion()
  const near = useVisibility(sticky, '700px')
  const onScreen = useVisibility(sticky, '0px')
  const [loaded, setLoaded] = useState(false)
  const [focus, setFocus] = useState<Focus>(NO_FOCUS)
  const [zoom, setZoom] = useState(1)
  const webgl = useMemo(() => hasWebGL(), [])
  const [mode, setMode] = useState<'3d' | 'list'>(webgl ? '3d' : 'list')

  useEffect(() => {
    if (near) setLoaded(true)
  }, [near])

  // Progreso vinculado al scroll (sin pin: el scroll nunca se bloquea y la animación es reversible).
  useLayoutEffect(() => {
    if (reduced) {
      progressRef.current = 1
      return
    }
    const st = ScrollTrigger.create({
      trigger: outer.current,
      start: 'top 65%',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })
    return () => st.kill()
  }, [reduced])

  // El modo lista cambia la altura de la sección: hay que recalcular todos los disparadores de scroll.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [mode])

  const stage = findStage(focus.stage)
  const cat = findCat(stage, focus.category)
  const item = findItem(cat, focus.item)

  const back = useCallback(() => {
    setFocus((f) =>
      f.item ? { ...f, item: null } : f.category ? { ...f, category: null } : NO_FOCUS,
    )
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focus.stage && !document.querySelector('.dlg')) back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus.stage, back])

  const goStage = (s: Stage) => setFocus({ stage: s.id, category: null, item: null })
  const goCat = (s: Stage, c: Category) =>
    setFocus({ stage: s.id, category: `${s.id}/${c.id}`, item: null })
  const goItem = (s: Stage, c: Category, i: Item) =>
    setFocus({ stage: s.id, category: `${s.id}/${c.id}`, item: `${s.id}/${c.id}/${i.id}` })

  useEffect(() => {
    if (!sticky.current?.querySelector('.cn-ficha')) return
    gsap.fromTo(
      '.cn-ficha',
      { x: 24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
    )
  }, [focus.stage, focus.category, focus.item])

  return (
    <section
      ref={outer}
      className={`cn${mode === 'list' ? ' cn--list' : ''}`}
      id="constelacion"
      aria-labelledby="cn-title"
    >
      <div ref={sticky} className="cn__sticky">
        <header className="cn__head">
          <p className="eyebrow dot-label muted">
            <b style={{ color: 'var(--copper)', fontWeight: 400 }}>03</b> Constelación
          </p>
          <h2 id="cn-title">
            Mi trayectoria
            <br />
            <em>en red.</em>
          </h2>
          <p className="muted cn__lede">
            Cada experiencia y cada proyecto es una rama; al entrar en ella se despliegan sus
            responsabilidades, habilidades y aprendizajes.
          </p>
        </header>

        {/* El lienzo nunca se desmonta al cambiar de modo (drei <Html> falla al retirarse del DOM): se oculta y se pausa. */}
        {webgl && (
          <div
            className="cn__stage"
            hidden={mode !== '3d'}
            role="group"
            aria-label="Constelación 3D interactiva. Hay una vista de lista equivalente."
          >
            <Boundary fallback={<ListFallback onList={() => setMode('list')} />}>
              {loaded && (
                <Suspense fallback={<p className="cn__loading muted">Cargando escena…</p>}>
                  <Constellation
                    stages={stages}
                    progressRef={progressRef}
                    focus={focus}
                    onFocus={setFocus}
                    zoom={zoom}
                    active={onScreen && mode === '3d'}
                    coarse={coarse}
                    reduced={reduced}
                  />
                </Suspense>
              )}
            </Boundary>
          </div>
        )}

        {mode === 'list' && (
          <div className="cn__list">
            <Tree onOpenStage={onOpenStage} />
          </div>
        )}

        <div className="cn__controls">
          {webgl && (
            <button className="pill" onClick={() => setMode(mode === '3d' ? 'list' : '3d')}>
              {mode === '3d' ? 'Ver como lista' : 'Ver en 3D'}
            </button>
          )}
          {mode === '3d' && (
            <>
              <button className="pill" onClick={back} disabled={!focus.stage}>
                ← {focus.item ? 'A la categoría' : focus.category ? 'A la experiencia' : 'Volver'}
              </button>
              <button className="pill" onClick={() => setFocus(NO_FOCUS)} disabled={!focus.stage}>
                Vista global
              </button>
              <span className="cn__zoom" role="group" aria-label="Zoom">
                <button
                  className="pill cn__round"
                  onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
                  aria-label="Acercar"
                >
                  +
                </button>
                <button
                  className="pill cn__round"
                  onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.2).toFixed(1)))}
                  aria-label="Alejar"
                >
                  −
                </button>
              </span>
            </>
          )}
        </div>

        {mode === '3d' && (
          <nav className="cn__chips" aria-label="Elegir experiencia">
            {stages.map((s) => (
              <button
                key={s.id}
                className="pill cn__chip"
                aria-pressed={focus.stage === s.id}
                onClick={() => goStage(s)}
              >
                {s.company}
              </button>
            ))}
          </nav>
        )}

        {mode === '3d' && stage && (
          <aside className="cn-ficha" aria-live="polite">
            <header className="cn-ficha__top">
              <nav className="cn-ficha__crumbs eyebrow" aria-label="Ubicación">
                <button onClick={() => setFocus(NO_FOCUS)}>Global</button>
                <span aria-hidden="true">/</span>
                <button onClick={() => goStage(stage)} aria-current={!cat}>
                  {stage.company}
                </button>
                {cat && (
                  <>
                    <span aria-hidden="true">/</span>
                    <button onClick={() => goCat(stage, cat)} aria-current={!item}>
                      {cat.title}
                    </button>
                  </>
                )}
              </nav>
              <button
                className="cn-ficha__x"
                onClick={back}
                aria-label="Cerrar ficha y subir un nivel"
              >
                ×
              </button>
            </header>

            {!cat && (
              <>
                <p className="eyebrow cn-ficha__kind">
                  {KIND[stage.kind]} · {stage.period}
                </p>
                <h3>{stage.kind === 'project' ? stage.company : stage.role}</h3>
                <p className="cn-ficha__company">
                  {stage.kind === 'project' ? stage.role : stage.company}
                  {stage.place ? ` · ${stage.place}` : ''}
                </p>
                <p className="cn-ficha__sum">{stage.summary}</p>
                <p className="eyebrow muted">Explora esta rama</p>
                <ul className="cn-ficha__rows">
                  {stage.categories.map((c) => (
                    <li key={c.id}>
                      <button onClick={() => goCat(stage, c)}>
                        <span>{c.title}</span>
                        <span className="cn-ficha__n">{c.items.length}</span>
                        <Chevron />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="pill pill--solid cn-ficha__cta"
                  onClick={(e) => onOpenStage(stage, e.currentTarget.getBoundingClientRect())}
                >
                  Abrir ficha completa
                  <Chevron />
                </button>
              </>
            )}
            {cat && !item && (
              <>
                <p className="eyebrow cn-ficha__kind">Categoría</p>
                <h3>{cat.title}</h3>
                <p className="cn-ficha__company">
                  {stage.role} · {stage.company}
                </p>
                <ul className="cn-ficha__rows">
                  {cat.items.map((i) => (
                    <li key={i.id}>
                      <button onClick={() => goItem(stage, cat, i)}>
                        <span>
                          {i.label}
                          {i.provisional && <span className="dlg__tag">Por validar</span>}
                        </span>
                        <Chevron />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cat && item && (
              <>
                <p className="eyebrow cn-ficha__kind">{cat.title}</p>
                <h3>{item.label}</h3>
                <p className="cn-ficha__company">
                  {stage.role} · {stage.company}
                </p>
                <p className="cn-ficha__sum">
                  {item.detail ?? 'Dato tomado directamente del currículum.'}
                </p>
                {item.provisional && (
                  <p className="cn-ficha__warn">
                    Contenido provisional: no figura en el CV y está pendiente de validación.
                  </p>
                )}
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  )
}

function ListFallback({ onList }: { onList: () => void }) {
  useEffect(onList, [onList])
  return null
}

const KIND: Record<Stage['kind'], string> = {
  work: 'Experiencia',
  education: 'Formación',
  volunteer: 'Voluntariado',
  project: 'Proyecto',
}

const Chevron = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 5l7 7-7 7" />
  </svg>
)

/** Modo alternativo accesible: la misma jerarquía en tarjetas desplegables, navegable con teclado y lector de pantalla. */
function Tree({ onOpenStage }: { onOpenStage: (s: Stage, rect: DOMRect | null) => void }) {
  return (
    <ul className="tree" aria-label="Jerarquía profesional">
      {stages.map((s) => (
        <li key={s.id}>
          <details className="tree__stage">
            <summary>
              <span className="tree__co">{s.company}</span>
              <span className="tree__role">{s.role}</span>
              <span className="tree__period">{s.period}</span>
              <Chevron />
            </summary>
            <div className="tree__panel">
              <p className="muted tree__sum">{s.summary}</p>
              <div className="tree__cats">
                {s.categories.map((c) => (
                  <section key={c.id} className="tree__cat">
                    <h4>
                      {c.title} <span>{c.items.length}</span>
                    </h4>
                    <ul>
                      {c.items.map((i) => (
                        <li key={i.id}>
                          {i.label}
                          {i.provisional && <span className="dlg__tag">Por validar</span>}
                          {i.detail && <small className="muted">{i.detail}</small>}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <button
                className="pill"
                onClick={(e) => onOpenStage(s, e.currentTarget.getBoundingClientRect())}
              >
                Abrir ficha completa
              </button>
            </div>
          </details>
        </li>
      ))}
    </ul>
  )
}
