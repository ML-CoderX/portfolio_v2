import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei/core/RoundedBox.js'
import {
  BackSide, CanvasTexture, Color, DataTexture, Group, MathUtils, NearestFilter,
  PerspectiveCamera, RedFormat, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2,
  Vector4, WebGLRenderTarget,
} from 'three'
import type { ScenePlayback, TransitionConfig } from './scenes'
import { phase } from './shot-motion'
type Callbacks = { onPaint: () => void; onFailure: () => void }

class CanvasBoundary extends Component<{ onFailure: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function Box({ size, at, color, gradient, outline = .036 }: {
  size: [number, number, number]; at: [number, number, number]; color: string; gradient: DataTexture; outline?: number
}) {
  return <group position={at}>
    {outline > 0 && <mesh>
      <boxGeometry args={size.map(dimension => dimension + outline) as [number, number, number]} />
      <meshBasicMaterial color="#0b0b12" side={BackSide} />
    </mesh>}
    <RoundedBox args={size} radius={.028} smoothness={2}>
      <meshToonMaterial color={color} gradientMap={gradient} />
    </RoundedBox>
  </group>
}

function Laptop({ playback }: { playback: ScenePlayback }) {
  const rig = useRef<Group>(null)
  const pointer = useRef(new Vector2())
  const gradient = useMemo(() => {
    const texture = new DataTexture(new Uint8Array([105, 186, 255]), 3, 1, RedFormat)
    texture.minFilter = texture.magFilter = NearestFilter
    texture.needsUpdate = true
    return texture
  }, [])
  useEffect(() => () => gradient.dispose(), [gradient])
  useEffect(() => {
    const fine = matchMedia('(pointer: fine)')
    function move(event: PointerEvent) {
      if (fine.matches && event.pointerType === 'mouse') pointer.current.set(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1)
    }
    function reset() { pointer.current.set(0, 0) }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', reset)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', reset) }
  }, [])
  useFrame(({ clock }, delta) => {
    if (!rig.current) return
    const approach = phase(playback.progress, 0, .32)
    rig.current.position.y = -.12 + Math.sin(clock.elapsedTime * 1.45) * .065 * (1 - approach)
    rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, -.45 + .14 * approach + pointer.current.x * .14 * (1 - approach), 5, delta)
    rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, pointer.current.y * .09 * (1 - approach), 5, delta)
    rig.current.scale.setScalar(1 + approach * .15)
  })
  return <group ref={rig} rotation={[0, -.45, 0]}>
    <Box size={[3.8, .19, 2.05]} at={[0, 0, .36]} color="#f6f3ec" gradient={gradient} />
    <Box size={[1.1, .02, .36]} at={[0, .102, 1.11]} color="#f6f3ec" gradient={gradient} />
    {Array.from({ length: 3 }, (_, row) => Array.from({ length: 10 }, (_, column) =>
      <Box key={row * 10 + column} size={[.255, .042, .15]} at={[-1.4 + column * .31, .104, .21 + row * .22]} color={column % 3 ? '#ff2e88' : '#fde400'} gradient={gradient} outline={.019} />
    ))}
    <group position={[0, .13, -.62]} rotation={[-.18, 0, 0]}>
      <Box size={[3.77, 2.05, .15]} at={[0, 1, 0]} color="#f6f3ec" gradient={gradient} />
      <Box size={[3.44, 1.72, .035]} at={[0, 1.025, .091]} color="#6c4bff" gradient={gradient} />
      <Box size={[.74, .095, .021]} at={[-1, 1.48, .119]} color="#fde400" gradient={gradient} outline={0} />
      <Box size={[1.46, .075, .021]} at={[-.64, 1.23, .119]} color="#f6f3ec" gradient={gradient} outline={0} />
      <Box size={[1.07, .075, .021]} at={[-.83, .99, .119]} color="#ff2e88" gradient={gradient} outline={0} />
    </group>
  </group>
}

const screenVertex = `
  uniform vec4 bounds;
  varying vec2 surface;
  void main() {
    surface = uv;
    gl_Position = vec4(bounds.xy + position.xy * bounds.zw, 0.0, 1.0);
  }
`

const laptopFragment = `
  uniform sampler2D image;
  uniform float pitch;
  varying vec2 surface;
  void main() {
    vec4 pixel = texture2D(image, surface);
    float dotInk = 1.0 - smoothstep(.19, .28, length(fract(gl_FragCoord.xy / pitch) - .5));
    float tone = 1.0 - dot(pixel.rgb, vec3(.299, .587, .114));
    gl_FragColor = vec4(mix(pixel.rgb, vec3(.004, .004, .006), dotInk * tone * .58), pixel.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const inkFragment = `
  uniform sampler2D ink;
  uniform float progress;
  uniform float aspect;
  uniform float orbSize;
  uniform float textureReady;
  uniform vec2 origin;
  uniform vec2 orb;
  uniform vec3 blackInk;
  uniform vec3 pinkInk;
  varying vec2 surface;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.,0.)), f.x),
      mix(hash(cell + vec2(0.,1.)), hash(cell + 1.), f.x), f.y);
  }

  void main() {
    vec2 uv = vec2(surface.x, 1.0 - surface.y);
    vec2 ratio = vec2(aspect, 1.0);
    float orbDistance = length((uv - orb) * ratio);
    float circle = 1.0 - smoothstep(orbSize * .92, max(orbSize, .001), orbDistance);
    float rim = smoothstep(orbSize * .72, max(orbSize * .94, .001), orbDistance);
    vec3 orbColor = mix(blackInk, pinkInk, rim);
    float orbAlpha = circle * step(.001, orbSize);
    if (progress <= 0.0) {
      gl_FragColor = vec4(orbColor, orbAlpha);
      #include <colorspace_fragment>
      return;
    }
    vec2 offset = (uv - origin) * ratio;
    vec2 sampleUV = clamp(offset * .78 + .5, 0.0, 1.0);
    vec3 art = texture2D(ink, vec2(sampleUV.x, 1.0 - sampleUV.y)).rgb;
    float textureMask = (1.0 - dot(art, vec3(.299, .587, .114))) * textureReady;
    float grains = noise(uv * 26.0) * .67 + noise(uv * 68.0) * .33;
    float distance = length(offset) + (grains - .5) * .18 - textureMask * .16;
    vec2 farCorner = max(origin, 1.0 - origin) * ratio;
    float extent = length(farCorner) + .18;
    float radius = mix(-.31, extent, min(progress, 1.0 - progress) * 2.0);
    float spread = 1.0 - smoothstep(radius - .045, radius + .035, distance);
    float fringe = smoothstep(radius - .12, radius, distance);
    float marbling = smoothstep(.40, .78, noise(uv * 10.0) + textureMask * .24) * .74;
    vec3 color = mix(blackInk, pinkInk, max(fringe, marbling));
    orbAlpha *= 1.0 - spread;
    float alpha = spread + orbAlpha;
    color = (color * spread + orbColor * orbAlpha) / max(alpha, .001);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`

type CanvasProps = Callbacks & { playback: ScenePlayback; config: TransitionConfig }

function screenMaterial(fragmentShader: string, uniforms: ShaderMaterial['uniforms']) {
  return new ShaderMaterial({
    uniforms, vertexShader: screenVertex, fragmentShader,
    depthTest: false, depthWrite: false, transparent: true,
  })
}

function SceneFrame({ playback, config, onPaint, onFailure }: CanvasProps) {
  const { gl, size, invalidate, scene, camera } = useThree()
  const painted = useRef(false)
  const laptopScene = useMemo(() => new Scene(), [])
  const laptopCamera = useMemo(() => {
    const perspective = new PerspectiveCamera(36, 1, .1, 100)
    perspective.position.set(0, 3.05, 6.5)
    perspective.lookAt(0, 0, 0)
    return perspective
  }, [])
  const target = useMemo(() => new WebGLRenderTarget(1, 1), [])
  const laptop = useMemo(() => ({
    bounds: { value: new Vector4() }, image: { value: target.texture }, pitch: { value: 5 },
  }), [target])
  const ink = useMemo(() => ({
    bounds: { value: new Vector4(0, 0, 1, 1) },
    ink: { value: null as ReturnType<TextureLoader['load']> | null },
    textureReady: { value: 0 }, progress: { value: 0 }, aspect: { value: 1 }, orbSize: { value: 0 },
    origin: { value: new Vector2() }, orb: { value: new Vector2(.7, .4) },
    blackInk: { value: new Color('#0b0b12') }, pinkInk: { value: new Color('#ff2e88') },
  }), [])
  const effects = useMemo(() => ({
    bounds: { value: new Vector4(0, 0, 1, 1) },
    image: { value: null as CanvasTexture | null },
  }), [])
  const materials = useMemo(() => [
    screenMaterial(laptopFragment, laptop),
    screenMaterial(inkFragment, ink),
    screenMaterial(`
      uniform sampler2D image;
      varying vec2 surface;
      void main() {
        gl_FragColor = texture2D(image, surface);
        #include <colorspace_fragment>
      }
    `, effects),
  ], [effects, ink, laptop])
  const slot = useRef<Element | null>(null)
  const hero = useRef<HTMLElement | null>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const orbInitialized = useRef(false)

  useEffect(() => () => target.dispose(), [target])
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  useEffect(() => {
    let active = true
    const texture = new TextureLoader().load(config.shader.texture, loaded => {
      if (!active) return
      ink.ink.value = loaded
      ink.textureReady.value = 1
      invalidate()
    })
    return () => { active = false; texture.dispose(); ink.ink.value = null; ink.textureReady.value = 0 }
  }, [config.shader.texture, ink, invalidate])

  useEffect(() => {
    slot.current = document.querySelector('.workstation')
    const source = document.getElementById(config.from)
    hero.current = source
    playback.invalidate = invalidate
    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return
      pointer.current = { x: event.clientX, y: event.clientY }
      if (hero.current && hero.current.getBoundingClientRect().bottom > 0) invalidate()
    }
    function leave() { pointer.current = null; playback.orb.moved = false; invalidate() }
    function lost(event: Event) { event.preventDefault(); onFailure() }
    source?.addEventListener('pointermove', move, { passive: true })
    source?.addEventListener('pointerleave', leave)
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => {
      delete playback.invalidate
      source?.removeEventListener('pointermove', move)
      source?.removeEventListener('pointerleave', leave)
      gl.domElement.removeEventListener('webglcontextlost', lost)
    }
  }, [config.from, gl, invalidate, onFailure, playback])

  useEffect(() => {
    function connect() {
      window.SakugaFX?.setSurfaceConsumer(canvas => {
        if (effects.image.value?.image !== canvas) {
          effects.image.value?.dispose()
          effects.image.value = new CanvasTexture(canvas)
          effects.image.value.colorSpace = SRGBColorSpace
        }
        effects.image.value.needsUpdate = true
        invalidate()
      })
    }
    connect()
    window.addEventListener('sakuga:ready', connect)
    return () => {
      window.removeEventListener('sakuga:ready', connect)
      window.SakugaFX?.setSurfaceConsumer(null)
      effects.image.value?.dispose()
      effects.image.value = null
    }
  }, [effects, invalidate])

  useFrame((_, dt) => {
    if (gl.getContext().isContextLost()) return
    const rect = slot.current?.getBoundingClientRect()
    const heroVisible = (hero.current?.getBoundingClientRect().bottom ?? 0) > 0
    const { width, height } = size
    const slotVisible = !!rect && rect.bottom > 0 && rect.top < height && rect.width > 0
    laptop.bounds.value.set(0, 0, 0, 0)
    if (slotVisible) {
      const dpr = gl.getPixelRatio()
      const pixelWidth = Math.max(1, Math.round(rect.width * dpr))
      const pixelHeight = Math.max(1, Math.round(rect.height * dpr))
      if (target.width !== pixelWidth || target.height !== pixelHeight) {
        target.setSize(pixelWidth, pixelHeight)
        laptopCamera.aspect = rect.width / rect.height
        laptopCamera.updateProjectionMatrix()
      }
      gl.setRenderTarget(target)
      gl.render(laptopScene, laptopCamera)
      gl.setRenderTarget(null)
      laptop.pitch.value = 5 * dpr
      laptop.bounds.value.set((2 * rect.left + rect.width) / width - 1, 1 - (2 * rect.top + rect.height) / height, rect.width / width, rect.height / height)
    }
    if (heroVisible && rect && playback.progress === 0) {
      const fallbackX = (rect.left + rect.width / 2) / width
      const fallbackY = (rect.top + rect.height / 2) / height
      const x = (pointer.current?.x ?? fallbackX * width) / width
      const y = (pointer.current?.y ?? fallbackY * height) / height
      if (!orbInitialized.current) {
        ink.orb.value.set(fallbackX, fallbackY)
        orbInitialized.current = true
      }
      ink.orb.value.x = MathUtils.damp(ink.orb.value.x, x, 8, dt)
      ink.orb.value.y = MathUtils.damp(ink.orb.value.y, y, 8, dt)
      playback.orb.x = ink.orb.value.x
      playback.orb.y = ink.orb.value.y
      playback.orb.moved = pointer.current !== null
    }
    const progress = playback.progress
    if (progress > 0 && progress < 1) ink.orb.value.set(playback.origin.x, playback.origin.y)
    ink.orbSize.value = (heroVisible || (progress > 0 && progress < .47))
      ? 17 / height * (1 - phase(progress, 0, .33)) : 0
    ink.progress.value = progress <= .5 ? phase(progress, 0, .5) * .5
      : progress < .96 ? .5 + phase(progress, .5, .96) * .5 : 0
    ink.origin.value.set(playback.origin.x, playback.origin.y)
    ink.aspect.value = width / height
    gl.render(scene, camera)
    if (!painted.current) { painted.current = true; onPaint() }
    if (heroVisible && !document.hidden) invalidate()
  }, 1)

  return <>
    {createPortal(<>
      <ambientLight intensity={.95} />
      <directionalLight position={[2, 4, 4]} intensity={2.3} />
      <Laptop playback={playback} />
    </>, laptopScene)}
    {materials.map((material, index) => <mesh key={material.uuid} frustumCulled={false} renderOrder={index + 1} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>)}
  </>
}

export default function Workstation(props: CanvasProps): ReactNode {
  return <div className="r3f-layer" aria-hidden="true">
    <CanvasBoundary onFailure={props.onFailure}>
      <Canvas dpr={[1, 1.5]} frameloop="demand" style={{ pointerEvents: 'none' }} gl={{ alpha: true, antialias: true }}>
        <SceneFrame {...props} />
      </Canvas>
    </CanvasBoundary>
  </div>
}
