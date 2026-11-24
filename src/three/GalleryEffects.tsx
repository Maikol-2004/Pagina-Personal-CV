import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

/** HDR glow only above the luminance threshold. No depth-of-field or full-scene blur. */
export function GalleryEffects({occlusion}:{occlusion:boolean}){
  const {gl,scene,camera,size,viewport}=useThree()
  const pipeline=useRef<EffectComposer|null>(null)
  useEffect(()=>{
    const target=new WebGLRenderTarget(1,1,{type:HalfFloatType,depthBuffer:true})
    target.samples=Math.min(2,gl.capabilities.maxSamples)
    const composer=new EffectComposer(gl,target)
    const render=new RenderPass(scene,camera)
    composer.addPass(render)
    const ao=occlusion?new SSAOPass(scene,camera,1,1,16):null
    if(ao){ao.kernelRadius=4;ao.minDistance=.003;ao.maxDistance=.08;composer.addPass(ao)}
    const bloom=new UnrealBloomPass(new Vector2(1,1),.19,.18,1.15)
    const output=new OutputPass()
    composer.addPass(bloom);composer.addPass(output)
    composer.setPixelRatio(gl.getPixelRatio())
    composer.setSize(gl.domElement.clientWidth||1,gl.domElement.clientHeight||1)
    pipeline.current=composer
    return()=>{pipeline.current=null;render.dispose();ao?.dispose();bloom.dispose();output.dispose();composer.dispose()}
  },[gl,scene,camera,occlusion])
  useEffect(()=>{pipeline.current?.setPixelRatio(viewport.dpr);pipeline.current?.setSize(size.width,size.height)},[size.width,size.height,viewport.dpr])
  useFrame((_,dt)=>{if(pipeline.current)pipeline.current.render(dt);else gl.render(scene,camera)},1)
  return null
}
