import type { Project } from '../data/types'
const evidence={
  fitness:[
    {src:'fitness-editor.png',title:'Editor de rutinas',desc:'Creación y edición de una rutina en las pruebas H2.'},
    {src:'fitness-session.png',title:'Sesión de entrenamiento',desc:'Registro de series y descanso durante una sesión.'},
    {src:'fitness-history.png',title:'Historial',desc:'Consulta de sesiones registradas en las pruebas.'},
  ],
  eurogrip:[
    {src:'eurogrip-campaign.webp',title:'Campaña original',desc:'Recurso gráfico utilizado en la portada del sitio.'},
    {src:'eurogrip-tyre.webp',title:'Producto · perspectiva',desc:'Imagen de un modelo del catálogo.'},
    {src:'eurogrip-side.webp',title:'Producto · lateral',desc:'Vista técnica del mismo modelo.'},
  ],
} as const
export function CaseStudy({project}:{project:Project}){
  const fitness=project.id==='fitness'
  const images=fitness?evidence.fitness:evidence.eurogrip
  return <article className={'case-study case-study--'+project.id}>
    <header className="case-head"><div><p className="eyebrow">{project.context}</p><h2>{project.title}<em>.</em></h2><p className="case-status">{project.status} · {project.role}</p><p>{project.summary}</p></div><img src={import.meta.env.BASE_URL+'gallery-posters/editorial/'+project.id+'.svg'} alt={'Portada conceptual de '+project.title}/></header>
    <section className="case-section"><p className="eyebrow">{fitness?'EVIDENCIA H2 / CAPTURAS REALES':'RECURSOS ORIGINALES / CATÁLOGO'}</p><h3>{fitness?'El entrenamiento en acción.':'Diseño centrado en el producto.'}</h3><div className="case-evidence">{images.map(x=><figure key={x.src}><img src={import.meta.env.BASE_URL+'projects/'+x.src} alt={x.title} decoding="async"/><figcaption><strong>{x.title}</strong><p>{x.desc}</p></figcaption></figure>)}</div></section>
    <section className="case-section case-columns"><div><p className="eyebrow">01 / OBJETIVO</p><h3>De la idea a la solución.</h3>{project.objectives.map(x=><p key={x}>{x}</p>)}<ul>{project.features.map(x=><li key={x}>{x}</li>)}</ul></div><div><p className="eyebrow">02 / IMPLEMENTACIÓN</p><h3>Cómo está construido.</h3><ul className="skill-tech">{project.technologies.map(x=><li key={x}>{x}</li>)}</ul>{project.technical.map(x=><p key={x}>{x}</p>)}</div></section>
    <p className="case-disclosure">{fitness?'Las capturas proceden de pruebas H2. Otros apartados y la sincronización de dispositivos siguen en evolución.':'Las imágenes son recursos del sitio, no capturas de una compra finalizada. El proyecto es un catálogo comercial en desarrollo.'}</p>
  </article>
}
