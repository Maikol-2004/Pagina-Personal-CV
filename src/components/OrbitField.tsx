import { useEffect, useRef } from 'react'
import { makeRng } from '../lib/rng'

/**
 * Órbita viva de la portada: dos lienzos (detrás y delante de la esfera) con
 *  - un anillo principal que oscila lentamente,
 *  - partículas que rotan sin parar a distintas velocidades,
 *  - partículas en espiral que se expanden y se desvanecen (el conocimiento "va aumentando"),
 *  - palabras de mi stack que orbitan con profundidad.
 * El scroll acelera la rotación: la velocidad de desplazamiento se suma a la velocidad base.
 */
const TOKENS = [
  'Java',
  'SQL',
  'Python',
  'Git',
  'Firebase',
  'JavaScript',
  'Android',
  'HTML',
  'JavaFX',
  'Linux',
]

interface P {
  th: number
  k: number
  sp: number
  size: number
  ring: 0 | 1
  life?: number
  label?: string
}

export function OrbitField() {
  const back = useRef<HTMLCanvasElement>(null)
  const front = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cb = back.current!
    const cf = front.current!
    const bctx = cb.getContext('2d')!
    const fctx = cf.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rng = makeRng('orbit')
    const parts: P[] = []
    for (let i = 0; i < 56; i++)
      parts.push({
        th: rng.range(0, 6.283),
        k: rng.range(0.9, 1.03),
        sp: rng.range(0.12, 0.26),
        size: rng.range(0.8, 2),
        ring: 0,
      })
    for (let i = 0; i < 38; i++)
      parts.push({
        th: rng.range(0, 6.283),
        k: rng.range(0.72, 1.12),
        sp: -rng.range(0.08, 0.2),
        size: rng.range(0.7, 1.6),
        ring: 1,
      })
    for (let i = 0; i < 26; i++)
      parts.push({
        th: rng.range(0, 6.283),
        k: 0.6,
        sp: rng.range(0.18, 0.34),
        size: rng.range(1, 2.2),
        ring: 0,
        life: rng.next(),
      })
    TOKENS.forEach((label, i) =>
      parts.push({ th: (i / TOKENS.length) * 6.283, k: 1.1, sp: -0.07, size: 1, ring: 1, label }),
    )

    let W = 0 // ancho del lienzo (más ancho que la escultura para que las palabras no se recorten)
    let B = 0 // ancho base de la escultura
    let H = 0
    let dpr = 1
    const resize = () => {
      const r = cb.parentElement!.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      B = r.width
      W = r.width * 1.3
      H = r.height
      for (const c of [cb, cf]) {
        c.width = Math.round(W * dpr)
        c.height = Math.round(H * dpr)
        c.style.width = `${W}px`
        c.style.height = `${H}px`
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cb.parentElement!)
    resize()

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(cb)

    let last = performance.now()
    let t = 0
    let lastY = window.scrollY
    let boost = 0

    const project = (p: P, k: number, tilt: number, flat: number) => {
      const a = B * 0.47
      const x0 = Math.cos(p.th) * a * k
      const y0 = Math.sin(p.th) * a * k * flat
      const cos = Math.cos(tilt)
      const sin = Math.sin(tilt)
      return {
        x: W * 0.5 + x0 * cos - y0 * sin,
        y: H * 0.15 + B * 0.31 + x0 * sin + y0 * cos,
        depth: Math.sin(p.th),
      }
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (visible || reduced) {
        const vy = Math.abs(window.scrollY - lastY) / Math.max(dt, 0.001)
        lastY = window.scrollY
        boost += (Math.min(vy / 500, 6) - boost) * 0.08
        if (!reduced) t += dt
        const speed = 1 + boost
        const tilt0 = (-34 * Math.PI) / 180 + Math.sin(t * 0.25) * 0.1
        const tilt1 = (20 * Math.PI) / 180 - Math.sin(t * 0.18) * 0.12
        for (const c of [bctx, fctx]) {
          c.setTransform(dpr, 0, 0, dpr, 0, 0)
          c.clearRect(0, 0, W, H)
        }
        // Anillo principal: tramo trasero tenue, tramo delantero brillante.
        const seg = 90
        for (let i = 0; i < seg; i++) {
          const th0 = (i / seg) * 6.283
          const th1 = ((i + 1) / seg) * 6.283
          const a = project({ th: th0 } as P, 1, tilt0, 0.4)
          const b = project({ th: th1 } as P, 1, tilt0, 0.4)
          const front = a.depth > 0
          const c = front ? fctx : bctx
          c.beginPath()
          c.moveTo(a.x, a.y)
          c.lineTo(b.x, b.y)
          c.strokeStyle = front
            ? `rgba(230,186,138,${0.35 + a.depth * 0.6})`
            : 'rgba(163,121,78,0.35)'
          c.lineWidth = front ? 1.5 + a.depth * 3.2 : 1
          c.stroke()
        }
        // Anillo exterior fino
        for (let i = 0; i < seg; i++) {
          const a = project({ th: (i / seg) * 6.283 } as P, 1.1, tilt1, 0.3)
          const b = project({ th: ((i + 1) / seg) * 6.283 } as P, 1.1, tilt1, 0.3)
          const c = a.depth > 0 ? fctx : bctx
          c.beginPath()
          c.moveTo(a.x, a.y)
          c.lineTo(b.x, b.y)
          c.strokeStyle = `rgba(210,162,126,${a.depth > 0 ? 0.28 : 0.12})`
          c.lineWidth = 1
          c.stroke()
        }
        for (const p of parts) {
          if (!reduced) p.th += p.sp * dt * speed
          let k = p.k
          let alpha = 1
          if (p.life !== undefined) {
            // Espiral que se expande: nace cerca de la esfera, crece y se desvanece.
            if (!reduced) p.life += dt * 0.09 * (0.6 + boost * 0.3)
            if (p.life > 1) p.life -= 1
            k = 0.62 + p.life * 0.62
            alpha = Math.sin(p.life * Math.PI)
          }
          const tilt = p.ring === 0 ? tilt0 : tilt1
          const pos = project(p, k, tilt, p.ring === 0 ? 0.4 : 0.3)
          const c = pos.depth > 0 ? fctx : bctx
          const d = 0.55 + 0.45 * pos.depth
          if (p.label) {
            c.font = `${11 + pos.depth * 2}px 'MG Sans', sans-serif`
            c.fillStyle = `rgba(246,239,228,${0.35 + 0.5 * (pos.depth * 0.5 + 0.5)})`
            c.fillText(p.label, pos.x - 14, pos.y)
            c.beginPath()
            c.arc(pos.x - 20, pos.y - 4, 1.8, 0, 6.283)
            c.fillStyle = 'rgba(210,162,126,0.9)'
            c.fill()
          } else {
            c.beginPath()
            c.arc(pos.x, pos.y, p.size * d, 0, 6.283)
            c.fillStyle = `rgba(232,190,146,${alpha * (0.35 + 0.55 * (pos.depth * 0.5 + 0.5))})`
            c.fill()
          }
        }
      }
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    let raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <>
      <canvas ref={back} className="orbit-canvas orbit-canvas--back" />
      <canvas ref={front} className="orbit-canvas orbit-canvas--front" />
    </>
  )
}
