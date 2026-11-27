// Local editorial covers, derived from actual project captures. Optional original art overrides.
import {mkdir, readFile, writeFile} from 'node:fs/promises'
const root=new URL('../public/gallery-posters/',import.meta.url)
const dir=new URL('editorial/',root)
const projectDir=new URL('../public/projects/',import.meta.url)
await mkdir(dir,{recursive:true})
const entries=[
 ['ashesfire','AshesFire','Gestión de proyectos · Costes · Rentabilidad','SOFTWARE DE GESTIÓN','#d0a07a','ashesfire-costs','ashesfire-list'],
 ['matchup','MatchUp','Organiza · Comparte · Juega','EXPERIENCIA DEPORTIVA','#baf34b','matchup-inicio','matchup-perfil'],
 ['my-journey','My Journey','Trayectoria profesional · Web interactiva','PORTAFOLIO INMERSIVO','#d2a27e','journey-constel-focus','journey-hero'],
 ['portfolio-narrativo','Portfolio narrativo','Una trayectoria contada en capítulos','NARRATIVA DIGITAL','#e7c3a3','narrativo-timeline','narrativo-detail'],
]
const data=async(name)=>'data:image/webp;base64,'+(await readFile(new URL(name+'.webp',projectDir))).toString('base64')
await Promise.all(entries.map(async ([id,title,subtitle,category,accent,main,secondary],index)=>{
  const target=new URL(id+'.svg',dir)
  // Approved campaign artwork is complete; preserve it uncropped instead of printing its title twice.
  try{
    const approved='data:image/webp;base64,'+(await readFile(new URL('approved/'+id+'.webp',root))).toString('base64')
    const label=id==='matchup'?'<text x="70" y="126" font-family="Arial,sans-serif" font-weight="800" font-style="italic" font-size="98" fill="#c6f052">MatchUp</text><text x="76" y="165" font-family="Arial,sans-serif" font-size="26" fill="#fff">Organiza · Comparte · Juega</text>':''
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1440" viewBox="0 0 1400 1120" data-cover="approved-art"><title>${title}</title><desc>Arte conceptual aprobado, no captura de la aplicación.</desc><rect width="1400" height="1120" fill="#090909"/><image href="${approved}" width="1400" height="1120" preserveAspectRatio="xMidYMid meet"/>${label}</svg>`
    await writeFile(target,svg)
    return
  }catch(error){if(error.code!=='ENOENT')throw error}
  let artwork
  try{artwork='data:image/webp;base64,'+(await readFile(new URL('artwork/'+id+'.webp',root))).toString('base64')}catch{}
  const primary=artwork?null:await data(main),second=artwork?null:await data(secondary)
  const mobile=id==='matchup'
  const visual=artwork
    ? `<image href="${artwork}" x="0" y="0" width="1400" height="850" preserveAspectRatio="xMidYMid slice"/><rect y="0" width="1400" height="850" fill="url(#artshade)"/>`
    : mobile
      ? `<g transform="translate(480 85) rotate(-8 150 290)"><rect width="306" height="590" rx="42" fill="#101315" stroke="${accent}" stroke-opacity=".6" stroke-width="3"/><image href="${second}" x="10" y="10" width="286" height="570" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(790 58) rotate(9 150 300)"><rect width="326" height="640" rx="45" fill="#101315" stroke="#b8b9af" stroke-width="3"/><image href="${primary}" x="10" y="10" width="306" height="620" preserveAspectRatio="xMidYMid meet"/></g>`
      : `<g transform="translate(220 125) rotate(-6 485 270)"><rect width="1010" height="555" rx="15" fill="#17191c" stroke="${accent}" stroke-opacity=".7" stroke-width="2"/><image href="${primary}" x="12" y="12" width="986" height="531" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(835 383) rotate(5 210 120)"><rect width="445" height="270" rx="9" fill="#16171a" stroke="#ac9177" stroke-width="2"/><image href="${second}" x="8" y="8" width="429" height="254" preserveAspectRatio="xMidYMid meet"/></g>`
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1440" viewBox="0 0 1400 1120" data-cover="${artwork?'photograph':'capture'}"><title>${title} — exposición digital</title><desc>${artwork?'Fotografía conceptual con licencia Unsplash; no es una captura del proyecto.':'Composición editorial con capturas originales del proyecto.'}</desc><defs><radialGradient id="back" cx=".67" cy=".28" r=".8"><stop stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="#101012"/></radialGradient><linearGradient id="artshade" x2="0" y2="1"><stop stop-color="#08090a" stop-opacity=".55"/><stop offset=".2" stop-color="#08090a" stop-opacity=".04"/><stop offset=".68" stop-color="#08090a" stop-opacity="0"/><stop offset="1" stop-color="#08090a"/></linearGradient><linearGradient id="fade" x2="0" y2="1"><stop stop-color="#08090a" stop-opacity="0"/><stop offset=".53" stop-color="#08090a" stop-opacity="0"/><stop offset=".74" stop-color="#08090a" stop-opacity=".98"/><stop offset="1" stop-color="#08090a"/></linearGradient></defs><rect width="1400" height="1120" fill="#101012"/><rect width="1400" height="1120" fill="url(#back)"/>${visual}<rect width="1400" height="1120" fill="url(#fade)"/><g fill="#f7efe5" font-family="Arial,sans-serif"><text x="72" y="78" font-size="22" letter-spacing="4">${category}</text><path d="M72 720H145" stroke="${accent}" stroke-width="3"/><text x="68" y="847" font-family="Georgia,serif" font-size="${id==='portfolio-narrativo'?92:120}" letter-spacing="-2">${title}</text><text x="74" y="912" font-size="27">${subtitle}</text><path d="M74 962H1326" stroke="#dbc4a8" stroke-opacity=".45"/><text x="74" y="1024" font-size="22" letter-spacing="4" fill="${accent}">EXPLORAR PROYECTO</text><text x="1326" y="1024" font-size="35" text-anchor="end" fill="${accent}">↗</text></g></svg>`
  await writeFile(target,svg)
  console.log('Editorial poster:',id,artwork?'concept art':'real project captures')
}))

/** Three original editorial compositions for the new projects. The two photographic compositions reuse
 * real project-owned resources. LINGO is an original vector concept, not a screenshot. */
const coverPhoto=async name=>'data:image/webp;base64,'+(await readFile(new URL(name+'.webp',projectDir))).toString('base64')
const coverFrame=(title,kicker,subtitle,color,art)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1440" viewBox="0 0 1400 1120" data-cover="project-editorial"><title>${title}</title><defs><radialGradient id="bg"><stop stop-color="${color}" stop-opacity=".23"/><stop offset="1" stop-color="#0b0c0d"/></radialGradient><linearGradient id="fade" x2="0" y2="1"><stop stop-color="#090a0b" stop-opacity=".04"/><stop offset=".50" stop-color="#090a0b" stop-opacity=".08"/><stop offset=".78" stop-color="#090a0b" stop-opacity=".98"/><stop offset="1" stop-color="#090a0b"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="10"/></filter></defs><rect width="1400" height="1120" fill="#090a0b"/><rect width="1400" height="1120" fill="url(#bg)"/>${art}<rect width="1400" height="1120" fill="url(#fade)"/><g fill="#f6efe4" font-family="Arial,sans-serif"><text x="74" y="75" font-size="21" letter-spacing="5">${kicker}</text><path d="M74 742H152" stroke="${color}" stroke-width="3"/><text x="68" y="872" font-size="120" font-family="Georgia,serif" font-style="italic">${title}</text><text x="77" y="930" font-size="28" fill="${color}">${subtitle}</text><path d="M76 975H1324" stroke="#f6efe4" stroke-opacity=".35"/><text x="76" y="1037" font-size="19" letter-spacing="4">EN DESARROLLO</text><text x="1324" y="1037" font-size="19" text-anchor="end" letter-spacing="4">MG / EXHIBITION</text></g></svg>`
const lingoArt=`<g transform="translate(700 390)"><ellipse rx="465" ry="215" transform="rotate(-24)" fill="none" stroke="#78bca9" stroke-opacity=".28"/><ellipse rx="420" ry="160" transform="rotate(32)" fill="none" stroke="#d2a27e" stroke-opacity=".4"/><circle r="248" fill="#80cbbb" opacity=".14" filter="url(#glow)"/><circle r="218" fill="#142a29" stroke="#8ac4b2" stroke-width="2"/><circle r="203" fill="none" stroke="#8ac4b2" stroke-opacity=".3" stroke-dasharray="3 12"/><path d="M-112 -81h224v135H20l-48 54V54h-84z" fill="#0c1718" stroke="#9cd6c1" stroke-width="3"/><text text-anchor="middle" y="7" font-family="Georgia,serif" font-style="italic" font-size="76" fill="#f6efe4">Hello.</text><g fill="#112322" stroke="#88b9a8"><rect x="-515" y="-164" width="230" height="95" rx="14"/><rect x="288" y="65" width="235" height="95" rx="14"/></g><g font-family="Arial,sans-serif" fill="#e1efdc" font-size="29" text-anchor="middle"><text x="-400" y="-109">Listen</text><text x="405" y="120">Practice</text></g><g fill="#a4ddc6"><circle cx="-370" cy="142" r="6"/><circle cx="308" cy="-178" r="6"/><circle cx="425" cy="-39" r="4"/><circle cx="-242" cy="-231" r="4"/></g></g>`
await writeFile(new URL('lingo.svg',dir),coverFrame('LINGO','APRENDIZAJE / ANDROID','Escucha · Aprende · Practica','#9cd6c1',lingoArt))
for(const [id,title,kicker,subtitle,color,asset] of [['fitness','Fitness App','BIENESTAR / ANDROID','Entrena · Registra · Evoluciona','#dac6a8','fitness-training'],['eurogrip','Eurogrip','AUTOMOCIÓN / WEB','Catálogo · Tecnología · Rendimiento','#ef9b88','eurogrip-campaign']]){
  const art=`<image href="${await coverPhoto(asset)}" width="1400" height="850" preserveAspectRatio="xMidYMid slice"/><rect width="1400" height="850" fill="#090a0b" opacity=".18"/>`
  await writeFile(new URL(id+'.svg',dir),coverFrame(title,kicker,subtitle,color,art))
}
