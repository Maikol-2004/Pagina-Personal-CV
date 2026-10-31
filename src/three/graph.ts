/**
 * Generador de la "Professional Neural Constellation".
 * Convierte los datos reales (stages) en geometría: nodos jerárquicos + ramificaciones orgánicas.
 * Es una función pura y determinista (sin WebGL) para poder probarla.
 *
 * Jerarquía: núcleo (0) → experiencias (1) → categorías (2) → elementos (3).
 */
import { Color, Vector3 } from 'three'
import type { Category, Item, Stage } from '../data/types'
import { makeRng, type Rng } from '../lib/rng'

export type Vec = [number, number, number]

export interface Buffers {
  /** Pares de vértices (LineSegments). */
  pos: number[]
  grow: number[]
  seed: number[]
}
export interface PointBuffers {
  pos: number[]
  grow: number[]
  seed: number[]
  size: number[]
}
export const emptyLines = (): Buffers => ({ pos: [], grow: [], seed: [] })
export const emptyPoints = (): PointBuffers => ({ pos: [], grow: [], seed: [], size: [] })

export interface Item3 {
  id: string
  item: Item
  pos: Vec
}
export interface Cat2 {
  id: string
  category: Category
  pos: Vec
  lines: Buffers
  points: PointBuffers
  items: Item3[]
  itemLines: Buffers
  itemPoints: PointBuffers
}
export interface Branch {
  id: string
  stage: Stage
  color: Vec
  pos: Vec
  dir: Vec
  lines: Buffers
  points: PointBuffers
  /** Conexiones y ramitas de nivel 2 (visibles al seleccionar la experiencia). */
  categories: Cat2[]
}
export interface Graph {
  branches: Branch[]
  core: { lines: Buffers; points: PointBuffers }
  dust: PointBuffers
  nodes: Record<string, Vec>
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const toVec = (p: Vector3): Vec => [p.x, p.y, p.z]

function randomUnit(rng: Rng): Vector3 {
  const z = rng.signed()
  const t = rng.range(0, Math.PI * 2)
  const r = Math.sqrt(1 - z * z)
  return v(Math.cos(t) * r, z, Math.sin(t) * r)
}

function perpendicular(d: Vector3, rng: Rng): Vector3 {
  const r = randomUnit(rng)
  return r.sub(d.clone().multiplyScalar(r.dot(d))).normalize()
}

function pushSeg(out: Buffers, a: Vector3, b: Vector3, ga: number, gb: number, seed: number) {
  out.pos.push(a.x, a.y, a.z, b.x, b.y, b.z)
  out.grow.push(ga, gb)
  out.seed.push(seed, seed)
}
function pushPoint(out: PointBuffers, p: Vector3, g: number, seed: number, size: number) {
  out.pos.push(p.x, p.y, p.z)
  out.grow.push(g)
  out.seed.push(seed)
  out.size.push(size)
}

interface TwigOptions {
  curl: number
  branchProb: number
  pointProb: number
  stepLen: number
}

/** Ramita recursiva con curvatura suave: la base del aspecto "neuronal" orgánico. */
function twig(
  lines: Buffers,
  points: PointBuffers,
  start: Vector3,
  dir: Vector3,
  length: number,
  depth: number,
  g0: number,
  span: number,
  rng: Rng,
  o: TwigOptions,
) {
  const steps = Math.max(4, Math.round(length / o.stepLen))
  const stepLen = length / steps
  const pos = start.clone()
  const d = dir.clone().normalize()
  const seed = rng.next()
  for (let s = 0; s < steps; s++) {
    d.add(randomUnit(rng).multiplyScalar(o.curl)).normalize()
    const next = pos.clone().addScaledVector(d, stepLen)
    const ga = g0 + (span * s) / steps
    const gb = g0 + (span * (s + 1)) / steps
    pushSeg(lines, pos, next, Math.min(ga, 1), Math.min(gb, 1), seed)
    if (rng.next() < o.pointProb)
      pushPoint(points, next, Math.min(gb, 1), rng.next(), rng.range(0.5, 1))
    if (depth > 0 && rng.next() < o.branchProb) {
      const child = d
        .clone()
        .addScaledVector(perpendicular(d, rng), rng.range(0.7, 1.3))
        .normalize()
      twig(
        lines,
        points,
        next,
        child,
        length * rng.range(0.4, 0.62),
        depth - 1,
        gb,
        span * 0.7,
        rng,
        o,
      )
    }
    pos.copy(next)
  }
  pushPoint(points, pos, Math.min(g0 + span, 1), rng.next(), rng.range(1, 1.7)) // punta luminosa
}

/** Curva cuadrática con curvatura lateral aleatoria, devuelta como polilínea. */
function curvePoints(a: Vector3, b: Vector3, rng: Rng, bend: number, n = 28): Vector3[] {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const axis = b.clone().sub(a)
  const len = axis.length()
  mid.addScaledVector(perpendicular(axis.clone().normalize(), rng), len * bend * rng.range(0.6, 1))
  const out: Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = a
      .clone()
      .multiplyScalar((1 - t) * (1 - t))
      .addScaledVector(mid, 2 * (1 - t) * t)
      .addScaledVector(b, t * t)
    out.push(p)
  }
  return out
}

function pushPolyline(out: Buffers, pts: Vector3[], g0: number, span: number, seed: number) {
  for (let i = 0; i < pts.length - 1; i++) {
    pushSeg(
      out,
      pts[i],
      pts[i + 1],
      g0 + (span * i) / (pts.length - 1),
      g0 + (span * (i + 1)) / (pts.length - 1),
      seed,
    )
  }
}

/** Dirección en un cono alrededor de `axis`. */
function inCone(axis: Vector3, theta: number, angle: number): Vector3 {
  const a = axis.clone().normalize()
  const helper = Math.abs(a.y) < 0.9 ? v(0, 1, 0) : v(1, 0, 0)
  const u = a.clone().cross(helper).normalize()
  const w = a.clone().cross(u).normalize()
  return a
    .clone()
    .multiplyScalar(Math.cos(theta))
    .addScaledVector(u, Math.sin(theta) * Math.cos(angle))
    .addScaledVector(w, Math.sin(theta) * Math.sin(angle))
}

export function buildGraph(stages: Stage[], quality = 1): Graph {
  const n = stages.length
  const nodes: Record<string, Vec> = { core: [0, 0, 0] }
  const q = Math.max(0.35, Math.min(1, quality))
  const twigOpts: TwigOptions = { curl: 0.28, branchProb: 0.13, pointProb: 0.5, stepLen: 0.13 }

  // ── Núcleo: ramillete denso que nace del centro ─────────────────────────────
  const coreRng = makeRng('core')
  const core = { lines: emptyLines(), points: emptyPoints() }
  const coreTwigs = Math.round(26 * q)
  for (let i = 0; i < coreTwigs; i++) {
    twig(
      core.lines,
      core.points,
      v(0, 0, 0),
      randomUnit(coreRng),
      coreRng.range(1.1, 2.1),
      2,
      0,
      1,
      coreRng,
      twigOpts,
    )
  }

  // ── Polvo ambiental repartido en una corona esférica ────────────────────────
  const dust = emptyPoints()
  const dustRng = makeRng('dust')
  const dustCount = Math.round(520 * q)
  for (let i = 0; i < dustCount; i++) {
    const p = randomUnit(dustRng).multiplyScalar(dustRng.range(2.5, 9.5))
    pushPoint(dust, p, 0, dustRng.next(), dustRng.range(0.4, 1))
  }

  // ── Ramas principales (nivel 1) ─────────────────────────────────────────────
  const branches: Branch[] = stages.map((stage, i) => {
    const rng = makeRng(stage.id)
    // Reparto en espiral de Fibonacci con la latitud acotada → distribución orgánica sin solaparse.
    const y = (1 - ((i + 0.5) / n) * 2) * 0.72
    const r = Math.sqrt(1 - y * y)
    const phi = i * 2.399963 + 0.6
    const dir = v(Math.cos(phi) * r, y, Math.sin(phi) * r)
    const dist = 4.5 + rng.range(-0.3, 0.9)
    const pos = dir.clone().multiplyScalar(dist)
    nodes[stage.id] = toVec(pos)

    const c = new Color(stage.tone)
    const lines = emptyLines()
    const points = emptyPoints()

    // Tronco: dos hebras casi paralelas para dar sensación de fibra.
    for (let strand = 0; strand < 2; strand++) {
      const target = pos.clone().addScaledVector(randomUnit(rng), strand * 0.06)
      const trunk = curvePoints(v(0, 0, 0), target, rng, 0.14, 36)
      pushPolyline(lines, trunk, 0, 0.5, rng.next())
      if (strand === 0) {
        // Ramitas que nacen a lo largo del tronco.
        const twigsAlong = Math.round(11 * q)
        for (let k = 0; k < twigsAlong; k++) {
          const idx = 4 + Math.floor((k / twigsAlong) * (trunk.length - 6))
          const base = trunk[idx]
          const tdir = trunk[idx + 1].clone().sub(trunk[idx]).normalize()
          const out = tdir
            .clone()
            .addScaledVector(perpendicular(tdir, rng), rng.range(0.9, 1.6))
            .normalize()
          twig(
            lines,
            points,
            base,
            out,
            rng.range(1.0, 2.2),
            2,
            (idx / trunk.length) * 0.5,
            0.4,
            rng,
            twigOpts,
          )
        }
      }
    }
    // Penacho alrededor del nodo de la experiencia.
    const crown = Math.round(10 * q)
    for (let k = 0; k < crown; k++) {
      twig(
        lines,
        points,
        pos,
        inCone(dir, rng.range(0.1, 1.9), rng.range(0, 6.28)),
        rng.range(1.0, 2.0),
        3,
        0.5,
        0.5,
        rng,
        twigOpts,
      )
    }

    // ── Nivel 2: categorías ───────────────────────────────────────────────────
    const categories: Cat2[] = stage.categories.map((category, k) => {
      const crng = makeRng(`${stage.id}/${category.id}`)
      const K = stage.categories.length
      const angle = (k / K) * Math.PI * 2 + 0.5
      const cdir = inCone(dir, 1.0, angle)
      const cpos = pos.clone().addScaledVector(cdir, 1.9)
      const catKey = `${stage.id}/${category.id}`
      nodes[catKey] = toVec(cpos)

      const cLines = emptyLines()
      const cPoints = emptyPoints()
      pushPolyline(cLines, curvePoints(pos, cpos, crng, 0.2, 20), 0, 0.6, crng.next())
      for (let t = 0; t < Math.round(5 * q); t++) {
        twig(
          cLines,
          cPoints,
          cpos,
          inCone(cdir, crng.range(0.2, 1.6), crng.range(0, 6.28)),
          crng.range(0.5, 1.0),
          2,
          0.6,
          0.4,
          crng,
          twigOpts,
        )
      }

      // ── Nivel 3: elementos ──────────────────────────────────────────────────
      const m = category.items.length
      const iLines = emptyLines()
      const iPoints = emptyPoints()
      const items: Item3[] = category.items.map((item, j) => {
        const irng = makeRng(`${catKey}/${item.id}`)
        const idir = inCone(cdir, 0.85, (j / m) * Math.PI * 2 + 0.3)
        const ipos = cpos.clone().addScaledVector(idir, 1.05 + irng.range(0, 0.25))
        nodes[`${catKey}/${item.id}`] = toVec(ipos)
        pushPolyline(iLines, curvePoints(cpos, ipos, irng, 0.18, 14), 0, 0.6, irng.next())
        twig(
          iLines,
          iPoints,
          ipos,
          inCone(idir, 0.9, irng.range(0, 6.28)),
          irng.range(0.3, 0.6),
          1,
          0.6,
          0.4,
          irng,
          twigOpts,
        )
        return { id: `${catKey}/${item.id}`, item, pos: toVec(ipos) }
      })

      return {
        id: catKey,
        category,
        pos: toVec(cpos),
        lines: cLines,
        points: cPoints,
        items,
        itemLines: iLines,
        itemPoints: iPoints,
      }
    })

    return {
      id: stage.id,
      stage,
      color: [c.r, c.g, c.b],
      pos: toVec(pos),
      dir: toVec(dir),
      lines,
      points,
      categories,
    }
  })

  return { branches, core, dust, nodes }
}

export function countNodes(g: Graph) {
  let l2 = 0
  let l3 = 0
  g.branches.forEach((b) =>
    b.categories.forEach((c) => {
      l2++
      l3 += c.items.length
    }),
  )
  return { l0: 1, l1: g.branches.length, l2, l3 }
}
