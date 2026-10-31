import { useEffect, useState, type RefObject } from 'react'

/** true mientras el elemento está (casi) en pantalla: sirve para pausar el render 3D. */
export function useVisibility(ref: RefObject<Element | null>, margin = '200px') {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: margin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return visible
}
