import { useState, useRef, useEffect } from 'react'
import { PROJECT_LAYERS } from '../data/projectShots'
import { projectCosts } from '../lib/galleryLogic'
import type { Project } from '../data/types'
import './projectExperience.css'

const url=(name:string)=>import.meta.env.BASE_URL+'projects/'+name+'.webp'

const themes:Record<string,{label:string;headline:string;sub:string;tabs:string[]}>={
  matchup:{label:'02 / MOBILE EXPERIENCE',headline:'El partido empieza aquí.',sub:'Organiza. Comparte. Juega.',tabs:['Bienvenida','Explorar partidos','Perfil','Inicio']},
  ashesfire:{label:'01 / OPERATIONS CENTER',headline:'Del trabajo diario a la rentabilidad.',sub:'Gestión · Seguimiento · Control',tabs:['Proyectos','Menú principal','Costes']},
  'my-journey':{label:'03 / DIGITAL UNIVERSE',headline:'Una trayectoria conectada.',sub:'Cada nodo cuenta una historia.',tabs:['Portada','Constelación','Cronología móvil']},
  'cv-editorial':{label:'04 / DIGITAL EDITORIAL',headline:'Una identidad en cada detalle.',sub:'Tipografía, composición y movimiento.',tabs:['Portada','Trayectoria','Móvil']},
  'portfolio-narrativo':{label:'05 / INTERACTIVE STORY',headline:'Una carrera, muchos capítulos.',sub:'Una historia profesional que se descubre.',tabs:['Cronología','Detalle','Móvil']},
}

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
function FeatureStory({project}:{project:Project}){
  const [active,setActive]=useState(0)
  const sections=[{label:'El objetivo',items:project.objectives},{label:'La solución',items:project.features},{label:'La tecnología',items:project.technical}]
  const part=sections[active]
  return <section className="px-story">
    <div className="px-story-intro"><span className="px-kicker">BEHIND THE PROJECT</span><h3>De la idea<br/>al desarrollo.</h3><p>Explora el trabajo que hay detrás de {project.title}.</p></div>
    <div className="px-story-body"><div className="px-tabs" role="group" aria-label="Aspectos del desarrollo">{sections.map((s,i)=><button key={s.label} aria-pressed={i===active} onClick={()=>setActive(i)}>{s.label}</button>)}</div><div key={active} className="px-story-items">{part.items.map((item,i)=><article key={item}><span>{String(i+1).padStart(2,'0')}</span><p>{item}</p></article>)}</div></div>
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
const projectJourney:Record<string,{action:string;heading:string;sub:string}> = {
  matchup:{action:'Probar la app',heading:'Del equipo al partido.',sub:'Una demostración de la experiencia deportiva.'},
  ashesfire:{action:'Simular rentabilidad',heading:'Cada decisión cuenta.',sub:'Experimenta con el coste y los ingresos de un proyecto.'},
  'my-journey':{action:'Explorar tecnologías',heading:'El universo detrás de esta web.',sub:'Descubre cómo se conectan sus tecnologías.'},
  'cv-editorial':{action:'Explorar la edición',heading:'Un currículum que también cuenta una historia.',sub:'Compara la composición y su adaptación a distintos dispositivos.'},
  'portfolio-narrativo':{action:'Leer los capítulos',heading:'Una trayectoria que cobra vida.',sub:'Recorre sus diferentes escenas narrativas.'},
}
const sequenceCopy:Record<string,string[]> = {
  matchup:['La bienvenida al deporte.','Explora partidos y encuentra tu equipo.','Tu identidad como jugador.','Una entrada con identidad propia.'],
  ashesfire:['Una vista central de los proyectos.','Cada herramienta en su lugar.','Los costes y la rentabilidad, a la vista.'],
  'my-journey':['El inicio de una trayectoria.','La experiencia convertida en conexiones.','Una cronología pensada también para móvil.'],
  'cv-editorial':['Una portada con identidad visual.','La experiencia profesional como relato.','La misma información, adaptada a tu mano.'],
  'portfolio-narrativo':['El tiempo como hilo conductor.','Cada capítulo descubre una etapa.','Una historia adaptada a pantallas pequeñas.'],
}
function CinematicSequence({project}:{project:Project}){
  const shots=PROJECT_LAYERS[project.id]??[]
  const root=useRef<HTMLElement>(null)
  const [active,setActive]=useState(0)
  useEffect(()=>{
    const el=root.current,scroll=el?.closest('.dlg__scroll')
    if(!el||!scroll)return
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame=0
    const cards=Array.from(el.querySelectorAll<HTMLElement>('.px-sequence-step'))
    const update=()=>{
      frame=0
      const bounds=scroll.getBoundingClientRect()
      let index=0,best=Infinity
      cards.forEach((card,i)=>{
        const r=card.getBoundingClientRect()
        const distance=Math.abs(r.top+r.height*.5-(bounds.top+bounds.height*.5))
        if(distance<best){best=distance;index=i}
        if(!reduced){const v=Math.max(-1,Math.min(1,(r.top+r.height*.5-bounds.top-bounds.height*.5)/Math.max(1,bounds.height)))
          card.style.setProperty('--scene-shift',(v*26).toFixed(2)+'px')
          card.style.setProperty('--scene-angle',(v*7).toFixed(2)+'deg')}
      })
      setActive(index)
    }
    const tick=()=>{if(!frame)frame=requestAnimationFrame(update)}
    scroll.addEventListener('scroll',tick,{passive:true})
    window.addEventListener('resize',tick);tick()
    return()=>{scroll.removeEventListener('scroll',tick);window.removeEventListener('resize',tick);cancelAnimationFrame(frame)}
  },[])
  return <section ref={root} className="px-sequence">
    <header><span className="px-kicker">IN MOTION</span><h3>El proyecto, en movimiento.</h3><p>Desplázate para descubrir las capturas originales.</p></header>
    {shots.map((s,i)=><article key={s.src} className={'px-sequence-step '+(i===active?'is-current':'')}><div className="px-sequence-copy"><span>0{i+1} / {project.title}</span><h4>{sequenceCopy[project.id]?.[i]??s.title??s.alt}</h4><p>{s.alt}</p></div><figure className={'px-sequence-shot px-sequence-shot--'+s.kind}><img loading="lazy" decoding="async" src={url(s.src)} alt={s.alt}/></figure></article>)}
  </section>
}
export function ProjectExperience({project}:{project:Project}){
  const [active,setActive]=useState(0)
  const root=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return
    const el=root.current
    if(!el)return
    const nodes=el.querySelectorAll('.px-story,.px-comparison')
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}},{threshold:.12,root:el.closest('.dlg__scroll')})
    nodes.forEach(node=>{node.classList.add('px-reveal');observer.observe(node)})
    return()=>{observer.disconnect();nodes.forEach(node=>node.classList.remove('px-reveal'))}
  },[])
  const shots=PROJECT_LAYERS[project.id]??[]
  const theme=themes[project.id]??{label:'PROJECT SHOWCASE',headline:project.title,sub:project.accent,tabs:[]}
  const current=shots[active]??shots[0]
  const journey=projectJourney[project.id]
  function goToDemo(){const el=root.current?.querySelector<HTMLElement>('.px-primary-experience');el?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
  return <div ref={root} className={'px px--'+project.id}>
    <header className="px-hero dlg__in">
      <div className="px-copy">
        <span className="px-kicker">{theme.label}</span>
        <p className="px-brand">{project.title}</p>
        <h2>{theme.headline}</h2>
        <p className="px-sub">{theme.sub}</p>
        <p>{project.summary}</p>
        <span className="px-status">{project.status} · {project.role}</span>{journey&&<button className="px-hero-action" onClick={goToDemo}>{journey.action} <span aria-hidden="true">↘</span></button>}
      </div>
      <div className="px-visual">
        {project.id==='cv-editorial'&&<div className="px-sphere" aria-hidden="true"/>}
        {project.id==='my-journey'&&<div className="px-halo" aria-hidden="true"/>}
        {project.id==='matchup'&&shots.slice(0,3).map((s,i)=><button key={s.src} className={'px-device px-device--'+i+(i===active?' is-active':'')} aria-pressed={i===active} onClick={()=>setActive(i)} aria-label={s.alt}><img src={url(s.src)} alt={s.alt}/></button>)}
        {project.id!=='matchup'&&current&&<figure className={'px-screen px-screen--'+current.kind}><img key={current.src} src={url(current.src)} alt={current.alt}/><figcaption>{current.title??current.alt}</figcaption></figure>}
      </div>
    </header>
    <section className="px-explore dlg__in">
      <div className="px-section-head"><span>INTERACTIVE SHOWCASE</span><h3>{project.id==='portfolio-narrativo'?'Explora los capítulos':project.id==='ashesfire'?'Explora el centro de control':'Descubre la experiencia'}</h3><p>Capturas originales del proyecto. Esta presentación no ejecuta la aplicación.</p></div>
      <div className="px-tabs" role="group" aria-label="Escenas del proyecto">{shots.map((s,i)=><button key={s.src} aria-pressed={i===active} onClick={()=>setActive(i)}>{project.id==='portfolio-narrativo'&&<small>0{i+1} </small>}{theme.tabs[i]??s.title??s.alt}</button>)}</div>
      {current&&<figure className={'px-detail px-detail--'+current.kind}><img key={current.src} src={url(current.src)} alt={current.alt}/><figcaption>{current.alt}</figcaption></figure>}
      {project.id==='ashesfire'&&<div className="px-metrics"><div><strong>{shots.length}</strong><span>Vistas en esta exposición</span></div><div><strong>{project.features.length}</strong><span>Funcionalidades documentadas</span></div><div><strong>{project.technologies.length}</strong><span>Tecnologías del proyecto</span></div></div>}
      {project.id==='portfolio-narrativo'&&<div className="px-chapters">{shots.map((s,i)=><button key={s.src} aria-pressed={i===active} onClick={()=>setActive(i)}><span>0{i+1}</span>{theme.tabs[i]}</button>)}</div>}
      {project.id==='cv-editorial'&&<div className="px-editorial"><span>01 / Diseño</span><span>02 / Trayectoria</span><span>03 / Adaptabilidad</span></div>}
      {project.id==='matchup'&&<div className="px-sports"><span>FÚTBOL</span><span>PÁDEL</span><span>BASKET</span></div>}
    </section>
    <section className="px-primary-experience">
      {journey&&<header className="px-primary-head"><span className="px-kicker">EXPERIENCE / {project.title}</span><h3>{journey.heading}</h3><p>{journey.sub}</p></header>}
      {project.id==='matchup'&&<MatchDemo/>}
      {project.id==='ashesfire'&&<CostsDemo/>}
      {project.id==='my-journey'&&<Orbit project={project}/>}
      {(project.id==='cv-editorial'||project.id==='portfolio-narrativo')&&<EditorialDemo shots={shots} kind={project.id}/>}
    </section>
    <CinematicSequence project={project}/>
    <DeviceCompare project={project}/>
    <FeatureStory project={project}/>
  </div>
}
