import { profile, skillGroups, stages, projects } from '../data/profile'
import type { Project } from '../data/types'
import { SectionLabel } from '../components/SectionLabel'

const edu = stages
  .filter((s) => s.kind === 'education')
  .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
const volunteer = stages.find((s) => s.kind === 'volunteer')

const technicalGroups=[
  {id:'web',label:'01 / FRONTEND',title:'Interfaces & web',icon:'M3 5h18v14H3z M3 9h18 M9 13l-2 2 2 2 M15 13l2 2-2 2',items:['React','TypeScript','JavaScript','HTML','CSS','Vite','GSAP','Three.js','React Three Fiber'],proof:['my-journey','portfolio-narrativo','eurogrip']},
  {id:'mobile',label:'02 / MÓVIL',title:'Desarrollo Android',icon:'M7 3h10v18H7z M10 17h4',items:['Kotlin','Jetpack Compose','Material 3','Android Studio','Java','Room','DataStore'],proof:['matchup','fitness']},
  {id:'data',label:'03 / DATOS',title:'Software & persistencia',icon:'M4 6c0-4 16-4 16 0s-16 4-16 0z M4 6v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0',items:['Python','Streamlit','SQL','PostgreSQL','SQLAlchemy','pandas','PL/SQL','Hibernate','Firebase'],proof:['ashesfire']},
  {id:'tools',label:'04 / FUNDAMENTOS',title:'Entorno & calidad',icon:'M4 5h16v14H4z M7 9l4 3-4 3 M13 15h4',items:['Git / GitHub','GNU/Linux','Vitest','JavaFX','Java Swing','XML'],proof:['my-journey']},
] as const
export function Skills({onOpen}:{onOpen:(project:Project,rect:DOMRect|null)=>void}) {
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
              {technicalGroups.map(g=><article key={g.id} className="skill-ledger" data-reveal>
                <div className="skill-ledger-head"><svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d={g.icon}/></svg><span className="eyebrow">{g.label}</span></div>
                <h3>{g.title}</h3>
                <ul className="skill-tech">{g.items.map(it=><li key={it}>{it}</li>)}</ul>
                <div className="skill-evidence"><span className="eyebrow muted">PROYECTOS RELACIONADOS</span>{g.proof.map(id=>{const p=projects.find(p=>p.id===id);return p&&<button key={id} onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title} ↗</button>})}</div>
              </article>)}
              <div className="skill-human">{skillGroups.filter(g=>g.id==='personas'||g.id==='idiomas').map(g=><article key={g.id} data-reveal><p className="eyebrow muted">{g.label}</p><h3>{g.title} <em>{g.accent}</em></h3><ul className="skill-tech">{g.items.map(it=><li key={it}>{it}</li>)}</ul></article>)}</div>
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
