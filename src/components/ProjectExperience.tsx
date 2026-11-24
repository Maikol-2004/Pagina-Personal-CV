import { useState } from 'react'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import './projectExperience.css'

const url=(name:string)=>import.meta.env.BASE_URL+'projects/'+name+'.webp'

const themes:Record<string,{label:string;headline:string;sub:string;tabs:string[]}>={
  matchup:{label:'01 / MOBILE EXPERIENCE',headline:'El partido empieza aquí.',sub:'Organiza. Comparte. Juega.',tabs:['Bienvenida','Explorar partidos','Perfil','Inicio']},
  ashesfire:{label:'02 / OPERATIONS CENTER',headline:'Del trabajo diario a la rentabilidad.',sub:'Gestión · Seguimiento · Control',tabs:['Proyectos','Menú principal','Costes']},
  'my-journey':{label:'03 / DIGITAL UNIVERSE',headline:'Una trayectoria conectada.',sub:'Cada nodo cuenta una historia.',tabs:['Portada','Constelación','Cronología móvil']},
  'cv-editorial':{label:'04 / DIGITAL EDITORIAL',headline:'Una identidad en cada detalle.',sub:'Tipografía, composición y movimiento.',tabs:['Portada','Trayectoria','Móvil']},
  'portfolio-narrativo':{label:'05 / INTERACTIVE STORY',headline:'Una carrera, muchos capítulos.',sub:'Una historia profesional que se descubre.',tabs:['Cronología','Detalle','Móvil']},
}

function Orbit({project}:{project:Project}){
  const [active,setActive]=useState(0)
  const items=project.technologies
  return <div className="px-orbit">
    <svg viewBox="0 0 400 300" role="img" aria-label="Mapa visual del stack tecnológico">
      <ellipse cx="200" cy="150" rx="154" ry="103" fill="none" stroke="currentColor" opacity=".2"/>
      <ellipse cx="200" cy="150" rx="95" ry="116" transform="rotate(38 200 150)" fill="none" stroke="currentColor" opacity=".25"/>
      {items.map((t,i)=>{
        const a=i/Math.max(1,items.length)*Math.PI*2-Math.PI/2
        const x=200+Math.cos(a)*145,y=150+Math.sin(a)*100
        return <g key={t}><line x1="200" y1="150" x2={x} y2={y} stroke="currentColor" opacity={active===i?.8:.28}/><circle cx={x} cy={y} r={active===i?9:5} fill="currentColor"/><text x={x} y={y-14} textAnchor="middle" fill="currentColor" fontSize="11">{t}</text></g>
      })}
      <circle cx="200" cy="150" r="28" fill="#201711" stroke="currentColor"/><text x="200" y="157" textAnchor="middle" fill="currentColor" fontSize="20">MG</text>
    </svg>
    <div className="px-tabs" aria-label="Tecnologías">{items.map((t,i)=><button key={t} aria-pressed={active===i} onClick={()=>setActive(i)}>{t}</button>)}</div>
    <p>Stack seleccionado: <strong>{items[active]}</strong></p>
  </div>
}
export function ProjectExperience({project}:{project:Project}){
  const [active,setActive]=useState(0)
  const shots=PROJECT_LAYERS[project.id]??[]
  const theme=themes[project.id]??{label:'PROJECT SHOWCASE',headline:project.title,sub:project.accent,tabs:[]}
  const current=shots[active]??shots[0]
  return <div className={'px px--'+project.id}>
    <header className="px-hero dlg__in">
      <div className="px-copy">
        <span className="px-kicker">{theme.label}</span>
        <p className="px-brand">{project.title}</p>
        <h2>{theme.headline}</h2>
        <p className="px-sub">{theme.sub}</p>
        <p>{project.summary}</p>
        <span className="px-status">{project.status} · {project.role}</span>
      </div>
      <div className="px-visual">
        {project.id==='cv-editorial'&&<div className="px-sphere" aria-hidden="true"/>}
        {project.id==='my-journey'&&<div className="px-halo" aria-hidden="true"/>}
        {project.id==='matchup'&&shots.slice(0,3).map((s,i)=><button key={s.src} className={'px-device px-device--'+i} onClick={()=>setActive(i)} aria-label={s.alt}><img src={url(s.src)} alt={s.alt}/></button>)}
        {project.id!=='matchup'&&current&&<figure className={'px-screen px-screen--'+current.kind}><img key={current.src} src={url(current.src)} alt={current.alt}/><figcaption>{current.title??current.alt}</figcaption></figure>}
      </div>
    </header>
    <section className="px-explore dlg__in">
      <div className="px-section-head"><span>INTERACTIVE SHOWCASE</span><h3>{project.id==='portfolio-narrativo'?'Explora los capítulos':project.id==='ashesfire'?'Explora el centro de control':'Descubre la experiencia'}</h3><p>Capturas originales del proyecto. Esta presentación no ejecuta la aplicación.</p></div>
      <div className="px-tabs" role="group" aria-label="Escenas del proyecto">{shots.map((s,i)=><button key={s.src} aria-pressed={i===active} onClick={()=>setActive(i)}>{project.id==='portfolio-narrativo'&&<small>0{i+1} </small>}{theme.tabs[i]??s.title??s.alt}</button>)}</div>
      {current&&<figure className={'px-detail px-detail--'+current.kind}><img key={current.src} src={url(current.src)} alt={current.alt}/><figcaption>{current.alt}</figcaption></figure>}
      {project.id==='ashesfire'&&<div className="px-metrics"><div><strong>{shots.length}</strong><span>Vistas en esta exposición</span></div><div><strong>{project.features.length}</strong><span>Funcionalidades documentadas</span></div><div><strong>{project.technologies.length}</strong><span>Tecnologías del proyecto</span></div></div>}
      {project.id==='my-journey'&&<Orbit project={project}/>}
      {project.id==='portfolio-narrativo'&&<div className="px-chapters">{shots.map((s,i)=><button key={s.src} aria-pressed={i===active} onClick={()=>setActive(i)}><span>0{i+1}</span>{theme.tabs[i]}</button>)}</div>}
      {project.id==='cv-editorial'&&<div className="px-editorial"><span>01 / Diseño</span><span>02 / Trayectoria</span><span>03 / Adaptabilidad</span></div>}
      {project.id==='matchup'&&<div className="px-sports"><span>FÚTBOL</span><span>PÁDEL</span><span>BASKET</span></div>}
    </section>
  </div>
}
