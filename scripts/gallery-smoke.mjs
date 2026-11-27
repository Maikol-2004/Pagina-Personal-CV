import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

await mkdir('artifacts/gallery',{recursive:true})
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const base='http://127.0.0.1:4173/'
const names=['AshesFire','MatchUp','My Journey','Portfolio narrativo']
const chapters=['screens','features','stack','demo']
const sizes=[{width:390,height:844},{width:1440,height:900}]
async function ready(page){
  await page.waitForFunction(()=>document.querySelector('.dlg')?.getAttribute('data-transition')==='ready',null,{timeout:30000})
}
async function close(page){
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({state:'hidden',timeout:30000})
}
async function disableWebGL(context){
  // Isolate DOM animations from the software GPU. WebGL is tested separately below.
  await context.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null
      return original.call(this,type,...args)
    }
  })
}
try{
  for(const reducedMotion of ['reduce','no-preference']){
    for(const viewport of sizes){
      const context=await browser.newContext({viewport,reducedMotion})
      await disableWebGL(context)
      const page=await context.newPage(),errors=[]
      page.setDefaultTimeout(30000)
      page.on('pageerror',e=>errors.push(e.message))
      await page.goto(base,{waitUntil:'domcontentloaded'})
      const access=page.locator('.gallery-access')
      await access.waitFor()
      const entries=access.getByRole('button')
      assert.equal(await entries.count(),names.length)
      const modes=new Set()
      for(let i=0;i<names.length;i++){
        await entries.nth(i).click()
        const dialog=page.getByRole('dialog')
        await dialog.waitFor();await ready(page)
        modes.add(await dialog.getAttribute('data-motion'))
        const overview=dialog.locator('.px-overview')
        assert.equal(await overview.count(),1)
        assert.equal(await overview.evaluate(el=>getComputedStyle(el).borderTopWidth),'0px')
        assert.equal(await overview.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)')
        assert.ok(await overview.locator('.px-overview-card,.px-preview').evaluateAll(els=>els.every(el=>getComputedStyle(el).borderTopWidth==='0px'&&getComputedStyle(el).backgroundColor==='rgba(0, 0, 0, 0)')),'Overview elements must not have card frames')
        assert.ok(await dialog.locator('.dlg__scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+2),'No horizontal overflow')
        assert.equal(await overview.locator('[data-unfold-source]').count(),4)
        assert.equal(await dialog.locator('[data-unfold-target]').count(),4)
        for(const key of chapters)assert.equal(await dialog.locator('[data-unfold-target="'+key+'"]').count(),1)
        assert.ok((await overview.locator('h2').textContent()).includes(names[i]),'Expected project '+names[i])
        await overview.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())))
        assert.ok(await overview.locator('img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0)))
        assert.ok((await overview.boundingBox()).height<=viewport.height*1.4,'Overview should be compact')
        if(reducedMotion==='no-preference'){
          await page.screenshot({path:'artifacts/gallery/'+viewport.width+'-'+i+'-overview.png'})
          // Native scrolling expands the features card from its overview column.
          const surface=dialog.locator('[data-unfold-target="features"] .px-unfold-surface')
          await dialog.locator('.dlg__scroll').evaluate(sc=>{
            const r=sc.querySelector('[data-unfold-target="features"]').getBoundingClientRect()
            sc.scrollTop+=r.top-sc.getBoundingClientRect().top-sc.clientHeight*.8
          })
          await page.waitForFunction(()=>Number(document.querySelector('[data-unfold-target="features"] .px-unfold-surface').style.getPropertyValue('--unfold-scale'))<.98)
          await dialog.locator('.dlg__scroll').evaluate(sc=>{
            const r=sc.querySelector('[data-unfold-target="features"]').getBoundingClientRect()
            sc.scrollTop+=r.top-sc.getBoundingClientRect().top-80
          })
          await page.waitForFunction(()=>Number(document.querySelector('[data-unfold-target="features"] .px-unfold-surface').style.getPropertyValue('--unfold-scale'))>.98)
          assert.ok(await surface.isVisible())
          await page.screenshot({path:'artifacts/gallery/'+viewport.width+'-'+i+'-expanded.png'})
        }
        await overview.locator('.px-preview-side .px-preview').first().click()
        const selected=dialog.locator('.px-detail img')
        const expected=await overview.locator('.px-preview-side .px-preview img').first().getAttribute('src')
        await page.waitForFunction(src=>document.querySelector('.px-detail img')?.getAttribute('src')===src,expected)
        await selected.evaluate(img=>img.decode())
        await overview.locator('[data-unfold-source="stack"]').click()
        assert.equal(await dialog.locator('.px-stack-expanded span').count()>0,true)
        await overview.locator('[data-unfold-source="demo"]').click()
        if(i===1){
          await dialog.getByRole('button',{name:'Solicitar plaza',exact:true}).click()
          assert.match(await dialog.getByRole('status').innerText(),/Solicitud registrada/)
        }
        if(i===0){
          await dialog.getByRole('button',{name:'Proyecto B',exact:true}).click()
          assert.match(await dialog.locator('.px-demo .px-metrics').innerText(),/Resultado/)
        }
        await close(page)
      }
      assert.equal(modes.size,names.length)
      await entries.first().click()
      await close(page)
      assert.deepEqual(errors,[])
      console.log('PASS four project overviews, preview navigation, chapters and return',viewport,reducedMotion)
      await context.close()
    }
  }
  for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
    const context=await browser.newContext({viewport,reducedMotion:'no-preference'})
    const page=await context.newPage(),errors=[]
    page.setDefaultTimeout(45000)
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto(base,{waitUntil:'domcontentloaded'})
    const gallery=page.locator('.gallery-scroll')
    await gallery.waitFor()
    async function walk(i){
      await gallery.evaluate((el,index)=>{
        const view=el.querySelector('.gallery-viewport')
        window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top+(el.clientHeight-view.clientHeight)*(21+8*index)/51)
      },i)
    }
    for(const id of ['ashesfire','matchup','my-journey','portfolio-narrativo']){
      const response=await page.request.get(base+'gallery-posters/editorial/'+id+'.svg')
      assert.ok(response.ok(),'Missing poster '+id)
      const poster=await response.text()
      assert.match(poster,/viewBox="0 0 1400 1120"/)
      assert.match(poster,/data:image\/webp;base64,/)
      assert.ok(!poster.includes('images.unsplash.com'))
      assert.match(poster,/data-cover="(?:photograph|approved-art)"/,'Expected a local cover for '+id)
    }
    await walk(0)
    await page.locator('.gallery-viewport canvas').waitFor()
    assert.equal(await page.getByLabel('Ambiente de la galería').count(),0)
    assert.equal(await page.locator('.gallery-viewport').getAttribute('data-atmosphere'),'architecture')
    const quality=page.getByLabel('Calidad gráfica')
    for(const mode of ['auto','medium']){
      await quality.selectOption(mode)
      await page.waitForTimeout(350)
      const result=await page.evaluate(()=>new Promise(resolve=>{
        const times=[],start=performance.now()
        let previous=start
        function frame(now){
          times.push(now-previous);previous=now
          if(now-start<1300)requestAnimationFrame(frame)
          else{times.sort((a,b)=>a-b);resolve({fps:Math.round(times.length*1000/(now-start)*10)/10,p95ms:Math.round(times[Math.floor((times.length-1)*.95)])})}
        }
        requestAnimationFrame(frame)
      }))
      console.log('Software renderer frame sample',viewport,mode,JSON.stringify(result))
    }
    await quality.selectOption('medium')
    await page.screenshot({path:'artifacts/gallery/'+viewport.width+'-museum.png'})
    for(let i=0;i<names.length;i++){
      await walk(i)
      const observe=page.getByRole('button',{name:'Observar '+names[i]+' ↗',exact:true})
      await observe.waitFor();await observe.click()
      const enter=page.getByRole('button',{name:/Entrar al proyecto/})
      await enter.waitFor()
      assert.equal(await page.getByRole('dialog').count(),0)
      const scrollBefore=await page.evaluate(()=>window.scrollY)
      await enter.click()
      await page.getByRole('dialog').waitFor()
      await ready(page)
      assert.ok((await page.locator('.px-overview h2').textContent()).includes(names[i]))
      await close(page)
      await enter.waitFor()
      assert.ok(Math.abs((await page.evaluate(()=>window.scrollY))-scrollBefore)<65)
      await page.getByRole('button',{name:/Continuar recorrido/}).click()
      assert.equal(await enter.count(),0)
    }
    assert.deepEqual(errors,[])
    console.log('PASS all four WebGL two-step entries and return',viewport)
    await context.close()
  }
}finally{await browser.close()}
