import { useEffect, useRef, useState } from 'react'
import { copy, profile } from './content'
import type { SakugaButton, SakugaToast } from './sakuga-runtime'

export function ContactActions({ copyEffect, toastEffect }: { copyEffect: boolean; toastEffect: boolean }) {
  const emailLink = 'mailto:' + profile.email
  const email = useRef<HTMLInputElement>(null)
  const button = useRef<SakugaButton>(null)
  const toast = useRef<SakugaToast>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const element = button.current
    function activate() { email.current?.form?.requestSubmit() }
    element?.addEventListener('click', activate)
    return () => element?.removeEventListener('click', activate)
  }, [copyEffect])

  async function copyEmail() {
    setStatus('')
    let copied = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profile.email)
        copied = true
      }
    } catch { /* Try the legacy clipboard action below. */ }
    if (!copied && email.current) {
      email.current.focus()
      email.current.select()
      email.current.setSelectionRange(0, profile.email.length)
      try { copied = document.execCommand('copy') } catch { /* Selection stays available. */ }
    }
    if (copied) {
      button.current?.done()
      if (toast.current) toast.current.show(copy.copied)
      else setStatus(copy.copied)
    } else setStatus(copy.copyFailed)
  }

  return <div className="contact-controls">
    <form className="email-box" action={emailLink} onSubmit={event => { event.preventDefault(); void copyEmail() }}>
      <input aria-label={copy.email} ref={email} readOnly value={profile.email} onFocus={event => event.currentTarget.select()} />
      {copyEffect
        ? <sakuga-button ref={button}>{copy.copy}</sakuga-button>
        : <button type="submit" className="comic-action pink">{copy.copy}</button>}
    </form>
    <a className="email-link" href={emailLink}>{copy.email}</a>
    <p className="copy-status" role="status">{status}</p>
    {toastEffect && <sakuga-toast ref={toast} />}
  </div>
}
