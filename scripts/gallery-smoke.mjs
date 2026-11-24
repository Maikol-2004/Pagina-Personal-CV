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
}finally{await browser.close()}
