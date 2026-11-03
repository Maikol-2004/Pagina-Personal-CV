import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

const links = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'constelacion', label: 'Constelación' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', label: 'Competencias' },
  { id: 'contacto', label: 'Contacto' },
]

/** Cabecera fija: marca, navegación con sección actual, descarga del CV y barra de progreso de lectura. */
export function Header() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => bar.current && gsap.set(bar.current, { scaleX: s.progress }),
    })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    links.forEach((l) => {
      const el = document.getElementById(l.id)
      if (el) io.observe(el)
    })
    return () => {
      st.kill()
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="header">
      <div className="header-inner container">
        <a className="brand" href="#inicio" aria-label="Michael Guzmán, inicio">
          mg<span>CV / 26</span>
        </a>
        <nav className="nav" aria-label="Principal" data-open={open}>
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={current === l.id}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          className="pill pill--solid"
          href={`${import.meta.env.BASE_URL}Michael-Guzman-CV.pdf`}
          download
        >
          Descargar CV
        </a>
        <button className="menu-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
      <div ref={bar} className="reading-progress" aria-hidden="true" />
    </header>
  )
}
