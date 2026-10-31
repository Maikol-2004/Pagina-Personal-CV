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
import { stages } from '../data/profile'
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
    <section ref={outer} className="cn" id="constelacion" aria-labelledby="cn-title">
      <div ref={sticky} className="cn__sticky">
        <header className="cn__head">
          <h2 id="cn-title">Constelación profesional</h2>
          <p className="muted cn__lede">
            Mi trayectoria como una red: cada experiencia es una rama; al entrar en ella se
            despliegan sus responsabilidades, habilidades y aprendizajes.
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
            <button
              className="btn btn--quiet"
              onClick={() => setMode(mode === '3d' ? 'list' : '3d')}
            >
              {mode === '3d' ? 'Ver como lista' : 'Ver en 3D'}
            </button>
          )}
          {mode === '3d' && (
            <>
              <button className="btn btn--quiet" onClick={back} disabled={!focus.stage}>
                ← {focus.item ? 'Categoría' : focus.category ? 'Experiencia' : 'Vista global'}
              </button>
              <button
                className="btn btn--quiet"
                onClick={() => setFocus(NO_FOCUS)}
                disabled={!focus.stage}
              >
                Vista global
              </button>
              <span className="cn__zoom" role="group" aria-label="Zoom">
                <button
                  className="btn btn--quiet cn__round"
                  onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
                  aria-label="Acercar"
                >
                  +
                </button>
                <button
                  className="btn btn--quiet cn__round"
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
                className="chip cn__chip"
                aria-pressed={focus.stage === s.id}
                onClick={() => goStage(s)}
              >
                {s.company}
              </button>
            ))}
          </nav>
        )}

        {mode === '3d' && stage && (
          <aside
            className="cn-ficha"
            aria-live="polite"
            style={{ ['--tone' as string]: stage.tone }}
          >
            <button
              className="cn-ficha__x"
              onClick={back}
              aria-label="Cerrar ficha y subir un nivel"
            >
              ×
            </button>
            {!cat && (
              <>
                <h3>{stage.role}</h3>
                <p className="muted">
                  {stage.company} · {stage.period}
                </p>
                <p>{stage.summary}</p>
                <ul className="cn-ficha__list">
                  {stage.categories.map((c) => (
                    <li key={c.id}>
                      <button onClick={() => goCat(stage, c)}>
                        {c.title} <span className="muted">({c.items.length})</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="btn"
                  onClick={(e) => onOpenStage(stage, e.currentTarget.getBoundingClientRect())}
                >
                  Abrir ficha completa
                </button>
              </>
            )}
            {cat && !item && (
              <>
                <p className="muted">
                  {stage.company} · {stage.role}
                </p>
                <h3>{cat.title}</h3>
                <ul className="cn-ficha__list">
                  {cat.items.map((i) => (
                    <li key={i.id}>
                      <button onClick={() => goItem(stage, cat, i)}>
                        {i.label}
                        {i.provisional && <span className="dlg__tag"> Por validar</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cat && item && (
              <>
                <p className="muted">
                  {stage.company} · {cat.title}
                </p>
                <h3>{item.label}</h3>
                <p>{item.detail ?? 'Dato tomado directamente del currículum.'}</p>
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

/** Modo alternativo accesible: la misma jerarquía como árbol navegable con teclado y lector de pantalla. */
function Tree({ onOpenStage }: { onOpenStage: (s: Stage, rect: DOMRect | null) => void }) {
  return (
    <ul className="tree" aria-label="Jerarquía profesional">
      {stages.map((s) => (
        <li key={s.id}>
          <details>
            <summary>
              <strong>{s.company}</strong> — {s.role} <span className="muted">({s.period})</span>
            </summary>
            <p className="muted">{s.summary}</p>
            <ul>
              {s.categories.map((c) => (
                <li key={c.id}>
                  <details>
                    <summary>{c.title}</summary>
                    <ul>
                      {c.items.map((i) => (
                        <li key={i.id}>
                          {i.label}
                          {i.provisional && <span className="dlg__tag"> Por validar</span>}
                          {i.detail && <small className="muted"> — {i.detail}</small>}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
            <button
              className="btn btn--quiet"
              onClick={(e) => onOpenStage(s, e.currentTarget.getBoundingClientRect())}
            >
              Abrir ficha completa
            </button>
          </details>
        </li>
      ))}
    </ul>
  )
}
