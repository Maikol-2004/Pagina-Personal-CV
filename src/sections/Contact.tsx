import { profile } from '../data/profile'
import { useMagnetic } from '../components/Nav'

export function Contact() {
  const mail = useMagnetic<HTMLAnchorElement>()
  return (
    <section className="section contact" id="contacto" aria-labelledby="ct-title">
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
      <h2 id="ct-title" data-reveal>
        Construyamos algo juntos
      </h2>
      <p className="lead contact__lead" data-reveal>
        Busco mi siguiente reto profesional en desarrollo de software. Escríbeme y hablamos.
      </p>
      <div className="contact__links" data-reveal>
        <a ref={mail} className="btn" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <a className="btn btn--quiet" href={`tel:+34${profile.phone}`}>
          {profile.phone}
        </a>
        <a className="btn btn--quiet" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <p className="muted contact__foot" data-reveal>
        {profile.name} · {profile.location}
      </p>
    </section>
  )
}
