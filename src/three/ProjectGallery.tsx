import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, useTexture, RoundedBox, Environment, Lightformer, Sparkles } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Vector3, Color, TextureLoader, Group, SpotLight, Object3D, BufferGeometry, Float32BufferAttribute, Quaternion, PerspectiveCamera, LinearMipmapLinearFilter, LinearFilter, SRGBColorSpace, CanvasTexture, RepeatWrapping, MeshStandardMaterial } from 'three'
import { projects } from '../data/profile'
import { PROJECT_LAYERS } from '../data/projectShots'
import type { Project } from '../data/types'
import { GalleryEffects } from './GalleryEffects'
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
const exhibitX = 4.04
const alcoveHalf = 2.85
const alcoves = (side:number) => projects.map((_,i)=>i).filter(i=>(i%2?1:-1)===side).map(projectZ)
const wallSegments = (side:number) => {
  let cursor=ROOM_FRONT_Z
  const result:{z:number;length:number}[]=[]
  for(const z of alcoves(side)){
    const end=z+alcoveHalf
    if(cursor>end)result.push({z:(cursor+end)/2,length:cursor-end})
    cursor=z-alcoveHalf
  }
  if(cursor>ROOM_BACK_Z)result.push({z:(cursor+ROOM_BACK_Z)/2,length:cursor-ROOM_BACK_Z})
  return result
}
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
    const make=(wood:boolean, data=false)=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1024
      const ctx=canvas.getContext('2d')!
      const pixels=ctx.createImageData(1024,1024)
      for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
        const i=(y*1024+x)*4
        const grain=wood?Math.sin(x*.29+Math.sin(y*.013)*3+Math.sin(y*.04)*.7)*9+Math.sin(x*1.7+y*.008)*5:Math.sin(x*.028+y*.019+Math.sin(y*.031)*2)*5
        const noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1*3
        const v=grain+noise+(wood?Math.sin(x*.075+Math.sin(y*.008)*1.7)*7:Math.sin(x*.04+y*.025+Math.sin(y*.017)*2)*4)
        pixels.data[i]=data?128+v*3:(wood?83:68)+v;pixels.data[i+1]=data?128+v*3:(wood?58:53)+v;pixels.data[i+2]=data?128+v*3:(wood?42:44)+v;pixels.data[i+3]=255
      }
      ctx.putImageData(pixels,0,0)
      const t=new CanvasTexture(canvas);if(!data)t.colorSpace=SRGBColorSpace;t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=8
      return t
    }
    const wood=make(true),stone=make(false),woodRelief=make(true,true),stoneRelief=make(false,true)
    stone.repeat.set(2,ROOM_LENGTH/3.5);stoneRelief.repeat.copy(stone.repeat)
    return {wood,stone,woodRelief,stoneRelief,wall:new MeshStandardMaterial({map:wood,bumpMap:woodRelief,bumpScale:.035,roughnessMap:woodRelief,roughness:.95,metalness:.03})}
  },[])
}
// Optional locally served photographic maps. Procedural materials remain available offline.
function usePhotoMaps(asset:string,repeat:[number,number]){
  const [maps,setMaps]=useState<{diff:import('three').Texture;normal:import('three').Texture;rough:import('three').Texture}|null>(null)
  const gl=useThree(s=>s.gl)
  const [rx,ry]=repeat
  useEffect(()=>{
    let cancelled=false
    const loader=new TextureLoader()
    const loaded:import('three').Texture[]=[]
    const load=async (name:string,color:boolean)=>{
      const t=await loader.loadAsync(import.meta.env.BASE_URL+'gallery-materials/'+asset+'-'+name+'.img')
      if(cancelled){t.dispose();throw new Error('Cancelled')}
      loaded.push(t);t.wrapS=t.wrapT=RepeatWrapping;t.repeat.set(rx,ry)
      t.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy())
      if(color)t.colorSpace=SRGBColorSpace
      return t
    }
    void Promise.all([load('diff',true),load('nor_gl',false),load('rough',false)]).then(([diff,normal,rough])=>{if(!cancelled)setMaps({diff,normal,rough})}).catch(()=>{})
    return()=>{cancelled=true;loaded.forEach(t=>t.dispose())}
  },[asset,rx,ry,gl])
  return maps
}
function Sculpture({kind,accent}:{kind:string;accent:string}){
  const ref=useRef<Group>(null)
  const world=useMemo(()=>new Vector3(),[])
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
  useFrame(({camera},dt)=>{if(ref.current&&Math.abs(camera.position.z-ref.current.getWorldPosition(world).z)<10)ref.current.rotation.y+=dt*.24})
  return <group position={[0,-1.31,.88]}>
    <Block position={[0,-.38,0]} size={[1.2,.12,.6]} color="#2b2018" metal={.4}/>
    <group ref={ref} position={[0,.05,0]} scale={kind==='my-journey'?1.38:1.15}>
      {kind==='my-journey'?<><lineSegments geometry={vertices.geometry}><lineBasicMaterial color={accent} transparent opacity={.8}/></lineSegments>{vertices.points.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.033,8,8]}/><meshBasicMaterial color={accent}/></mesh>)}</>:kind==='cv-editorial'?<mesh><sphereGeometry args={[.36,40,28]}/><meshStandardMaterial color="#c28c62" metalness={.9} roughness={.23}/></mesh>:null}
    </group>
  </group>
}
function ContactStrips(){
  const tex=useMemo(()=>{
    const c=document.createElement('canvas');c.width=256;c.height=32
    const ctx=c.getContext('2d')!,g=ctx.createLinearGradient(0,0,256,0)
    g.addColorStop(0,'rgba(8,5,3,.65)');g.addColorStop(.25,'rgba(8,5,3,.23)');g.addColorStop(1,'rgba(8,5,3,0)')
    ctx.fillStyle=g;ctx.fillRect(0,0,256,32)
    return new CanvasTexture(c)
  },[])
  useEffect(()=>()=>tex.dispose(),[tex])
  return <>{[-1,1].map(s=><mesh key={s} position={[s*3.06,.032,ROOM_CENTER]} rotation={[-Math.PI/2,0,s===1?Math.PI:0]}><planeGeometry args={[.68,ROOM_LENGTH-1]}/><meshBasicMaterial map={tex} transparent depthWrite={false}/></mesh>)}</>
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
function Alcove({project,index}:{project:Project;index:number}){
  const side=index%2?1:-1,z=projectZ(index)
  const tone=project.id==='matchup'?'#536b31':project.id==='ashesfire'?'#64503d':'#a77b56'
  return <group position={[side*3.46,2.2,z]} rotation={[0,-side*Math.PI/2,0]}>
    <Block position={[0,0,-.87]} size={[5.7,4.45,.18]} color="#2d211a"/>
    {[-1,1].map(s=><group key={s}>
      <Block position={[s*2.85,0,-.4]} size={[.17,4.4,.98]} color="#493529"/>
      <Block position={[s*2.76,0,.015]} size={[.045,4.3,.075]} color="#b98a63" metal={.78} roughness={.3}/>
    </group>)}
    <Block position={[0,2.05,-.4]} size={[5.7,.34,1.05]} color="#30241b"/>
    <Block position={[0,-2.13,-.4]} size={[5.7,.14,1.05]} color="#66513e"/>
    <mesh position={[0,1.84,-.1]}><boxGeometry args={[5.3,.045,.045]}/><meshBasicMaterial color={tone}/></mesh>
  </group>
}
function Installation({kind,accent}:{kind:string;accent:string}){
  const motion=useRef<Group>(null)
  const world=useMemo(()=>new Vector3(),[])
  useFrame(({camera,clock},dt)=>{
    if(!motion.current)return
    const nearby=Math.abs(camera.position.z-motion.current.getWorldPosition(world).z)<8
    const goal=nearby?Math.sin(clock.elapsedTime*1.5)*.055:0
    motion.current.position.y+=(goal-motion.current.position.y)*(1-Math.exp(-dt*3))
  })
  return <group position={[0,-1.55,.74]}>
    {kind==='matchup'&&<group>
      <Block position={[0,-.1,0]} size={[4.35,.18,1.05]} color="#142217" roughness={.7}/>
      <group rotation={[-Math.PI/2,0,0]} position={[0,.002,0]}>
        <mesh><planeGeometry args={[4.12,.94]}/><meshStandardMaterial color="#29422a" roughness={.95}/></mesh>
        {[-1,1].map(s=><group key={s}><mesh position={[s*2.0,0,.012]}><planeGeometry args={[.018,.86]}/><meshBasicMaterial color={accent}/></mesh><mesh position={[0,s*.43,.012]}><planeGeometry args={[4,.018]}/><meshBasicMaterial color={accent}/></mesh></group>)}
        <mesh position={[0,0,.013]}><ringGeometry args={[.21,.225,40]}/><meshBasicMaterial color={accent}/></mesh>
        <mesh position={[0,0,.014]}><planeGeometry args={[.018,.86]}/><meshBasicMaterial color={accent}/></mesh>
      </group>
      <group ref={motion}><mesh position={[0,.26,0]}><sphereGeometry args={[.16,24,16]}/><meshStandardMaterial color="#dce4d0" roughness={.4}/></mesh></group>
    </group>}
    {kind==='ashesfire'&&<group>
      <Block position={[0,-.08,0]} size={[4.25,.2,.85]} color="#292b2d" metal={.35}/>
      <group ref={motion}>{[.28,.51,.39,.67,.86,.55,.72].map((h,i)=><group key={i} position={[-1.5+i*.5,0,0]}><Block position={[0,h/2,0]} size={[.26,h,.23]} color={i%2?'#b4733f':'#d2a27e'} metal={.6} roughness={.4}/><mesh position={[0,h,.01]}><boxGeometry args={[.27,.025,.25]}/><meshBasicMaterial color={accent}/></mesh></group>)}</group>
    </group>}
    {kind==='portfolio-narrativo'&&<group>
      <Block position={[0,-.09,0]} size={[4.2,.18,.8]} color="#30241f" metal={.25}/>
      <group ref={motion}><mesh position={[0,.14,0]}><boxGeometry args={[3.7,.022,.025]}/><meshBasicMaterial color={accent}/></mesh>{[-1.65,-.55,.55,1.65].map((x,i)=><group key={x} position={[x,.14,0]}><mesh><sphereGeometry args={[.07,12,12]}/><meshBasicMaterial color={accent}/></mesh><Block position={[0,.25,0]} size={[.62,.32,.055]} color={i%2?'#745441':'#a87d5d'} metal={.45}/></group>)}</group>
    </group>}
  </group>
}
function Artwork({ project, index, focused, onSelect }: { project: Project; index: number; focused:boolean; onSelect: () => void }) {
  const side = index % 2 ? 1 : -1
  const z = projectZ(index)
  const layers = useMemo(()=>PROJECT_LAYERS[project.id].filter(l => !l.gallery),[project.id])
  const sources = useMemo(()=>layers.map(l=>url(l.src)),[layers])
  const textures = useTexture(sources)
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
  const exhibitLight=useRef<import('three').PointLight>(null)
  const aura=useRef<Group>(null)
  const mobile=useThree(s=>s.size.width<700)
  const accent=project.id==='matchup'?'#a8ed46':project.tone
  const emission=useMemo(()=>new Color(accent).multiplyScalar(3.2),[accent])
  useFrame(({clock,camera},dt)=>{
    if(!display.current)return
    const proximity=Math.max(0,1-Math.abs(camera.position.z-z)/9)
    const ease=1-Math.exp(-dt*4)
    const target=Math.sin(clock.elapsedTime*1.2)*.06*proximity
    display.current.position.y+=(target-display.current.position.y)*ease
    display.current.position.z+=(.09*proximity-display.current.position.z)*ease
    if(exhibitLight.current)exhibitLight.current.intensity+=(2+5*proximity+(focused?3:0)-exhibitLight.current.intensity)*ease
    if(aura.current){const scale=.92+.08*proximity;aura.current.scale.x+=(scale-aura.current.scale.x)*ease;aura.current.scale.y+=(scale-aura.current.scale.y)*ease}
  })
  return <group position={[side*exhibitX,2.16,z]} rotation={[0,-side*Math.PI/2,0]} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={()=>setHover(true)} onPointerOut={()=>setHover(false)}>
    <Block position={[0,0,-.08]} size={[4.9,3.12,.17]} color="#16100d"/>
    <Block position={[0,0,.015]} size={[4.55,2.88,.06]} color={hover?'#f4d2ad':'#b88a63'} metal={.75} roughness={.28}/>
    <Block position={[0,0,.06]} size={[4.43,2.76,.04]} color={project.id==='matchup'?'#101a12':'#241b16'}/>
    <Block position={[0,-1.43,.03]} size={[4.5,.07,.36]} color="#b98a63" metal={.65} roughness={.35}/>
    <mesh position={[0,1.38,.22]}><boxGeometry args={[3.9,.045,.08]}/><meshBasicMaterial color={emission} toneMapped={false}/></mesh>
    <pointLight ref={exhibitLight} position={[0,1.45,.7]} intensity={2} distance={4} color={accent}/>
    <group ref={aura}>
      {[-1,1].map(s=><mesh key={s} position={[s*2.22,0,.11]}><boxGeometry args={[.022,2.7,.025]}/><meshBasicMaterial color={emission} toneMapped={false}/></mesh>)}
    </group>
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
    <Installation kind={project.id} accent={accent}/>
    {(project.id==='my-journey'||project.id==='cv-editorial')&&<Sculpture kind={project.id} accent={accent}/>}
    {project.id==='matchup'&&[-1,1].map(s=><mesh key={s} position={[s*2.03,0,.19]}><boxGeometry args={[.035,2.5,.055]}/><meshBasicMaterial color={emission} toneMapped={false}/></mesh>)}
    {project.id==='ashesfire'&&Array.from({length:5},(_,i)=><mesh key={i} position={[-1.7+i*.17,-1.2,.22]}><boxGeometry args={[.10,.12+i*.055,.045]}/><meshBasicMaterial color={accent}/></mesh>)}
    {project.id==='portfolio-narrativo'&&<group position={[0,-1.16,.2]}><mesh><boxGeometry args={[3.8,.018,.04]}/><meshBasicMaterial color={accent}/></mesh>{[-1.5,0,1.5].map(x=><mesh key={x} position={[x,0,.03]}><sphereGeometry args={[.055,10,10]}/><meshBasicMaterial color={accent}/></mesh>)}</group>}
    {project.id==='my-journey'&&!mobile&&<Sparkles count={35} scale={[4,2.3,.35]} position={[0,0,.45]} size={2} speed={.35} color={accent}/>}
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
  const desiredRotation=useMemo(()=>new Quaternion(),[])
  const aimCamera=useMemo(()=>new PerspectiveCamera(),[])
  const notified=useRef<Phase|null>(null)
  useEffect(()=>{notified.current=null},[phase,selected])
  useFrame((_,dt)=>{
    const z=CAMERA_START_Z-progress.current*length
    const side=selected!==null?(selected%2?1:-1):0
    const focus=selected!==null&&phase!=='walking'
    const close=phase==='entering'||phase==='inside'
    const distance=close?1.25:5.8
    const p=targetPosition.set(focus?side*(exhibitX-distance):0,focus?2.16:1.75+Math.sin(progress.current*95)*.018,focus?projectZ(selected!):z)
    const l=targetLook.set(focus?side*exhibitX:Math.sin(yaw.current)*10,focus?2.16:1.75,focus?p.z:z-Math.cos(yaw.current)*10)
    const a=1-Math.exp(-Math.min(dt,.05)*(focus?4:5))
    camera.position.lerp(p,a);look.current.lerp(l,a)
    aimCamera.position.copy(p);aimCamera.lookAt(l);desiredRotation.copy(aimCamera.quaternion);camera.quaternion.slerp(desiredRotation,a)
    if(camera instanceof PerspectiveCamera){
      const aspect=size.width/Math.max(1,size.height)
      const fit=2*Math.atan((4.7*1.12)/(2*5.8*aspect))*180/Math.PI
      const fov=focus&&!close?Math.max(62,Math.min(112,fit)):size.width<700?78:65
      if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*a;camera.updateProjectionMatrix()}
    }
    if((phase==='turning'||phase==='entering')&&notified.current!==phase&&camera.position.distanceTo(p)<.06&&look.current.distanceTo(l)<.06){
      notified.current=phase;onArrive()
    }
  })
  return null
}
function ExhibitShadow({enabled}:{enabled:boolean}){
  const lamp=useRef<SpotLight>(null)
  const target=useRef<Object3D>(null)
  useFrame(({camera})=>{
    const i=nearestIndex(camera.position.z)
    if(!lamp.current||!target.current)return
    lamp.current.visible=enabled&&i!==null
    if(i===null)return
    const side=i%2?1:-1,z=projectZ(i)
    lamp.current.position.set(side*.6,3.9,z+.9)
    target.current.position.set(side*3.1,1.7,z)
    lamp.current.target=target.current
    target.current.updateMatrixWorld()
  })
  return <><object3D ref={target}/><spotLight ref={lamp} color="#ffe0b8" intensity={10} angle={.62} penumbra={.85} distance={7} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-.0003} shadow-normalBias={.025}/></>
}
function Room({progress,selected,phase,quality,yaw,onSelect,onArrive}: {progress: React.RefObject<number>;selected:number|null;phase:Phase;quality:Quality;yaw:React.RefObject<number>;onSelect:(i:number)=>void;onArrive:()=>void}) {
  const materials=useArchitecturalMaterials()
  const woodPhoto=usePhotoMaps('dark_wood',[1,1])
  const floorPhoto=usePhotoMaps('square_floor',[2,ROOM_LENGTH/3.5])
  useEffect(()=>{
    if(!woodPhoto)return
    materials.wall.map=woodPhoto.diff;materials.wall.normalMap=woodPhoto.normal;materials.wall.bumpMap=null;materials.wall.roughnessMap=woodPhoto.rough;materials.wall.needsUpdate=true
  },[materials,woodPhoto])
  const mobile=useThree(s=>s.size.width<700)
  useEffect(()=>()=>{materials.wood.dispose();materials.stone.dispose();materials.woodRelief.dispose();materials.stoneRelief.dispose();materials.wall.dispose()},[materials])
  return <>
    <color attach="background" args={['#17120f']}/>
    <fog attach="fog" args={['#17120f',25,68]}/>
    <ambientLight intensity={phase==='focused'?.18:.28}/>
    <Environment resolution={128}><Lightformer form="rect" intensity={3} color="#ffe0b8" position={[0,5,-10]} scale={[6,25,1]} rotation={[Math.PI/2,0,0]}/><Lightformer form="rect" intensity={1.5} color="#c69a73" position={[4,2,-15]} scale={[30,4,1]} rotation={[0,-Math.PI/2,0]}/></Environment>
    <hemisphereLight args={["#ffe1bf","#38251b",phase==='focused'?.83:1.1]}/>
    <mesh position={[0,.015,ROOM_CENTER]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[7,ROOM_LENGTH]}/><MeshReflectorMaterial resolution={quality==='ultra'?1024:quality==='medium'?256:mobile?512:768} mirror={.22} mixBlur={.35} mixStrength={.48} blur={mobile?[40,18]:[90,35]} map={floorPhoto?.diff??materials.stone} normalMap={floorPhoto?.normal??null} bumpMap={floorPhoto?null:materials.stoneRelief} bumpScale={.022} roughnessMap={floorPhoto?.rough??materials.stoneRelief} color="#9e8b79" metalness={.18} roughness={.46}/></mesh>
    <Block position={[0,4.5,ROOM_CENTER]} size={[7,.3,ROOM_LENGTH]} color="#211813"/>
    <Block position={[0,2.2,ROOM_BACK_Z]} size={[7,4.5,.3]} color="#302219"/>
    {[-1,1].map(side=><group key={side}>
      {wallSegments(side).map(s=><Block key={s.z} position={[side*3.55,2.2,s.z]} size={[.3,4.5,s.length]} color="#372a21"/>)}
      {wallSegments(side).map(s=><Block key={s.z} position={[side*3.36,.15,s.z]} size={[.12,.3,s.length]} color="#916b4d" metal={.65}/>)}
      <Block position={[side*3.35,4.15,ROOM_CENTER]} size={[.12,.12,ROOM_LENGTH]} color="#b98a63" metal={.6}/>
      {Array.from({length:23},(_,i)=>ROOM_FRONT_Z-1.5-i*3).filter(z=>alcoves(side).every(a=>Math.abs(a-z)>alcoveHalf+1.5)).map(z=><group key={z} position={[side*3.39,2.2,z]}>
        <mesh material={materials.wall} receiveShadow><boxGeometry args={[.08,3.85,2.88]}/></mesh>
        <Block position={[-side*.09,0,1.46]} size={[.16,4.25,.085]} color="#211813"/>
        <Block position={[-side*.08,0,1.40]} size={[.05,4.1,.025]} color="#a77d58" metal={.65}/>
      </group>)}
      <mesh position={[side*3.26,4.02,ROOM_CENTER]}><boxGeometry args={[.035,.045 ,ROOM_LENGTH-1]}/><meshBasicMaterial color="#ffdbac" toneMapped={false}/></mesh>
      {wallSegments(side).map(s=><mesh key={s.z} position={[side*3.25,.31,s.z]}><boxGeometry args={[.025,.025,s.length]}/><meshBasicMaterial color="#d3a477" toneMapped={false}/></mesh>)}
    </group>)}
    {Array.from({length:8},(_,i)=><group key={'portal'+i} position={[0,0,6-i*8]}>
      {[-1,1].map(side=><group key={side}>
        <Block position={[side*3.13,2.2,0]} size={[.45,4.4,.52]} color="#241a14"/>
        <Block position={[side*2.89,2.2,0]} size={[.025,4.15,.38]} color="#b98a63" metal={.7}/>
      </group>)}
      <Block position={[0,i%2===0?4.12:4.26,0]} size={[6.1,i%2===0?.55:.3,.65]} color="#241a14"/>
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
    <Block position={[0,.22,ROOM_BACK_Z+1.15]} size={[2.1,.44,1.3]} color="#5d4634" metal={.3}/>
    <group position={[0,1.05,ROOM_BACK_Z+1.15]} rotation={[.3,0,.18]}><mesh><torusGeometry args={[.56,.075,16,64]}/><meshStandardMaterial color="#c18d61" metalness={.85} roughness={.23}/></mesh><mesh rotation={[0,Math.PI/2,0]}><torusGeometry args={[.48,.05,12,48]}/><meshStandardMaterial color="#e0b28a" metalness={.8} roughness={.28}/></mesh></group>
    <pointLight position={[0,3.8,ROOM_BACK_Z+2.2]} color="#ffce99" intensity={12} distance={7}/>
    <ContactStrips/>
    <ExhibitShadow enabled={quality==='ultra'||(!mobile&&quality==='high')}/>
    <Reception progress={progress}/>
    {projects.map((p,i)=><Alcove key={'alcove-'+p.id} project={p} index={i}/>)}
    {projects.map((p,i)=><Suspense key={p.id} fallback={null}><Artwork project={p} index={i} focused={selected===i&&phase==='focused'} onSelect={()=>onSelect(i)}/></Suspense>)}
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
  const [visible,setVisible]=useState(true)
  const [atEnd,setAtEnd]=useState(false)
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
    const update=()=>{setMobile(window.innerWidth<700);const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const value=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-(viewport.current?.clientHeight??window.innerHeight))));if(Math.abs(progress.current-value)>.0005)yaw.current=0;progress.current=value;setAtEnd(value>.94);setNearestProject(nearestIndex(CAMERA_START_Z-value*length))}
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  useEffect(()=>{
    const el=viewport.current
    if(!el)return
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'160px'})
    observer.observe(el)
    return()=>observer.disconnect()
  },[fallback])
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
  const effects=visible&&phase==='walking'&&(quality==='high'||quality==='ultra'||(!mobile&&quality==='auto'&&adaptiveDpr>=2))

  return <div className="gallery-shell">
    {!fallback&&<div ref={section} className="gallery-scroll"><div ref={viewport} className="gallery-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUpCapture={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={pointerEnd}>
      <Canvas frameloop={visible&&phase!=='inside'?'always':'never'} shadows dpr={[1,dpr]} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} camera={{position:[0,1.75,CAMERA_START_Z],fov:mobile?78:65,near:.1,far:80}} fallback={<p>WebGL no disponible.</p>}>
        <Suspense fallback={null}><Room progress={progress} selected={selected} phase={phase} quality={quality} yaw={yaw} onSelect={select} onArrive={arrive}/><AdaptiveQuality enabled={quality==='auto'&&phase==='walking'} onChange={setAdaptiveDpr}/>{effects&&<GalleryEffects occlusion={quality==='ultra'&&!mobile}/>}</Suspense>
      </Canvas>
      <div className="gallery-hud"><span>04 / THE EXHIBITION</span></div>
      <div className="gallery-quality"><AmbientSound/><label>Calidad <select value={quality} onChange={e=>setQuality(e.target.value as Quality)} aria-label="Calidad gráfica"><option value="auto">Auto</option><option value="medium">Equilibrada</option><option value="high">Alta</option><option value="ultra">Ultra</option></select></label></div>
      <div className="gallery-instruction">{phase==='turning'?'Girando hacia la exposición…':phase==='focused'?'Toca otra vez para entrar · Desliza para continuar':phase==='entering'||phase==='inside'?'Entrando en la experiencia…':atEnd?'Desliza para continuar hacia mis competencias':nearestProject===null?'Desliza hacia arriba para caminar · A los lados para mirar':'Toca una exposición para observarla'}</div>
      {phase==='focused'&&selected!==null&&<div className="gallery-focus"><div className="gallery-focus-copy"><small>EXHIBITION / {String(selected+1).padStart(2,'0')}</small><strong>{projects[selected].title}</strong><p>{projects[selected].accent}</p></div><button onClick={()=>select(selected)}>Entrar al proyecto ↗</button><button onClick={resume}>Continuar recorrido →</button></div>}
      {phase==='walking'&&atEnd&&<div className="gallery-end-actions"><a href="https://github.com/Maikol-2004" target="_blank" rel="noreferrer">GitHub ↗</a><a href={import.meta.env.BASE_URL+'Michael-Guzman-CV.pdf'} download>Descargar CV ↓</a><a href="#habilidades">Competencias →</a></div>}
      {phase==='walking'&&nearestProject!==null&&<div className="gallery-near"><button onClick={()=>select(nearestProject)}>Observar {projects[nearestProject].title} ↗</button></div>}
    </div></div>}
    <div className="gallery-access" aria-label="Acceso directo a proyectos">{projects.map(p=><button key={p.id} className="pill" onClick={e=>onOpen(p,e.currentTarget.getBoundingClientRect())}>{p.title} ↗</button>)}</div>
    <p className="gallery-material-credit">Materiales fotográficos: <a href="https://polyhaven.com/" target="_blank" rel="noreferrer">Poly Haven (CC0)</a> · con alternativa procedural.</p>
  </div>
}
