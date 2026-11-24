import { useEffect, useRef } from 'react'
import { copy, profile } from './content'
import { ActionLink } from './sakuga'
import { Icon } from './Icon'
import { ThemeSwitch } from './ThemeSwitch'

const desktopNavigation = '(min-width: 901px)'

function NavigationLinks({ className }: { className?: string }) {
  return <nav className={className} aria-label={copy.nav}>
    {copy.navLinks.map(link => <a key={link.href} href={link.href} data-link-impact>{link.label}</a>)}
  </nav>
}

export function Navigation({ effectsReady, motion }: { effectsReady: boolean; motion: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const desktop = matchMedia(desktopNavigation)
    const details = menu.current!
    const sync = () => { details.open = desktop.matches }
    const dismiss = (event: PointerEvent) => {
      if (!desktop.matches && event.target instanceof Node && !details.contains(event.target)) details.open = false
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.open && !desktop.matches) {
        details.open = false
        details.querySelector('summary')?.focus()
      }
    }
    sync()
    desktop.addEventListener('change', sync)
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      desktop.removeEventListener('change', sync)
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return <header className="site-header">
    <a className="skip" href="#main" data-link-impact>{copy.skip}</a>
    <div className="energy" aria-hidden="true"><span data-energy /></div>
    <div className="header-row">
      <div className="brand-group"><a className="brand" href="#hero" data-link-impact>{profile.name}<i /></a><span className="ready" data-active-chapter>{copy.ready}</span></div>
      <NavigationLinks className="desktop-nav" />
      <div className="header-actions">
        <ThemeSwitch effectsReady={effectsReady} motion={motion} />
        <details className="header-menu" ref={menu} onClick={event => {
          if ((event.target as Element).closest('a') && !matchMedia(desktopNavigation).matches) event.currentTarget.open = false
        }}>
          <summary data-link-impact>{copy.menu}</summary>
          <div className="menu-panel">
            <NavigationLinks />
            <ActionLink href={profile.resume} appearance="pink"><Icon name="description" />{copy.resume}</ActionLink>
          </div>
        </details>
      </div>
    </div>
  </header>
}
