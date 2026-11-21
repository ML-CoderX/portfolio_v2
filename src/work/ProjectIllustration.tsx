type Props = { project: string }

// Decorative drawings mirror the features described in each project's DOM copy.
export function ProjectIllustration({ project }: Props) {
  const dots = `comic-dots-${project}`
  return <div className="project-illustration" data-project-art={project} aria-hidden="true">
    <svg viewBox="0 0 600 260" fill="none" stroke="#0b0b12" strokeWidth="3" strokeLinejoin="round">
      <defs><pattern id={dots} width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#0b0b12" stroke="none" /></pattern></defs>
      <g data-art-layer="background">
        <path d="M0 230 600 38M0 150 600 100M100 260 420 0M280 260 480 0" opacity=".14" />
        <ellipse cx="310" cy="218" rx="196" ry="22" fill="#0b0b12" opacity=".14" stroke="none" />
        <circle cx="300" cy="123" r="108" fill={`url(#${dots})`} opacity=".2" stroke="none" />
      </g>
      {project === 'digital-safety-hub' && <>
        <g data-art-layer="middle">
          <path d="m144 52 270 15-8 161-270-15z" fill="#0b0b12" />
          <path d="m136 43 270 15-8 161-270-15z" fill="#f6f3ec" />
          <path d="m136 43 270 15-2 33-270-15z" fill="#6c4bff" />
          <path d="m157 59 3 0m12 1 3 0m12 1 3 0" stroke="#f6f3ec" strokeWidth="6" strokeLinecap="round" />
          <path d="m156 108 102 6m-104 16 193 11m-194 13 172 10m-173 12 114 6" strokeWidth="7" />
          <path d="m333 151 29 48h-58z" fill="#fde400" /><path d="M333 167v13m0 7v3" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-x="-48" data-art-rotation="-8">
          <path d="m371 153 58 52" strokeWidth="22" strokeLinecap="round" />
          <path d="m371 153 58 52" stroke="#ff2e88" strokeWidth="13" strokeLinecap="round" />
          <circle cx="335" cy="117" r="53" fill="#6c4bff" />
          <circle cx="335" cy="117" r="43" fill="#f6f3ec" />
          <path d="M308 108h52m-52 17h38" strokeWidth="6" /><path d="M305 139h59" stroke="#ff2e88" strokeWidth="4" />
          <path d="M304 95q7-14 24-16" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </g>
      </>}
      {project === 'agro-ai' && <>
        <g data-art-layer="middle">
          <path d="M40 210q130-100 260 0 130-100 260 0v50H40z" fill="#6c4bff" />
          <path d="m60 244 80-44m-20 52 80-44m190 44 70-44m-10 44 70-44" stroke="#f6f3ec" />
          <circle cx="426" cy="66" r="25" fill="#fde400" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-rotation="-9">
          <path d="M282 212Q160 165 213 49q136-12 159 69 10 83-90 94Z" fill="#f6f3ec" />
          <path d="M282 212Q160 165 213 49q72 61 69 163Z" fill="#fde400" />
          <path d="m290 237-8-25Q278 124 213 49m63 124-49-21m41-12-44-29m60 76 48-35m-61-22 34-28" />
          <path d="m310 105 12-5 11 13-5 16-18-2-7-11zm22 40 10 3 2 14-12 7-8-10z" fill="#ff2e88" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-scale="1.18" data-art-opacity=".25" stroke="#ff2e88" strokeWidth="4">
          <path d="M295 86h-14v21m70-21h15v21m-85 62v21h14m56 0h15v-21" />
          <path d="M290 139h67" opacity=".6" />
        </g>
      </>}
      {project === 'cashlio' && <>
        <g data-art-layer="middle">
          <path d="m179 34 130 10 10 193-130-10z" fill="#0b0b12" />
          <path d="m168 25 130 10 10 193-130-10z" fill="#6c4bff" />
          <path d="m180 50 105 8 7 137-105-8z" fill="#f6f3ec" />
          <path d="m210 40 40 3m-21 164 19 1" stroke="#f6f3ec" strokeWidth="4" strokeLinecap="round" />
          <path d="m198 166-2-35 17 1 2 35zm27 2-4-62 17 1 4 62zm27 2-6-88 17 1 6 88z" fill="#ff2e88" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-x="-55" data-art-rotation="-12">
          <path d="m329 42 113 20-28 165-13-10-16 5-12-10-16 5-12-10-16 5-12-10-17 5z" fill="#0b0b12" />
          <path d="m321 34 113 20-28 165-13-10-16 5-12-10-16 5-12-10-16 5-12-10-17 5z" fill="#f6f3ec" />
          <path d="m337 68 77 13m-80 6 77 13m-80 7 40 7m-44 12 77 13m-80 7 77 13m-81 13 53 9" strokeWidth="5" />
          <path d="m326 150 77 13" stroke="#ff2e88" strokeWidth="8" />
        </g>
      </>}
      {project === 'docuai' && <>
        <g data-art-layer="middle">
          <path d="m131 69 133-19 23 155-133 19z" fill="#f6f3ec" />
          <path d="m149 95 76-11m-73 34 97-14m-94 34 97-14m-94 34 63-9" strokeWidth="5" />
          <path d="m180 182 11-2 3-14 9 25 9-22 21-3" stroke="#ff2e88" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-x="-30" data-art-rotation="-8">
          <path d="M237 41h133v164H237z" fill="#6c4bff" />
          <path d="m262 93 35-22 44 35-40 49-39-62 39 62 40-49m-44-35 4 84" stroke="#f6f3ec" />
          {[ [262, 93], [297, 71], [341, 106], [301, 155] ].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="8" fill="#fde400" />)}
          <path d="M259 181h89" stroke="#f6f3ec" strokeWidth="5" />
        </g>
        <g data-art-layer="foreground" data-art-action data-art-x="-90" data-art-rotation="-15">
          <path d="m366 68 128 21-25 151-128-21z" fill="#f6f3ec" />
          <path d="m391 97 15 3m-6-9-3 15" stroke="#ff2e88" strokeWidth="6" />
          <path d="m370 125 93 15m-96 6 76 12m-79 10 93 15" strokeWidth="5" />
          <circle cx="427" cy="205" r="27" fill="#fde400" /><path d="m414 204 9 10 18-20" strokeWidth="5" />
        </g>
      </>}
    </svg>
  </div>
}
