import { useSyncExternalStore } from 'react'
import { mq } from '../lib/tokens'

/** Suscripción a una media query sin parpadeos de hidratación. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
export const useIsMobile = () => useMedia(mq.mobile)
export const useReducedMotion = () => useMedia(mq.reduced)
export const useIsCoarse = () => useMedia(mq.coarse)
