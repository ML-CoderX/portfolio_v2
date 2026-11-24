import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CanvasTexture, InstancedMesh, Matrix4, SRGBColorSpace } from 'three'

// Dimensions are in model units. Both the keycaps and their printed legends
// use these coordinates so they stay aligned throughout the lid animation.
const keyboardWidth = 3.86
const keyboardDepth = 1.18
const keyboardZ = -.32
const typingRows = [
  'Esc F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12 Del',
  '` 1 2 3 4 5 6 7 8 9 0 - = Back',
  'Tab Q W E R T Y U I O P [ ] \\',
  "Caps A S D F G H J K L ; ' Enter",
  'Shift Z X C V B N M , . / Shift ↑',
  'Ctrl Fn Alt Space Alt Ctrl ← ↓ →',
]
const padRows = ['Home End Pg↑ Pg↓', 'Num / × −', '7 8 9 +', '4 5 6', '1 2 3 Enter', '0 .']
const widths: Record<string, number> = { Space: 5, Shift: 1.65, Enter: 1.8, Caps: 1.5, Back: 1.8, Tab: 1.4 }

function keyLayout() {
  const result: { label: string; x: number; z: number; width: number; depth: number }[] = []
  const pitch = keyboardDepth / typingRows.length
  for (const [row, labels] of typingRows.entries()) {
    const keys = labels.split(' ')
    const unit = 2.98 / keys.reduce((sum, label) => sum + (widths[label] ?? 1), 0)
    const z = -keyboardDepth / 2 + pitch * (row + .5)
    let left = -keyboardWidth / 2
    for (const label of keys) {
      const width = (widths[label] ?? 1) * unit
      result.push({ label, x: left + width / 2, z, width: width - .025, depth: pitch - .035 })
      left += width
    }
    const padPitch = .2
    left = keyboardWidth / 2 - 4 * padPitch
    for (const label of padRows[row].split(' ')) {
      const width = label === '0' ? padPitch * 2 : padPitch
      const tall = label === '+' || label === 'Enter'
      result.push({ label, x: left + width / 2, z: z + (tall ? pitch / 2 : 0),
        width: width - .025, depth: pitch * (tall ? 2 : 1) - .035 })
      left += width
    }
  }
  return result
}

const caps = keyLayout()

function printLegends() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 320
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#d5d6d8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const key of caps) {
    if (key.label === 'Space') continue
    ctx.font = key.label.length > 1 ? '14px Arial' : '18px Arial'
    ctx.fillText(key.label, (key.x / keyboardWidth + .5) * canvas.width,
      (key.z / keyboardDepth + .5) * canvas.height)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function Keyboard() {
  const keys = useRef<InstancedMesh>(null!)
  const legends = useMemo(printLegends, [])
  useEffect(() => () => legends.dispose(), [legends])
  useLayoutEffect(() => {
    const matrix = new Matrix4()
    caps.forEach((cap, index) => {
      matrix.makeScale(cap.width, .027, cap.depth).setPosition(cap.x, .107, cap.z)
      keys.current.setMatrixAt(index, matrix)
    })
    keys.current.instanceMatrix.needsUpdate = true
    keys.current.computeBoundingSphere()
  }, [])
  return <group position={[0, 0, keyboardZ]}>
    <instancedMesh ref={keys} args={[undefined, undefined, caps.length]}>
      <boxGeometry /><meshStandardMaterial color="#303133" roughness={.84} />
    </instancedMesh>
    <mesh position={[0, .122, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[keyboardWidth, keyboardDepth]} />
      <meshBasicMaterial map={legends} transparent depthWrite={false} />
    </mesh>
  </group>
}

// The dark recess sits just inside the perimeter of the body. One instanced
// mesh draws all the fins of each bank, including the short side exhaust.
export function Exhaust({ width, fins }: { width: number; fins: number }) {
  const grille = useRef<InstancedMesh>(null!)
  useLayoutEffect(() => {
    const matrix = new Matrix4()
    const spacing = width / fins
    for (let i = 0; i < fins; i++) {
      matrix.makeScale(.019, .068, .008).setPosition(-width / 2 + (i + .5) * spacing, 0, .007)
      grille.current.setMatrixAt(i, matrix)
    }
    grille.current.instanceMatrix.needsUpdate = true
    grille.current.computeBoundingSphere()
  }, [width, fins])
  return <>
    <mesh><boxGeometry args={[width, .076, .01]} /><meshStandardMaterial color="#08090a" roughness={.96} /></mesh>
    <instancedMesh ref={grille} args={[undefined, undefined, fins]}>
      <boxGeometry /><meshStandardMaterial color="#46474a" metalness={.25} roughness={.72} />
    </instancedMesh>
  </>
}
