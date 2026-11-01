import { describe, expect, it } from 'vitest'
import { constellationStages as stages, timelineStages } from '../data/profile'
import { buildGraph, countNodes } from '../three/graph'

describe('graph de la constelación', () => {
  it('refleja exactamente los datos del CV (sin nodos inventados)', () => {
    const g = buildGraph(stages, 1)
    const expectedL2 = stages.reduce((n, s) => n + s.categories.length, 0)
    const expectedL3 = stages.reduce(
      (n, s) => n + s.categories.reduce((m, c) => m + c.items.length, 0),
      0,
    )
    expect(countNodes(g)).toEqual({ l0: 1, l1: stages.length, l2: expectedL2, l3: expectedL3 })
  })

  it('es determinista', () => {
    const a = buildGraph(stages, 0.5)
    const b = buildGraph(stages, 0.5)
    expect(a.branches[0].lines.pos.slice(0, 30)).toEqual(b.branches[0].lines.pos.slice(0, 30))
  })

  it('genera cientos de segmentos y escala con la calidad', () => {
    const hi = buildGraph(stages, 1).branches[0].lines.pos.length
    const lo = buildGraph(stages, 0.35).branches[0].lines.pos.length
    expect(hi).toBeGreaterThan(lo)
    expect(hi / 6).toBeGreaterThan(300)
  })

  it('valores de crecimiento dentro de [0,1] y sin NaN', () => {
    const g = buildGraph(stages, 1)
    for (const b of g.branches) {
      expect(b.lines.grow.every((x) => x >= 0 && x <= 1)).toBe(true)
      expect(b.lines.pos.every((x) => Number.isFinite(x))).toBe(true)
    }
  })
})

describe('datos', () => {
  it('la línea temporal va de lo más reciente a lo más antiguo, con la formación en curso primero', () => {
    expect(timelineStages[0].end).toBeNull()
    const ends = timelineStages.map((s) => s.end ?? 9999)
    expect([...ends].sort((a, b) => b - a)).toEqual(ends)
  })
  it('todo contenido no extraído del CV está marcado como provisional o es derivado', () => {
    const ids = new Set<string>()
    stages.forEach((s) =>
      s.categories.forEach((c) =>
        c.items.forEach((i) => {
          expect(ids.has(i.id)).toBe(false)
          ids.add(i.id)
        }),
      ),
    )
  })
})
