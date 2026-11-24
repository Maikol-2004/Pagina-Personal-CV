import { useState, useRef, useEffect } from 'react'
import { PROJECT_OVERVIEW } from '../data/projectOverview'
import { transitionShot } from '../lib/projectTransition'
import { PROJECT_LAYERS } from '../data/projectShots'
import { projectCosts } from '../lib/galleryLogic'
import type { Project } from '../data/types'
import './projectExperience.css'

const url=(name:string)=>import.meta.env.BASE_URL+'projects/'+name+'.webp'

function Orbit({project}:{project:Project}){
  const [active,setActive]=useState(0)
  const items=project.technologies
  const details:Record<string,string>={'React':'Componentes de interfaz y gestión del estado.','TypeScript':'Tipado del código y contratos entre componentes.','Vite':'Servidor de desarrollo y compilación.','GSAP':'Animaciones y transiciones de interfaz.','Three.js':'Escenas, cámaras, materiales y geometrías 3D.','React Three Fiber':'Integración declarativa de Three.js con React.','Vitest':'Pruebas automatizadas del proyecto.'}
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
    <p>Stack seleccionado: <strong>{items[active]}</strong></p><p className="demo-node-detail">{details[items[active]]??"Tecnología incluida en el stack documentado del proyecto."}</p>
  </div>
}
function MatchDemo(){
  const [mode,setMode]=useState<'browse'|'create'>('browse')
  const [place,setPlace]=useState('')
  const [time,setTime]=useState('18:00')
  const [created,setCreated]=useState<{place:string;time:string;sport:string}|null>(null)
  const [sport,setSport]=useState('Fútbol')
  const [joined,setJoined]=useState(false)
  const max=sport==='Pádel'?4:10,players=sport==='Fútbol'?8:sport==='Pádel'?3:6
  return <section className="px-demo">
    <span className="px-kicker">DEMO / MATCHUP</span><h3>Encuentra tu próximo partido.</h3>
    <p>Simulación local con datos ficticios; no se envían solicitudes reales.</p>
    <div className="px-tabs"><button aria-pressed={mode==='browse'} onClick={()=>setMode('browse')}>Buscar partido</button><button aria-pressed={mode==='create'} onClick={()=>setMode('create')}>Crear partido</button></div>
    <div className="px-tabs">{['Fútbol','Pádel','Basket'].map(s=><button key={s} aria-pressed={sport===s} onClick={()=>{setSport(s);setJoined(false)}}>{s}</button>)}</div>
    {mode==='browse'?<><div className="demo-match"><span className="demo-ball">{sport==='Fútbol'?'⚽':sport==='Pádel'?'🎾':'🏀'}</span><div><h4>Partido de {sport.toLowerCase()}</h4><p>Madrid · 18:00 · {players}/{max} jugadores</p><div className="demo-track"><i style={{width:players/max*100+'%'}}/></div></div></div>
    <button className="demo-action" onClick={()=>setJoined(v=>!v)}>{joined?'Cancelar solicitud de ejemplo':'Solicitar plaza'}</button>
    <p key={String(joined)} className="px-feedback" role="status">{joined?'✓ Solicitud registrada en esta simulación.':'Selecciona un deporte y prueba a solicitar una plaza.'}</p></>:<form className="demo-fields" onSubmit={e=>{e.preventDefault();if(place.trim())setCreated({place:place.trim(),time,sport})}}><label>Lugar de ejemplo<input required maxLength={80} value={place} placeholder="Polideportivo" onChange={e=>setPlace(e.target.value)}/></label><label>Hora<input type="time" required value={time} onChange={e=>setTime(e.target.value)}/></label><button className="demo-action" type="submit">Crear partido de ejemplo</button>{created&&<p key={created.place+created.time+created.sport} className="px-feedback" role="status">✓ {created.sport} · {created.place} · {created.time}. Guardado solo en esta simulación.</p>}</form>}
  </section>
}
function CostsDemo(){
  const scenarios=[{name:'Proyecto A',hours:24,rate:35,expenses:220,revenue:1800},{name:'Proyecto B',hours:48,rate:42,expenses:480,revenue:3200},{name:'Proyecto C',hours:12,rate:30,expenses:150,revenue:800}]
  const [scenario,setScenario]=useState(0)
  const [hours,setHours]=useState(24),[rate,setRate]=useState(35),[expenses,setExpenses]=useState(220),[revenue,setRevenue]=useState(1800)
  const {cost,profit,margin}=projectCosts(hours,rate,expenses,revenue)
  const euro=(n:number)=>n.toLocaleString('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0})
  return <section className="px-demo">
    <span className="px-kicker">DEMO / ASHESFIRE</span><h3>Simulador de rentabilidad</h3><p>Datos ficticios y cálculo simplificado, sin conexión a la aplicación original.</p>
    <div className="px-tabs">{scenarios.map((s,i)=><button key={s.name} aria-pressed={scenario===i} onClick={()=>{setScenario(i);setHours(s.hours);setRate(s.rate);setExpenses(s.expenses);setRevenue(s.revenue)}}>{s.name}</button>)}</div>
    <div className="demo-fields">{([{label:'Horas',v:hours,set:setHours,max:100},{label:'Coste por hora (€)',v:rate,set:setRate,max:100},{label:'Gastos (€)',v:expenses,set:setExpenses,max:2000},{label:'Ingresos (€)',v:revenue,set:setRevenue,max:6000}]).map(f=><label key={f.label}><span>{f.label} <strong>{f.v}</strong></span><input type="range" min={0} max={f.max} value={f.v} onChange={e=>f.set(Number(e.target.value))}/></label>)}</div>
    <div className="px-metrics"><div><strong>{euro(cost)}</strong><span>Coste total</span></div><div><strong>{euro(profit)}</strong><span>Resultado</span></div><div><strong>{margin===null?'—':margin+'%'}</strong><span>Margen</span></div></div>
    <div className="demo-bars" aria-label="Comparación de ingresos y costes">{[{name:'Ingresos',value:revenue},{name:'Mano de obra',value:hours*rate},{name:'Gastos',value:expenses},{name:'Coste total',value:cost}].map(row=><div key={row.name}><span>{row.name}</span><i style={{width:row.value/Math.max(1,revenue,cost)*100+'%'}}/><strong>{euro(row.value)}</strong></div>)}</div>
  </section>
}
function EditorialDemo({shots,kind}:{shots:typeof PROJECT_LAYERS[string];kind:string}){
  const [step,setStep]=useState(0)
  const touch=useRef<number|null>(null)
  const current=shots[step]
  if(!current)return null
  return <section className="px-demo">
    <span className="px-kicker">DEMO / {kind==='cv-editorial'?'EDITORIAL':'NARRATIVE'}</span><h3>{kind==='cv-editorial'?'Cambia la perspectiva':'Recorre los capítulos'}</h3>
    <p>Visor interactivo de capturas originales.</p>
    <div className="demo-nav"><button disabled={step===0} onClick={()=>setStep(v=>v-1)}>← Anterior</button><span>{step+1} / {shots.length}</span><button disabled={step===shots.length-1} onClick={()=>setStep(v=>v+1)}>Siguiente →</button></div>
    <figure className="demo-editorial" onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current===null)return;const dx=e.changedTouches[0].clientX-touch.current;touch.current=null;if(Math.abs(dx)>45)setStep(v=>Math.max(0,Math.min(shots.length-1,v+(dx<0?1:-1))))}}><img key={current.src} src={url(current.src)} alt={current.alt}/><figcaption>{current.alt}</figcaption></figure>
  </section>
}
function DeviceCompare({project}:{project:Project}){
  const shots=PROJECT_LAYERS[project.id]??[]
  const desktop=shots.find(s=>s.kind==='window'||s.src==='narrativo-timeline')
  const phone=shots.find(s=>s.kind==='phone'||s.src==='narrativo-phone')
  const [mode,setMode]=useState<'both'|'desktop'|'phone'>('both')
  if(!desktop||!phone)return null
  return <section className="px-comparison">
    <span className="px-kicker">RESPONSIVE DESIGN</span><h3>Una experiencia, dos perspectivas.</h3>
    <div className="px-tabs"><button aria-pressed={mode==='both'} onClick={()=>setMode('both')}>Ambas</button><button aria-pressed={mode==='desktop'} onClick={()=>setMode('desktop')}>Escritorio</button><button aria-pressed={mode==='phone'} onClick={()=>setMode('phone')}>Móvil</button></div>
    <div className={'px-compare-devices is-'+mode}>{mode!=='phone'&&<figure className="px-compare-desktop"><img loading="lazy" src={url(desktop.src)} alt={desktop.alt}/><figcaption>Escritorio</figcaption></figure>}{mode!=='desktop'&&<figure className="px-compare-phone"><img loading="lazy" src={url(phone.src)} alt={phone.alt}/><figcaption>Móvil</figcaption></figure>}</div>
  </section>
}
type Chapter='screens'|'features'|'stack'|'demo'
const chapterOrder:Chapter[]=['screens','features','stack','demo']

/** Shared card expansion follows the native scroll. No extra canvas, pinning or React work per frame. */
function useUnfold(root:React.RefObject<HTMLDivElement|null>){
  useEffect(()=>{
    const el=root.current,scroll=el?.closest<HTMLElement>('.dlg__scroll')
    if(!el||!scroll||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
    const pairs=chapterOrder.flatMap(key=>{
      const source=el.querySelector<HTMLElement>('[data-unfold-source="'+key+'"]')
      const target=el.querySelector<HTMLElement>('[data-unfold-target="'+key+'"]')
      const surface=target?.querySelector<HTMLElement>('.px-unfold-surface')
      return source&&target&&surface?[{source,target,surface}]:[]
    })
    let raf=0
    function update(){
      raf=0
      const viewport=scroll!.getBoundingClientRect()
      if(viewport.height<=0)return
      // Read all positions before applying transforms, to avoid repeated layout recalculation.
      const positions=pairs.map(({source,target,surface})=>({source:source.getBoundingClientRect(),target:target.getBoundingClientRect(),surface}))
      for(const {source,target,surface} of positions){
        const p=Math.max(0,Math.min(1,(viewport.bottom-target.top)/(viewport.height*.54)))
        const ease=p*p*(3-2*p)
        const scale=Math.max(.58,Math.min(1,source.width/Math.max(1,target.width)))
        const shift=Math.max(-target.width*.25,Math.min(target.width*.25,source.left-target.left))
        surface.style.setProperty('--unfold-x',((1-ease)*shift).toFixed(2)+'px')
        surface.style.setProperty('--unfold-scale',(scale+(1-scale)*ease).toFixed(3))
        surface.style.setProperty('--unfold-detail',(.6+.4*ease).toFixed(3))
        surface.style.setProperty('--unfold-y',((1-ease)*24).toFixed(2)+'px')
      }
    }
    const tick=()=>{if(!raf)raf=requestAnimationFrame(update)}
    const observer=new ResizeObserver(tick);observer.observe(el);observer.observe(scroll)
    scroll.addEventListener('scroll',tick,{passive:true});tick()
    return()=>{observer.disconnect();scroll.removeEventListener('scroll',tick);cancelAnimationFrame(raf);for(const {surface} of pairs){surface.style.removeProperty('--unfold-x');surface.style.removeProperty('--unfold-scale');surface.style.removeProperty('--unfold-detail');surface.style.removeProperty('--unfold-y')}}
  },[root])
}

export function ProjectExperience({project}:{project:Project}){
  const shots=PROJECT_LAYERS[project.id]??[]
  const identity=PROJECT_OVERVIEW[project.id]
  const lead=transitionShot(project.id)??shots[0]
  const [active,setActive]=useState(Math.max(0,shots.findIndex(s=>s.src===lead?.src)))
  const root=useRef<HTMLDivElement>(null)
  useUnfold(root)
  const current=shots[active]??shots[0]
  const otherShots=shots.map((shot,index)=>({shot,index})).filter(({shot})=>shot.src!==lead?.src).slice(0,2)
  function jump(chapter:Chapter,index?:number){
    if(index!==undefined)setActive(index)
    const target=root.current?.querySelector<HTMLElement>('[data-unfold-target="'+chapter+'"]')
    target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})
    target?.querySelector<HTMLElement>('h3')?.focus({preventScroll:true})
  }
  return <div ref={root} className={'px px--'+project.id}>
    <header className="px-hero px-overview dlg__in" aria-label="Proyecto de un vistazo">
      <div className="px-copy px-overview-intro">
        <span className="px-kicker">PROJECT / OVERVIEW</span>
        <h2>{project.title}<span>.</span></h2>
        <p className="px-sub">{identity?.descriptor??project.accent}</p>
        <p className="px-overview-summary">{project.summary}</p>
        <div className="px-overview-meta"><span>{project.status}</span><span>{project.role}</span></div>
        {project.links.length>0&&<div className="px-overview-links">{project.links.map(link=><a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>}
      </div>
      <div className="px-visual px-overview-screens" data-unfold-source="screens">
        {lead&&<button className="px-preview px-preview-main" onClick={()=>jump('screens',shots.indexOf(lead))} aria-label={'Ampliar '+lead.alt}>
          <img src={url(lead.src)} alt={lead.alt} data-transition-shot={lead.src} fetchPriority="high"/>
          <span>{identity?.screenLabels[shots.indexOf(lead)]??lead.title??'Vista principal'} <b>↗</b></span>
        </button>}
        <div className="px-preview-side">{otherShots.map(({shot,index})=><button key={shot.src} className="px-preview" onClick={()=>jump('screens',index)} aria-label={'Ampliar '+shot.alt}>
          <img src={url(shot.src)} alt={shot.alt} decoding="async"/>
          <span>{identity?.screenLabels[index]??shot.title??'Vista'} <b>↗</b></span>
        </button>)}</div>
      </div>
      <button className="px-overview-card px-overview-features" data-unfold-source="features" onClick={()=>jump('features')}>
        <span className="px-card-label">01 / FUNCIONALIDADES <b>↘</b></span>
        <strong>{identity?.purpose??project.objectives[0]}</strong>
        <span className="px-feature-tags">{(identity?.features??project.features).map(f=><span key={f}>{f}</span>)}</span>
      </button>
      <button className="px-overview-card px-overview-stack" data-unfold-source="stack" onClick={()=>jump('stack')}>
        <span className="px-card-label">02 / TECNOLOGÍAS <b>↘</b></span>
        <strong>Cómo está construido.</strong>
        <span className="px-feature-tags">{project.technologies.map(t=><span key={t}>{t}</span>)}</span>
      </button>
      <button className="px-overview-card px-overview-demo px-hero-action" data-unfold-source="demo" onClick={()=>jump('demo')}>
        <span className="px-card-label">03 / INTERACTIVO <b>↘</b></span>
        <strong>{identity?.demo??'Explora el proyecto'}</strong>
        <span>{identity?.demoHint??'Descubre la experiencia.'}</span>
        <span className="px-demo-cta">Explorar ahora →</span>
      </button>
      <div className="px-overview-foot"><span>Capturas originales · {project.context}</span><span>Selecciona una tarjeta o desliza para ampliar ↓</span></div>
    </header>
    <section className="px-unfold" data-unfold-target="screens">
      <div className="px-unfold-surface px-explore">
        <header className="px-section-head"><span>VISTAS / {project.title}</span><h3 tabIndex={-1}>El proyecto en acción.</h3><p>Las mismas capturas de la portada, ahora a tamaño completo. No ejecutan la aplicación original.</p></header>
        <div className="px-tabs" role="group" aria-label="Escenas del proyecto">{shots.map((s,i)=><button key={s.src} aria-pressed={i===active} onClick={()=>setActive(i)}>{identity?.screenLabels[i]??s.title??s.alt}</button>)}</div>
        {current&&<figure className={'px-detail px-detail--'+current.kind+(current.src==='narrativo-phone'?' px-detail--phone':'')}><img key={current.src} src={url(current.src)} alt={current.alt} loading="lazy" decoding="async"/><figcaption>{current.alt}</figcaption></figure>}
        <DeviceCompare project={project}/>
      </div>
    </section>
    <section className="px-unfold" data-unfold-target="features">
      <div className="px-unfold-surface px-unfold-info">
        <header className="px-section-head"><span>01 / FUNCIONALIDADES</span><h3 tabIndex={-1}>De la idea a la solución.</h3></header>
        <div className="px-unfold-content"><div className="px-objective"><h4>El objetivo</h4>{project.objectives.map(t=><p key={t}>{t}</p>)}</div>
          <div className="px-expanded-features">{project.features.map((feature,i)=><article key={feature}><span className="px-kicker">0{i+1}</span><h4>{identity?.features[i]??'Funcionalidad '+(i+1)}</h4><p>{feature}</p></article>)}</div></div>
      </div>
    </section>
    <section className="px-unfold" data-unfold-target="stack">
      <div className="px-unfold-surface px-unfold-info">
        <header className="px-section-head"><span>02 / TECNOLOGÍAS</span><h3 tabIndex={-1}>Cómo está construido.</h3></header>
        <div className="px-unfold-content"><div className="px-stack-expanded">{project.technologies.map(t=><span key={t}>{t}</span>)}</div>
          <div className="px-expanded-features">{project.technical.map((t,i)=><article key={t}><span className="px-kicker">0{i+1} / IMPLEMENTACIÓN</span><p>{t}</p></article>)}</div></div>
      </div>
    </section>
    <section className="px-unfold px-primary-experience" data-unfold-target="demo">
      <div className="px-unfold-surface px-unfold-info">
        <header className="px-section-head"><span>03 / INTERACTIVO</span><h3 tabIndex={-1}>{identity?.demo??'Explora el proyecto'}</h3><p>{identity?.demoHint}</p></header>
        {project.id==='matchup'&&<MatchDemo/>}
        {project.id==='ashesfire'&&<CostsDemo/>}
        {project.id==='my-journey'&&<Orbit project={project}/>}
        {(project.id==='cv-editorial'||project.id==='portfolio-narrativo')&&<EditorialDemo shots={shots} kind={project.id}/>}
      </div>
    </section>
    <button className="px-back-overview" onClick={()=>root.current?.querySelector('.px-overview')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>↑ Volver a la vista general</button>
  </div>
}
