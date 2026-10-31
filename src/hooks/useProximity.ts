import { useEffect } from 'react'

/** La tarjeta `.scene` más cercana al cursor (≤ 280px) se ilumina; sólo con puntero fino. */
export function useProximity() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let best: HTMLElement | null = null
        let bestD = 280
        document.querySelectorAll<HTMLElement>('.scene').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.bottom < 0 || r.top > innerHeight) return
          const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right)
          const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom)
          const d = Math.hypot(dx, dy)
          if (d < bestD) {
            bestD = d
            best = el
          }
          el.removeAttribute('data-near')
        })
        const el = best as HTMLElement | null
        if (el) {
          const r = el.getBoundingClientRect()
          el.setAttribute('data-near', '')
          el.style.setProperty('--lx', `${e.clientX - r.left}px`)
          el.style.setProperty('--ly', `${e.clientY - r.top}px`)
        }
      })
    }
    window.addEventListener('mousemove', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', move)
    }
  }, [])
}
