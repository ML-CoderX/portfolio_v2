import { useEffect } from 'react'
import { sceneArt } from './scene-art'

export function useChapterReveals(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return
    const shots = document.querySelectorAll<HTMLElement>('[data-chapter-shot]')
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        target.toggleAttribute('data-chapter-playing', isIntersecting)
      }
    }, { rootMargin: '0px 0px -78px 0px' })

    for (const shot of shots) observer.observe(shot)
    return () => {
      observer.disconnect()
      for (const shot of shots) shot.removeAttribute('data-chapter-playing')
    }
  }, [enabled])
}

const eyeOpenings = [
  { id: 'left', x: 249, outline: 'M194 176Q216 158 249 163Q279 161 299 191Q250 206 211 192Q197 186 194 176Z' },
  { id: 'right', x: 483, outline: 'M427 192Q447 163 482 163Q519 158 537 175Q534 186 510 194Q468 205 427 192Z' },
]

function EyesDrawing() {
  return <div className="eye-art">
    <img src={sceneArt.eyesPanel} width="720" height="309" alt="" loading="lazy" decoding="async" />
    <svg className="eye-gaze-overlay" viewBox="0 0 720 309">
      <defs>
        <linearGradient id="eye-white" x2="0" y2="1">
          <stop stopColor="#b2a9b4" />
          <stop offset=".47" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="eye-pink" x2="0" y2="1">
          <stop offset=".4" stopColor="#36041d" />
          <stop offset=".77" stopColor="#ff2e88" />
          <stop offset="1" stopColor="#ad005b" />
        </linearGradient>
        <pattern id="iris-dots" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <circle cx="1.6" cy="1.6" r=".68" fill="#0b0b12" opacity=".52" />
        </pattern>
        {eyeOpenings.map(({ id, outline }) => <clipPath id={`eye-opening-${id}`} key={id}><path d={outline} /></clipPath>)}
      </defs>
      {eyeOpenings.map(({ id, x }) => <g key={id} clipPath={`url(#eye-opening-${id})`}>
        <rect x={x - 60} y="156" width="120" height="51" fill="url(#eye-white)" />
        <g data-eye-gaze>
          <circle cx={x} cy="166.5" r="26.5" fill="url(#eye-pink)" stroke="#0b0b12" strokeWidth="1.8" />
          <circle cx={x} cy="166.5" r="25.6" fill="url(#iris-dots)" />
          <circle cx={x} cy="165" r="14.5" fill="#0b0b12" />
          <ellipse cx={x - 15} cy="177" rx="7" ry="1.8" fill="#fff" />
          <circle cx={x + 13} cy="170" r="1.8" fill="#fff" />
        </g>
      </g>)}
    </svg>
  </div>
}

export function ChapterShot({ shot }: { shot: 'eyes' | 'curtains' }) {
  if (shot === 'eyes') return <figure className="about-eyes" data-chapter-shot="eyes" aria-hidden="true">
    <EyesDrawing />
  </figure>

  return <>
    <img className="contact-stage" src={sceneArt.contactStage} alt="" loading="lazy" decoding="async" />
    <div className="chapter-shot--curtains" data-chapter-shot="curtains" aria-hidden="true">
    <div className="curtain curtain--left">
      <svg viewBox="0 0 500 400" preserveAspectRatio="none">
        <g id="chapter-curtain" stroke="#0b0b12" strokeLinejoin="round">
          <path fill="#ff2e88" strokeWidth="5" d="M-8-8h508c-8 52 7 100 0 153-8 57 4 123-4 183l6 67q-39 17-87 0-44 17-93 2-53 13-103-1-49 16-103 2-46 10-124-2z" />
          <path fill="#0b0b12" strokeWidth="2" d="M57-4c23 93 19 265 1 401l32 2C78 245 93 92 79-4zm99 0c11 106 14 265-4 403l26-2c-13-131 2-273-9-401zm113 0c18 117 18 260 0 401l21 3c-8-97 0-216-8-404zm92 0c19 95 15 259 3 401l27 1c-13-91 0-243-16-402zm90 0c17 114 9 301-1 402l24 1c-17-122 5-246-7-403z" />
          <path fill="none" stroke="#ffd9e1" strokeWidth="4" d="M33 0c14 151 4 334-5 398M126 0c14 151 4 334-5 398M229 0c14 151 4 334-5 398M335 0c14 151 4 334-5 398M432 0c14 151 4 334-5 398" />
          <path fill="none" opacity=".52" strokeWidth="2" d="M106 0c8 128 8 254-1 380M195 0c8 128 8 254-1 380M309 0c8 128 8 254-1 380M411 0c8 128 8 254-1 380M482 0c8 128 8 254-1 380" />
        </g>
      </svg>
    </div>
    <div className="curtain curtain--right">
      <svg viewBox="0 0 500 400" preserveAspectRatio="none"><use href="#chapter-curtain" /></svg>
    </div>
    </div>
  </>
}
