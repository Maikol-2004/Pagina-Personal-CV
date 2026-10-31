import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../lib/gsap'

interface Props {
  /** Rectángulo del elemento pulsado: el diálogo "nace" desde él y regresa a él. */
  origin: DOMRect | null
  tone: string
  label: string
  onClose: () => void
  children: ReactNode
}

const insetFrom = (r: DOMRect | null) => {
  if (!r) return 'inset(50% 50% 50% 50% round 12px)'
  const { innerWidth: w, innerHeight: h } = window
  return `inset(${Math.max(r.top, 0)}px ${Math.max(w - r.right, 0)}px ${Math.max(h - r.bottom, 0)}px ${Math.max(r.left, 0)}px round 12px)`
}

/**
 * Vista detallada cinematográfica: el panel se abre con un clip-path desde la tarjeta origen
 * (sin saltos), el contenido entra escalonado y al cerrar vuelve exactamente a su sitio.
 * El scroll de la página queda congelado en su posición, así que no se pierde el punto de la línea temporal.
 */
export function CinematicDialog({ origin, tone, label, onClose, children }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const opener = useRef<Element | null>(
    typeof document !== 'undefined' ? document.activeElement : null,
  )

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.style.overflow = 'hidden'
    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(panel.current, { clipPath: 'inset(0px)' })
        return
      }
      const tl = gsap.timeline()
      tl.fromTo('.dlg__veil', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo(
          panel.current,
          { clipPath: insetFrom(origin) },
          { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.05, ease: 'expo.inOut' },
          0,
        )
        .fromTo(
          '.dlg__in',
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 },
          0.55,
        )
    }, root)
    return () => {
      ctx.revert()
      document.documentElement.style.overflow = ''
    }
  }, [origin])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const done = () => {
      onClose()
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true })
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
    const tl = gsap.timeline({ onComplete: done })
    tl.to('.dlg__in', { y: 16, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.02 }, 0)
      .to(panel.current, { clipPath: insetFrom(origin), duration: 0.85, ease: 'expo.inOut' }, 0.12)
      .to('.dlg__veil', { opacity: 0, duration: 0.5 }, 0.4)
  }, [onClose, origin])

  useEffect(() => {
    root.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && root.current) {
        // Trampa de foco mínima: el diálogo es modal.
        const f = root.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div
      ref={root}
      className="dlg"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{ ['--tone' as string]: tone }}
    >
      <div className="dlg__veil" onClick={close} />
      <div ref={panel} className="dlg__panel">
        <button className="dlg__close" onClick={close} data-autofocus aria-label="Cerrar y volver">
          <span aria-hidden="true">←</span> Volver
        </button>
        <div className="dlg__scroll" data-lenis-prevent>
          {children}
        </div>
      </div>
    </div>
  )
}
