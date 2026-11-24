import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, useTexture, RoundedBox, Environment, Lightformer, Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Vector3, Group, BufferGeometry, Float32BufferAttribute, PerspectiveCamera, LinearMipmapLinearFilter, LinearFilter, SRGBColorSpace, CanvasTexture, RepeatWrapping, MeshStandardMaterial } from 'three'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import './projectGallery.css'

type Props = { onOpen: (p: Project, rect: DOMRect | null) => void; activeProjectId?: string }
type Phase = 'walking' | 'turning' | 'focused' | 'entering' | 'inside'
type Quality = 'auto' | 'medium' | 'high' | 'ultra'
const FIRST_PROJECT_Z = -14
const PROJECT_SPACING = 8
const CAMERA_START_Z = 7
const CAMERA_END_Z = -52
const ROOM_FRONT_Z = 12
const ROOM_BACK_Z = -57
const ROOM_LENGTH = ROOM_FRONT_Z - ROOM_BACK_Z
const ROOM_CENTER = (ROOM_FRONT_Z + ROOM_BACK_Z) / 2
const length = CAMERA_START_Z - CAMERA_END_Z
const projectZ = (index: number) => FIRST_PROJECT_Z - index * PROJECT_SPACING
const nearestIndex = (z: number) => {
  const index = Math.round((FIRST_PROJECT_Z - z) / PROJECT_SPACING)
  return index >= 0 && index < projects.length && Math.abs(z - projectZ(index)) <= 4.5 ? index : null
}
const url = (name: string) => import.meta.env.BASE_URL + 'projects/' + name + '.webp'

function Block({ position, size, color, metal = 0, roughness = .7 }: { position: [number,number,number]; size: [number,number,number]; color: string; metal?: number; roughness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={roughness}/></mesh>
}
// Locally generated grain and stone maps: no external texture requests.
function useArchitecturalMaterials(){
  return useMemo(()=>{
    const make=(wood:boolean)=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1024
      const ctx=canvas.getContext('2d')!
      const pixels=ctx.createImageData(1024,1024)
      for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
        const i=(y*1024+x)*4
        const grain=wood?Math.sin(x*.29+Math.sin(y*.013)*3+Math.sin(y*.04)*.7)*9+Math.sin(x*1.7+y*.008)*5:Math.sin(x*.028+y*.019+Math.sin(y*.031)*2)*5
        const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1*3
        const v=grain+noise
        pixels.data[i]=(wood?83:68)+v;pixels.data[i+1]=(wood?58:53)+v;pixels.data[i+2]=(wood?42:44)+v;pixels.data[i+3]=255
      }
      ctx.putImageData(pixels,0,0)
      const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=8
      return t
    }
    const wood=make(true),stone=make(false);stone.repeat.set(2,ROOM_LENGTH/3.5)
    return {wood,stone,wall:new MeshStandardMaterial({map:wood,bumpMap:wood,bumpScale:.025,roughness:.68,metalness:.08})}
  },[])
}
function Sculpture({kind,accent}:{kind:string;accent:string}){
  const ref=useRef<Group>(null)
  const vertices=useMemo(()=>{
    const points=Array.from({length:18},(_,i)=>{
      const y=1-2*i/17,a=i*2.399963,r=Math.sqrt(1-y*y)
      return new Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiplyScalar(.42)
    })
    const lines:number[]=[]
    points.forEach((p,i)=>points.slice(i+1).forEach(q=>{if(p.distanceTo(q)<.48)lines.push(...p.toArray(),...q.toArray())}))
    const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(lines,3))
    return {points,geometry}
  },[])
  useEffect(()=>()=>vertices.geometry.dispose(),[vertices])
  useFrame(({camera},dt)=>{if(ref.current&&Math.abs(camera.position.z-ref.current.getWorldPosition(new Vector3()).z)<10)ref.current.rotation.y+=dt*.24})
  return <group position={[0,-1.1,.65]}>
    <Block position={[0,-.38,0]} size={[1.2,.12,.6]} color="#2b2018" metal={.4}/>
    <group ref={ref} position={[0,.05,0]}>
      {kind==='my-journey'?<><lineSegments geometry={vertices.geometry}><lineBasicMaterial color={accent} transparent opacity={.8}/></lineSegments>{vertices.points.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.033,8,8]}/><meshBasicMaterial color={accent}/></mesh>)}</>:kind==='cv-editorial'?<mesh><sphereGeometry args={[.36,40,28]}/><meshStandardMaterial color="#c28c62" metalness={.9} roughness={.23}/></mesh>:null}
    </group>
  </group>
}
function Reception({progress}:{progress:React.RefObject<number>}){
  const light=useRef<import('three').PointLight>(null)
  useFrame((_,dt)=>{if(light.current){const target=progress.current<.25?11:3;light.current.intensity+=(target-light.current.intensity)*(1-Math.exp(-dt*3))}})
  return <group>
    {[-1,1].map(side=><group key={side} position={[side*3.12,2.1,1.5]} rotation={[0,-side*Math.PI/2,0]}>
      <Block position={[0,0,-.08]} size={[5.1,3.3,.18]} color="#211812"/>
      <Block position={[0,1.67,.02]} size={[5.1,.035,.05]} color="#d2a27e" metal={.7}/>
      <Block position={[0,-1.67,.02]} size={[5.1,.035,.05]} color="#d2a27e" metal={.7}/>
      <Html transform position={[0,0,.12]} distanceFactor={5} style={{pointerEvents:'none'}}><div className="gallery-reception"><strong>MG.</strong><span>THE EXHIBITION</span><p>Cinco proyectos. Una trayectoria.</p></div></Html>
    </group>)}
    <pointLight ref={light} position={[0,3.4,1.5]} color="#ffd4a6" intensity={11} distance={10}/>
    <Html position={[0,3.35,-2.4]} transform distanceFactor={7} style={{pointerEvents:'none'}}><div className="gallery-entry-sign">THE EXHIBITION <span>↓</span></div></Html>
  </group>
}
function Artwork({ project, index, onSelect }: { project: Project; index: number; onSelect: () => void }) {
  const side = index % 2 ? 1 : -1
  const z = projectZ(index)
  const layers = PROJECT_LAYERS[project.id].filter(l => !l.gallery)
  const textures = useTexture(layers.map(l => url(l.src)))
  const [hover, setHover] = useState(false)
  const gl=useThree(s=>s.gl)
  useEffect(()=>{
    for(const t of textures){
      t.colorSpace=SRGBColorSpace
      t.anisotropy=gl.capabilities.getMaxAnisotropy()
      t.minFilter=LinearMipmapLinearFilter
      t.magFilter=LinearFilter
      t.needsUpdate=true
    }
  },[textures,gl])
  const display=useRef<Group>(null)
  const mobile=useThree(s=>s.size.width<700)
  const accent=project.id==='matchup'?'#a8ed46':project.tone
  useFrame(({clock,camera},dt)=>{
    if(!display.current)return
    const near=Math.abs(camera.position.z-z)<7
    const target=near?Math.sin(clock.elapsedTime*1.2)*.045:0
    display.current.position.y+=(target-display.current.position.y)*(1-Math.exp(-dt*4))
  })
  return <group position={[side*3.22,2.05,z]} rotation={[0,-side*Math.PI/2,0]}>
    <Block position={[0,0,-.08]} size={[4.7,3.05,.17]} color="#16100d"/>
    <Block position={[0,0,.015]} size={[4.55,2.88,.06]} color={hover?'#f4d2ad':'#b88a63'} metal={.75} roughness={.28}/>
    <Block position={[0,0,.06]} size={[4.43,2.76,.04]} color={project.id==='matchup'?'#101a12':'#241b16'}/>
    <Block position={[0,-1.43,.03]} size={[4.5,.07,.36]} color="#b98a63" metal={.65} roughness={.35}/>
    <mesh position={[0,1.38,.22]}><boxGeometry args={[3.9,.045,.08]}/><meshBasicMaterial color={accent} toneMapped={false}/></mesh>
    <pointLight position={[0,1.45,.7]} intensity={5} distance={4} color={accent}/>
    <group ref={display}>
    {textures.map((t,i)=>{
      const image=t.image as {width:number;height:number}
      const aspect=image.width/image.height
      const maxW=project.id==='matchup'?1.08:i===0?2.65:1.25
      const height=Math.min(project.id==='matchup'?2.15:1.95,maxW/aspect)
      const width=height*aspect
      const x=project.id==='matchup'?(i-(textures.length-1)/2)*1.23:i===0?-.68:1.42
      const y=project.id==='matchup'?0:i===0?0:i===1?.51:-.51
      return <group key={layers[i].src} position={[x,y,i===0?.27:.17]} rotation={[0,project.id==='matchup'?(i-1)*-.12:0,0]}>
        <RoundedBox args={[width+.075,height+.075,.095]} radius={.025} smoothness={3}><meshStandardMaterial color={project.id==='matchup'?'#111713':'#17120f'} metalness={.5} roughness={.3}/></RoundedBox>
        <mesh position={[0,0,.052]}><planeGeometry args={[width,height]}/><meshBasicMaterial map={t} toneMapped={false}/></mesh>
      </group>
    })}
    </group>
    {(project.id==='my-journey'||project.id==='cv-editorial')&&<Sculpture kind={project.id} accent={accent}/>}
    {project.id==='matchup'&&[-1,1].map(s=><mesh key={s} position={[s*2.03,0,.19]}><boxGeometry args={[.035,2.5,.055]}/><meshBasicMaterial color={accent} toneMapped={false}/></mesh>)}
    {project.id==='ashesfire'&&Array.from({length:5},(_,i)=><mesh key={i} position={[-1.7+i*.17,-1.2,.22]}><boxGeometry args={[.10,.12+i*.055,.045]}/><meshBasicMaterial color={accent}/></mesh>)}
    {project.id==='portfolio-narrativo'&&<group position={[0,-1.16,.2]}><mesh><boxGeometry args={[3.8,.018,.04]}/><meshBasicMaterial color={accent}/></mesh>{[-1.5,0,1.5].map(x=><mesh key={x} position={[x,0,.03]}><sphereGeometry args={[.055,10,10]}/><meshBasicMaterial color={accent}/></mesh>)}</group>}
    {project.id==='my-journey'&&!mobile&&<Sparkles count={35} scale={[4,2.3,.35]} position={[0,0,.45]} size={2} speed={.35} color={accent}/>}
    <mesh position={[0,0,.55]} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)}>
      <planeGeometry args={[4.7,3.05]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
    <Html position={[0,-1.72,.12]} transform distanceFactor={5} occlude style={{pointerEvents:"none"}}>
      <div className="gallery-plaque"><small>0{index+1} / MY JOURNEY</small><strong>{project.title}</strong><small>{project.technologies.slice(0,3).join(" · ")}</small></div>
    </Html>
  </group>
}
function Camera({ progress, selected, phase, yaw, onArrive }: { progress: React.RefObject<number>; selected: number|null; phase:Phase; yaw:React.RefObject<number>; onArrive: () => void }) {
  const {camera,size}=useThree()
  const look=useRef(new Vector3(0,1.75,CAMERA_START_Z-10))
  const targetPosition=useMemo(()=>new Vector3(),[])
  const targetLook=useMemo(()=>new Vector3(),[])
  const notified=useRef<Phase|null>(null)
  useEffect(()=>{notified.current=null},[phase,selected])
  useFrame((_,dt)=>{
    const z=CAMERA_START_Z-progress.current*length
    const side=selected!==null?(selected%2?1:-1):0
    const focus=selected!==null&&phase!=='walking'
    const close=phase==='entering'||phase==='inside'
    const distance=close?2.4:5.5
    const p=targetPosition.set(focus?side*(3.0-distance):0,focus?2.05:1.75+Math.sin(progress.current*95)*.018,focus?projectZ(selected!):z)
    const l=targetLook.set(focus?side*3.22:Math.sin(yaw.current)*10,focus?2.05:1.75,focus?p.z:z-Math.cos(yaw.current)*10)
    const a=1-Math.exp(-dt*(focus?4:5))
    camera.position.lerp(p,a);look.current.lerp(l,a);camera.lookAt(look.current)
    if(camera instanceof PerspectiveCamera){
      const aspect=size.width/Math.max(1,size.height)
      const fit=2*Math.atan((4.7*1.12)/(2*5.5*aspect))*180/Math.PI
      const fov=focus&&!close?Math.max(62,Math.min(112,fit)):size.width<700?78:65
      if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*a;camera.updateProjectionMatrix()}
    }
    if((phase==='turning'||phase==='entering')&&notified.current!==phase&&camera.position.distanceTo(p)<.06&&look.current.distanceTo(l)<.06){
      notified.current=phase;onArrive()
    }
  })
  return null
}
function Room({progress,selected,phase,quality,yaw,onSelect,onArrive}: {progress: React.RefObject<number>;selected:number|null;phase:Phase;quality:Quality;yaw:React.RefObject<number>;onSelect:(i:number)=>void;onArrive:()=>void}) {
  const materials=useArchitecturalMaterials()
  const mobile=useThree(s=>s.size.width<700)
  useEffect(()=>()=>{materials.wood.dispose();materials.stone.dispose();materials.wall.dispose()},[materials])
  return <>
    <color attach="background" args={['#17120f']}/>
    <fog attach="fog" args={['#17120f',25,68]}/>
    <ambientLight intensity={.28}/>
    <Environment resolution={128}><Lightformer form="rect" intensity={3} color="#ffe0b8" position={[0,5,-10]} scale={[6,25,1]} rotation={[Math.PI/2,0,0]}/><Lightformer form="rect" intensity={1.5} color="#c69a73" position={[4,2,-15]} scale={[30,4,1]} rotation={[0,-Math.PI/2,0]}/></Environment>
    <hemisphereLight args={["#ffe1bf","#38251b",1.1]}/>
    <mesh position={[0,.015,ROOM_CENTER]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,ROOM_LENGTH]}/><MeshReflectorMaterial resolution={quality==='ultra'?1024:quality==='medium'?256:mobile?512:768} mirror={.22} mixBlur={.35} mixStrength={.48} blur={mobile?[40,18]:[90,35]} map={materials.stone} bumpMap={materials.stone} bumpScale={.015} color="#9e8b79" metalness={.18} roughness={.46}/></mesh>
    <Block position={[0,4.5,ROOM_CENTER]} size={[7,.3,ROOM_LENGTH]} color="#211813"/>
    <Block position={[0,2.2,ROOM_BACK_Z]} size={[7,4.5,.3]} color="#302219"/>
    {[-1,1].map(side=><group key={side}>
      <Block position={[side*3.55,2.2,ROOM_CENTER]} size={[.3,4.5,ROOM_LENGTH]} color="#372a21"/>
      <Block position={[side*3.36,.15,ROOM_CENTER]} size={[.12,.3,ROOM_LENGTH]} color="#916b4d" metal={.65}/>
      <Block position={[side*3.35,4.15,ROOM_CENTER]} size={[.12,.12,ROOM_LENGTH]} color="#b98a63" metal={.6}/>
      {Array.from({length:23},(_,i)=><group key={i} position={[side*3.39,2.2,ROOM_FRONT_Z-1.5-i*3]}>
        <mesh material={materials.wall} receiveShadow><boxGeometry args={[.08,3.85,2.88]}/></mesh>
        <Block position={[-side*.09,0,1.46]} size={[.16,4.25,.085]} color="#211813"/>
        <Block position={[-side*.08,0,1.40]} size={[.05,4.1,.025]} color="#a77d58" metal={.65}/>
      </group>)}
      <mesh position={[side*3.26,4.02,ROOM_CENTER]}><boxGeometry args={[.035,.045 ,ROOM_LENGTH-1]}/><meshBasicMaterial color="#ffdbac" toneMapped={false}/></mesh>
      <mesh position={[side*3.25,.31,ROOM_CENTER]}><boxGeometry args={[.025,.025 ,ROOM_LENGTH-1]}/><meshBasicMaterial color="#d3a477" toneMapped={false}/></mesh>
    </group>)}
    {Array.from({length:8},(_,i)=><group key={'portal'+i} position={[0,0,6-i*8]}>
      {[-1,1].map(side=><group key={side}>
        <Block position={[side*3.13,2.2,0]} size={[.45,4.4,.52]} color="#241a14"/>
        <Block position={[side*2.89,2.2,0]} size={[.025,4.15,.38]} color="#b98a63" metal={.7}/>
      </group>)}
      <Block position={[0,4.12,0]} size={[6.1,.55,.65]} color="#241a14"/>
      <mesh position={[0,3.83,0]}><boxGeometry args={[5.7,.025,.045]}/><meshBasicMaterial color="#ffe0b8" toneMapped={false}/></mesh>
    </group>)}
    {!mobile&&<Sparkles count={45} scale={[5,3,ROOM_LENGTH-4]} position={[0,2,ROOM_CENTER]} size={1.2} speed={.12} opacity={.18} color="#d2a27e"/>}
    {Array.from({length:21},(_,i)=><group key={i} position={[0,4.29,10-i*3.3]}>
      <Block position={[0,.04,0]} size={[6.7,.15,.38]} color="#17120f"/>
      <mesh><boxGeometry args={[5.8,.035,.045]}/><meshBasicMaterial color="#ffdfb6" toneMapped={false}/></mesh>
      <pointLight position={[0,-.2,0]} color="#ffd2a0" intensity={6} distance={8} decay={2}/>
    </group>)}
    {Array.from({length:23},(_,i)=><mesh key={i} position={[0,.022,ROOM_FRONT_Z-1.5-i*3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[6.7,.018]}/><meshBasicMaterial color="#6a5140"/></mesh>)}
    <Block position={[0,2.3,ROOM_BACK_Z+.3]} size={[4.9,3.5,.12]} color="#201712"/>
    <Block position={[0,4.08,ROOM_BACK_Z+.45]} size={[5,.06,.16]} color="#d2a27e" metal={.6}/>
    <Html position={[0,2.35,ROOM_BACK_Z+.55]} transform distanceFactor={6} style={{pointerEvents:'none'}}><div className="gallery-end"><strong>MG.</strong><span>MY JOURNEY</span><p>Cada proyecto, un paso más en mi trayectoria.</p></div></Html>
    <pointLight position={[0,3.8,ROOM_BACK_Z+2.2]} color="#ffce99" intensity={12} distance={7}/>
    <Reception progress={progress}/>
    {projects.map((p,i)=><Artwork key={p.id} project={p} index={i} onSelect={()=>onSelect(i)}/>)}
    <Camera progress={progress} selected={selected} phase={phase} yaw={yaw} onArrive={onArrive}/>
  </>
}
function AmbientSound(){
  const [enabled,setEnabled]=useState(false)
  const audio=useRef<{ctx:AudioContext;gain:GainNode}|null>(null)
  useEffect(()=>()=>{void audio.current?.ctx.close()},[])
  useEffect(()=>{
    const root=document.querySelector('.gallery-viewport');if(!root)return
    const observer=new IntersectionObserver(([entry])=>{const a=audio.current;if(a)a.gain.gain.setTargetAtTime(entry.isIntersecting && enabled ? .035 : 0,a.ctx.currentTime,.25)},{threshold:.2})
    observer.observe(root);return()=>observer.disconnect()
  },[enabled])
  async function toggle(){
    try{
      if(!audio.current){
        const ctx=new AudioContext(),gain=ctx.createGain()
        gain.gain.value=0;gain.connect(ctx.destination)
        for(const hz of [55,82.41,110]){
          const osc=ctx.createOscillator(),level=ctx.createGain()
          osc.type='sine';osc.frequency.value=hz;level.gain.value=.22
          osc.connect(level);level.connect(gain);osc.start()
        }
        audio.current={ctx,gain}
      }
      const {ctx,gain}=audio.current
      await ctx.resume()
      const next=!enabled
      gain.gain.setTargetAtTime(next ? .035 : 0,ctx.currentTime,.25)
      setEnabled(next)
    }catch{setEnabled(false)}
  }
  return <button className="gallery-audio" aria-pressed={enabled} onClick={()=>void toggle()}>{enabled?'Sonido: sí':'Sonido: no'}</button>
}
function AdaptiveQuality({enabled,onChange}:{enabled:boolean;onChange:(n:number)=>void}){
  const sample=useRef({time:0,frames:0,level:2})
  useFrame((_,dt)=>{
    if(!enabled||dt>.25){sample.current.time=0;sample.current.frames=0;return}
    const s=sample.current;s.time+=dt;s.frames++
    if(s.time>=3){const fps=s.frames/s.time;const next=fps<32?Math.max(1.5,s.level-.25):fps>52?Math.min(2.5,s.level+.25):s.level
      if(next!==s.level){s.level=next;onChange(next)}s.time=0;s.frames=0}
  })
  return null
}
export default function ProjectGallery({onOpen,activeProjectId}:Props){
  const section=useRef<HTMLDivElement>(null)
  const viewport=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const yaw=useRef(0)
  const drag=useRef<{x:number;y:number;start:number;moved:boolean}|null>(null)
  const ignoreClick=useRef(0)
  const [adaptiveDpr,setAdaptiveDpr]=useState(2)
  const [percent,setPercent]=useState(0)
  const [nearestProject,setNearestProject]=useState<number|null>(null)
  const [selected,setSelected]=useState<number|null>(null)
  const [fallback,setFallback]=useState(false)
  const [mobile,setMobile]=useState(false)
  const [phase,setPhase]=useState<Phase>('walking')
  const [quality,setQuality]=useState<Quality>('auto')
  const savedScroll=useRef(0)
  useEffect(()=>{
    const canvas=document.createElement('canvas')
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!canvas.getContext('webgl2'))setFallback(true)
    const update=()=>{setMobile(window.innerWidth<700);const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const value=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-(viewport.current?.clientHeight??window.innerHeight))));if(Math.abs(progress.current-value)>.0005)yaw.current=0;progress.current=value;setPercent(Math.round(value*100));setNearestProject(nearestIndex(CAMERA_START_Z-value*length))}
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  useEffect(()=>{
    if(phase==='inside'&&selected!==null&&activeProjectId!==projects[selected].id){
      window.scrollTo({top:savedScroll.current,behavior:'instant'})
      setPhase('focused')
    }
  },[phase,selected,activeProjectId])
  useEffect(()=>{
    if(phase!=='focused'&&phase!=='turning')return
    const resume=()=>{if(Math.abs(window.scrollY-savedScroll.current)>40){setPhase('walking');setSelected(null)}}
    window.addEventListener('scroll',resume,{passive:true})
    return()=>window.removeEventListener('scroll',resume)
  },[phase])
  function select(i:number){
    if(performance.now()<ignoreClick.current)return
    yaw.current=0
    if(phase==='walking'){savedScroll.current=window.scrollY;setSelected(i);setPhase('turning')}
    else if(phase==='focused'&&selected===i)setPhase('entering')
  }
  function resume(){setSelected(null);setPhase('walking')}
  function arrive(){
    if(selected===null)return
    if(phase==='turning'){setPhase('focused');return}
    if(phase!=='entering')return
    const r=viewport.current?.getBoundingClientRect()
    setPhase('inside')
    onOpen(projects[selected],r?new DOMRect(r.x+r.width*.08,r.y+r.height*.1,r.width*.84,r.height*.8):null)
  }
  function pointerDown(e:ReactPointerEvent<HTMLDivElement>){
    if(phase!=='walking'||!(e.target instanceof HTMLCanvasElement))return
    drag.current={x:e.clientX,y:e.clientY,start:yaw.current,moved:false}
  }
  function pointerMove(e:ReactPointerEvent<HTMLDivElement>){
    const d=drag.current;if(!d||phase!=='walking')return
    const dx=e.clientX-d.x,dy=e.clientY-d.y
    if(!d.moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){drag.current=null;return}
    if(Math.abs(dx)>12)d.moved=true
    if(d.moved)yaw.current=Math.max(-.85,Math.min(.85,d.start-dx*.005))
  }
  function pointerEnd(){if(drag.current?.moved)ignoreClick.current=performance.now()+350;drag.current=null}
  const dpr=quality==='medium'?1.25:quality==='high'?2:quality==='ultra'?3:adaptiveDpr

  return <div className="gallery-shell">
    {!fallback&&<div ref={section} className="gallery-scroll"><div ref={viewport} className="gallery-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUpCapture={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={pointerEnd}>
      <Canvas shadows dpr={[1,dpr]} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} camera={{position:[0,1.75,CAMERA_START_Z],fov:mobile?78:65,near:.1,far:80}} fallback={<p>WebGL no disponible.</p>}>
        <Suspense fallback={null}><Room progress={progress} selected={selected} phase={phase} quality={quality} yaw={yaw} onSelect={select} onArrive={arrive}/><AdaptiveQuality enabled={quality==='auto'&&phase==='walking'} onChange={setAdaptiveDpr}/></Suspense>
      </Canvas>
      <div className="gallery-hud"><span>04 / THE EXHIBITION</span><span>{percent}%</span></div>
      <div className="gallery-quality"><AmbientSound/><label>Calidad <select value={quality} onChange={e=>setQuality(e.target.value as Quality)} aria-label="Calidad gráfica"><option value="auto">Auto</option><option value="medium">Equilibrada</option><option value="high">Alta</option><option value="ultra">Ultra</option></select></label></div>
      <div className="gallery-instruction">{phase==='turning'?'Girando hacia la exposición…':phase==='focused'?'Toca otra vez para entrar · Desliza para continuar':phase==='entering'||phase==='inside'?'Entrando en la experiencia…':nearestProject===null?'Desliza hacia arriba para caminar · A los lados para mirar':'Toca una exposición para observarla'}</div>
      {phase==='focused'&&selected!==null&&<div className="gallery-focus"><strong>{projects[selected].title}</strong><button onClick={()=>select(selected)}>Entrar al proyecto ↗</button><button onClick={resume}>Continuar recorrido →</button></div>}
      {phase==='walking'&&nearestProject!==null&&<div className="gallery-near"><button onClick={()=>select(nearestProject)}>Observar {projects[nearestProject].title} ↗</button></div>}
      <div className="gallery-progress" style={{width:percent+'%'}}/>
    </div></div>}
    <div className="gallery-access" aria-label="Acceso directo a proyectos">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title} ↗</button>)}</div>
  </div>
}
