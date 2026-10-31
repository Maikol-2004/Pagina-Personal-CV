import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { gsap } from '../lib/gsap'

const links = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#trayectoria', label: 'Trayectoria' },
  { href: '#constelacion', label: 'Constelación' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#competencias', label: 'Competencias' },
]

/** Botón magnético: se acerca ligeramente al cursor (sólo con puntero fino). */
export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * 0.28)
      y((e.clientY - (r.top + r.height / 2)) * 0.4)
    }
    const leave = () => {
      x(0)
      y(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [])
  return ref
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const cta = useMagnetic<HTMLAnchorElement>()
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <header className="nav">
      <a className="nav__brand" href="#inicio" onClick={() => setOpen(false)}>
        {profile.shortName}
      </a>
      <nav className="nav__links" aria-label="Principal" data-open={open}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a ref={cta} className="btn nav__cta" href="#contacto">
        Contacto
      </a>
      <button
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Cerrar' : 'Menú'}
      </button>
    </header>
  )
}
