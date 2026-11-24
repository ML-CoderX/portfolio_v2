import { copy, profile, timeline, toolkit } from './content'
import { ActionLink, LinkEffects, useSakuga } from './sakuga'
import { Scene, WorkSequence } from './Scene'
import { ChapterShot, useChapterReveals } from './SceneShots'
import { sceneArt } from './scene-art'
import { Navigation } from './Navigation'
import { MotionSwitch, useMotionPreference } from './MotionSwitch'
import { useOpeningScreen } from './opening-screen'
import { Work } from './work/Work'
import { Icon } from './Icon'
import { ChapterHeading } from './ChapterHeading'
import { ContactActions } from './ContactActions'

function Hero() {
  const h = copy.hero
  return <Scene id="hero" className="hero section-tone">
    <div className="speed-lines" aria-hidden="true" />
    <div className="frame hero-grid">
      <div className="hero-copy">
        <div className="hero-badge"><i />{h.chapter}<b aria-hidden="true">★</b></div>
        <div className="hero-name">
          <span className="sfx-stamp" aria-hidden="true">{h.sfx}</span>
          <h1 id="hero-title">{profile.first} <em>{profile.last}</em></h1>
        </div>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-intro">{h.intro}</p>
        <div className="action-row">
          <ActionLink href="#work" appearance="pink">{h.work}<Icon name="bolt" /><small>{h.act}</small></ActionLink>
          <ActionLink href="#toolkit">{h.toolkit}<b>{h.exp}</b></ActionLink>
        </div>
        <a className="scroll-cue" href="#work">{h.scroll}<Icon name="arrow_downward" /></a>
      </div>
      <div className="hero-art">
        <span className="art-stamp">{h.badge}</span>
        <div className="workstation" aria-hidden="true"><span className="closed-fallback" /></div>
        <div className="terminal">
          <div className="terminal-bar"><span aria-hidden="true"><i /><i /><i /></span>{h.terminal}</div>
          <div className="terminal-body">
            <ol>{h.steps.map(step => <li key={step}><span>{step}</span></li>)}</ol>
            <svg viewBox="0 0 120 40" aria-hidden="true"><path pathLength="1" d="M3 33 L24 33 L41 24 L65 24 L83 10 L117 10" /><circle cx="3" cy="33" r="3"/><circle cx="65" cy="24" r="3"/><circle cx="117" cy="10" r="3"/></svg>
          </div>
        </div>
        <span className="art-stamp secondary">{h.badgeTwo}</span>
      </div>
    </div>
  </Scene>
}

function About() {
  const a = copy.about
  return <Scene id="about" className="site-section section-tone">
    <ChapterShot shot="eyes" />
    <div className="frame">
    <ChapterHeading chapter={a} id="about-title" />
    <div className="about-grid">
      <figure className="character panel">
        <img loading="lazy" decoding="async" src={sceneArt.portrait} width="640" height="853" alt={a.alt} />
      </figure>
      <div className="bio">
        <blockquote className="panel speech"><small>{a.log}</small><p>{a.quote}</p></blockquote>
        <p>{a.bio}</p>
        <ul className="facets">{a.facets.map(([title, detail], index) => <li key={title} className="panel"><span aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{detail}</p></li>)}</ul>
      </div>
    </div>
  </div></Scene>
}

function Toolkit() {
  return <Scene id="toolkit" className="site-section toolkit-section"><div className="frame">
    <ChapterHeading chapter={copy.toolkit} id="toolkit-title" />
    <div className="toolkit-grid">
      <div className="timeline panel"><h3>{copy.toolkit.log}</h3><ol>{timeline.map(milestone => <li key={milestone.title}>
        <small>{milestone.badge}</small><h4>{milestone.title}</h4><p>{milestone.detail}</p><b>{milestone.note}</b>
      </li>)}</ol></div>
      <div className="matrix">{toolkit.map(group => <section className="panel" key={group.name}>
        <h3>{group.name}</h3><ul>{group.items.map(item => <li key={item}>{item}<div className="exp-track" aria-hidden="true"><span /></div></li>)}</ul>
      </section>)}</div>
    </div>
  </div></Scene>
}

function Contact({ copyEffect, toast }: { copyEffect: boolean; toast: boolean }) {
  const c = copy.contact
  return <Scene id="contact" className="contact site-section section-tone">
    <ChapterShot shot="curtains" />
    <div className="frame">
    <div className="chapter-pill">{c.chapter} <b>{c.stamp}</b></div>
    <div className="contact-card panel">
      <span className="contact-stamp">{c.badge}</span>
      <h2 id="contact-title">{c.title} <em>{c.accent}</em></h2>
      <p>{c.intro}</p>
      <ContactActions copyEffect={copyEffect} toastEffect={toast} />
      <div className="action-row">{profile.socials.map(link => <a className="comic-action" key={link.href} href={link.href}>{link.label}</a>)}
        <ActionLink appearance="pink" href={profile.resume} download><Icon name="download" />{copy.download}</ActionLink></div>
    </div>
  </div></Scene>
}

export function App() {
  const motion = useMotionPreference()
  const motionEnabled = motion === true
  useOpeningScreen(motionEnabled)
  useChapterReveals(motionEnabled)
  const sakuga = useSakuga(motionEnabled)

  return <>
    <Navigation effectsReady={sakuga.button} motion={motionEnabled} />
    <MotionSwitch enabled={motion} />
    <LinkEffects ready={sakuga.button} />
    <main id="main" tabIndex={-1}><Hero /><Work tooltips={sakuga.tooltip} /><About /><Toolkit /><Contact copyEffect={sakuga.button} toast={sakuga.toast} /></main>
    {motion && <WorkSequence />}
    <footer className="footer"><div className="frame"><p>{copy.footer}</p><nav aria-label={copy.contact.title}>{profile.socials.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}<a href={'mailto:' + profile.email}>{copy.email}</a></nav><a className="comic-action" href="#hero"><Icon name="arrow_upward" />{copy.top}</a></div></footer>
  </>
}
