import { useLayoutEffect, useRef, useState } from 'react'
import { timelineStages } from '../data/profile'
import type { Stage } from '../data/types'
import { StageArt } from '../components/StageArt'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useIsMobile, useReducedMotion } from '../hooks/useMedia'

interface Props {
  onOpen: (s: Stage, rect: DOMRect | null) => void
}

const n = timelineStages.length
const vw = () => window.innerWidth / 100

/**
 * LÍNEA TEMPORAL PROFESIONAL (sección protagonista)
 * Un único tween "f" (índice continuo 0 → n-1) enlazado al scroll con `scrub`. Cada tarjeta se coloca
 * en función de su distancia d = i - f al foco:
 *   d = 0 → protagonista (centro, escala 1)
 *   d > 0 → próximas: más profundas (z negativo), más pequeñas y desplazadas hacia donde llega el scroll
 *   d < 0 → anteriores: se alejan, reducen escala y pierden protagonismo
 * En escritorio el eje es horizontal; en móvil vertical. Con movimiento reducido se muestra como lista.
 */
export function Timeline({ onOpen }: Props) {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()
  const activeRef = useRef(0)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const proxy = { f: 0 }
      const place = () => {
        const f = proxy.f
        const stageH = pin.current?.clientHeight ?? window.innerHeight
        cards.current.forEach((el, i) => {
          if (!el) return
          const d = i - f
          const ad = Math.abs(d)
          if (mobile) {
            gsap.set(el, {
              y: d >= 0 ? d * stageH * 0.62 : d * stageH * 0.3,
              z: -ad * 140,
              scale: d >= 0 ? 1 - d * 0.07 : 1 + d * 0.12,
              rotateX: d >= 0 ? -d * 6 : 0,
              opacity:
                d >= 0
                  ? Math.max(0, 1 - Math.max(0, d - 0.12) * 0.6)
                  : Math.max(0, 1 + Math.min(0, d + 0.12) * 1.1),
              xPercent: -50,
              yPercent: -50,
            })
          } else {
            gsap.set(el, {
              x: 12 * vw() + (d >= 0 ? d * 19 * vw() : d * 5 * vw()),
              z: d >= 0 ? -ad * 260 : -ad * 340,
              rotateY: d >= 0 ? -d * 9 : -d * 12,
              scale: d >= 0 ? 1 - d * 0.1 : 1 + d * 0.14,
              opacity:
                d >= 0
                  ? Math.max(0, 1 - Math.max(0, d - 0.12) * 0.5)
                  : Math.max(0, 1 + Math.min(0, d + 0.12) * 1.1),
              xPercent: -50,
              yPercent: -50,
            })
          }
          el.style.zIndex = String(100 - Math.round(ad * 10))
          el.style.pointerEvents = ad < 0.5 ? 'auto' : 'none'
          el.style.visibility = ad > 1.8 ? 'hidden' : 'visible'
          // El texto sólo aparece cuando la tarjeta llega al foco: de las demás asoma únicamente la ilustración.
          const body = el.querySelector<HTMLElement>('.tl__body')
          if (body) {
            body.style.opacity = String(Math.min(1, Math.max(0, 1 - (ad - 0.2) * 3)))
            body.style.visibility = ad > 0.55 ? 'hidden' : 'visible'
          }
        })
        if (fill.current) gsap.set(fill.current, { scaleX: f / (n - 1) })
        const a = Math.round(f)
        if (a !== activeRef.current) {
          activeRef.current = a
          setActive(a)
        }
      }
      place()
      gsap.to(proxy, {
        f: n - 1,
        ease: 'none',
        onUpdate: place,
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (n - 1) * 0.7}`,
          pin: pin.current,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, root)
    return () => ctx.revert()
  }, [mobile, reduced])

  // Saltar a una etapa desde la regla inferior: calcula el scroll exacto de ese punto.
  const goTo = (i: number) => {
    const st = ScrollTrigger.getAll().find((s) => s.trigger === root.current)
    if (!st) return
    const y = st.start + (st.end - st.start) * (i / (n - 1))
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
  }

  const cur = timelineStages[active]
  return (
    <section
      ref={root}
      className={`tl ${reduced ? 'tl--static' : ''}`}
      id="trayectoria"
      aria-labelledby="tl-title"
    >
      <div ref={pin} className="tl__pin">
        <div className="tl__side">
          <h2 id="tl-title">Mi trayectoria</h2>
          <p className="tl__year" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Etapa actual: </span>
            {cur.start}
          </p>
        </div>

        <ol className="tl__stage">
          {timelineStages.map((s, i) => (
            <li
              key={s.id}
              ref={(el) => {
                cards.current[i] = el
              }}
              className="tl__card"
              data-active={i === active}
              style={{ ['--tone' as string]: s.tone }}
            >
              <TiltCard stage={s} onOpen={onOpen} />
            </li>
          ))}
        </ol>

        <div className="tl__rail" role="group" aria-label="Etapas">
          <span className="tl__track" aria-hidden="true">
            <span ref={fill} className="tl__fill" />
          </span>
          {timelineStages.map((s, i) => (
            <button
              key={s.id}
              className="tl__tick"
              data-on={i <= active}
              aria-current={i === active}
              onClick={() => goTo(i)}
            >
              <span className="tl__dot" aria-hidden="true" />
              <span className="tl__tickyear">{s.start}</span>
              <span className="sr-only"> {s.role}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Tarjeta con tres estados: reposo → hover (se acerca a cámara, inclinación 3D, vista previa) → click (diálogo).
 * En táctil no hay hover: la vista previa es visible siempre y el toque abre el detalle.
 */
function TiltCard({ stage, onOpen }: { stage: Stage; onOpen: Props['onOpen'] }) {
  const ref = useRef<HTMLDivElement>(null)
  const preview = stage.categories[0]?.items.slice(0, 3) ?? []

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, {
      rotateY: px * 12,
      rotateX: -py * 10,
      z: 70,
      scale: 1.04,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  const onLeave = () => {
    if (ref.current)
      gsap.to(ref.current, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        scale: 1,
        duration: 0.8,
        ease: 'expo.out',
        overwrite: 'auto',
      })
  }
  const open = (e: React.SyntheticEvent<HTMLElement>) => {
    const card = (e.currentTarget.closest('.tl__tilt') as HTMLElement) ?? e.currentTarget
    onOpen(stage, card.getBoundingClientRect())
  }

  return (
    <div ref={ref} className="tl__tilt" onMouseMove={onMove} onMouseLeave={onLeave} onClick={open}>
      <StageArt className="tl__art" seed={stage.id} tone={stage.tone} />
      <div className="tl__body">
        <h3>{stage.role}</h3>
        <p className="tl__company">
          {stage.company}
          {stage.place ? ` · ${stage.place}` : ''} · {stage.period}
        </p>
        <p className="tl__sum">{stage.summary}</p>
        <ul className="tl__preview" aria-label="Vista previa">
          {preview.map((p) => (
            <li key={p.id}>{p.label}</li>
          ))}
        </ul>
        <button
          className="btn tl__open"
          onClick={(e) => {
            e.stopPropagation()
            open(e)
          }}
          aria-label={`Abrir detalle: ${stage.role}, ${stage.company}`}
        >
          Abrir detalle
        </button>
      </div>
    </div>
  )
}
