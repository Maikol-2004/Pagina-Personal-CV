import { useLayoutEffect, useRef } from 'react'
import { profile } from '../data/profile'
import { gsap } from '../lib/gsap'

const Arrow = ({ d }: { d: string }) => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
)

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('.hero h1 .line > span', { yPercent: 115, duration: 1.4, stagger: 0.12 })
          .from('.hero-kicker, .hero-full', { opacity: 0, y: 14, duration: 1, stagger: 0.1 }, 0.4)
          .from('.sculpture-art', { scale: 0.8, opacity: 0, duration: 1.8 }, 0.2)
          .from(
            '.hero-bottom > *, .hero-top, .hero-foot',
            { opacity: 0, y: 20, duration: 1, stagger: 0.08 },
            0.7,
          )

        // Scroll: el objeto y el titular viajan a distinta velocidad.
        gsap.to('.sculpture', {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
        })
        gsap.to('.hero-name', {
          yPercent: -10,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        // Ratón: el objeto se inclina hacia el cursor.
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
        const art = root.current!.querySelector<HTMLElement>('.sculpture-art')!
        const move = (e: MouseEvent) => {
          art.style.setProperty('--ty', `${(e.clientX / innerWidth - 0.5) * 18}deg`)
          art.style.setProperty('--tx', `${-(e.clientY / innerHeight - 0.5) * 12}deg`)
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
      <div className="hero-glow" aria-hidden="true" />
      <div className="container">
        <div className="hero-top eyebrow">
          <span className="dot-label">Desarrollo · Personas · Posibilidades</span>
          <span>Currículum personal / 2026</span>
        </div>
        <div className="hero-title">
          <div className="hero-name">
            <span className="hero-kicker eyebrow">Hola, soy</span>
            <h1 id="hero-title" aria-label={profile.shortName}>
              <span className="line" aria-hidden="true">
                <span>Michael</span>
              </span>
              <span className="line" aria-hidden="true">
                <span>
                  <em>
                    Guzmán<span aria-hidden="true">.</span>
                  </em>
                </span>
              </span>
            </h1>
            <span className="hero-full eyebrow">{profile.name}</span>
          </div>
          <figure
            className="sculpture"
            aria-label="Composición abstracta en cobre: una esfera y su órbita"
          >
            <div className="sculpture-art" aria-hidden="true">
              <div className="orbit orbit-back" />
              <div className="sphere" />
              <div className="orbit orbit-front" />
              <span className="art-point point-1" />
              <span className="art-point point-2" />
            </div>
            <figcaption>
              <span>
                Siempre en
                <br />
                <em>construcción.</em>
              </span>
              <span className="eyebrow muted">
                Curiosidad
                <br />
                en órbita
              </span>
            </figcaption>
          </figure>
        </div>
        <div className="hero-bottom">
          <p className="hero-statement">
            Curiosidad para aprender.
            <br />
            Compromiso para <em>crear.</em>
          </p>
          <div className="hero-intro">
            <p>
              {profile.headline}. {profile.tagline}
            </p>
            <a className="text-link" href="#trayectoria">
              Explora mi trayectoria <Arrow d="M5 19 19 5M5 5h14v14" />
            </a>
          </div>
          <a className="circle-link" href="#perfil" aria-label="Descubrir mi perfil">
            <Arrow d="M12 3v18M5 14l7 7 7-7" />
          </a>
        </div>
        <div className="hero-foot eyebrow">
          <span>{profile.location} · España</span>
          <span>Desliza para descubrir</span>
          <span>40°28′ N · 3°52′ O</span>
        </div>
      </div>
    </section>
  )
}
