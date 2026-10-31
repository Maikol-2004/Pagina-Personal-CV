import { makeRng } from '../lib/rng'

/**
 * Ilustración arquitectónica generada a partir del id: arcos superpuestos en planos de tono.
 * Sustituye a las fotografías hasta que existan imágenes reales (sólo formas rellenas).
 */
export function StageArt({
  seed,
  tone,
  className,
}: {
  seed: string
  tone: string
  className?: string
}) {
  const rng = makeRng(seed)
  const arches = Array.from({ length: 4 }, (_, i) => {
    const w = 120 - i * 22 + rng.range(-6, 6)
    return {
      x: 160 - w / 2 + rng.range(-34, 34),
      w,
      y: 70 + i * 26 + rng.range(-8, 8),
      fill: ['#393a38', '#49372e', tone, '#eae5dd'][i],
      opacity: [1, 1, 0.92, 0.9][i],
    }
  })
  const sun = { cx: rng.range(70, 250), cy: rng.range(34, 70), r: rng.range(10, 18) }
  return (
    <svg
      className={className}
      viewBox="0 0 320 240"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="240" fill="#2c2b29" />
      <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill="#c5b5a0" opacity="0.85" />
      {arches.map((a, i) => (
        <path
          key={i}
          d={`M${a.x} 240 V${a.y + a.w / 2} A${a.w / 2} ${a.w / 2} 0 0 1 ${a.x + a.w} ${a.y + a.w / 2} V240 Z`}
          fill={a.fill}
          opacity={a.opacity}
        />
      ))}
      <rect y="214" width="320" height="26" fill="#242321" />
    </svg>
  )
}
