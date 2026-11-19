import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei/core/RoundedBox.js'
import {
  BackSide, DataTexture, Group, NearestFilter, RedFormat, Vector2, MathUtils,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

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

function Laptop() {
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
    rig.current.position.y = -.12 + Math.sin(clock.elapsedTime * 1.45) * .065
    rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, -.45 + pointer.current.x * .14, 5, delta)
    rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, pointer.current.y * .09, 5, delta)
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

function Halftone() {
  const { gl, scene, camera, size } = useThree()
  const effects = useRef<EffectComposer | null>(null)
  useEffect(() => {
    const composer = new EffectComposer(gl)
    const render = new RenderPass(scene, camera)
    const dots = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, pitch: { value: gl.getPixelRatio() * 5 } },
      vertexShader: 'varying vec2 uvScreen; void main(){uvScreen=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float pitch; varying vec2 uvScreen; void main(){vec4 c=texture2D(tDiffuse,uvScreen); float dotInk=1.-smoothstep(.19,.28,length(fract(gl_FragCoord.xy/pitch)-.5)); float tone=1.-dot(c.rgb,vec3(.299,.587,.114)); gl_FragColor=vec4(mix(c.rgb,vec3(.043,.043,.071),dotInk*tone*.58),c.a);}',
    })
    composer.addPass(render)
    composer.addPass(dots)
    effects.current = composer
    return () => { effects.current = null; dots.dispose(); composer.dispose() }
  }, [camera, gl, scene])
  useEffect(() => { effects.current?.setSize(size.width, size.height) }, [size.width, size.height])
  useFrame(({ gl, scene, camera }) => {
    if (effects.current) effects.current.render()
    else gl.render(scene, camera)
  }, 1)
  return null
}

function ObserveCanvas({ onPaint, onFailure }: Callbacks) {
  const { gl } = useThree()
  const painted = useRef(false)
  useFrame(() => {
    if (!painted.current) { painted.current = true; onPaint() }
  })
  useEffect(() => {
    function lost(event: Event) { event.preventDefault(); onFailure() }
    const element = gl.domElement
    element.addEventListener('webglcontextlost', lost)
    return () => element.removeEventListener('webglcontextlost', lost)
  }, [gl, onFailure])
  return null
}

function Fallback({ onFailure }: Pick<Callbacks, 'onFailure'>) {
  useEffect(onFailure, [onFailure])
  return null
}

export default function Workstation(callbacks: Callbacks): ReactNode {
  const wrapper = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!document.hidden)
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 1024px) and (pointer: fine)').matches)
  useEffect(() => {
    const query = matchMedia('(min-width: 1024px) and (pointer: fine)')
    let inFrame = true
    const visibility = () => setVisible(inFrame && !document.hidden)
    const resize = () => setDesktop(query.matches)
    const observer = new IntersectionObserver(([entry]) => { inFrame = entry.isIntersecting; visibility() })
    if (wrapper.current) observer.observe(wrapper.current)
    document.addEventListener('visibilitychange', visibility)
    query.addEventListener('change', resize)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); query.removeEventListener('change', resize) }
  }, [])
  return <div className="r3f-layer" aria-hidden="true" ref={wrapper}>
    <CanvasBoundary onFailure={callbacks.onFailure}>
      <Canvas fallback={<Fallback onFailure={callbacks.onFailure} />} dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} camera={{ position: [0, 3.05, 6.5], fov: 36 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={.95} />
        <directionalLight position={[2, 4, 4]} intensity={2.3} />
        <Laptop />
        {desktop && <Halftone />}
        <ObserveCanvas {...callbacks} />
      </Canvas>
    </CanvasBoundary>
  </div>
}
