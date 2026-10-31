/** Espejo en JS de los tokens CSS que necesita el código (breakpoints, curvas, colores 3D). */
export const bp = { mobile: 820, wide: 1100 } as const
export const mq = {
  mobile: `(max-width: ${bp.mobile}px)`,
  reduced: '(prefers-reduced-motion: reduce)',
  coarse: '(hover: none), (pointer: coarse)',
} as const
export const ease = { out: 'expo.out', inOut: 'power3.inOut' } as const
export const palette = {
  charcoal: '#242321',
  graphite: '#393a38',
  espresso: '#49372e',
  toast: '#806653',
  copper: '#b08968',
  sand: '#c5b5a0',
  ivory: '#eae5dd',
} as const
