// Fetch CC0 materials at build time, never from a visitor's browser.
// A failed download must not stop the portfolio from building.
import { mkdir, writeFile } from 'node:fs/promises'
const dir=new URL('../public/gallery-materials/',import.meta.url)
await mkdir(dir,{recursive:true})
const assets=['dark_wood','square_floor']
await Promise.all(assets.map(async asset=>{
  try {
    const response=await fetch('https://api.polyhaven.com/files/'+asset,{signal:AbortSignal.timeout(7000)})
    if(!response.ok)throw new Error('Metadata HTTP '+response.status)
    const files=await response.json()
    await Promise.all(['diff','nor_gl','rough'].map(async map=>{
      const formats=files[map]?.['1k']
      const file=formats?.jpg??formats?.png
      if(!file?.url)throw new Error('Missing '+map)
      const download=await fetch(file.url,{signal:AbortSignal.timeout(10000)})
      if(!download.ok)throw new Error('Texture HTTP '+download.status)
      const data=Buffer.from(await download.arrayBuffer())
      if(data.length>4000000)throw new Error('Texture exceeds size limit')
      // Detect file type via contents; the browser decodes either JPG or PNG.
      await writeFile(new URL(asset+'-'+map+'.img',dir),data)
    }))
    console.log('Gallery material ready:',asset)
  } catch(error){console.warn('Using procedural fallback for',asset,String(error))}
}))
