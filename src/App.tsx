import { useEffect, useRef, useState } from 'react'
import { copy, profile, projects, timeline, toolkit, type Project } from './content'
import { ActionLink, Chip, ContactActions, LinkEffects, useSakuga } from './sakuga'
import { useEnhancements } from './enhancements'
import { Scene, SceneArtwork, Transition } from './Scene'
import { heroToWork } from './scenes'
import portrait from '../.scene-art/about/portrait.webp'
import { ThemeSwitch } from './ThemeSwitch'
import { useOpeningScreen } from './opening-screen'
import { ProjectIllustration } from './ProjectIllustration'

type Chapter = { chapter: string; stamp: string; title: string; accent: string; intro?: string }

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>
}

function ChapterHeading({ chapter, id }: { chapter: Chapter; id: string }) {
  return <div className="chapter-heading">
    <div><div className="chapter-pill"><span>{chapter.chapter}</span><b>{chapter.stamp}</b></div>
      <h2 data-heading id={id}>{chapter.title} <em>{chapter.accent}</em></h2>
    </div>
    {chapter.intro && <p>{chapter.intro}</p>}
  </div>
}

function Navigation({ effectsReady }: { effectsReady: boolean }) {
  return <header className="site-header">
    <a className="skip" href="#main" data-link-impact>{copy.skip}</a>
    <div className="energy" aria-hidden="true"><span data-energy /></div>
    <div className="header-row">
      <div className="brand-group"><a className="brand" href="#hero" data-link-impact>{profile.name}<i /></a><span className="ready" data-active-chapter>{copy.ready}</span></div>
      <nav aria-label={copy.nav} className="desktop-nav">{copy.navLinks.map(link => <a key={link.href} href={link.href} data-link-impact>{link.label}</a>)}</nav>
      <div className="header-actions">
        <details className="mobile-nav" onClick={event => {
          if ((event.target as Element).closest('a')) event.currentTarget.open = false
        }}>
          <summary data-link-impact>{copy.menu}</summary>
          <nav aria-label={copy.nav}>{copy.navLinks.map(link => <a key={link.href} href={link.href} data-link-impact>{link.label}</a>)}</nav>
        </details>
        <ThemeSwitch effectsReady={effectsReady} />
        <ActionLink href={profile.resume} sfx={copy.effects.download} appearance="pink"><Icon name="description" /><span className="header-resume-label">{copy.resume}</span></ActionLink>
      </div>
    </div>
  </header>
}

function Hero() {
  const h = copy.hero
  return <Scene id="hero" className="hero section-tone">
    <div className="speed-lines" aria-hidden="true" />
    <div className="frame hero-grid">
      <div className="hero-copy">
        <div className="hero-badge" data-stamp><i />{h.chapter}<b aria-hidden="true">★</b></div>
        <div className="hero-name">
          <span className="impact" aria-hidden="true" />
          <span className="sfx-stamp" data-stamp aria-hidden="true">{h.sfx}</span>
          <h1 id="hero-title">{profile.first} <em>{profile.last}</em></h1>
        </div>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-intro">{h.intro}</p>
        <div className="action-row">
          <ActionLink href="#work" sfx={copy.effects.work} appearance="pink">{h.work}<Icon name="bolt" /><small>{h.act}</small></ActionLink>
          <ActionLink href="#toolkit" sfx={copy.effects.toolkit}>{h.toolkit}<b>{h.exp}</b></ActionLink>
        </div>
        <a className="scroll-cue" href="#work">{h.scroll}<Icon name="arrow_downward" /></a>
      </div>
      <div className="hero-art">
        <span className="art-stamp" data-stamp>{h.badge}</span>
        <figure className="workstation">
          <img src="/workstation.svg" alt={h.alt} width="500" height="290" fetchPriority="high" />
          <SceneArtwork id="hero" />
        </figure>
        <div className="terminal">
          <div className="terminal-bar"><span aria-hidden="true"><i /><i /><i /></span>{h.terminal}</div>
          <div className="terminal-body">
            <ol>{h.steps.map((step, index) => <li key={step} style={{ '--step': index } as React.CSSProperties}><span>{step}</span></li>)}</ol>
            <svg viewBox="0 0 120 40" aria-hidden="true"><path pathLength="1" d="M3 33 L24 33 L41 24 L65 24 L83 10 L117 10" /><circle cx="3" cy="33" r="3"/><circle cx="65" cy="24" r="3"/><circle cx="117" cy="10" r="3"/></svg>
          </div>
        </div>
        <span className="art-stamp secondary" data-stamp>{h.badgeTwo}</span>
      </div>
    </div>
  </Scene>
}

function DossierBody({ project }: { project: Project }) {
  const dossier = project.dossier!
  return <div className="dossier-body">
    <p>{dossier.description}</p>
    <h4>{copy.blueprint}</h4>
    <ol className="pipeline">{dossier.stages.map(stage => <li key={stage}>{stage}</li>)}</ol>
    <ul className="notes">{dossier.notes.map(note => <li key={note}>{note}</li>)}</ul>
    {project.repo && <a className="comic-action" href={project.repo}><Icon name="code" />{copy.github}</a>}
  </div>
}

function Dossier({ project }: { project: Project }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype)
    const current = dialog.current
    return () => { if (current?.open) current.close() }
  }, [ready])

  const title = project.dossier!.title
  return ready ? <>
    <button type="button" ref={opener} className="comic-action pink" data-sfx={copy.effects.impact} onClick={() => {
      dialog.current?.showModal()
      dialog.current?.querySelector('button')?.focus()
    }}>
      <Icon name="folder_open" />{copy.open}<span className="sr-only"> · {project.title}</span>
    </button>
    <dialog ref={dialog} aria-modal="true" aria-labelledby={project.id + '-dossier'} onClose={() => opener.current?.focus()} onKeyDown={event => {
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
      <div className="dialog-top"><span>{project.index}</span><button autoFocus type="button" className="comic-action" onClick={() => dialog.current?.close()}>{copy.close}<Icon name="close" /></button></div>
      <h3 id={project.id + '-dossier'}>{title}</h3>
      <DossierBody project={project} />
    </dialog>
  </> : <details className="dossier-disclosure"><summary className="comic-action pink">{copy.open}</summary><h4>{title}</h4><DossierBody project={project} /></details>
}

function Work({ sakuga }: { sakuga: ReturnType<typeof useSakuga> }) {
  return <Scene id="work" className="site-section work-section">
    <div className="frame">
      <ChapterHeading chapter={copy.work} id="work-title" />
      <div className="project-grid">
        {projects.map(project => <article className={`project panel ${project.span}`} key={project.id} data-reveal>
          <div className="panel-top"><span>{project.badge}</span><b>{project.index}</b></div>
          <h3>{project.title}</h3><p>{project.description}</p>
          <ProjectIllustration project={project.id} />
          <div className={'project-preview ' + project.id}>
            {project.preview.map(item => <div key={item}>{item}</div>)}
          </div>
          {project.stack.length > 0 && <ul className="chips" aria-label={copy.technologies}>{project.stack.map(item => <li key={item}><Chip title={item} hint={project.title} enhanced={sakuga.tooltip} /></li>)}</ul>}
          {(project.dossier || project.demo || project.repo) && <div className="action-row">
            {project.dossier && <Dossier project={project} />}
            {project.demo && <ActionLink href={project.demo} appearance="pink" sfx={copy.effects.toolkit}><Icon name="launch" />{copy.demo}<span className="sr-only"> · {project.title}</span></ActionLink>}
            {project.repo && <a className="comic-action" href={project.repo}><Icon name="code" />{copy.github}<span className="sr-only"> · {project.title}</span></a>}
          </div>}
        </article>)}
      </div>
    </div>
  </Scene>
}

function About() {
  const a = copy.about
  return <Scene id="about" className="site-section section-tone"><div className="frame">
    <ChapterHeading chapter={a} id="about-title" />
    <div className="about-grid">
      <figure className="character panel" data-reveal>
        <img loading="lazy" decoding="async" src={portrait} width="640" height="853" alt={a.alt} />
      </figure>
      <div className="bio">
        <blockquote className="panel speech" data-reveal><small>{a.log}</small><p>{a.quote}</p></blockquote>
        <p>{a.bio}</p>
        <ul className="facets">{a.facets.map(([title, detail], index) => <li key={title} className="panel" data-reveal><span aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{detail}</p></li>)}</ul>
      </div>
    </div>
  </div></Scene>
}

function Toolkit() {
  return <Scene id="toolkit" className="site-section toolkit-section"><div className="frame">
    <ChapterHeading chapter={copy.toolkit} id="toolkit-title" />
    <div className="toolkit-grid">
      <div className="timeline panel"><h3>{copy.toolkit.log}</h3><ol>{timeline.map(milestone => <li key={milestone.title} data-reveal>
        <small>{milestone.badge}</small><h4>{milestone.title}</h4><p>{milestone.detail}</p><b>{milestone.note}</b>
      </li>)}</ol></div>
      <div className="matrix">{toolkit.map(group => <section className="panel" key={group.name} data-reveal>
        <h3>{group.name}</h3><ul>{group.items.map(item => <li key={item}>{item}<div className="exp-track" aria-hidden="true"><span data-exp /></div></li>)}</ul>
      </section>)}</div>
    </div>
  </div></Scene>
}

function Contact({ sakuga }: { sakuga: ReturnType<typeof useSakuga> }) {
  const c = copy.contact
  return <Scene id="contact" className="contact site-section section-tone"><div className="frame">
    <div className="chapter-pill">{c.chapter} <b>{c.stamp}</b></div>
    <div className="contact-card panel">
      <span className="contact-stamp">{c.badge}</span>
      <h2 id="contact-title" data-heading>{c.title} <em>{c.accent}</em></h2>
      <p>{c.intro}</p>
      <ContactActions enhanced={sakuga} />
      <div className="action-row">{profile.socials.map(link => <a className="comic-action" key={link.href} href={link.href}>{link.label}</a>)}
        <ActionLink appearance="pink" href={profile.resume} sfx={copy.effects.download} download><Icon name="download" />{copy.download}</ActionLink></div>
    </div>
  </div></Scene>
}

export function App() {
  useOpeningScreen()
  const sakuga = useSakuga()
  useEnhancements()
  return <>
    <Navigation effectsReady={sakuga.button} />
    <LinkEffects ready={sakuga.button} />
    <main id="main" tabIndex={-1}><Hero /><Work sakuga={sakuga} /><About /><Toolkit /><Contact sakuga={sakuga} /></main>
    <Transition config={heroToWork} />
    <footer className="footer"><div className="frame"><p>{copy.footer}</p><nav aria-label={copy.contact.title}>{profile.socials.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}<a href={'mailto:' + profile.email}>{copy.email}</a></nav><a className="comic-action" href="#hero"><Icon name="arrow_upward" />{copy.top}</a></div></footer>
  </>
}
