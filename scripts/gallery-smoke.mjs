import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
try{
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce'})
    const page=await context.newPage()
    const errors=[]
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'})
    const access=page.locator('.gallery-access')
    await access.waitFor({timeout:30000})
    const entries=access.getByRole('button')
    assert.equal(await entries.count(),5)
    for(let i=0;i<5;i++){
      await entries.nth(i).click()
      const dialog=page.getByRole('dialog')
      await dialog.waitFor()
      assert.equal(await dialog.locator('.px-hero').count(),1)
      const action=dialog.locator('.px-hero-action')
      await action.click()
      await dialog.locator('.px-primary-experience').waitFor()
      const img=dialog.locator('.px-detail img')
      await img.evaluate(el=>el.decode())
      assert.ok(await img.evaluate(el=>el.naturalWidth>0))
      if(await dialog.locator('.px--matchup').count()){
        await dialog.getByRole('button',{name:'Solicitar plaza',exact:true}).click()
        assert.match(await dialog.getByRole('status').innerText(),/Solicitud registrada/)
      }
      if(await dialog.locator('.px--ashesfire').count()){
        await dialog.getByRole('button',{name:'Proyecto B',exact:true}).click()
        assert.match(await dialog.locator('.px-demo .px-metrics').innerText(),/Resultado/)
      }
      await page.keyboard.press('Escape')
      await dialog.waitFor({state:'hidden'})
    }
    assert.deepEqual(errors,[])
    console.log('PASS accessible project navigation',viewport)
    await context.close()
  }
  // Real animated entrances, not only the reduced-motion fallback.
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    const animated=await browser.newContext({viewport,reducedMotion:'no-preference'})
    const p=await animated.newPage(),faults=[]
    p.on('pageerror',e=>faults.push(e.message))
    await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'})
    const access=p.locator('.gallery-access')
    await access.waitFor({timeout:30000})
    const buttons=access.getByRole('button')
    const modes=new Set()
    for(let i=0;i<5;i++){
      await buttons.nth(i).click()
      const dialog=p.getByRole('dialog')
      await dialog.waitFor()
      modes.add(await dialog.getAttribute('data-motion'))
      await dialog.locator('.dlg__scroll').waitFor()
      await p.waitForFunction(()=>document.querySelector('.dlg')?.getAttribute('data-transition')==='ready',null,{timeout:15000})
      assert.ok(await dialog.locator('.px-hero').isVisible())
      if(i%2===0)await dialog.locator('.dlg__scroll').evaluate(el=>{el.scrollTop=el.scrollHeight})
      await p.keyboard.press('Escape')
      await dialog.waitFor({state:'hidden',timeout:15000})
    }
    assert.equal(modes.size,5)
    await buttons.first().click()
    await p.keyboard.press('Escape')
    await p.getByRole('dialog').waitFor({state:'hidden',timeout:15000})
    assert.deepEqual(faults,[])
    console.log('PASS five animated entrances, deep-scroll return and early cancellation',viewport)
    await animated.close()
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'})
  const page=await context.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'})
  const gallery=page.locator('.gallery-scroll')
  await gallery.waitFor({timeout:30000})
  await gallery.evaluate(el=>{
    const view=el.querySelector('.gallery-viewport')
    window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top+(el.clientHeight-view.clientHeight)*21/59)
  })
  const observe=page.getByRole('button',{name:/Observar AshesFire/})
  await observe.waitFor({timeout:30000})
  await observe.click()
  const enter=page.getByRole('button',{name:/Entrar al proyecto/})
  await enter.waitFor({timeout:30000})
  assert.equal(await page.getByRole('dialog').count(),0)
  await enter.click()
  await page.getByRole('dialog').waitFor({timeout:30000})
  await page.waitForFunction(()=>document.querySelector('.dlg')?.getAttribute('data-transition')==='ready',null,{timeout:15000})
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({state:'hidden',timeout:30000})
  await enter.waitFor({timeout:30000})
  await page.getByRole('button',{name:/Continuar recorrido/}).click()
  assert.equal(await enter.count(),0)
  assert.deepEqual(errors,[])
  console.log('PASS WebGL two-step navigation and return')
  await context.close()
}finally{await browser.close()}
