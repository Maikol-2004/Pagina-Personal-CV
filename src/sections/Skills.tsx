import { useState } from 'react'
import { profile, skillGroups, stages } from '../data/profile'

const edu = stages.filter((s) => s.kind === 'education')

export function Skills() {
  const [sel, setSel] = useState(skillGroups[0].id)
  const group = skillGroups.find((g) => g.id === sel)!
  return (
    <section className="section skills" id="competencias" aria-labelledby="sk-title">
      <h2 id="sk-title" data-reveal>
        Formación y competencias
      </h2>

      <div className="skills__grid">
        <div className="skills__edu" data-reveal>
          <h3 className="sr-only">Formación</h3>
          {edu
            .slice()
            .reverse()
            .map((s) => (
              <article key={s.id} className="skills__study">
                <p className="skills__degree">{s.role}</p>
                <p className="muted">
                  {s.company} · {s.period}
                </p>
              </article>
            ))}
          <p className="muted skills__lang">
            Idiomas: {profile.languages.map((l) => `${l.name} (${l.level})`).join(' · ')}
          </p>
        </div>

        <div className="skills__map" data-reveal>
          <div className="skills__tabs" role="group" aria-label="Categorías de competencias">
            {skillGroups.map((g) => (
              <button
                key={g.id}
                className="skills__tab"
                aria-pressed={sel === g.id}
                onClick={() => setSel(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
          <div className="skills__panel" key={group.id}>
            <p className="muted">{group.note}</p>
            <ul className="skills__chips">
              {group.items.map((it, i) => (
                <li key={it} style={{ ['--i' as string]: i }}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
