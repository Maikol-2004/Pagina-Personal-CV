// Compose self-contained editorial posters using licensed photography.
import {mkdir, readFile, writeFile, access} from 'node:fs/promises'
const root=new URL('../public/gallery-posters/',import.meta.url)
const dir=new URL('editorial/',root)
await mkdir(dir,{recursive:true})
const entries=[
 ['ashesfire','AshesFire','Gestión de proyectos · Costes · Rentabilidad','SOFTWARE DE GESTIÓN','1772001936267-b6058748eff4','Fer Troulik','lIipHR8mi3o'],
 ['matchup','MatchUp','Organiza · Comparte · Juega','EXPERIENCIA DEPORTIVA','1676746424139-77f8bd8922a8','Chris Kursikowski','5IS7UghgoMA'],
 ['my-journey','My Journey','Trayectoria profesional · Web interactiva','PORTAFOLIO INMERSIVO','1754762646500-d741ed975cd1','Marek Piwnicki','hycORWHgfo4'],
 ['cv-editorial','CV web','Diseño editorial · Identidad profesional','CURRÍCULUM INTERACTIVO','1752223638233-4c9545333f89','Dhony Koswara','btVTuAIhvk8'],
 ['portfolio-narrativo','Portfolio narrativo','Una trayectoria contada en capítulos','NARRATIVA DIGITAL','1760840415585-ae89d94bb636','byVlado','k3tHnRwtTso'],
]
await Promise.all(entries.map(async ([id,title,subtitle,category,photo,author,source],index)=>{
 const target=new URL(id+'.svg',dir)
 try{await access(target);if((await readFile(target,'utf8')).includes('data:image/jpeg;base64,'))return}catch{}
 try{
  const response=await fetch('https://images.unsplash.com/photo-'+photo+'?fit=crop&w=1400&h=1120&q=82&fm=jpg',{signal:AbortSignal.timeout(10000)})
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Image unavailable')
  const bytes=Buffer.from(await response.arrayBuffer())
  if(bytes.length>1500000||bytes[0]!==255||bytes[1]!==216)throw Error('Invalid JPEG')
  const picture=bytes.toString('base64')
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="0 0 1400 1120"><title>${title} — portada conceptual</title><desc>Fotografía de ${author}, Unsplash: https://unsplash.com/photos/${source}. Composición editorial, no captura de la aplicación.</desc><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#090909" stop-opacity=".64"/><stop offset=".22" stop-color="#090909" stop-opacity=".03"/><stop offset=".45" stop-color="#090909" stop-opacity=".1"/><stop offset=".75" stop-color="#090909" stop-opacity=".88"/><stop offset="1" stop-color="#090909"/></linearGradient></defs><rect width="1400" height="1120" fill="#090909"/><image href="data:image/jpeg;base64,${picture}" width="1400" height="1120" preserveAspectRatio="xMidYMid slice"/><rect width="1400" height="1120" fill="url(#shade)"/><g fill="#f7efe5" font-family="Arial,sans-serif"><text x="72" y="78" font-size="22" letter-spacing="4">${category}</text><text x="1328" y="78" font-size="23" text-anchor="end">0${index+1} / 05</text><path d="M72 720H145" stroke="#d6b08a" stroke-width="3"/><text x="68" y="847" font-family="Georgia,serif" font-size="${id==='portfolio-narrativo'?92:120}" letter-spacing="-2">${title}</text><text x="74" y="912" font-size="27">${subtitle}</text><path d="M74 962H1326" stroke="#dbc4a8" stroke-opacity=".45"/><text x="74" y="1024" font-size="22" letter-spacing="4" fill="#e7c6a1">EXPLORAR PROYECTO</text><text x="1326" y="1024" font-size="35" text-anchor="end" fill="#e7c6a1">↗</text></g></svg>`
  await writeFile(target,svg)
  console.log('Editorial poster:',id)
 }catch(error){
  // Keep the site available offline. Retry photographs on the next startup.
  console.warn('Using original cover for',id,String(error))
  await writeFile(target,await readFile(new URL(id+'.svg',root)))
 }
}))
