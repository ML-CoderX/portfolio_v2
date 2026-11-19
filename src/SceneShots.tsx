import { reachTarget, shotArtwork } from './scenes'

export function ReachShot() {
  return <div className="reach-shot" data-reach-shot aria-hidden="true" style={{
    left: `${reachTarget.x * 100}%`, top: `${reachTarget.y * 100}%`,
  }}>
    <svg className="reach-drawing" viewBox="0 0 680 460">
      <defs>
        <pattern id="reach-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#0b0b12" opacity=".48" />
        </pattern>
      </defs>
      <g data-reach-arm stroke="#0b0b12" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        <g fill="none" stroke="#ff2e88" strokeWidth="3" opacity=".75">
          <path d="M244 112l81 12m61-12 148 35M380 159l109 17m-58 213 183 42M508 436l82 13" />
          <path d="M218 272l-28 20m7-72-40 3m24-78-31-16" />
        </g>
        <path fill="#eee9ff" d="m428 207 82 12 187 79v164L483 366l-94-63z" />
        <path fill="#6c4bff" d="m484 307 40 15 173 80v60L483 366l-51-40z" />
        <path fill="url(#reach-dots)" stroke="none" d="m489 277 208 96v88l-214-95-52-40z" />
        <path fill="none" d="m523 252 67 41 55 18m-139 12 56 32 53 14m-124-28 49 30m31-65 28 18" />
        <path fill="#f6f3ec" d="M401 204q24-13 54 5l48 27-32 115-61-28q-32-17-36-41z" />
        <path fill="#ff2e88" d="m459 213 21 12-29 118-19-9z" />
        <path fill="none" strokeWidth="2" d="m430 208-22 97m11-99-23 86m47-80-25 108" />
        <path fill="#ffd9e1" d="M420 214c-28-10-49-24-77-37-18-9-37-24-58-20l-38 9c-9 2-10 14 3 16l46 2 32 25c-35-2-65 0-82 11-13 8-7 20 5 19l31-7 35 11-25 14c-9 7-3 18 9 15l31-7c14-4 24 2 43 11l31 17z" />
        <path fill="#f6f3ec" d="M420 218c-38-7-64-24-91-38-19-10-35-9-52-5l-34 9c-17 5-14 19 3 19l41-6 32 26c-19 7-26 17-23 31 3 12 17 18 36 16 17-1 30 8 46 16l23 11z" />
        <path fill="url(#reach-dots)" stroke="none" d="m302 247 40-10 78 13-19 47-23-11c-18-8-28-17-46-16-20 2-29-5-30-23z" />
        <path fill="none" strokeWidth="2" d="m308 192 20 12m-4 17 22 10m-29 22 20-4m7 1 28 14m18-21 13 7" />
        <g data-reach-index>
          <path fill="#f6f3ec" d="M333 184c-14-12-29-27-48-31l-32-8-55 3c-14 1-18 12-7 18 5 3 19 2 29 2l34-2 34 13 26 24" />
          <path fill="#ffd9e1" strokeWidth="2" d="M188 157q10-7 25-3l-2 9-19 1z" />
          <path fill="none" strokeWidth="2" d="m243 150 12 7m21 1 13 5" />
        </g>
        <g data-reach-thumb>
          <path fill="#f6f3ec" d="M351 258c-13-19-29-28-47-31-15-3-31-4-44-10l-36-16c-14-6-21-1-19 8 2 10 16 17 25 24l32 22 44 8 22 12" />
          <path fill="#ffd9e1" strokeWidth="2" d="M205 206q10-5 24 4l-6 9-14-8z" />
          <path fill="none" strokeWidth="2" d="m249 224 7 9m12-2 9 8m23 7 15 7" />
        </g>
      </g>
    </svg>
  </div>
}

function PourDrawing() {
  return <svg className="pour-drawing" viewBox="0 0 720 380">
    <defs>
      <pattern id="pour-dots" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.25" fill="#0b0b12" opacity=".46" />
      </pattern>
      <clipPath id="jar-glass">
        <path d="M-29-109h58v27c3 13 41 24 41 55v64c0 22-28 32-70 32s-70-10-70-32v-64c0-31 38-42 41-55z" />
      </clipPath>
    </defs>
    <path fill="#0b0b12" opacity=".18" d="M74 336c0-18 111-32 249-32s271 18 271 39-123 29-263 29S74 356 74 336z" />
    <g stroke="#0b0b12" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
      <path fill="#6c4bff" d="m425 292 17 52q55 25 106 0l17-52z" />
      <path fill="url(#pour-dots)" stroke="none" d="m488 295 77-3-17 52q-25 10-59 11z" />
      <ellipse cx="495" cy="294" rx="70" ry="21" fill="#0b0b12" />
      <ellipse data-pour-fill cx="495" cy="298" rx="54" ry="10" fill="#ff2e88" stroke="none" />
      <path data-pour-stream d="M400 118C447 115 483 166 495 296" pathLength="1" fill="none" strokeWidth="15" />
      <path data-pour-stream d="M400 118C447 115 483 166 495 296" pathLength="1" fill="none" stroke="#ff2e88" strokeWidth="8" />
      <circle data-pour-drop cx="495" cy="296" r="5" fill="#ff2e88" strokeWidth="2" />
      <g data-pour-jar>
        <path fill="#ffd9e1" d="M-29-109h58v27c3 13 41 24 41 55v64c0 22-28 32-70 32s-70-10-70-32v-64c0-31 38-42 41-55z" />
        <g clipPath="url(#jar-glass)" stroke="none">
          <path data-jar-fill fill="#ff2e88" d="M-175-40Q-90-56 0-40T175-40V175h-350z" />
          <path fill="url(#pour-dots)" d="M22-110h67V82H22z" />
          <path fill="#f6f3ec" opacity=".8" d="M-51-28q4-12 10-16l-3 65-10-4zm1 60 6 2-1 13-7-4z" />
        </g>
        <ellipse cy="-108" rx="33" ry="9" fill="#0b0b12" />
        <ellipse cy="-110" rx="23" ry="4" fill="#ff2e88" stroke="none" />
        <path fill="none" strokeWidth="2" d="M-54 53q52 20 105 0m-66-144 27 1m-27 6 21 1" />
        <path fill="none" stroke="#f6f3ec" strokeWidth="4" d="M-10 16 0-2l10 18L0 35z" />
        <g data-pour-hand opacity="0">
          <path fill="#eee9ff" d="m-228 52 97-41 48-9 23 39-40 23-110 50z" />
          <path fill="#6c4bff" d="m-105 16 18-9 30 31-22 17z" />
          <path fill="url(#pour-dots)" stroke="none" d="m-224 71 120-45 24 21-123 59z" />
          <path fill="#f6f3ec" d="M-88 9c7-12 14-16 28-21l35-10c11-3 16 10 5 16l-21 9 24-3c11-1 13 12 4 15l-23 7 20-1c10 0 10 11 2 14l-28 10c-11 4-25 6-35-1z" />
          <path fill="none" strokeWidth="2" d="m-70 20 11 11m-105 15-32 15m55-16-25 13" />
        </g>
      </g>
      <path data-pour-splash fill="none" stroke="#ff2e88" strokeWidth="3" d="m477 285-10-11m45 10 13-11m-28 9 1-15" />
    </g>
  </svg>
}

export function ChapterShot({ shot }: { shot: 'eyes' | 'pour' | 'curtains' }) {
  return <div className={`chapter-shot chapter-shot--${shot}`} data-chapter-shot={shot} aria-hidden="true">
    {shot === 'eyes' && <>
      <div className="eye-panel"><img src={shotArtwork.eyesPanel} alt="" loading="lazy" /></div>
      <div className="ink-shutter" />
    </>}
    {shot === 'pour' && <>
      <img className="pour-shelf" src={shotArtwork.shelf} alt="" loading="lazy" />
      <PourDrawing />
    </>}
    {shot === 'curtains' && <>
      <img className="stage-floor" src={shotArtwork.stage} alt="" loading="lazy" />
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
    </>}
  </div>
}
