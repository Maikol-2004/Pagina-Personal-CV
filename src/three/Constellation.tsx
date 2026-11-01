/**
 * Escena 3D de la Professional Neural Constellation (React Three Fiber).
 *  - Dibujado progresivo vinculado al scroll (`progressRef`, 0 → 1), reversible.
 *  - Hover: ilumina la rama y atenúa el resto. Click: la cámara viaja a la rama y se despliegan niveles.
 *  - Sólo se renderiza mientras la sección es visible (`active`).
 */
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MathUtils,
  Vector3,
  type Group,
  type LineSegments,
  type Points,
  type Sprite,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { memo, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { profile } from '../data/profile'
import type { Stage } from '../data/types'
import type { Focus } from './focus'
import { buildGraph, type Branch, type Cat2, type Graph } from './graph'
import { linesGeometry, pointsGeometry } from './geometry'
import { makeLineMaterial, makePointMaterial, makeShared, type SharedUniforms } from './materials'

interface Props {
  stages: Stage[]
  progressRef: MutableRefObject<number>
  focus: Focus
  onFocus: (f: Focus) => void
  zoom: number
  active: boolean
  coarse: boolean
  reduced: boolean
}

const IVORY = new Color('#f6efe4')
let haloTexture: CanvasTexture | null = null
function getHalo() {
  if (haloTexture) return haloTexture
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,0.9)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.28)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  haloTexture = new CanvasTexture(c)
  return haloTexture
}

const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))
const smooth = (a: number, b: number, x: number) => MathUtils.smoothstep(x, a, b)

/** Nodo: punto sólido + halo aditivo + esfera invisible más grande para facilitar el toque. */
function Node({
  position,
  color,
  radius,
  scale,
  enabled,
  onOver,
  onOut,
  onClick,
  groupRef,
}: {
  position: [number, number, number]
  color: Color
  radius: number
  scale: number
  enabled: boolean
  onOver?: () => void
  onOut?: () => void
  onClick?: () => void
  groupRef: (g: Group | null) => void
}) {
  const halo = useRef<Sprite>(null)
  useEffect(() => {
    if (halo.current) halo.current.material.map = getHalo()
  }, [])
  const stop = (fn?: () => void) => (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!enabled) return
    e.stopPropagation()
    fn?.()
  }
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh onPointerOver={stop(onOver)} onPointerOut={stop(onOut)} onClick={stop(onClick)}>
        <sphereGeometry args={[radius * 3.4, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <sprite ref={halo} scale={[radius * 9, radius * 9, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

interface Ctx {
  shared: SharedUniforms
  progressRef: MutableRefObject<number>
  focus: Focus
  hovered: string | null
  setHovered: (id: string | null) => void
  onFocus: (f: Focus) => void
  reduced: boolean
}

/** Dibuja líneas+puntos de un conjunto de buffers con materiales propios. */
function Strands({
  lines,
  points,
  color,
  growRef,
  opacityRef,
  sizeRef,
  lineAlpha = 0.85,
  shared,
}: {
  lines?: ReturnType<typeof linesGeometry>
  points: ReturnType<typeof pointsGeometry>
  color: Color
  growRef: MutableRefObject<number>
  opacityRef: MutableRefObject<number>
  sizeRef?: MutableRefObject<number>
  lineAlpha?: number
  shared: SharedUniforms
}) {
  const lineMat = useMemo(() => makeLineMaterial(color, shared), [color, shared])
  const pointMat = useMemo(() => makePointMaterial(color, shared), [color, shared])
  const lRef = useRef<LineSegments>(null)
  const pRef = useRef<Points>(null)
  useEffect(
    () => () => {
      lines?.dispose()
      points.dispose()
      lineMat.dispose()
      pointMat.dispose()
    },
    [lines, points, lineMat, pointMat],
  )
  useFrame(() => {
    const g = growRef.current
    const on = g > 0.002
    if (lRef.current) lRef.current.visible = on
    if (pRef.current) pRef.current.visible = on
    if (!on) return
    lineMat.uniforms.uGrow.value = g
    lineMat.uniforms.uOpacity.value = lineAlpha * opacityRef.current
    pointMat.uniforms.uGrow.value = g
    pointMat.uniforms.uOpacity.value = opacityRef.current
    pointMat.uniforms.uSize.value = 7 * (sizeRef?.current ?? 1)
  })
  return (
    <>
      {lines && (
        <lineSegments ref={lRef} geometry={lines} material={lineMat} frustumCulled={false} />
      )}
      <points ref={pRef} geometry={points} material={pointMat} frustumCulled={false} />
    </>
  )
}

const CategoryView = memo(function CategoryView({
  cat,
  stageId,
  color,
  ctx,
  stageGrow,
}: {
  cat: Cat2
  stageId: string
  color: Color
  ctx: Ctx
  stageGrow: MutableRefObject<number>
}) {
  const lines = useMemo(() => linesGeometry(cat.lines), [cat])
  const points = useMemo(() => pointsGeometry(cat.points), [cat])
  const iLines = useMemo(() => linesGeometry(cat.itemLines), [cat])
  const iPoints = useMemo(() => pointsGeometry(cat.itemPoints), [cat])
  const grow2 = useRef(0)
  const grow3 = useRef(0)
  const op2 = useRef(1)
  const op3 = useRef(1)
  const node2 = useRef<Group>(null)
  const itemNodes = useRef<(Group | null)[]>([])
  const nodeColor = useMemo(() => color.clone().lerp(IVORY, 0.5), [color])
  const { focus, hovered, setHovered, onFocus } = ctx
  const stageOpen = focus.stage === stageId
  const catOpen = focus.category === cat.id
  const labelVisible = stageOpen

  useFrame((_, dt) => {
    grow2.current = damp(grow2.current, stageOpen && stageGrow.current > 0.9 ? 1 : 0, 2.6, dt)
    grow3.current = damp(grow3.current, catOpen ? 1 : 0, 2.6, dt)
    const s2 = smooth(0.55, 1, grow2.current)
    node2.current?.scale.setScalar(
      Math.max(s2 * (hovered === cat.id || catOpen ? 1.35 : 1), 0.0001),
    )
    itemNodes.current.forEach((g) =>
      g?.scale.setScalar(Math.max(smooth(0.5, 1, grow3.current) * 1, 0.0001)),
    )
  })

  return (
    <>
      <Strands
        lines={lines}
        points={points}
        color={color}
        growRef={grow2}
        opacityRef={op2}
        shared={ctx.shared}
      />
      <Strands
        lines={iLines}
        points={iPoints}
        color={color}
        growRef={grow3}
        opacityRef={op3}
        shared={ctx.shared}
      />
      <Node
        groupRef={(g) => {
          node2.current = g
        }}
        position={cat.pos}
        color={nodeColor}
        radius={0.1}
        scale={0.0001}
        enabled={stageOpen}
        onOver={() => setHovered(cat.id)}
        onOut={() => setHovered(null)}
        onClick={() => onFocus({ stage: stageId, category: cat.id, item: null })}
      />
      {labelVisible && (
        <Html position={cat.pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="cn-label cn-label--cat" data-active={catOpen}>
            {cat.category.title}
          </div>
        </Html>
      )}
      {cat.items.map((it, i) => (
        <group key={it.id}>
          <Node
            groupRef={(g) => {
              itemNodes.current[i] = g
            }}
            position={it.pos}
            color={nodeColor}
            radius={0.07}
            scale={0.0001}
            enabled={catOpen}
            onOver={() => setHovered(it.id)}
            onOut={() => setHovered(null)}
            onClick={() => onFocus({ stage: stageId, category: cat.id, item: it.id })}
          />
          {catOpen && (
            <Html position={it.pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
              <div className="cn-label cn-label--item" data-active={focus.item === it.id}>
                {it.item.label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </>
  )
})

const BranchView = memo(function BranchView({
  branch,
  index,
  ctx,
}: {
  branch: Branch
  index: number
  ctx: Ctx
}) {
  const { stage } = branch
  const color = useMemo(() => new Color(...branch.color), [branch])
  const nodeColor = useMemo(() => color.clone().lerp(IVORY, 0.25), [color])
  const lines = useMemo(() => linesGeometry(branch.lines), [branch])
  const points = useMemo(() => pointsGeometry(branch.points), [branch])
  const grow = useRef(0)
  const opacity = useRef(0.7)
  const size = useRef(1)
  const node = useRef<Group>(null)
  const { focus, hovered, setHovered, onFocus, progressRef } = ctx
  const isFocus = focus.stage === stage.id
  const isHover = hovered === stage.id
  const [ready, setReady] = useState(false)

  useFrame((_, dt) => {
    // Cada rama nace escalonada: el núcleo (0–0.18) → ramas principales (0.18–1).
    const target = MathUtils.clamp((progressRef.current - 0.14 - index * 0.06) / 0.34, 0, 1)
    grow.current = ctx.reduced ? target : damp(grow.current, target, 6, dt)
    const anyFocus = focus.stage !== null
    const wantOpacity = anyFocus ? (isFocus ? 1 : 0.07) : isHover ? 1 : hovered ? 0.28 : 0.72
    opacity.current = damp(opacity.current, wantOpacity, 5, dt)
    size.current = damp(size.current, isHover || isFocus ? 1.5 : 1, 5, dt)
    const born = smooth(0.85, 1, grow.current)
    node.current?.scale.setScalar(Math.max(born * (isHover ? 1.45 : isFocus ? 1.2 : 1), 0.0001))
    const r = grow.current > 0.85
    if (r !== ready) setReady(r)
  })

  return (
    <>
      <Strands
        lines={lines}
        points={points}
        color={color}
        growRef={grow}
        opacityRef={opacity}
        sizeRef={size}
        shared={ctx.shared}
      />
      <Node
        groupRef={(g) => {
          node.current = g
        }}
        position={branch.pos}
        color={nodeColor}
        radius={0.16}
        scale={0.0001}
        enabled={ready}
        onOver={() => setHovered(stage.id)}
        onOut={() => setHovered(null)}
        onClick={() => onFocus({ stage: stage.id, category: null, item: null })}
      />
      {ready && (
        <Html position={branch.pos} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div
            className="cn-label"
            data-hover={isHover || isFocus}
            data-dim={focus.stage !== null && !isFocus}
          >
            <span className="cn-label__name">{stage.company}</span>
            <span className="cn-label__more">
              {stage.role} · {stage.period}
            </span>
          </div>
        </Html>
      )}
      {branch.categories.map((cat) => (
        <CategoryView
          key={cat.id}
          cat={cat}
          stageId={stage.id}
          color={color}
          ctx={ctx}
          stageGrow={grow}
        />
      ))}
    </>
  )
})

function Ambient({ graph, ctx }: { graph: Graph; ctx: Ctx }) {
  const coreLines = useMemo(() => linesGeometry(graph.core.lines), [graph])
  const corePoints = useMemo(() => pointsGeometry(graph.core.points), [graph])
  const dustPoints = useMemo(() => pointsGeometry(graph.dust), [graph])
  const sand = useMemo(() => new Color('#d2a27e'), [])
  const toast = useMemo(() => new Color('#9c6f4d'), [])
  const coreGrow = useRef(0)
  const dustGrow = useRef(0)
  const opacity = useRef(0.8)
  const dustOp = useRef(0.55)
  const node = useRef<Group>(null)
  const { progressRef, focus, onFocus, hovered, setHovered } = ctx
  useFrame((_, dt) => {
    const p = progressRef.current
    coreGrow.current = ctx.reduced
      ? Math.min(1, p / 0.2)
      : damp(coreGrow.current, Math.min(1, p / 0.2), 6, dt)
    dustGrow.current = damp(dustGrow.current, Math.min(1, p * 4), 3, dt)
    opacity.current = damp(opacity.current, focus.stage ? 0.15 : 0.4, 4, dt)
    dustOp.current = damp(dustOp.current, focus.stage ? 0.25 : 0.55, 4, dt)
    node.current?.scale.setScalar(
      Math.max(smooth(0, 0.5, coreGrow.current) * (hovered === 'core' ? 1.2 : 1), 0.0001),
    )
  })
  return (
    <>
      <Strands
        lines={coreLines}
        points={corePoints}
        color={sand}
        growRef={coreGrow}
        opacityRef={opacity}
        lineAlpha={0.5}
        shared={ctx.shared}
      />
      <Strands
        points={dustPoints}
        color={toast}
        growRef={dustGrow}
        opacityRef={dustOp}
        shared={ctx.shared}
      />
      <Node
        groupRef={(g) => {
          node.current = g
        }}
        position={[0, 0, 0]}
        color={IVORY}
        radius={0.24}
        scale={0.0001}
        enabled
        onOver={() => setHovered('core')}
        onOut={() => setHovered(null)}
        onClick={() => onFocus({ stage: null, category: null, item: null })}
      />
      <Html position={[0, -0.55, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="cn-label cn-label--core" data-dim={focus.stage !== null}>
          <span className="cn-label__name">{profile.shortName}</span>
          <span className="cn-label__more">Núcleo · trayectoria completa</span>
        </div>
      </Html>
    </>
  )
}

/** Cámara: viaja suavemente hacia el nodo enfocado y vuelve a la vista global sin saltos. */
function Rig({
  graph,
  focus,
  zoom,
  reduced,
  controls,
  coarse,
}: {
  graph: Graph
  focus: Focus
  zoom: number
  reduced: boolean
  controls: MutableRefObject<OrbitControlsImpl | null>
  coarse: boolean
}) {
  const { camera, size } = useThree()
  const trans = useRef(0)
  const lastKey = useRef('core')
  const desiredTarget = useMemo(() => new Vector3(), [])
  const desiredDir = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(), [])
  const key = focus.item ?? focus.category ?? focus.stage ?? 'core'

  // En escritorio desplaza el encuadre a la derecha para dejar libre el título de la sección.
  useEffect(() => {
    if (size.width / size.height < 1.3) return
    camera.setViewOffset(
      size.width,
      size.height,
      -size.width * 0.09,
      size.height * 0.04,
      size.width,
      size.height,
    )
    return () => camera.clearViewOffset()
  }, [camera, size.width, size.height])

  useFrame((state, dt) => {
    const c = controls.current
    if (!c) return
    if (lastKey.current !== key) {
      lastKey.current = key
      trans.current = 2.2
    }
    const aspect = size.width / size.height
    // Distancia que encuadra toda la estructura según la proporción de pantalla (vertical = más lejos).
    const base = MathUtils.clamp(5.8 / (0.414 * aspect), 14, 38)
    const level = focus.item ? 3 : focus.category ? 2 : focus.stage ? 1 : 0
    const dist = [base, base * 0.5, base * 0.36, base * 0.28][level] * zoom
    const node = graph.nodes[key] ?? [0, 0, 0]
    desiredTarget.set(...node)
    if (level === 0) desiredDir.set(0.1, 0.18, 1).normalize()
    else desiredDir.copy(desiredTarget).normalize()

    const k = reduced ? 1 : 1 - Math.exp(-dt * 3)
    c.target.lerp(desiredTarget, k)
    offset.copy(camera.position).sub(c.target)
    let len = offset.length()
    offset.normalize()
    if (trans.current > 0) {
      offset.lerp(desiredDir, k).normalize()
      trans.current -= dt
    }
    len += (dist - len) * k
    camera.position.copy(c.target).addScaledVector(offset, len)
    c.autoRotate = level === 0 && !reduced && !coarse
    c.autoRotateSpeed = 0.35
    // Parallax del cursor: inclina muy ligeramente la mirada.
    void state
  }, -2)
  return null
}

function Scene({
  stages,
  progressRef,
  focus,
  onFocus,
  zoom,
  reduced,
  coarse,
}: Omit<Props, 'active'>) {
  const { gl, size, pointer } = useThree()
  const quality = coarse ? 0.55 : 1
  const graph = useMemo(() => buildGraph(stages, quality), [stages, quality])
  const shared = useMemo(
    () => makeShared(Math.min(gl.getPixelRatio(), coarse ? 1.5 : 2)),
    [gl, coarse],
  )
  const [hovered, setHovered] = useState<string | null>(null)
  const controls = useRef<OrbitControlsImpl | null>(null)
  const sway = useRef<Group>(null)

  // OrbitControls fuerza `touch-action: none` en el lienzo y eso bloquea el scroll de la página en el móvil.
  // En táctil lo devolvemos a `pan-y`: el scroll vertical sigue siendo de la página y el arrastre horizontal gira la escena.
  useEffect(() => {
    if (!coarse) return
    const el = gl.domElement
    el.style.touchAction = 'pan-y'
    const id = requestAnimationFrame(() => (el.style.touchAction = 'pan-y'))
    return () => cancelAnimationFrame(id)
  }, [gl, coarse])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  useFrame((state, dt) => {
    shared.uTime.value = reduced ? 0 : state.clock.elapsedTime
    shared.uAspect.value = size.width / size.height
    shared.uPointer.value = coarse ? [9, 9] : [pointer.x, pointer.y]
    if (sway.current && !coarse && !reduced) {
      sway.current.rotation.y = damp(sway.current.rotation.y, pointer.x * 0.1, 2.5, dt)
      sway.current.rotation.x = damp(sway.current.rotation.x, -pointer.y * 0.06, 2.5, dt)
    }
  })

  const ctx: Ctx = { shared, progressRef, focus, hovered, setHovered, onFocus, reduced }
  return (
    <>
      <Rig
        graph={graph}
        focus={focus}
        zoom={zoom}
        reduced={reduced}
        controls={controls}
        coarse={coarse}
      />
      <OrbitControls
        ref={controls as never}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.55}
      />
      <group ref={sway}>
        <Ambient graph={graph} ctx={ctx} />
        {graph.branches.map((b, i) => (
          <BranchView key={b.id} branch={b} index={i} ctx={ctx} />
        ))}
      </group>
    </>
  )
}

export default function Constellation(props: Props) {
  const { active, coarse } = props
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, coarse ? 1.5 : 2]}
      camera={{ position: [1.2, 2.2, 12.5], fov: 45, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: coarse ? 'pan-y' : 'none' }}
      onPointerMissed={() => {}}
    >
      <Scene {...props} />
    </Canvas>
  )
}
