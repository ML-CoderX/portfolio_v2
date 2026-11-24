import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { copy, type Project } from '../content'
import { Icon } from '../Icon'
import { restoreProjectEvent } from './playback'

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

export function Dossier({ project, dossier }: { project: Project; dossier: DossierDetails }) {
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
    button.dispatchEvent(new Event(restoreProjectEvent, { bubbles: true }))
    button.focus({ preventScroll: true })
    // If native focus restoration temporarily crossed a beat boundary, wait for the card to become active again.
    if (document.activeElement !== button) requestAnimationFrame(() => {
      if (!document.querySelector('dialog[open]')) button.focus({ preventScroll: true })
    })
  }
  const { title } = dossier
  return ready ? <>
    <button type="button" ref={opener} className="comic-action pink" onClick={() => {
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
