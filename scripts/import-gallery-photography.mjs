// One-time import of licensed photography, stored in the repository as WebP.
import {mkdir,readFile,writeFile} from 'node:fs/promises'
const target=new URL('../public/gallery-posters/artwork/',import.meta.url)
const photos=[
  [
    "ashesfire",
    "1707157284454-553ef0a4ed0d",
    "Jakub Żerdzicki",
    "https://unsplash.com/photos/heiYgqp0Tsk"
  ],
  [
    "matchup",
    "1767731154269-904a69c11fe4",
    "Christopher Lemercier",
    "https://unsplash.com/photos/BZGIyawVX0s"
  ],
  [
    "my-journey",
    "1679913156130-fc7fa9da4df1",
    "Kevin Charit",
    "https://unsplash.com/photos/M_VdGQTLv2g"
  ],
  [
    "cv-editorial",
    "1764755932155-dabbee87df7e",
    "ReyLabs Studio",
    "https://unsplash.com/photos/ohxs8oPgQ9k"
  ],
  [
    "portfolio-narrativo",
    "1760840415585-ae89d94bb636",
    "byVlado",
    "https://unsplash.com/photos/k3tHnRwtTso"
  ]
]
await mkdir(target,{recursive:true})
for (const [id,photo,author,source] of photos){
  const destination=new URL(id+'.webp',target)
  let valid=false
  try{const b=await readFile(destination);valid=b.length>12000&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'}catch{}
  if(!valid){
    const url='https://images.unsplash.com/photo-'+photo+'?fit=crop&w=1800&h=1090&fm=webp&q=88'
    for(let i=0;i<3;i++){
      try{
        const r=await fetch(url,{signal:AbortSignal.timeout(25000)})
        if(!r.ok)throw Error('HTTP '+r.status)
        const b=Buffer.from(await r.arrayBuffer())
        if(b.length<12000||b.length>3500000||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP '+b.length)
        await writeFile(destination,b);valid=true;break
      }catch(error){console.warn(id,error.message)}
    }
    if(!valid)throw Error('Unable to import '+id)
  }
  console.log('PHOTO READY:',id,author,source)
}
await writeFile(new URL('CREDITS.md',target),'# Fotografía conceptual de la exposición\n\nFotografías con licencia Unsplash (https://unsplash.com/license). No son capturas de las aplicaciones.\n\n'+photos.map(([id,,author,source])=>'- '+id+': ['+author+']('+source+')').join('\n')+'\n')
