import { profile, skillGroups, stages } from '../data/profile'
import { SectionLabel } from '../components/SectionLabel'

const edu = stages
  .filter((s) => s.kind === 'education')
  .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
const volunteer = stages.find((s) => s.kind === 'volunteer')

export function Skills() {
  return (
    <>
      <section className="section skills" id="habilidades" aria-labelledby="sk-title">
        <div className="container">
          <SectionLabel n="05" left="Competencias" right="Ideas que se convierten en soluciones" />
          <div className="skills-layout">
            <div className="skills-intro" data-reveal>
              <h2 id="sk-title">
                Competencias
                <br />
                <em>digitales.</em>
              </h2>
              <p>
                Conocimientos técnicos.
                <br />
                Una manera humana de aplicarlos.
              </p>
              <svg className="icon skills-mark" viewBox="0 0 80 80" aria-hidden="true">
                <path d="M40 2v76M2 40h76M13 13l54 54M13 67l54-54" />
              </svg>
            </div>
            <div className="skill-groups">
              {skillGroups.map((g) => (
                <article key={g.id} className="skill-card scene" data-reveal>
                  <p className="eyebrow muted">{g.label}</p>
                  <h3>
                    {g.title}
                    <br />
                    <em>{g.accent}</em>
                  </h3>
                  <p className="note">{g.note}</p>
                  <ul className="chips">
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section education" id="formacion" aria-labelledby="ed-title">
        <div className="container">
          <SectionLabel n="06" left="Formación y compromiso" right="Seguir aprendiendo" />
          <div className="education-grid">
            <div>
              <h2 id="ed-title" data-reveal>
                El siguiente
                <br />
                <em>capítulo.</em>
              </h2>
              <div className="studies">
                {edu.map((s) => (
                  <article key={s.id} className="study scene" data-reveal>
                    <span className="dot" aria-hidden="true" />
                    <p className="eyebrow muted">
                      {s.period}
                      {s.end === null ? ' · en curso' : ''}
                    </p>
                    <h3>{s.role}</h3>
                    <p className="muted">{s.company}</p>
                  </article>
                ))}
              </div>
            </div>
            {volunteer && (
              <article className="volunteer scene" data-reveal>
                <p className="eyebrow muted">Más allá del trabajo · Compromiso social</p>
                <h3>
                  También se crece
                  <br />
                  <em>aportando.</em>
                </h3>
                <div>
                  <p>Voluntario de la {volunteer.company}.</p>
                  <ul className="muted">
                    {volunteer.categories[0].items.map((i) => (
                      <li key={i.id}>{i.label}</li>
                    ))}
                  </ul>
                </div>
                <p className="eyebrow muted">
                  {profile.languages.map((l) => `${l.name} · ${l.level}`).join('  /  ')}
                </p>
              </article>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
