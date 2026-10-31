import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Entrada escalonada de cualquier elemento `[data-reveal]`: sube 24px con opacidad al entrar en pantalla.
 * `data-reveal="2"` añade retraso por posición. Respeta prefers-reduced-motion (no hace nada).
 */
export function useRevealAll() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      gsap.set(els, { y: 28, opacity: 0 })
      ScrollTrigger.batch(els, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.08,
            overwrite: true,
          }),
      })
    })
    return () => mm.revert()
  }, [])
}
