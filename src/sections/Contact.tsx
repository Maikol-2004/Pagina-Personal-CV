import { profile } from '../data/profile'
import { SectionLabel } from '../components/SectionLabel'

const Out = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19 19 5M5 5h14v14" />
  </svg>
)

export function Contact() {
  const tel = `+34 ${profile.phone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`
  return (
    <footer className="section contact" id="contacto" aria-labelledby="ct-title">
      <div className="container">
        <SectionLabel n="07" left="Contacto" right="Todo empieza con un hola" />
        <div data-reveal>
          <h2 id="ct-title">
            <a href={`mailto:${profile.email}`}>
              Hagamos algo
              <br />
              <em>con sentido.</em>
              <span className="contact-arrow">
                <Out />
              </span>
            </a>
          </h2>
          <p className="contact-sub">¿Conectamos? Me encantará conocer tu próximo proyecto.</p>
        </div>
        <div className="contact-links" data-reveal>
          <a href={`mailto:${profile.email}`}>
            <span className="eyebrow">Escríbeme</span>
            <span className="row">
              {profile.email} <Out />
            </span>
          </a>
          <a href={`tel:+34${profile.phone}`}>
            <span className="eyebrow">Llámame</span>
            <span className="row">
              {tel} <Out />
            </span>
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            <span className="eyebrow">Conectemos</span>
            <span className="row">
              LinkedIn <Out />
            </span>
          </a>
          <a href={`${import.meta.env.BASE_URL}Michael-Guzman-CV.pdf`} download>
            <span className="eyebrow">Guárdalo para después</span>
            <span className="row">
              Descargar CV <Out />
            </span>
          </a>
        </div>
        <div className="footer-bottom eyebrow">
          <span>© 2026 {profile.name}</span>
          <span>Con curiosidad, desde Madrid.</span>
          <a href="#inicio">Volver arriba ↑</a>
        </div>
      </div>
    </footer>
  )
}
