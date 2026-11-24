import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, useTexture, RoundedBox, Environment, Lightformer, Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Vector3, Group, SRGBColorSpace, CanvasTexture, RepeatWrapping, MeshStandardMaterial } from 'three'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import './projectGallery.css'

type Props = { onOpen: (p: Project, rect: DOMRect | null) => void }
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
      const canvas=document.createElement('canvas');canvas.width=canvas.height=512
      const ctx=canvas.getContext('2d')!
      const pixels=ctx.createImageData(512,512)
      for(let y=0;y<512;y++)for(let x=0;x<512;x++){
        const i=(y*512+x)*4
        const grain=wood?Math.sin(x*.29+Math.sin(y*.013)*3+Math.sin(y*.04)*.7)*5+Math.sin(x*1.7+y*.008)*3:Math.sin(x*.028+y*.019+Math.sin(y*.031)*2)*5
        const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1*3
        const v=grain+noise
        pixels.data[i]=(wood?83:68)+v;pixels.data[i+1]=(wood?58:53)+v;pixels.data[i+2]=(wood?42:44)+v;pixels.data[i+3]=255
      }
      ctx.putImageData(pixels,0,0)
      const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4
      return t
    }
    const wood=make(true),stone=make(false);stone.repeat.set(2,ROOM_LENGTH/3.5)
    return {wood,stone,wall:new MeshStandardMaterial({map:wood,roughness:.62,metalness:.08})}
  },[])
}
function Artwork({ project, index, onSelect }: { project: Project; index: number; onSelect: () => void }) {
  const side = index % 2 ? 1 : -1
  const z = projectZ(index)
  const layers = PROJECT_LAYERS[project.id].filter(l => !l.gallery)
  const textures = useTexture(layers.map(l => url(l.src)))
  const [hover, setHover] = useState(false)
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
      t.colorSpace=SRGBColorSpace
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
    {project.id==='my-journey'&&!mobile&&<Sparkles count={35} scale={[4,2.3,.35]} position={[0,0,.45]} size={2} speed={.35} color={accent}/>}
    <mesh position={[0,0,.55]} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)}>
      <planeGeometry args={[4.7,3.05]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
    <Html position={[0,-1.72,.12]} transform distanceFactor={5} occlude style={{pointerEvents:"none"}}>
      <div className="gallery-plaque"><small>0{index+1} / MY JOURNEY</small><strong>{project.title}</strong><small>{project.technologies.slice(0,3).join(" · ")}</small></div>
    </Html>
  </group>
}
function Camera({ progress, selected, onArrive }: { progress: React.RefObject<number>; selected: number|null; onArrive: () => void }) {
  const {camera}=useThree()
  const look=useRef(new Vector3(0,1.75,CAMERA_START_Z-10))
  const notified=useRef(false)
  useEffect(()=>{notified.current=false},[selected])
  useFrame((_,dt)=>{
    const z=CAMERA_START_Z-progress.current*length
    const side=selected!==null?(selected%2?1:-1):0
    const p=new Vector3(selected!==null?side*.85:0,selected!==null?2.05:1.75+Math.sin(progress.current*95)*.018,selected!==null?projectZ(selected):z)
    const l=new Vector3(selected!==null?side*3.34:0,selected!==null?2.05:1.75,selected!==null?p.z:z-10)
    const a=1-Math.exp(-dt*(selected!==null?3.2:5))
    camera.position.lerp(p,a);look.current.lerp(l,a);camera.lookAt(look.current)
    if(selected!==null&&!notified.current&&camera.position.distanceTo(p)<.08&&look.current.distanceTo(l)<.08){notified.current=true;onArrive()}
  })
  return null
}
function Room({progress,selected,onSelect,onArrive}: {progress: React.RefObject<number>;selected:number|null;onSelect:(i:number)=>void;onArrive:()=>void}) {
  const materials=useArchitecturalMaterials()
  const mobile=useThree(s=>s.size.width<700)
  useEffect(()=>()=>{materials.wood.dispose();materials.stone.dispose();materials.wall.dispose()},[materials])
  return <>
    <color attach="background" args={['#17120f']}/>
    <fog attach="fog" args={['#17120f',25,68]}/>
    <ambientLight intensity={.28}/>
    <Environment resolution={128}><Lightformer form="rect" intensity={3} color="#ffe0b8" position={[0,5,-10]} scale={[6,25,1]} rotation={[Math.PI/2,0,0]}/><Lightformer form="rect" intensity={1.5} color="#c69a73" position={[4,2,-15]} scale={[30,4,1]} rotation={[0,-Math.PI/2,0]}/></Environment>
    <hemisphereLight args={["#ffe1bf","#38251b",1.1]}/>
    <mesh position={[0,.015,ROOM_CENTER]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,ROOM_LENGTH]}/><MeshReflectorMaterial resolution={mobile?256:768} mirror={.35} mixBlur={1} mixStrength={.75} blur={mobile?[120,60]:[350,120]} map={materials.stone} color="#b7a28e" metalness={.25} roughness={.38}/></mesh>
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
    {Array.from({length:9},(_,i)=><group key={'portal'+i} position={[0,0,10-i*8]}>
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
      <pointLight position={[0,-.2,0]} color="#ffd2a0" intensity={9} distance={8} decay={2}/>
    </group>)}
    {Array.from({length:23},(_,i)=><mesh key={i} position={[0,.022,ROOM_FRONT_Z-1.5-i*3]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[6.7,.018]}/><meshBasicMaterial color="#6a5140"/></mesh>)}
    <Block position={[0,2.3,ROOM_BACK_Z+.3]} size={[4.9,3.5,.12]} color="#201712"/>
    <Block position={[0,4.08,ROOM_BACK_Z+.45]} size={[5,.06,.16]} color="#d2a27e" metal={.6}/>
    <Html position={[0,2.35,ROOM_BACK_Z+.55]} transform distanceFactor={6} style={{pointerEvents:'none'}}><div className="gallery-end"><strong>MG.</strong><span>MY JOURNEY</span><p>Cada proyecto, un paso más en mi trayectoria.</p></div></Html>
    <pointLight position={[0,3.8,ROOM_BACK_Z+2.2]} color="#ffce99" intensity={12} distance={7}/>
    {projects.map((p,i)=><Artwork key={p.id} project={p} index={i} onSelect={()=>onSelect(i)}/>)}
    <Camera progress={progress} selected={selected} onArrive={onArrive}/>
  </>
}
export default function ProjectGallery({onOpen}:Props){
  const section=useRef<HTMLDivElement>(null)
  const viewport=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const [percent,setPercent]=useState(0)
  const [nearestProject,setNearestProject]=useState<number|null>(null)
  const [selected,setSelected]=useState<number|null>(null)
  const [fallback,setFallback]=useState(false)
  const [mobile,setMobile]=useState(false)
  const opened=useRef(false)
  const savedScroll=useRef(0)
  useEffect(()=>{
    const canvas=document.createElement('canvas')
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!canvas.getContext('webgl2'))setFallback(true)
    const update=()=>{setMobile(window.innerWidth<700);const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const value=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-(viewport.current?.clientHeight??window.innerHeight))));progress.current=value;setPercent(Math.round(value*100));setNearestProject(nearestIndex(CAMERA_START_Z-value*length))}
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  useEffect(()=>{
    if(selected===null)return
    const observer=new MutationObserver(()=>{
      if(opened.current&&!document.querySelector('.dlg')){
        opened.current=false
        window.scrollTo({top:savedScroll.current,behavior:'instant'})
        setSelected(null)
      }
    })
    observer.observe(document.body,{childList:true,subtree:true})
    return()=>observer.disconnect()
  },[selected])
  function select(i:number){if(selected!==null)return;savedScroll.current=window.scrollY;setSelected(i)}
  function arrive(){if(selected===null||opened.current)return;opened.current=true;const r=viewport.current?.getBoundingClientRect();onOpen(projects[selected],r?new DOMRect(r.x+r.width*.08,r.y+r.height*.1,r.width*.84,r.height*.8):null)}
  return <div className="gallery-shell">
    {!fallback&&<div ref={section} className="gallery-scroll"><div ref={viewport} className="gallery-viewport">
      <Canvas shadows dpr={[1,mobile?1.15:1.5]} camera={{position:[0,1.75,CAMERA_START_Z],fov:mobile?78:65,near:.1,far:80}} fallback={<p>WebGL no disponible.</p>}>
        <Suspense fallback={null}><Room progress={progress} selected={selected} onSelect={select} onArrive={arrive}/></Suspense>
      </Canvas>
      <div className="gallery-hud"><span>04 / THE EXHIBITION</span><span>{percent}%</span></div>
      <div className="gallery-instruction">{selected!==null?"Entrando en la exposición…":nearestProject===null?"Desplázate para recorrer la galería":"Toca una exposición para descubrirla"}</div>
      {selected===null&&nearestProject!==null&&<div className="gallery-near"><button onClick={()=>select(nearestProject)}>Explorar {projects[nearestProject].title} ↗</button></div>}
      <div className="gallery-progress" style={{width:percent+'%'}}/>
    </div></div>}
    <div className="gallery-access" aria-label="Acceso directo a proyectos">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title} ↗</button>)}</div>
  </div>
}
