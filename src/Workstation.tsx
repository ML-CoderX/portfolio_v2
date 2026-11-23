import { Component, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei/core/RoundedBox.js'
import { CanvasTexture, Color, DirectionalLight, EquirectangularReflectionMapping, Group, InstancedMesh, Matrix4, MathUtils,
  Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PointLight, Sprite, SRGBColorSpace, TextureLoader, Vector3 } from 'three'
import { subscribeToSakugaSurface } from './sakuga-runtime'
import type { StudioPlayback } from './scene-scroll'

type Props = { playback: StudioPlayback; onPaint: () => void; onFailure: () => void }
const mix = MathUtils.lerp
const phase = MathUtils.smoothstep
class Boundary extends Component<{ children: ReactNode; fail: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.fail() }
  render() { return this.state.failed ? null : this.props.children }
}

function Keyboard() {
  const keys = useRef<InstancedMesh>(null!)
  useLayoutEffect(() => {
    const matrix = new Matrix4()
    const bottom = [-1.57,-1.31,-1.05,-.13,.85,1.11,1.37,1.63]
    let index = 0
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < (row === 4 ? bottom.length : 14); col++) {
        matrix.makeScale(row === 4 && col === 3 ? 1.48 : .216,.032,.18)
        matrix.setPosition(row === 4 ? bottom[col] : (col-6.5)*.25,.105,-.82+row*.225)
        keys.current.setMatrixAt(index++,matrix)
      }
    }
    keys.current.instanceMatrix.needsUpdate = true
    keys.current.computeBoundingSphere()
  }, [])
  return <instancedMesh ref={keys} args={[undefined,undefined,64]}>
    <boxGeometry /><meshStandardMaterial color="#40434e" roughness={.59} />
  </instancedMesh>
}

function Laptop({ playback, onPaint, onFailure }: Props) {
  const { gl, invalidate, scene, size } = useThree()
  const camera = useThree(state => state.camera) as PerspectiveCamera
  const [studio, grain] = useLoader(TextureLoader, ['/studio-environment.jpg', '/brushed-metal.png'])
  const root = useRef<Group>(null!)
  const hinge = useRef<Group>(null!)
  const display = useRef<MeshStandardMaterial>(null!)
  const metal = useRef<MeshPhysicalMaterial>(null!)
  const key = useRef<DirectionalLight>(null!)
  const spill = useRef<PointLight>(null!)
  const shadow = useRef<Mesh>(null!)
  const overlay = useRef<Sprite>(null!)
  const painted = useRef(false)
  const dom = useMemo(() => ({
    slot: document.querySelector<HTMLElement>('.workstation')!,
    work: document.getElementById('work')!,
    stage: document.querySelector<HTMLElement>('.studio-stage')!,
    screen: document.querySelector<HTMLElement>('.studio-screen')!,
    header: document.querySelector<HTMLElement>('.site-header')!,
  }), [])
  const pointer = useRef({ x: 0, y: 0 })
  const theme = useRef(0)
  const visible = useRef(true)
  const points = useMemo(() => [new Vector3(), new Vector3(), new Vector3()], [])
  const colors = useMemo(() => [new Color('#d4d8de'), new Color('#515670'), new Color('#f7eaff'), new Color('#c173ff')], [])
  const shadowMap = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const gradient = ctx.createRadialGradient(32,32,0,32,32,32)
    gradient.addColorStop(0,'rgba(24,22,38,.65)')
    gradient.addColorStop(.5,'rgba(24,22,38,.32)')
    gradient.addColorStop(1,'rgba(24,22,38,0)')
    ctx.fillStyle = gradient; ctx.fillRect(0,0,64,64)
    return new CanvasTexture(c)
  }, [])
  useEffect(() => {
    studio.mapping = EquirectangularReflectionMapping
    studio.colorSpace = SRGBColorSpace
    scene.environment = studio
    const fine = matchMedia('(hover:hover) and (pointer:fine) and (min-width:768px)')
    function move(event: PointerEvent) {
      pointer.current.x = fine.matches && event.pointerType === 'mouse' ? event.clientX / innerWidth - .5 : 0
      pointer.current.y = fine.matches && event.pointerType === 'mouse' ? event.clientY / innerHeight - .5 : 0
    }
    function wake() { if (!document.hidden && visible.current) invalidate() }
    const observer = new IntersectionObserver(() => {
      const a = dom.slot.getBoundingClientRect(), b = dom.work.getBoundingClientRect()
      visible.current = (a.bottom > 0 && a.top < innerHeight) || (b.bottom > 0 && b.top < innerHeight)
      invalidate()
    })
    observer.observe(dom.slot); observer.observe(dom.work)
    function lost(event: Event) { event.preventDefault(); onFailure() }
    gl.domElement.addEventListener('webglcontextlost', lost)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('scroll', wake, { passive: true })
    const changes = new MutationObserver(wake)
    changes.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme','data-studio'] })
    let texture: CanvasTexture | undefined
    const disconnect = subscribeToSakugaSurface(canvas => {
      if (!texture) { texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace }
      texture.needsUpdate = true
      overlay.current.material.map = texture
      overlay.current.material.visible = true
      overlay.current.material.needsUpdate = true
      if (visible.current) wake()
    })
    return () => {
      disconnect(); texture?.dispose(); observer.disconnect()
      scene.environment = null
      shadowMap.dispose()
      changes.disconnect()
      window.removeEventListener('scroll', wake)
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('pointermove', move)
      gl.domElement.removeEventListener('webglcontextlost', lost)
    }
  }, [studio, scene, dom, gl, invalidate, onFailure, shadowMap])
  useFrame(({ clock }, delta) => {
    if (document.hidden) return
    if (!visible.current && painted.current) { gl.clear(); return }
    const p = playback.progress, dt = Math.min(.06,delta)
    const { width:w, height:h } = size
    const slot = dom.slot.getBoundingClientRect(), stage = dom.stage.getBoundingClientRect()
    const join = phase(scrollY, 0, Math.max(1,dom.work.getBoundingClientRect().top + scrollY))
    const open = phase(p,0,.2), approach = phase(p,.04,.25)
    const header = dom.header.offsetHeight
    const usable = h - header
    const night = document.documentElement.dataset.theme === 'night' ? 1 : 0
    theme.current = MathUtils.damp(theme.current, night, 6, dt)
    const n = theme.current
    metal.current.color.copy(colors[0]).lerp(colors[1],n)
    scene.environmentIntensity = mix(1.45,.7,n)
    key.current.intensity = mix(3,1.45,n)
    spill.current.intensity = open * mix(.3,5,n)
    display.current.emissive.copy(colors[2]).lerp(colors[3],n)
    display.current.emissiveIntensity = open * mix(.5,1.6,n)
    if ('opacity' in shadow.current.material) shadow.current.material.opacity = mix(.75,1,n)
    const tilt = 1 - join
    root.current.rotation.set(MathUtils.damp(root.current.rotation.x,mix(.57,.18,join) + tilt * pointer.current.y*.09,10,dt), MathUtils.damp(root.current.rotation.y,tilt*(-.37 + pointer.current.x*.14),8,dt), tilt*.035)
    hinge.current.rotation.x = -open * Math.PI * 100/180
    // Convert desired screen framing to camera distance along its optical axis.
    const readingZoom = Math.max(Math.min(w*.90/4, usable*.86/2.45), Math.min(usable*.67,470)/2.45)
    const finalZoom = Math.max(w/4,usable/2.45)*1.03
    const zoom = mix(slot.width*.20, mix(Math.min(w*.19,usable*.30), readingZoom*(1+.06*phase(p,.25,.85)), approach),join)
    const pixelsPerUnit = mix(zoom,finalZoom,phase(p,.9,1))
    root.current.position.set(0,0,0)
    root.current.updateMatrixWorld(true)
    const center = points[0].set(0,-.056,1.28).applyMatrix4(hinge.current.matrixWorld)
    const x = mix(slot.left+slot.width*.5, w*.5,join)
    const y = mix(slot.top+slot.height*.47+Math.sin(clock.elapsedTime*1.35)*3,stage.top+header+usable*mix(.59,.52,approach),join)
    const fieldHeight = 2 * Math.tan(MathUtils.degToRad(camera.fov) / 2)
    camera.position.set(center.x * approach, center.y * approach, center.z * approach + h / (fieldHeight * pixelsPerUnit))
    camera.setViewOffset(w,h,w/2-x,h/2-y,w,h)
    camera.updateMatrixWorld()
    const upper = points[1].set(-2,-.06,2.505).applyMatrix4(hinge.current.matrixWorld).project(camera)
    const lower = points[2].set(2,-.06,.055).applyMatrix4(hinge.current.matrixWorld).project(camera)
    if (p >= .18 && dom.stage.dataset.cards === 'true') {
      const left = Math.max(4,(upper.x+1)*w/2), right = Math.min(w-4,(lower.x+1)*w/2)
      const top = (1-upper.y)*h/2-stage.top, bottom = (1-lower.y)*h/2-stage.top
      const css = dom.screen.style
      css.width = Math.max(1,right-left)+'px'; css.height = Math.max(1,bottom-top)+'px'
      css.transform = 'translate3d('+left+'px,'+top+'px,0)'
    }
    const overlayScale = .5 * fieldHeight / h
    overlay.current.position.set(camera.position.x+(w/2-x)*overlayScale,camera.position.y+(y-h/2)*overlayScale,camera.position.z-.5)
    overlay.current.scale.set(w*overlayScale,h*overlayScale,1)
    gl.render(scene,camera)
    if (!painted.current) { painted.current = true; onPaint() }
    if (visible.current && (join < 1 || Math.abs(root.current.rotation.x - .18) > .001 || Math.abs(root.current.rotation.y) > .001 || Math.abs(night - n) > .002)) invalidate()
  },1)
  return <>
    <ambientLight intensity={.48} />
    <directionalLight ref={key} position={[-3,5,4]} />
    <directionalLight position={[4,2,-2]} intensity={1.8} color="#ced7ff" />
    <group ref={root}>
      <mesh ref={shadow} position={[0,-.24,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[5.8,4.4]} /><meshBasicMaterial transparent map={shadowMap} depthWrite={false} /></mesh>
      <RoundedBox args={[4.22,.14,2.72]} radius={.065} smoothness={3}>
        <meshPhysicalMaterial ref={metal} metalness={.88} roughness={.62} roughnessMap={grain} anisotropy={.45} />
      </RoundedBox>
      <RoundedBox args={[3.66,.022,1.21]} radius={.01} position={[0,.08,-.37]}><meshStandardMaterial color="#303039" /></RoundedBox>
      <Keyboard />
      <RoundedBox args={[1.43,.016,.69]} radius={.007} position={[0,.078,.73]}><meshStandardMaterial color="#989da7" metalness={.65} roughness={.36} /></RoundedBox>
      <mesh position={[0,.135,-1.25]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.095,.095,3.5,20]} /><meshStandardMaterial color="#737783" metalness={.82} roughness={.28} /></mesh>
      <group ref={hinge} position={[0,.19,-1.27]}>
        <RoundedBox position={[0,0,1.28]} args={[4.22,.094,2.64]} radius={.045} smoothness={3}><meshPhysicalMaterial color="#aaaeba" metalness={.94} roughness={.57} roughnessMap={grain} anisotropy={.6} /></RoundedBox>
        <mesh position={[0,-.05,1.28]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[4.15,2.57]} /><meshStandardMaterial color="#13131a" roughness={.25} /></mesh>
        <mesh position={[0,-.055,1.28]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[4,2.45]} /><meshStandardMaterial ref={display} color="#302e3c" /></mesh>
        <pointLight ref={spill} position={[0,-.8,1.2]} color="#fa65c3" distance={5} />
      </group>
    </group>
    <sprite ref={overlay} renderOrder={10}><spriteMaterial transparent opacity={1} alphaTest={.001} color="white" depthTest={false} depthWrite={false} toneMapped={false} visible={false} /></sprite>
  </>
}

export default function Workstation(props: Props): ReactNode {
  return <div className="r3f-layer" aria-hidden="true"><Boundary fail={props.onFailure}>
    <Canvas style={{ pointerEvents: 'none' }} camera={{ position:[0,0,20], fov:32, near:.1, far:100 }} frameloop="demand" dpr={[1,1.5]} gl={{ alpha:true, antialias:true }}>
      <Laptop {...props} />
    </Canvas>
  </Boundary></div>
}
