import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, useTexture, Environment, Lightformer } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Vector3, Color, Matrix4, Mesh, InstancedMesh, Group, PointLight, SpotLight, Object3D, Quaternion, PerspectiveCamera, LinearMipmapLinearFilter, LinearFilter, SRGBColorSpace, CanvasTexture, RepeatWrapping, MeshStandardMaterial } from 'three'
import { projects } from '../data/profile'
import type { Project } from '../data/types'
import { ProjectIndex } from '../components/ProjectIndex'
import { GalleryEffects } from './GalleryEffects'
import { CAMERA_START_Z, CAMERA_END_Z, CEILING_COUNT, CAMERA_LENGTH as length, projectZ, nearestProject as findNearest, scrollProgress, focusFov, nextSelection, qualityStep, renderDpr, reflectionSize, ceilingIndices, type GalleryPhase as Phase } from '../lib/galleryLogic'
import { transitionShot, posterUrl, cameraEase, fitScreenDistance, validScreenRect } from '../lib/projectTransition'
import './projectGallery.css'

type Props = { onOpen: (p: Project, rect: DOMRect | null) => void; activeProjectId?: string; paused?:boolean }
type Quality = 'auto' | 'medium' | 'high' | 'ultra'
const ROOM_FRONT_Z = 12
const ROOM_BACK_Z = CAMERA_END_Z-5
const ROOM_LENGTH = ROOM_FRONT_Z - ROOM_BACK_Z
const ROOM_CENTER = (ROOM_FRONT_Z + ROOM_BACK_Z) / 2
const exhibitX = 3.275
const alcoveHalf = 2.68
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
const nearestIndex = (z:number)=>findNearest(z,projects.length)
const url = (name: string) => import.meta.env.BASE_URL + 'projects/' + name + '.webp'

const ceilingPositions:[number,number,number][]=Array.from({length:CEILING_COUNT},(_,i)=>[0,4.29,10-i*3.3])
/** Batch identical static geometry so the main and reflected views use fewer draw calls. */
function BoxBatch({positions,size,color,metal=0,roughness=.7,material,glow}:{positions:[number,number,number][];size:[number,number,number];color?:string;metal?:number;roughness?:number;material?:MeshStandardMaterial;glow?:Color}){
  const ref=useRef<InstancedMesh>(null)
  useLayoutEffect(()=>{
    const mesh=ref.current;if(!mesh)return
    const matrix=new Matrix4()
    positions.forEach((p,i)=>mesh.setMatrixAt(i,matrix.makeTranslation(...p)))
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere()
  },[positions])
  return <instancedMesh ref={ref} args={[undefined,undefined,positions.length]} material={material} receiveShadow>
    <boxGeometry args={size}/>
    {!material&&(glow?<meshBasicMaterial color={glow} toneMapped={false}/>:<meshStandardMaterial color={color} metalness={metal} roughness={roughness}/>)}
  </instancedMesh>
}
/** All fixtures remain visible; only five nearby lights are evaluated by the GPU. */
function CeilingLights(){
  const group=useRef<Group>(null)
  const last=useRef(-1)
  useFrame(({camera})=>{
    const indices=ceilingIndices(camera.position.z)
    if(!group.current||last.current===indices[0])return
    last.current=indices[0]
    indices.forEach(index=>{
      const lamp=group.current!.children[index%5] as PointLight
      lamp.position.set(0,4.09,ceilingPositions[index][2])
    })
  })
  return <group ref={group}>{Array.from({length:5},(_,i)=><pointLight key={i} position={[0,4.09,10-i*3.3]} color="#f2e6d4" intensity={5.5} distance={10} decay={2}/>)}</group>
}
function ExhibitionLights({selected,phase}:{selected:number|null;phase:Phase}){
  const group=useRef<Group>(null)
  useFrame(({camera},dt)=>{
    if(!group.current)return
    const nearest=projects.map((_,i)=>i).sort((a,b)=>Math.abs(camera.position.z-projectZ(a))-Math.abs(camera.position.z-projectZ(b))).slice(0,2)
    if(selected!==null&&phase!=='walking'&&!nearest.includes(selected))nearest[1]=selected
    nearest.forEach((i,slot)=>{
      const light=group.current!.children[slot] as PointLight
      const p=projects[i],side=i%2?1:-1
      light.position.set(side*(exhibitX-.7),3.6,projectZ(i))
      light.color.set(p.id==='matchup'?'#a8ed46':p.tone)
      const proximity=Math.max(0,1-Math.abs(camera.position.z-projectZ(i))/9)
      const target=2+5*proximity+(selected===i&&phase==='focused'?3:0)
      light.intensity+=(target-light.intensity)*(1-Math.exp(-dt*4))
    })
  })
  return <group ref={group}>{[0,1].map(i=><pointLight key={i} intensity={2} distance={5}/>)}</group>
}
function Block({ position, size, color, metal = 0, roughness = .7 }: { position: [number,number,number]; size: [number,number,number]; color: string; metal?: number; roughness?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={roughness}/></mesh>
}
/** Shared, deterministic stone and brushed bronze maps. No runtime network dependencies. */
function useArchitecturalMaterials(){
  return useMemo(()=>{
    const n=512
    const canvas=()=>{const c=document.createElement('canvas');c.width=c.height=n;return c}
    const color=canvas(),height=canvas(),metal=canvas()
    const cc=color.getContext('2d')!,hc=height.getContext('2d')!,mc=metal.getContext('2d')!
    const rgb=cc.createImageData(n,n),relief=hc.createImageData(n,n),brushed=mc.createImageData(n,n)
    const fract=(x:number)=>x-Math.floor(x)
    const hash=(x:number,y:number)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453123)
    const grids=new Map([5,17,67].map(period=>[period,Float32Array.from({length:period*period},(_,i)=>hash(i%period,Math.floor(i/period)))]))
    const noise=(x:number,y:number,period:number)=>{
      const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy
      const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy)
      const wrap=(k:number)=>(k%period+period)%period
      const grid=grids.get(period)!
      const a=grid[wrap(iy)*period+wrap(ix)],b=grid[wrap(iy)*period+wrap(ix+1)]
      const d=grid[wrap(iy+1)*period+wrap(ix)],e=grid[wrap(iy+1)*period+wrap(ix+1)]
      return (a+(b-a)*u)*(1-v)+(d+(e-d)*u)*v
    }
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const i=(y*n+x)*4, u=x/n,v=y/n
      const broad=noise(u*5,v*5,5),medium=noise(u*17,v*17,17),fine=noise(u*67,v*67,67),grit=hash(x,y)
      const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin((u*5+v*3+broad*.8)*Math.PI))*7),2)
      const h=.44*broad+.25*medium+.19*fine+.12*grit
      const k=(h-.5)*47+vein*7
      rgb.data[i]=80+k;rgb.data[i+1]=77+k;rgb.data[i+2]=72+k;rgb.data[i+3]=255
      const reliefValue=55+h*145-vein*15
      relief.data[i]=relief.data[i+1]=relief.data[i+2]=reliefValue;relief.data[i+3]=255
      const brushing=(hash(x,0)-.5)*23+(hash(x,y)-.5)*5
      brushed.data[i]=157+brushing;brushed.data[i+1]=136+brushing;brushed.data[i+2]=111+brushing;brushed.data[i+3]=255
    }
    cc.putImageData(rgb,0,0);hc.putImageData(relief,0,0);mc.putImageData(brushed,0,0)
    const tex=(c:HTMLCanvasElement,isColor:boolean)=>{
      const t=new CanvasTexture(c);if(isColor)t.colorSpace=SRGBColorSpace
      t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4;return t
    }
    const stone=tex(color,true),bump=tex(height,false),bronze=tex(metal,true)
    const wall=new MeshStandardMaterial({map:stone,bumpMap:bump,bumpScale:.085,roughness:.88,metalness:.02})
    const trim=new MeshStandardMaterial({map:bronze,metalness:.8,roughness:.34})
    return {stone,bump,bronze,wall,trim}
  },[])
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
      <Block position={[0,0,-.08]} size={[5.1,3.3,.18]} color="#27282a"/>
      <Block position={[0,1.67,.02]} size={[5.1,.035,.05]} color="#d2a27e" metal={.7}/>
      <Block position={[0,-1.67,.02]} size={[5.1,.035,.05]} color="#d2a27e" metal={.7}/>
      <Html transform position={[0,0,.12]} distanceFactor={5} style={{pointerEvents:'none'}}><div className="gallery-reception"><strong>MG.</strong><span>THE EXHIBITION</span><p>Siete proyectos. Una trayectoria.</p></div></Html>
    </group>)}
    <pointLight ref={light} position={[0,3.4,1.5]} color="#ecddc7" intensity={11} distance={10}/>
    <Html position={[0,3.35,-2.4]} transform distanceFactor={7} style={{pointerEvents:'none'}}><div className="gallery-entry-sign">THE EXHIBITION <span>↓</span></div></Html>
  </group>
}
/** The artwork is a single near-square printed digital exhibition, without props or extra frames. */
function Artwork({project,index,onSelect}:{project:Project;index:number;onSelect:()=>void}){
  const side=index%2?1:-1,z=projectZ(index)
  const texture=useTexture(posterUrl(project.id))
  const gl=useThree(s=>s.gl)
  useEffect(()=>{
    texture.colorSpace=SRGBColorSpace
    texture.anisotropy=gl.capabilities.getMaxAnisotropy()
    texture.generateMipmaps=true
    texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter
    texture.needsUpdate=true
  },[texture,gl])
  return <group position={[side*3.30,2.20,z]} rotation={[0,-side*Math.PI/2,0]}>
    <mesh name={'transition-screen-'+project.id} position={[0,0,.025]} onClick={e=>{e.stopPropagation();onSelect()}}>
      <planeGeometry args={[4.8,3.84]}/>
      <meshBasicMaterial map={texture} toneMapped={false}/>
    </mesh>
  </group>
}
/** Project the artwork plane into browser coordinates for a seamless handoff. */
function screenRect(mesh:Mesh,camera:PerspectiveCamera,canvas:HTMLCanvasElement){
  mesh.geometry.computeBoundingBox()
  const bounds=mesh.geometry.boundingBox
  if(!bounds)return null
  mesh.updateWorldMatrix(true,false);camera.updateMatrixWorld()
  const viewport=canvas.getBoundingClientRect()
  const corners=[new Vector3(bounds.min.x,bounds.min.y,0),new Vector3(bounds.max.x,bounds.min.y,0),new Vector3(bounds.min.x,bounds.max.y,0),new Vector3(bounds.max.x,bounds.max.y,0)].map(v=>mesh.localToWorld(v).project(camera))
  const xs=corners.map(v=>viewport.left+(v.x+1)*viewport.width/2)
  const ys=corners.map(v=>viewport.top+(1-v.y)*viewport.height/2)
  const rect=new DOMRect(Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))
  return validScreenRect(rect,window.innerWidth,window.innerHeight)?rect:null
}
function Camera({ progress, selected, phase, yaw, onArrive }: { progress: React.RefObject<number>; selected: number|null; phase:Phase; yaw:React.RefObject<number>; onArrive: (rect?:DOMRect|null) => void }) {
  const {camera,size,scene,gl}=useThree()
  const look=useRef(new Vector3(0,1.75,CAMERA_START_Z-10))
  const targetPosition=useMemo(()=>new Vector3(),[])
  const targetLook=useMemo(()=>new Vector3(),[])
  const desiredRotation=useMemo(()=>new Quaternion(),[])
  const aimCamera=useMemo(()=>new PerspectiveCamera(),[])
  const normal=useMemo(()=>new Vector3(),[])
  const screenRotation=useMemo(()=>new Quaternion(),[])
  const move=useRef({phase:'' as string,selected:null as number|null,elapsed:0,start:new Vector3(),rotation:new Quaternion(),fov:65})
  const notified=useRef<Phase|null>(null)
  useFrame((_,dt)=>{
    if(!(camera instanceof PerspectiveCamera))return
    const z=CAMERA_START_Z-progress.current*length
    const side=selected!==null?(selected%2?1:-1):0
    const focus=selected!==null&&phase!=='walking'
    const close=phase==='entering'||phase==='inside'
    const aspect=size.width/Math.max(1,size.height)
    let fov=close?Math.max(52,focusFov(aspect)-10):focus?focusFov(aspect):size.width<700?78:65
    const p=targetPosition.set(focus?side*(exhibitX-(close?1.5:5.8)):0,focus?2.16:1.75+Math.sin(progress.current*95)*.018,focus?projectZ(selected!):z)
    const l=targetLook.set(focus?side*exhibitX:Math.sin(yaw.current)*10,focus?2.16:1.75,focus?p.z:z-Math.cos(yaw.current)*10)
    const screen=focus&&selected!==null?scene.getObjectByName('transition-screen-'+projects[selected].id):null
    if(screen instanceof Mesh){
      screen.updateWorldMatrix(true,false)
      screen.getWorldPosition(l);screen.getWorldQuaternion(screenRotation)
      normal.set(0,0,1).applyQuaternion(screenRotation)
      if(!screen.geometry.boundingBox)screen.geometry.computeBoundingBox()
      const bounds=screen.geometry.boundingBox
      const distance=bounds?Math.min(6.1,fitScreenDistance(bounds.max.x-bounds.min.x,bounds.max.y-bounds.min.y,aspect,fov)):(close?4.5:5.8)
      p.copy(l).addScaledVector(normal,distance)
    }
    aimCamera.position.copy(p);aimCamera.lookAt(l);desiredRotation.copy(aimCamera.quaternion)
    const m=move.current
    if(m.phase!==phase||m.selected!==selected){
      m.phase=phase;m.selected=selected;m.elapsed=0;m.start.copy(camera.position);m.rotation.copy(camera.quaternion);m.fov=camera.fov;notified.current=null
    }
    if(phase==='turning'||phase==='entering'){
      m.elapsed+=Math.min(dt,.12)
      const duration=phase==='turning'?Math.min(1.35,.75+m.start.distanceTo(p)*.035):.82
      const t=Math.min(1,m.elapsed/duration),e=cameraEase(t)
      camera.position.lerpVectors(m.start,p,e);camera.quaternion.copy(m.rotation).slerp(desiredRotation,e)
      camera.fov=m.fov+(fov-m.fov)*e;camera.updateProjectionMatrix()
      if(t===1&&notified.current!==phase){
        notified.current=phase
        onArrive(phase==='entering'&&screen instanceof Mesh?screenRect(screen,camera,gl.domElement):null)
      }
    }else{
      const a=1-Math.exp(-Math.min(dt,.1)*(focus?5:6))
      camera.position.lerp(p,a);camera.quaternion.slerp(desiredRotation,a)
      if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*a;camera.updateProjectionMatrix()}
    }
    look.current.copy(l)
  })
  return null
}
function ExhibitShadow({enabled}:{enabled:boolean}){
  const lamp=useRef<SpotLight>(null)
  const target=useRef<Object3D>(null)
  const previous=useRef<number|null>(null)
  useFrame(({camera})=>{
    const i=nearestIndex(camera.position.z)
    if(!lamp.current||!target.current)return
    lamp.current.intensity=enabled&&i!==null?10:0
    if(i===null||i===previous.current)return
    previous.current=i
    const side=i%2?1:-1,z=projectZ(i)
    lamp.current.position.set(side*.6,3.9,z+.9)
    target.current.position.set(side*exhibitX,1.7,z)
    lamp.current.target=target.current
    target.current.updateMatrixWorld()
    lamp.current.shadow.needsUpdate=true
  })
  return <><object3D ref={target}/><spotLight ref={lamp} color="#ffe0b8" intensity={0} angle={.62} penumbra={.85} distance={7} castShadow shadow-autoUpdate={false} shadow-mapSize-width={768} shadow-mapSize-height={768} shadow-bias={-.0003} shadow-normalBias={.025}/></>
}
function Room({progress,selected,phase,quality,adaptiveDpr,yaw,onSelect,onArrive}: {progress: React.RefObject<number>;selected:number|null;phase:Phase;quality:Quality;adaptiveDpr:number;yaw:React.RefObject<number>;onSelect:(i:number)=>void;onArrive:(rect?:DOMRect|null)=>void}) {
  const materials=useArchitecturalMaterials()
  const mobile=useThree(s=>s.size.width<700)
  const ceilingGlow=useMemo(()=>new Color('#f2e7d7').multiplyScalar(2.25),[])
  const accentGlow=useMemo(()=>new Color('#e0c4a0').multiplyScalar(1.55),[])
  const architecture=useMemo(()=>{
    const positions=(fn:(side:number,z:number)=>[number,number,number])=>[-1,1].flatMap(side=>Array.from({length:projects.length+3},(_,i)=>fn(side,6-i*8)))
    const panels=([-1,1] as const).flatMap(side=>wallSegments(side).flatMap(seg=>{
      const count=Math.max(1,Math.floor(seg.length/2.3))
      const step=seg.length/count
      return Array.from({length:count},(_,i)=>({side,z:seg.z-seg.length/2+step*(i+.5),length:step-.055}))
    }))
    const flutes: [number,number,number][]=[]
    for(const side of [-1,1])for(const z of Array.from({length:projects.length+3},(_,i)=>6-i*8)){
      if(alcoves(side).some(a=>Math.abs(a-z)<3.05))continue
      for(let j=0;j<5;j++)flutes.push([side*2.82,2.28,z+(j-2)*.12])
    }
    return {panels,flutes,
      pillars:positions((s,z)=>[s*3.14,2.25,z]),
      pillarInset:positions((s,z)=>[s*2.94,2.25,z]),
      pillarEdges:positions((s,z)=>[s*2.83,2.25,z+.35]),
      pillarLights:positions((s,z)=>[s*2.81,2.25,z-.35]),
      crossbeams:Array.from({length:projects.length+3},(_,i):[number,number,number]=>[0,4.13,6-i*8]),
      crossTrim:Array.from({length:projects.length+3},(_,i):[number,number,number]=>[0,3.965,6-i*8]),
      coves:[[-2.67,4.13,ROOM_CENTER],[2.67,4.13,ROOM_CENTER]] as [number,number,number][],
      coveLights:[[-2.50,3.975,ROOM_CENTER],[2.50,3.975,ROOM_CENTER]] as [number,number,number][],
      fixtures:ceilingPositions.map(([x,y,z]):[number,number,number]=>[x,y+.04,z]),
      strips:ceilingPositions.map(([x,y,z]):[number,number,number]=>[x,y-.067,z])
    }
  },[])
  useEffect(()=>()=>{materials.stone.dispose();materials.bump.dispose();materials.bronze.dispose();materials.wall.dispose();materials.trim.dispose()},[materials])
  return <>
    <color attach="background" args={['#141619']}/>
    <fog attach="fog" args={['#141619',30,72]}/>
    <ambientLight intensity={phase==='focused'?.25:.38}/>
    <Environment resolution={128}><Lightformer form="rect" intensity={3} color="#f4e8d5" position={[0,5,-10]} scale={[6,25,1]} rotation={[Math.PI/2,0,0]}/><Lightformer form="rect" intensity={1.5} color="#b8ac9c" position={[4,2,-15]} scale={[30,4,1]} rotation={[0,-Math.PI/2,0]}/></Environment>
    <hemisphereLight args={["#f6ebd9","#343b42",phase==='focused'?.83:1.1]}/>
    {/* Keep the dark, continuous floor and the optimized real reflection buffer. */}
    <mesh position={[0,.015,ROOM_CENTER]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={[7,ROOM_LENGTH]}/>
      <MeshReflectorMaterial resolution={reflectionSize(quality,adaptiveDpr,mobile)} mirror={.40} mixStrength={4.5} mixBlur={0} blur={[0,0]} color="#101113" metalness={.12} roughness={.18}/>
    </mesh>
    <Block position={[0,4.5,ROOM_CENTER]} size={[7,.3,ROOM_LENGTH]} color="#242628"/>
    <Block position={[0,2.2,ROOM_BACK_Z]} size={[7,4.5,.3]} color="#343437"/>
    {[-1,1].map(side=><group key={side}>
      <Block position={[side*3.55,2.2,ROOM_CENTER]} size={[.3,4.5,ROOM_LENGTH]} color="#303134"/>
      <Block position={[side*3.33,.12,ROOM_CENTER]} size={[.17,.24,ROOM_LENGTH]} color="#222426" metal={.25}/>
      <mesh position={[side*3.229,.25,ROOM_CENTER]}><boxGeometry args={[.024,.035,ROOM_LENGTH-1]}/><meshBasicMaterial color={accentGlow} toneMapped={false}/></mesh>
      <Block position={[side*3.34,4.22,ROOM_CENTER]} size={[.16,.18,ROOM_LENGTH]} color="#383633"/>
      <mesh position={[side*3.23,4.11,ROOM_CENTER]}><boxGeometry args={[.035,.035,ROOM_LENGTH-1]}/><meshBasicMaterial color={accentGlow} toneMapped={false}/></mesh>
    </group>)}
    {/* Real stone slabs, slightly stepped relative to one another. Nothing overlaps the four posters. */}
    {architecture.panels.map((p,i)=><mesh key={i} position={[p.side*(i%2?3.32:3.36),2.24,p.z]} material={materials.wall} receiveShadow><boxGeometry args={[.12,3.85,p.length]}/></mesh>)}
    <BoxBatch positions={architecture.pillars} size={[.49,4.38,.76]} material={materials.wall}/>
    <BoxBatch positions={architecture.pillarInset} size={[.18,3.98,.66]} color="#292b2d" metal={.25}/>
    <BoxBatch positions={architecture.flutes} size={[.13,3.72,.058]} material={materials.trim}/>
    <BoxBatch positions={architecture.pillarEdges} size={[.045,4.12,.035]} material={materials.trim}/>
    <BoxBatch positions={architecture.pillarLights} size={[.025,3.58,.028]} glow={accentGlow}/>
    {/* Layered ceiling: a recessed central channel plus broad crossbeams and continuous coves. */}
    <BoxBatch positions={architecture.coves} size={[.72,.28,ROOM_LENGTH]} color="#2d2d2f" metal={.18}/>
    <BoxBatch positions={architecture.coveLights} size={[.075,.028,ROOM_LENGTH-1]} glow={ceilingGlow}/>
    <BoxBatch positions={architecture.crossbeams} size={[5.8,.28,.66]} color="#303031" metal={.12}/>
    <BoxBatch positions={architecture.crossTrim} size={[5.74,.035,.12]} material={materials.trim}/>
    <BoxBatch positions={architecture.fixtures} size={[6.7,.15,.38]} color="#242527"/>
    <BoxBatch positions={architecture.strips} size={[5.8,.025,.105]} glow={ceilingGlow}/>
    <CeilingLights/>
    <ExhibitionLights selected={selected} phase={phase}/>
    <mesh position={[0,2.3,ROOM_BACK_Z+.26]} material={materials.wall}><boxGeometry args={[5.4,4.1,.14]}/></mesh>
    <Block position={[0,4.32,ROOM_BACK_Z+.44]} size={[5.4,.08,.16]} color="#b69d80" metal={.7}/>
    <Html position={[0,2.35,ROOM_BACK_Z+.55]} transform distanceFactor={6} style={{pointerEvents:'none'}}><div className="gallery-end"><strong>MG.</strong><span>ARCHIVO / 07</span><p>El final del recorrido.</p></div></Html>
    <pointLight position={[0,3.8,ROOM_BACK_Z+2.2]} color="#e8d5bc" intensity={12} distance={7}/>
    <ContactStrips/>
    {quality==='ultra'&&!mobile&&<ExhibitShadow enabled/>}
    <Reception progress={progress}/>
    {projects.map((p,i)=><Suspense key={p.id} fallback={null}><Artwork project={p} index={i} onSelect={()=>onSelect(i)}/></Suspense>)}
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
  const sample=useRef({time:0,frames:0,level:1,good:0})
  useFrame((_,dt)=>{
    if(!enabled||dt>1){sample.current.time=0;sample.current.frames=0;sample.current.good=0;return}
    const s=sample.current;s.time+=dt;s.frames++
    if(s.time>=1.5){const fps=s.frames/s.time;s.good=fps>57?s.good+1:0
      const next=fps<45||s.good>=4?qualityStep(fps,s.level,window.innerWidth<700):s.level
      if(next!==s.level){s.level=next;s.good=0;onChange(next)}s.time=0;s.frames=0}
  })
  return null
}
export default function ProjectGallery({onOpen,activeProjectId,paused=false}:Props){
  const section=useRef<HTMLDivElement>(null)
  const viewport=useRef<HTMLDivElement>(null)
  const progress=useRef(0)
  const yaw=useRef(0)
  const drag=useRef<{x:number;y:number;start:number;moved:boolean}|null>(null)
  const ignoreClick=useRef(0)
  const [adaptiveDpr,setAdaptiveDpr]=useState(1)
  const [screen,setScreen]=useState(()=>({width:window.innerWidth,height:window.innerHeight,native:window.devicePixelRatio||1}))
  useEffect(()=>{const update=()=>setScreen({width:window.innerWidth,height:window.innerHeight,native:window.devicePixelRatio||1});window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update)},[])
  const [visible,setVisible]=useState(false)
  const [loaded,setLoaded]=useState(false)
  const [tabActive,setTabActive]=useState(!document.hidden)
  useEffect(()=>{const update=()=>setTabActive(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[])
  const [atEnd,setAtEnd]=useState(false)
  const [nearestProject,setNearestProject]=useState<number|null>(null)
  const [selected,setSelected]=useState<number|null>(null)
  const [fallback,setFallback]=useState(false)
  const [ready,setReady]=useState(false)
  const [mobile,setMobile]=useState(false)
  const [phase,setPhase]=useState<Phase>('walking')
  const [quality,setQuality]=useState<Quality>('auto')
  const savedScroll=useRef(0)
  useEffect(()=>{
    const canvas=document.createElement('canvas')
    const gl=canvas.getContext('webgl2')
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!gl)setFallback(true)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    const update=()=>{setMobile(window.innerWidth<700);const el=section.current;if(!el)return;const r=el.getBoundingClientRect();const value=scrollProgress(r.top,r.height,viewport.current?.clientHeight??window.innerHeight);if(Math.abs(progress.current-value)>.0005)yaw.current=0;progress.current=value;viewport.current?.style.setProperty('--gallery-entry-fade',String(Math.max(0,1-value/.09)));setAtEnd(value>.975);setNearestProject(nearestIndex(CAMERA_START_Z-value*length))}
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  useEffect(()=>{
    const el=viewport.current
    if(!el)return
    const observer=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(entry.isIntersecting)setLoaded(true)},{rootMargin:'220px'})
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
    if(phase!=='focused'&&phase!=='turning'&&phase!=='entering')return
    const resume=()=>{if(Math.abs(window.scrollY-savedScroll.current)>40){setPhase('walking');setSelected(null)}}
    window.addEventListener('scroll',resume,{passive:true})
    return()=>window.removeEventListener('scroll',resume)
  },[phase])
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&(phase==='focused'||phase==='turning'||phase==='entering')){setSelected(null);setPhase('walking')}}
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)
  },[phase])
  function select(i:number){
    if(performance.now()<ignoreClick.current)return
    if(phase==='focused'&&projects[i].detailMode==='announcement')return
    yaw.current=0
    const next=nextSelection(phase,selected,i)
    if(next==='turning'&&phase==='walking'){savedScroll.current=window.scrollY;setSelected(i);const shot=transitionShot(projects[i].id);if(shot){const img=new Image();img.src=url(shot.src);void img.decode().catch(()=>{})}}
    if(next!==phase)setPhase(next)
  }
  function resume(){yaw.current=0;setSelected(null);setPhase('walking')}
  function arrive(screenOrigin?:DOMRect|null){
    if(selected===null)return
    if(phase==='turning'){setPhase('focused');return}
    if(phase!=='entering'||projects[selected].detailMode==='announcement')return
    const r=viewport.current?.getBoundingClientRect()
    setPhase('inside')
    onOpen(projects[selected],screenOrigin??(r?new DOMRect(r.x+r.width*.1,r.y+r.height*.12,r.width*.8,r.height*.76):null))
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
  const walkingDpr=renderDpr(quality,adaptiveDpr,screen.width,screen.height,screen.native)
  // Keep the frontal artwork crisp, without raising the full walking render budget.
  const dpr=phase==='focused'||phase==='entering'||phase==='inside'?Math.max(walkingDpr,Math.min(screen.native,1.5,Math.sqrt(2400000/Math.max(1,screen.width*screen.height)))):walkingDpr
  const directory=atEnd&&phase==='walking'
  const effects=visible&&tabActive&&!paused&&!directory&&phase==='walking'&&quality==='ultra'&&!mobile

  return <div className="gallery-shell" id="galeria-inmersiva">
    {!fallback&&<div ref={section} className="gallery-scroll"><div ref={viewport} className="gallery-viewport" data-atmosphere="architecture" data-directory={directory} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUpCapture={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={pointerEnd}>
      {loaded&&<Canvas onCreated={({gl})=>{setReady(true);gl.domElement.addEventListener('webglcontextlost',()=>setFallback(true),{once:true})}} frameloop={visible&&tabActive&&!paused&&!activeProjectId&&phase!=='inside'?'always':'never'} shadows={quality==='ultra'&&!mobile} dpr={dpr} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} camera={{position:[0,1.75,CAMERA_START_Z],fov:mobile?78:65,near:.1,far:115}} fallback={<p>WebGL no disponible.</p>}>
        <Suspense fallback={null}><Room progress={progress} selected={selected} phase={phase} quality={quality} adaptiveDpr={adaptiveDpr} yaw={yaw} onSelect={select} onArrive={arrive}/><AdaptiveQuality enabled={quality==='auto'&&phase==='walking'} onChange={setAdaptiveDpr}/>{effects&&<GalleryEffects/>}</Suspense>
      </Canvas>}
      <div className="gallery-entry-fade" aria-hidden="true"/>
      {!ready&&<div className="gallery-loading" role="status">Preparando la exposición…</div>}
      <div className="gallery-hud"><span>04 / THE EXHIBITION</span></div>
      <div className="gallery-quality"><AmbientSound/><label>Calidad <select value={quality} onChange={e=>setQuality(e.target.value as Quality)} aria-label="Calidad gráfica"><option value="auto">Auto</option><option value="medium">Equilibrada</option><option value="high">Alta</option><option value="ultra">Ultra</option></select></label></div>
      <div className="gallery-instruction">{phase==='turning'?'Girando hacia la exposición…':phase==='focused'?(selected!==null&&projects[selected].detailMode==='announcement'?'En desarrollo · Próximamente':'Pulsa otra vez para entrar · Desplázate para continuar'):phase==='entering'||phase==='inside'?'Entrando en la experiencia…':atEnd?'Desliza para continuar hacia mis competencias':nearestProject===null?'Desplázate para avanzar · Arrastra a los lados para mirar':'Toca una exposición para observarla'}</div>
      {phase==='focused'&&selected!==null&&<div className="gallery-focus">{projects[selected].detailMode==='announcement'?<span className="gallery-coming">En desarrollo · Próximamente</span>:<button onClick={()=>select(selected)}>Entrar al proyecto ↗</button>}<button onClick={resume}>Continuar recorrido →</button></div>}
      {directory&&<div className="gallery-wall-directory"><ProjectIndex onOpen={onOpen}/></div>}
      {phase==='walking'&&!directory&&nearestProject!==null&&<div className="gallery-near"><button onClick={()=>select(nearestProject)}>Observar {projects[nearestProject].title} ↗</button></div>}
    </div></div>}
    {fallback&&<div className="container"><p className="gallery-fallback-note">Explora los proyectos directamente, sin animación 3D.</p><ProjectIndex onOpen={onOpen} fallback/></div>}
    <div className="gallery-return"><a className="pill" href="#proyectos">Volver al inicio ↑</a><a className="pill" href="#habilidades">Continuar a competencias →</a></div>
    <p className="gallery-material-credit">Portadas editoriales de cada proyecto · capturas originales y demostraciones en el interior.</p>
  </div>
}
