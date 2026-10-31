import { BufferAttribute, BufferGeometry } from 'three'
import type { Buffers, PointBuffers } from './graph'

const attr = (a: number[], n: number) => new BufferAttribute(new Float32Array(a), n)

export function linesGeometry(b: Buffers): BufferGeometry {
  const g = new BufferGeometry()
  g.setAttribute('position', attr(b.pos, 3))
  g.setAttribute('aGrow', attr(b.grow, 1))
  g.setAttribute('aSeed', attr(b.seed, 1))
  return g
}

export function pointsGeometry(b: PointBuffers): BufferGeometry {
  const g = new BufferGeometry()
  g.setAttribute('position', attr(b.pos, 3))
  g.setAttribute('aGrow', attr(b.grow, 1))
  g.setAttribute('aSeed', attr(b.seed, 1))
  g.setAttribute('aSize', attr(b.size, 1))
  return g
}
