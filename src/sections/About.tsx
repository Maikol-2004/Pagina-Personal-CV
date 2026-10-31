import { profile } from '../data/profile'
import { SectionLabel } from '../components/SectionLabel'

export function About() {
  return (
    <section className="profile section" id="perfil" aria-labelledby="profile-title">
      <div className="container">
        <SectionLabel n="01" left="Perfil" right="Un poco sobre mí" />
        <div className="profile-main">
          <div data-reveal>
            <h2 id="profile-title">
              La tecnología
              <br />
              empieza con las
              <br />
              <em>personas.</em>
            </h2>
            <span className="flourish" aria-hidden="true" />
          </div>
          <div className="profile-copy" data-reveal>
            <span className="eyebrow dot-label" style={{ color: 'var(--copper)' }}>
              De la experiencia a las ideas
            </span>
            <p className="lead">{profile.about[0]}</p>
            <p>{profile.about[1]}</p>
            <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
              Conecta conmigo en LinkedIn
            </a>
          </div>
        </div>
        <ul className="values" data-reveal>
          {profile.values.map((v, i) => (
            <li key={v}>
              <b className="eyebrow">0{i + 1} /</b>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
