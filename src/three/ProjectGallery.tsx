import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Vector3, SRGBColorSpace } from 'three'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import './projectGallery.css'

type Props = { onOpen: (p: Project, rect: DOMRect | null) => void }
const length = 36
const url = (name: string) => import.meta.env.BASE_URL + 'projects/' + name + '.webp'

function Block({ position, size, color, metal = 0, roughness = .7 }: { position: [number,number,number]; size: [number,number,number]; color: string; metal?: number; roughness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={roughness}/></mesh>
}
function Artwork({ project, index, onSelect }: { project: Project; index: number; onSelect: () => void }) {
  const side = index % 2 ? 1 : -1
  const z = -5 - index * 6
  const layers = PROJECT_LAYERS[project.id].filter(l => !l.gallery)
  const textures = useTexture(layers.map(l => url(l.src)))
  const [hover, setHover] = useState(false)
  return <group position={[side*3.34,2.05,z]} rotation={[0,-side*Math.PI/2,0]}>
    <Block position={[0,0,-.08]} size={[4.3,2.65,.17]} color="#16100d"/>
    <Block position={[0,0,.015]} size={[4.18,2.53,.06]} color={hover?'#f4d2ad':'#b88a63'} metal={.75} roughness={.28}/>
    <Block position={[0,0,.06]} size={[4.04,2.39,.04]} color="#241b16"/>
    {textures.map((t,i)=>{
      t.colorSpace=SRGBColorSpace
      const image=t.image as {width:number;height:number}
      const aspect=image.width/image.height
      const maxW=textures.length===3 && project.id==='matchup'?1.1: i===0?2.4:1.18
      const height=Math.min(1.85,maxW/aspect)
      const width=height*aspect
      const x=project.id==='matchup'?(i-1)*1.23:i===0?-.65:1.32
      const y=project.id==='matchup'?0:i===0?0:i===1?.51:-.51
      return <mesh key={layers[i].src} position={[x,y,.095]}><planeGeometry args={[width,height]}/><meshBasicMaterial map={t} toneMapped={false}/></mesh>
    })}
    <mesh position={[0,0,.13]} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)}>
      <planeGeometry args={[4.3,2.65]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
    <Html position={[0,-1.55,.12]} transform distanceFactor={5} occlude style={{pointerEvents:"none"}}>
      <div className="gallery-plaque"><small>0{index+1} / MY JOURNEY</small><strong>{project.title}</strong></div>
    </Html>
  </group>
}
function Camera({ progress, selected, onArrive }: { progress: React.RefObject<number>; selected: number|null; onArrive: () => void }) {
  const {camera}=useThree()
  const look=useRef(new Vector3(0,1.65,-5))
  const notified=useRef(false)
  useEffect(()=>{notified.current=false},[selected])
  useFrame((_,dt)=>{
    const z=1-progress.current*length
    const side=selected!==null?(selected%2?1:-1):0
    const p=new Vector3(selected!==null?side*.15:0,1.75,selected!==null?-5-selected*6:z)
    const l=new Vector3(selected!==null?side*3.34:0,selected!==null?2.05:1.75,selected!==null?p.z:z-8)
    const a=1-Math.exp(-dt*4)
    camera.position.lerp(p,a);look.current.lerp(l,a);camera.lookAt(look.current)
    if(selected!==null&&!notified.current&&camera.position.distanceTo(p)<.08&&look.current.distanceTo(l)<.08){notified.current=true;onArrive()}
  })
  return null
}
function Room({progress,selected,onSelect,onArrive}: {progress: React.RefObject<number>;selected:number|null;onSelect:(i:number)=>void;onArrive:()=>void}) {
  return <>
    <color attach="background" args={['#17120f']}/>
    <fog attach="fog" args={['#17120f',22,55]}/>
    <ambientLight intensity={.55}/>
    <hemisphereLight args={["#ffe1bf","#38251b",1.1]}/>
    <mesh position={[0,.015,-17]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,44]}/><MeshReflectorMaterial resolution={512} mirror={.28} mixBlur={1} mixStrength={.65} blur={[350,100]} color="#30241c" metalness={.35} roughness={.45}/></mesh>
    <Block position={[0,4.5,-17]} size={[7,.3,44]} color="#211813"/>
    <Block position={[0,2.2,-39]} size={[7,4.5,.3]} color="#302219"/>
    {[-1,1].map(side=><group key={side}>
      <Block position={[side*3.55,2.2,-17]} size={[.3,4.5,44]} color="#372a21"/>
      <Block position={[side*3.36,.15,-17]} size={[.12,.3,44]} color="#916b4d" metal={.65}/>
      <Block position={[side*3.35,4.15,-17]} size={[.12,.12,44]} color="#b98a63" metal={.6}/>
      {Array.from({length:14},(_,i)=><Block key={i} position={[side*3.38,2.2,3-i*3]} size={[.12,4.4,.045]} color="#1e1814"/>)}
    </group>)}
    {Array.from({length:13},(_,i)=><group key={i} position={[0,4.29,3-i*3.3]}>
      <Block position={[0,.04,0]} size={[6.7,.15,.38]} color="#17120f"/>
      <mesh><boxGeometry args={[5.8,.035,.045]}/><meshBasicMaterial color="#ffdfb6" toneMapped={false}/></mesh>
      <pointLight position={[0,-.2,0]} color="#ffd2a0" intensity={9} distance={8} decay={2}/>
    </group>)}
    {projects.map((p,i)=><Artwork key={p.id} project={p} index={i} onSelect={()=>onSelect(i)}/>)}
    <Camera progress={progress} selected={selected} onArrive={onArrive}/>
  </>
}
export default function ProjectGallery({onOpen}:Props){
  const section=useRef<HTMLDivElement>(null)
  const viewport=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const [percent,setPercent]=useState(0)
  const [selected,setSelected]=useState<number|null>(null)
  const [fallback,setFallback]=useState(false)
  useEffect(()=>{
    const canvas=document.createElement('canvas')
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!canvas.getContext('webgl2'))setFallback(true)
    const update=()=>{const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const value=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-window.innerHeight)));progress.current=value;setPercent(Math.round(value*100))}
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  function arrive(){if(selected===null)return;onOpen(projects[selected],viewport.current?.getBoundingClientRect()??null);setSelected(null)}
  return <div className="gallery-shell">
    {!fallback&&<div ref={section} className="gallery-scroll"><div ref={viewport} className="gallery-viewport">
      <Canvas shadows dpr={[1,1.5]} camera={{position:[0,1.75,1],fov:65,near:.1,far:80}} fallback={<p>WebGL no disponible.</p>}>
        <Suspense fallback={null}><Room progress={progress} selected={selected} onSelect={setSelected} onArrive={arrive}/></Suspense>
      </Canvas>
      <div className="gallery-hud"><span>04 / THE EXHIBITION</span><span>{percent}%</span></div>
      <div className="gallery-instruction">Desplázate para caminar · Selecciona un cuadro para descubrirlo</div>
      <div className="gallery-progress" style={{width:percent+'%'}}/>
    </div></div>}
    <div className="gallery-access" aria-label="Acceso directo a proyectos">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title} ↗</button>)}</div>
  </div>
}
