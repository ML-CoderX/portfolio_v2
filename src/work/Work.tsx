import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { copy, profile, projects, type Project } from '../content'
import { ActionLink, Chip } from '../sakuga'
import { Scene } from '../Scene'
import { sceneImage } from '../scene-art'
import { Icon } from '../Icon'
import { ChapterHeading } from '../ChapterHeading'
import { ProjectIllustration } from './ProjectIllustration'

type DossierDetails = NonNullable<Project['dossier']>

function DossierBody({ dossier, repo }: { dossier: DossierDetails; repo?: string }) {
  return <div className="dossier-body">
    <p>{dossier.description}</p>
    <h4>{copy.blueprint}</h4>
    <ol className="pipeline">{dossier.stages.map(stage => <li key={stage}>{stage}</li>)}</ol>
    <ul className="notes">{dossier.notes.map(note => <li key={note}>{note}</li>)}</ul>
    {repo && <a className="comic-action" href={repo}><Icon name="code" />{copy.github}</a>}
  </div>
}

function Dossier({ project, dossier }: { project: Project; dossier: DossierDetails }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const openedAt = useRef(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype)
    const current = dialog.current
    return () => { if (current?.open) current.close() }
  }, [ready])

  function restoreFocus() {
    const button = opener.current
    if (!button || document.querySelector('dialog[open]')) return
    if (Math.abs(scrollY - openedAt.current) > 1) {
      window.scrollTo({ top: openedAt.current, behavior: 'instant' })
    }
    button.dispatchEvent(new Event('studio:restore-project', { bubbles: true }))
    button.focus({ preventScroll: true })
    // If native focus restoration temporarily crossed a beat boundary, wait for the card to become active again.
    if (document.activeElement !== button) requestAnimationFrame(() => {
      if (!document.querySelector('dialog[open]')) button.focus({ preventScroll: true })
    })
  }
  const { title } = dossier
  return ready ? <>
    <button type="button" ref={opener} className="comic-action pink" data-sfx={copy.effects.impact} onClick={() => {
      openedAt.current = scrollY
      dialog.current?.showModal()
      close.current?.focus({ preventScroll: true })
    }}>
      <Icon name="folder_open" />{copy.open}<span className="sr-only"> · {project.title}</span>
    </button>
    {createPortal(<dialog data-lenis-prevent ref={dialog} aria-modal="true" aria-labelledby={project.id + '-dossier'} onClose={restoreFocus} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'))
      const position = controls.findIndex(control => control === document.activeElement)
      const step = event.shiftKey ? -1 : 1
      const next = position === -1 ? 0 : (position + step + controls.length) % controls.length
      event.preventDefault()
      controls[next]?.focus()
    }} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) event.currentTarget.close()
    }}>
      <div className="dialog-top"><span>{project.index}</span><button ref={close} autoFocus type="button" className="comic-action" onClick={() => dialog.current?.close()}>{copy.close}<Icon name="close" /></button></div>
      <h3 id={project.id + '-dossier'}>{title}</h3>
      <DossierBody dossier={dossier} repo={project.repo} />
    </dialog>, document.body)}
  </> : <details className="dossier-disclosure"><summary className="comic-action pink">{copy.open}</summary><h4>{title}</h4><DossierBody dossier={dossier} repo={project.repo} /></details>
}

export function Work({ tooltips }: { tooltips: boolean }) {
  const comicBackground = { '--studio-art': `url("${sceneImage('workBackdrop')}")` } as CSSProperties
  return <Scene id="work" className="site-section work-section">
    <div className="frame studio-stage">
      <ChapterHeading chapter={copy.work} id="work-title" />
      <div className="studio-screen" style={comicBackground}><div className="project-grid">
        {projects.map(project => <article className={`project panel ${project.span}`} key={project.id} data-project={project.id} data-reveal>
          <div className="project-page">
            <div className="project-caption">
              <div className="panel-top"><span>{project.badge}</span><b>{project.index}</b></div>
              <h3>{project.title}</h3><p>{project.description}</p>
            </div>
            <ProjectIllustration project={project.id} />
            <div className="project-details">
              <div className={'project-preview ' + project.id}>
                {project.preview.map(item => <div key={item}>{item}</div>)}
              </div>
              {project.stack.length > 0 && <ul className="chips" aria-label={copy.technologies}>{project.stack.map(item => <li key={item}><Chip title={item} hint={project.title} enhanced={tooltips} /></li>)}</ul>}
              {(project.dossier || project.demo || project.repo) && <div className="action-row">
                {project.dossier && <Dossier project={project} dossier={project.dossier} />}
                {project.demo && <ActionLink href={project.demo} appearance="pink" sfx={copy.effects.toolkit}><Icon name="launch" />{copy.demo}<span className="sr-only"> · {project.title}</span></ActionLink>}
                {project.repo && <a className="comic-action" href={project.repo}><Icon name="code" />{copy.github}<span className="sr-only"> · {project.title}</span></a>}
              </div>}
            </div>
          </div>
        </article>)}
        <div className="studio-final"><a className="comic-action pink" href={profile.socials.find(link => link.label === copy.github)?.href}>{copy.allWork}<Icon name="arrow_outward" /></a></div>
      </div></div>
      <div className="studio-dots" role="group" aria-label={copy.chooseProject}>
        {[...projects.map(project => project.title), copy.allWork].map((name, index) =>
          <button type="button" data-beat={index} aria-label={name} key={name} />)}
      </div>
    </div>
  </Scene>
}
