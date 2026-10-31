import { AdditiveBlending, Color, ShaderMaterial, type IUniform } from 'three'

/**
 * Shaders de la constelación. Las líneas y los puntos "crecen" según `uGrow` comparándolo con el
 * atributo `aGrow` de cada vértice (orden de nacimiento a lo largo de la rama), por eso el dibujado
 * avanza y retrocede de forma continua con el scroll.
 */
const wobble = /* glsl */ `
  vec3 wobble(vec3 p, float seed, float t) {
    return p + vec3(
      sin(t * 0.4 + seed * 6.283 + p.y),
      cos(t * 0.35 + seed * 5.0 + p.x),
      sin(t * 0.3 + seed * 3.0 + p.z)
    ) * 0.035;
  }
`

const lineVert = /* glsl */ `
  attribute float aGrow;
  attribute float aSeed;
  uniform float uTime;
  varying float vGrow;
  varying float vSeed;
  varying float vDepth;
  ${wobble}
  void main() {
    vec4 mv = modelViewMatrix * vec4(wobble(position, aSeed, uTime), 1.0);
    vGrow = aGrow;
    vSeed = aSeed;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const lineFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGrow;
  uniform float uOpacity;
  varying float vGrow;
  varying float vSeed;
  varying float vDepth;
  void main() {
    float born = smoothstep(0.0, 0.06, uGrow - vGrow);
    float fog = clamp(1.0 - (vDepth - 7.0) / 20.0, 0.18, 1.0);
    float a = born * uOpacity * fog * (0.5 + 0.5 * vSeed);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`
const pointVert = /* glsl */ `
  attribute float aGrow;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGrow;
  uniform float uSize;
  uniform vec2 uPointer;
  uniform float uAspect;
  varying float vAlpha;
  varying float vDepth;
  ${wobble}
  void main() {
    vec4 mv = modelViewMatrix * vec4(wobble(position, aSeed, uTime), 1.0);
    gl_Position = projectionMatrix * mv;
    vec2 ndc = gl_Position.xy / gl_Position.w;
    // Los puntos cercanos al cursor se avivan: la estructura "reconoce" el ratón.
    float near = smoothstep(0.42, 0.0, distance(ndc * vec2(uAspect, 1.0), uPointer * vec2(uAspect, 1.0)));
    float vis = smoothstep(0.0, 0.05, uGrow - aGrow);
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.4 + aSeed * 40.0);
    vDepth = -mv.z;
    vAlpha = vis * twinkle * (0.55 + near * 0.9);
    gl_PointSize = aSize * uSize * uPixelRatio * (1.0 + near * 1.5) * (13.0 / max(-mv.z, 1.0)) * vis;
  }
`
const pointFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    float fog = clamp(1.0 - (vDepth - 7.0) / 20.0, 0.2, 1.0);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity * fog);
    if (gl_FragColor.a < 0.004) discard;
  }
`

export interface SharedUniforms {
  uTime: IUniform<number>
  uPixelRatio: IUniform<number>
  uPointer: IUniform<[number, number]>
  uAspect: IUniform<number>
}
export const makeShared = (pixelRatio: number): SharedUniforms => ({
  uTime: { value: 0 },
  uPixelRatio: { value: pixelRatio },
  uPointer: { value: [9, 9] },
  uAspect: { value: 1 },
})

export function makeLineMaterial(color: Color | string, shared: SharedUniforms) {
  return new ShaderMaterial({
    vertexShader: lineVert,
    fragmentShader: lineFrag,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: shared.uTime,
      uColor: { value: new Color(color) },
      uGrow: { value: 0 },
      uOpacity: { value: 0.6 },
    },
  })
}

export function makePointMaterial(color: Color | string, shared: SharedUniforms, size = 7) {
  return new ShaderMaterial({
    vertexShader: pointVert,
    fragmentShader: pointFrag,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: shared.uTime,
      uPixelRatio: shared.uPixelRatio,
      uPointer: shared.uPointer,
      uAspect: shared.uAspect,
      uColor: { value: new Color(color) },
      uGrow: { value: 0 },
      uOpacity: { value: 1 },
      uSize: { value: size },
    },
  })
}
