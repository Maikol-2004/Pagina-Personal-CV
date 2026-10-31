import { useLayoutEffect, useRef } from 'react'
import { profile } from '../data/profile'
import { gsap } from '../lib/gsap'
import { useMagnetic } from '../components/Nav'

/** Letras separadas para la entrada escalonada (el texto accesible va en aria-label). */
function Letters({ text }: { text: string }) {
  return (
    <span className="hero__word" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span className="hero__ch" key={i}>
          <span className="hero__chi">{ch}</span>
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const cta = useMagnetic<HTMLAnchorElement>()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrada: letras, subtítulo y círculos en secuencia.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('.hero__chi', { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.035 })
          .from('.hero__sub > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.9')
          .from('.orb', { scale: 0.4, opacity: 0, duration: 1.6, stagger: 0.15 }, 0.2)
          .from('.hero__scroll', { opacity: 0, duration: 1 }, '-=0.4')

        // Scroll: cada círculo sube a distinta velocidad (parallax por capas).
        gsap.utils.toArray<HTMLElement>('.orb').forEach((el, i) => {
          gsap.to(el, {
            yPercent: -10 - i * 18,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          })
        })
        gsap.to('.hero__title', {
          yPercent: -18,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        // Ratón: los círculos siguen al cursor con distinta intensidad (profundidad).
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        const movers = gsap.utils.toArray<HTMLElement>('.orb').map((el) => ({
          x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
        }))
        const move = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          movers.forEach((m, i) => {
            m.x(-nx * (30 + i * 40))
            m.y(-ny * (24 + i * 30))
          })
        }
        window.addEventListener('mousemove', move)
        return () => window.removeEventListener('mousemove', move)
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="orbs" aria-hidden="true">
        <span className="orb orb--1">
          <i />
        </span>
        <span className="orb orb--2">
          <i />
        </span>
        <span className="orb orb--3">
          <i />
        </span>
      </div>
      <div className="hero__title">
        <h1 id="hero-title" aria-label={profile.shortName}>
          <Letters text="Michael" />
          <br />
          <Letters text="Guzmán" />
        </h1>
        <div className="hero__sub">
          <p className="lead">{profile.headline}.</p>
          <p className="muted hero__tag">{profile.tagline}</p>
          <a ref={cta} className="btn" href="#trayectoria">
            Recorrer mi trayectoria
          </a>
        </div>
      </div>
      <a className="hero__scroll" href="#sobre-mi" aria-label="Bajar a la siguiente sección">
        <span className="hero__dot" />
        Desliza
      </a>
    </section>
  )
}
