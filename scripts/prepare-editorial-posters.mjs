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
 ['cv-editorial','CV web','Diseño editorial · Identidad profesional','CURRÍCULUM INTERACTIVO','#d2a27e','cv-hero','cv-exp'],
 ['portfolio-narrativo','Portfolio narrativo','Una trayectoria contada en capítulos','NARRATIVA DIGITAL','#e7c3a3','narrativo-timeline','narrativo-detail'],
]
const data=async(name)=>'data:image/webp;base64,'+(await readFile(new URL(name+'.webp',projectDir))).toString('base64')
await Promise.all(entries.map(async ([id,title,subtitle,category,accent,main,secondary],index)=>{
  const target=new URL(id+'.svg',dir)
  let artwork
  try{artwork='data:image/webp;base64,'+(await readFile(new URL('artwork/'+id+'.webp',root))).toString('base64')}catch{}
  const primary=await data(main),second=await data(secondary)
  const mobile=id==='matchup'
  const visual=artwork
    ? `<image href="${artwork}" width="1400" height="790" preserveAspectRatio="xMidYMid slice"/><rect y="0" width="1400" height="790" fill="url(#artshade)"/>`
    : mobile
      ? `<g transform="translate(480 85) rotate(-8 150 290)"><rect width="306" height="590" rx="42" fill="#101315" stroke="${accent}" stroke-opacity=".6" stroke-width="3"/><image href="${second}" x="10" y="10" width="286" height="570" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(790 58) rotate(9 150 300)"><rect width="326" height="640" rx="45" fill="#101315" stroke="#b8b9af" stroke-width="3"/><image href="${primary}" x="10" y="10" width="306" height="620" preserveAspectRatio="xMidYMid meet"/></g>`
      : `<g transform="translate(220 125) rotate(-6 485 270)"><rect width="1010" height="555" rx="15" fill="#17191c" stroke="${accent}" stroke-opacity=".7" stroke-width="2"/><image href="${primary}" x="12" y="12" width="986" height="531" preserveAspectRatio="xMidYMid meet"/></g><g transform="translate(835 383) rotate(5 210 120)"><rect width="445" height="270" rx="9" fill="#16171a" stroke="#ac9177" stroke-width="2"/><image href="${second}" x="8" y="8" width="429" height="254" preserveAspectRatio="xMidYMid meet"/></g>`
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1440" viewBox="0 0 1400 1120"><title>${title} — exposición digital</title><desc>${artwork?'Ilustración conceptual generada; no representa una captura ni datos reales.':'Composición editorial con capturas originales del proyecto.'}</desc><defs><radialGradient id="back" cx=".67" cy=".28" r=".8"><stop stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="#101012"/></radialGradient><linearGradient id="artshade" x2="0" y2="1"><stop stop-color="#08090a" stop-opacity=".55"/><stop offset=".2" stop-color="#08090a" stop-opacity=".04"/><stop offset=".68" stop-color="#08090a" stop-opacity="0"/><stop offset="1" stop-color="#08090a"/></linearGradient><linearGradient id="fade" x2="0" y2="1"><stop stop-color="#08090a" stop-opacity="0"/><stop offset=".53" stop-color="#08090a" stop-opacity="0"/><stop offset=".74" stop-color="#08090a" stop-opacity=".96"/><stop offset="1" stop-color="#08090a"/></linearGradient></defs><rect width="1400" height="1120" fill="#101012"/><rect width="1400" height="1120" fill="url(#back)"/>${visual}<rect width="1400" height="1120" fill="url(#fade)"/><g fill="#f7efe5" font-family="Arial,sans-serif"><text x="72" y="78" font-size="22" letter-spacing="4">${category}</text><path d="M72 720H145" stroke="${accent}" stroke-width="3"/><text x="68" y="847" font-family="Georgia,serif" font-size="${id==='portfolio-narrativo'?92:120}" letter-spacing="-2">${title}</text><text x="74" y="912" font-size="27">${subtitle}</text><path d="M74 962H1326" stroke="#dbc4a8" stroke-opacity=".45"/><text x="74" y="1024" font-size="22" letter-spacing="4" fill="${accent}">EXPLORAR PROYECTO</text><text x="1326" y="1024" font-size="35" text-anchor="end" fill="${accent}">↗</text></g></svg>`
  await writeFile(target,svg)
  console.log('Editorial poster:',id,artwork?'concept art':'real project captures')
}))
