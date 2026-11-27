import { projects } from '../data/profile'
import type { Project } from '../data/types'
import { posterUrl } from '../lib/projectTransition'

interface Props { onOpen:(project:Project,rect:DOMRect|null)=>void; fallback?:boolean }
export function ProjectIndex({onOpen,fallback=false}:Props){
  return <section className={'exhibition-directory'+(fallback?' exhibition-directory--fallback':' exhibition-directory--wall')} aria-label="Índice de la exposición">
    <header className="directory-heading"><div><p className="eyebrow">MG / ARCHIVO DE PROYECTOS</p><h3>{fallback?'Explora los proyectos.':'Fin del recorrido.'}</h3></div><span className="directory-total">07 / 07</span></header>
    <div className="gallery-access directory-grid" aria-label="Acceso directo a proyectos">{projects.map((p,i)=><button type="button" key={p.id} className="directory-project" aria-disabled={p.detailMode==='announcement'} onClick={e=>{if(p.detailMode!=='announcement')onOpen(p,e.currentTarget.querySelector('img')?.getBoundingClientRect()??e.currentTarget.getBoundingClientRect())}}>
      <span className="directory-art"><img src={posterUrl(p.id)} alt="" decoding="async"/></span>
      <span className="directory-copy"><small>{String(i+1).padStart(2,'0')} · {p.status}</small><strong>{p.title}</strong><span>{p.detailMode==='announcement'?'Próximamente':p.accent.replace(/\.$/,'')}</span></span>
      <span className="directory-arrow" aria-hidden="true">{p.detailMode==='announcement'?'·':'↗'}</span>
    </button>)}</div>
    <footer className="directory-foot"><span>Una trayectoria. Siete proyectos.</span><a href="#habilidades">Competencias →</a></footer>
  </section>
}
