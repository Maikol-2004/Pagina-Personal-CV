import { useLayoutEffect, useRef } from 'react'
import { profile } from '../data/profile'
import { gsap } from '../lib/gsap'

/** Cada palabra del texto principal se enciende a medida que avanza el scroll (lectura guiada). */
export function About() {
  const root = useRef<HTMLElement>(null)
  const words = profile.about.join(' ').split(' ')

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.about__w',
          { opacity: 0.18 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.about__text',
              start: 'top 80%',
              end: 'bottom 55%',
              scrub: 0.5,
            },
          },
        )
        // Tarjetas en capas: velocidades distintas generan profundidad.
        gsap.utils.toArray<HTMLElement>('.about__card').forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: 14 + i * 12 },
            {
              yPercent: -6 - i * 8,
              ease: 'none',
              scrollTrigger: {
                trigger: '.about__cards',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            },
          )
        })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="section about" id="sobre-mi" aria-labelledby="about-title">
      <div className="about__top">
        <h2 id="about-title" data-reveal>
          Sobre mí
        </h2>
        <p className="muted about__where" data-reveal>
          {profile.location}
        </p>
      </div>
      <p className="about__text" aria-label={profile.about.join(' ')}>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <span className="about__w" key={i}>
              {w}{' '}
            </span>
          ))}
        </span>
      </p>
      <div className="about__cards">
        {profile.philosophy.map((p, i) => (
          <article className={`about__card about__card--${i + 1}`} key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            {p.provisional && <span className="chip chip--provisional">Texto por validar</span>}
          </article>
        ))}
      </div>
    </section>
  )
}
