import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

/** HDR glow only above the luminance threshold. No depth-of-field or full-scene blur. */
export function GalleryEffects(){
  const {gl,scene,camera,size,viewport}=useThree()
  const pipeline=useRef<EffectComposer|null>(null)
  useEffect(()=>{
    const target=new WebGLRenderTarget(1,1,{type:HalfFloatType,depthBuffer:true})
    target.samples=0
    const composer=new EffectComposer(gl,target)
    const render=new RenderPass(scene,camera)
    composer.addPass(render)
    const bloom=new UnrealBloomPass(new Vector2(1,1),.19,.18,1.15)
    const output=new OutputPass()
    composer.addPass(bloom);composer.addPass(output)
    composer.setPixelRatio(Math.min(1.25,gl.getPixelRatio()))
    composer.setSize(gl.domElement.clientWidth||1,gl.domElement.clientHeight||1)
    pipeline.current=composer
    return()=>{pipeline.current=null;render.dispose();bloom.dispose();output.dispose();composer.dispose()}
  },[gl,scene,camera])
  useEffect(()=>{pipeline.current?.setPixelRatio(Math.min(1.25,viewport.dpr));pipeline.current?.setSize(size.width,size.height)},[size.width,size.height,viewport.dpr])
  useFrame((_,dt)=>{if(pipeline.current)pipeline.current.render(dt);else gl.render(scene,camera)},1)
  return null
}
