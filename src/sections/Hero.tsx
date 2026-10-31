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
        // Entrada: letras, subtítulo y arcos 3D en secuencia.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('.hero__chi', { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.035 })
          .from('.hero__sub > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.9')
          .from('.slab', { y: 120, opacity: 0, rotateX: -40, duration: 1.6, stagger: 0.12 }, 0.2)
          .from('.hero__scroll', { opacity: 0, duration: 1 }, '-=0.4')

        // Scroll: cada plano de profundidad viaja a una velocidad distinta (parallax por capas).
        gsap.utils.toArray<HTMLElement>('.slab').forEach((el, i) => {
          gsap.to(el, {
            yPercent: -8 - i * 9,
            scale: 1 + i * 0.03,
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

        // Ratón: la escena se inclina y las capas se desplazan en sentidos opuestos.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        const rx = gsap.quickTo('.hero__scene', 'rotationX', { duration: 1, ease: 'power3.out' })
        const ry = gsap.quickTo('.hero__scene', 'rotationY', { duration: 1, ease: 'power3.out' })
        const move = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          ry(nx * 16)
          rx(-ny * 10)
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
      <div className="hero__scene" aria-hidden="true">
        <div className="slab slab--1" />
        <div className="slab slab--2" />
        <div className="slab slab--3" />
        <div className="slab slab--4" />
        <div className="slab slab--sun" />
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
