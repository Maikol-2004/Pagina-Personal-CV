import { useEffect, useRef } from 'react'
import { makeRng } from '../lib/rng'

/**
 * Placa de etapa/proyecto: lienzo animado con 7 diseños distintos (esfera con anillo, ondas, campo de puntos,
 * olas, red, ecualizador y radar). Todos reaccionan al cursor del elemento que los contiene y siguen
 * animándose solos; en táctil sólo se mueven solos. Sólo se dibuja mientras está en pantalla y `live`.
 */
export const ART_VARIANTS = 7

type Rgb = [number, number, number]
const hexToRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

interface Frame {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  t: number
  px: number
  py: number
  over: number
  rgb: Rgb
  a: (alpha: number) => string
}

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

const sphere = ({ ctx, W, H, t, px, py, over, rgb, a }: Frame) => {
  const cx = W * 0.72 - (px - 0.5) * 36
  const cy = H * 0.4 - (py - 0.5) * 26
  const R = Math.min(W, H) * (0.24 + over * 0.02)
  const rot = t * 0.55 + (px - 0.5) * 1.1
  const rx = R * 1.75
  const ry = R * (0.5 + (py - 0.5) * 0.25)
  const ring = (front: boolean, alpha: number, w: number) => {
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, rot, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
    ctx.strokeStyle = a(alpha)
    ctx.lineWidth = w
    ctx.stroke()
  }
  ring(false, 0.35, 1)
  const sat = (back: boolean) => {
    const th = t * 1.3
    const lx = Math.cos(th) * rx
    const ly = Math.sin(th) * ry
    if (Math.sin(th) < 0 !== back) return
    ctx.beginPath()
    ctx.arc(
      cx + lx * Math.cos(rot) - ly * Math.sin(rot),
      cy + lx * Math.sin(rot) + ly * Math.cos(rot),
      3.2,
      0,
      6.283,
    )
    ctx.fillStyle = a(0.95)
    ctx.fill()
  }
  sat(true)
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R)
  g.addColorStop(0, '#f4d2a8')
  g.addColorStop(0.3, a(1))
  g.addColorStop(0.7, '#72472c')
  g.addColorStop(1, '#241811')
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, 6.283)
  ctx.fillStyle = g
  ctx.fill()
  ring(true, 0.9, 2.4)
  sat(false)
  void rgb
}

const ripples = ({ ctx, W, H, t, px, py, over, a }: Frame) => {
  const cx = W * 0.7 + (px - 0.5) * 60
  const cy = H * 0.42 + (py - 0.5) * 36
  const maxR = Math.max(W, H) * 0.7
  for (let k = 0; k < 5; k++) {
    const ph = (t * (0.28 + over * 0.2) + k / 5) % 1
    ctx.beginPath()
    ctx.arc(cx, cy, ph * maxR, 0, 6.283)
    ctx.strokeStyle = a((1 - ph) * 0.6)
    ctx.lineWidth = 1.4
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, 6 + over * 4 + Math.sin(t * 3) * 1.5, 0, 6.283)
  ctx.fillStyle = a(1)
  ctx.fill()
}

const dots = ({ ctx, W, H, t, px, py, over, a }: Frame) => {
  const s = 24
  for (let y = s / 2; y < H; y += s) {
    for (let x = s / 2; x < W; x += s) {
      const d = Math.hypot(x - px * W, y - py * H)
      const wave = Math.sin(d * 0.028 - t * 2.2) * 0.5 + 0.5
      const near = Math.max(0, 1 - d / 150) * over
      ctx.beginPath()
      ctx.arc(x, y, 1 + wave * 1.5 + near * 3.2, 0, 6.283)
      ctx.fillStyle = a(0.18 + wave * 0.4 + near * 0.5)
      ctx.fill()
    }
  }
}

const waves = ({ ctx, W, H, t, px, py, over, a }: Frame) => {
  for (let i = 0; i < 7; i++) {
    const y0 = H * (0.2 + i * 0.1)
    ctx.beginPath()
    for (let x = 0; x <= W; x += 6) {
      const bump =
        Math.exp(-Math.pow((x - px * W) / 70, 2)) *
        26 *
        over *
        (1 - Math.min(1, Math.abs(y0 / H - py) * 2.2))
      const y =
        y0 +
        Math.sin(x * 0.012 + t * 0.9 + i * 0.7) * 11 +
        Math.sin(x * 0.027 - t * 0.6 + i) * 5 -
        bump
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = a(0.2 + (i / 7) * 0.55)
    ctx.lineWidth = 1.3
    ctx.stroke()
  }
}

const network = (f: Frame, nodes: Node[]) => {
  const { ctx, W, H, px, py, over, a } = f
  const mx = px * W
  const my = py * H
  for (const n of nodes) {
    n.x += n.vx
    n.y += n.vy
    if (n.x < 0 || n.x > W) n.vx *= -1
    if (n.y < 0 || n.y > H) n.vy *= -1
    const d = Math.hypot(n.x - mx, n.y - my)
    if (over > 0.1 && d < 110) {
      n.x += ((n.x - mx) / d) * 0.9 * over
      n.y += ((n.y - my) / d) * 0.9 * over
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
      if (d < 100) {
        ctx.beginPath()
        ctx.moveTo(nodes[i].x, nodes[i].y)
        ctx.lineTo(nodes[j].x, nodes[j].y)
        ctx.strokeStyle = a((1 - d / 100) * 0.5)
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    const dm = Math.hypot(nodes[i].x - mx, nodes[i].y - my)
    if (over > 0.1 && dm < 130) {
      ctx.beginPath()
      ctx.moveTo(nodes[i].x, nodes[i].y)
      ctx.lineTo(mx, my)
      ctx.strokeStyle = a((1 - dm / 130) * 0.9 * over)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(nodes[i].x, nodes[i].y, 2.2, 0, 6.283)
    ctx.fillStyle = a(0.95)
    ctx.fill()
  }
}

const bars = ({ ctx, W, H, t, px, over, a }: Frame) => {
  const w = 12
  for (let i = 0, x = 6; x < W; i++, x += w + 4) {
    const pulse = (Math.sin(i * 0.45 + t * 1.7) * 0.5 + 0.5) * H * 0.4
    const lift = Math.max(0, 1 - Math.abs(x - px * W) / 90) * H * 0.32 * over
    const h = H * 0.12 + pulse + lift
    ctx.fillStyle = a(0.25 + (h / H) * 0.5)
    ctx.beginPath()
    ctx.roundRect(x, H - h, w, h, 3)
    ctx.fill()
  }
}

const radar = ({ ctx, W, H, t, px, py, over, a }: Frame) => {
  const cx = W * 0.7 + (px - 0.5) * 30
  const cy = H * 0.42 + (py - 0.5) * 20
  const R = Math.min(W, H) * 0.5
  for (let k = 0; k < 4; k++) {
    const r = R * (0.35 + k * 0.22)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 6.283)
    ctx.strokeStyle = a(0.15)
    ctx.lineWidth = 1
    ctx.stroke()
    const rot = t * (0.4 + k * 0.25) * (k % 2 ? -1 : 1) * (1 + over * 0.8) + (px - 0.5)
    ctx.beginPath()
    ctx.arc(cx, cy, r, rot, rot + 1.3)
    ctx.strokeStyle = a(0.85)
    ctx.lineWidth = 2
    ctx.stroke()
  }
  const sweep = t * 0.9
  for (let i = 0; i < 14; i++) {
    const ang = sweep - i * 0.045
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R)
    ctx.strokeStyle = a((1 - i / 14) * 0.35)
    ctx.lineWidth = 2
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, 6.283)
  ctx.fillStyle = a(1)
  ctx.fill()
}

export function StageArt({
  label,
  tone,
  variant = 0,
  live = true,
  className = '',
}: {
  label: string
  tone: string
  variant?: number
  live?: boolean
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const liveRef = useRef(live)
  liveRef.current = live

  useEffect(() => {
    const el = wrap.current!
    const canvas = cv.current!
    const ctx = canvas.getContext('2d')!
    const rgb = hexToRgb(tone)
    const a = (al: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${al})`
    const v = ((variant % ART_VARIANTS) + ART_VARIANTS) % ART_VARIANTS
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0
    let H = 0
    let dpr = 1
    const nodes: Node[] = []
    const resize = () => {
      const r = el.getBoundingClientRect()
      // offsetWidth/Height ignoran las transformaciones 3D de las tarjetas.
      W = el.offsetWidth || r.width
      H = el.offsetHeight || r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      if (v === 4 && nodes.length === 0) {
        const rng = makeRng(`net-${label}`)
        for (let i = 0; i < 26; i++)
          nodes.push({
            x: rng.range(0, W),
            y: rng.range(0, H),
            vx: rng.signed() * 0.35,
            vy: rng.signed() * 0.35,
          })
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, over: 0, tover: 0 }
    const host = el.closest<HTMLElement>('.tl__tilt, .dlg__art, .pcard, .sd__side') ?? el
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      ptr.tx = Math.min(1.1, Math.max(-0.1, (e.clientX - r.left) / r.width))
      ptr.ty = Math.min(1.1, Math.max(-0.1, (e.clientY - r.top) / r.height))
      ptr.tover = 1
    }
    const leave = () => {
      ptr.tx = 0.5
      ptr.ty = 0.5
      ptr.tover = 0
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    let t = Math.random() * 10
    let last = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if ((visible && liveRef.current) || reduced) {
        if (!reduced) t += dt
        ptr.x += (ptr.tx - ptr.x) * 0.1
        ptr.y += (ptr.ty - ptr.y) * 0.1
        ptr.over += (ptr.tover - ptr.over) * 0.08
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)
        const f: Frame = { ctx, W, H, t, px: ptr.x, py: ptr.y, over: ptr.over, rgb, a }
        if (v === 0) sphere(f)
        else if (v === 1) ripples(f)
        else if (v === 2) dots(f)
        else if (v === 3) waves(f)
        else if (v === 4) network(f, nodes)
        else if (v === 5) bars(f)
        else radar(f)
      }
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [tone, variant, label])

  return (
    <div
      ref={wrap}
      className={`art ${className}`}
      style={{ ['--tone' as string]: tone }}
      aria-hidden="true"
    >
      <canvas ref={cv} className="art__canvas" />
      <span className="art__label">{label}</span>
    </div>
  )
}
