import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { copy, projects } from '../content'
import './loadout.css'

const projectNodes = projects.map(project => ({ ...project, tools: [...new Set(project.stack)] }))
const tools = [...new Set(projectNodes.flatMap(project => project.tools))]
const toolNodes = tools.map((name, index) => ({
  name, index, projects: projectNodes.filter(project => project.tools.includes(name)),
}))
const rowPosition = (index: number, count: number) => (index + .5) / count * 100
const edges = projectNodes.flatMap((project, index) => project.tools.map(tool => {
  const start = rowPosition(index, projectNodes.length)
  const end = rowPosition(tools.indexOf(tool), tools.length)
  return { project: project.id, tool, start, end, pink: index % 2 === 0 }
}))

type NodeSelection = { kind: 'project' | 'tool'; key: string }

export function LoadoutMap({ motion }: { motion: boolean }) {
  const panel = useRef<HTMLElement>(null)
  const network = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  const [{ width, height }, setSize] = useState({ width: 100, height: 100 })
  const [hovered, setHovered] = useState<NodeSelection>()
  const [focused, setFocused] = useState<NodeSelection>()
  const active = hovered ?? focused
  const links = active && edges.filter(edge => active.kind === 'project' ? edge.project === active.key : edge.tool === active.key)
  const labels = copy.loadout

  useEffect(() => {
    const element = network.current
    if (!element || typeof ResizeObserver === 'undefined') return
    // Match the SVG coordinate system to its display size so normalized dashes also
    // work with non-scaling strokes at different aspect ratios.
    const resize = new ResizeObserver(([{ contentRect }]) => {
      if (contentRect.width && contentRect.height) setSize({ width: contentRect.width, height: contentRect.height })
    })
    resize.observe(element)
    return () => resize.disconnect()
  }, [])

  useEffect(() => {
    const element = panel.current
    if (!element || !motion || typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined') return
    const media = matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    let stop: (() => void) | undefined
    let revision = 0
    const syncMotion = () => {
      stop?.()
      const run = ++revision
      if (!media.matches) return
      void import('./loadout-motion').then(({ animateLoadout }) => {
        if (run === revision) stop = animateLoadout(element, played)
      }).catch(() => { /* The map also renders as a complete static diagram. */ })
    }
    syncMotion()
    media.addEventListener('change', syncMotion)
    return () => {
      revision++
      media.removeEventListener('change', syncMotion)
      stop?.()
    }
  }, [motion])

  function interaction(kind: NodeSelection['kind'], key: string, position: number) {
    const selected = active?.kind === kind && active.key === key
    const related = links?.some(edge => kind === 'project' ? edge.project === key : edge.tool === key)
    return {
      tabIndex: 0,
      'data-loadout-node': kind,
      'data-muted': !!active && !selected && !related || undefined,
      'data-selected': selected || undefined,
      style: { top: position + '%' },
      onPointerEnter: (event: React.PointerEvent) => { if (event.pointerType !== 'touch') setHovered({ kind, key }) },
      onPointerLeave: () => setHovered(undefined),
      onFocus: () => setFocused({ kind, key }),
      onBlur: () => setFocused(undefined),
    }
  }

  return <section className="loadout panel" ref={panel} aria-labelledby="loadout-title">
    <header className="loadout-header">
      <h3 className="chapter-pill" id="loadout-title">{labels.title} <b><span aria-hidden="true">// </span>{labels.subtitle}</b></h3>
    </header>
    <ul className="loadout-list" role="list" aria-label={labels.projects}>
      {projectNodes.map(project => <li key={project.id}>
        <strong>{project.title}</strong>
        {project.tools.length > 0
          ? <ul className="loadout-chips" role="list" aria-label={labels.tools}>{project.tools.map(tool => <li className="chip" key={tool}>{tool}</li>)}</ul>
          : <p>{labels.empty}</p>}
      </li>)}
    </ul>
    <div className="loadout-graph">
      <div className="loadout-columns" aria-hidden="true"><span>{labels.projects}</span><span>{labels.tools}</span></div>
      <div className="loadout-network" ref={network} style={{ '--loadout-rows': Math.max(projectNodes.length, tools.length) } as CSSProperties}>
        <svg className="loadout-wires" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
          data-measured={width !== 100 || height !== 100 || undefined} aria-hidden="true">
          {edges.map(edge => {
            const start = edge.start * height / 100
            const end = edge.end * height / 100
            const path = `M${width * .375} ${start} C${width * .52} ${start} ${width * .56} ${end} ${width * .735} ${end}`
            return <g key={`${edge.project}-${edge.tool}`} className={edge.pink ? 'loadout-wire pink' : 'loadout-wire'}
              data-muted={links ? !links.includes(edge) || undefined : undefined}>
              <path className="loadout-line" d={path} pathLength="1" />
              <path className="loadout-pulse" d={path} pathLength="1" />
            </g>
          })}
        </svg>
        {projectNodes.map((project, index) => <div key={project.id} className="loadout-node"
          role="group" aria-label={`${project.title}. ${project.tools.join(', ') || labels.empty}.`}
          {...interaction('project', project.id, rowPosition(index, projectNodes.length))}>
          <span className="loadout-node-label">{project.title}</span>
        </div>)}
        {toolNodes.map(tool => <div key={tool.name} className="loadout-node"
          role="group" aria-label={`${tool.name}. ${tool.projects.map(project => project.title).join(', ')}.`}
          {...interaction('tool', tool.name, rowPosition(tool.index, tools.length))}>
          <span className="loadout-node-label">{tool.name}</span>
        </div>)}
      </div>
    </div>
  </section>
}
