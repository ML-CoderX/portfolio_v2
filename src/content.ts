export type Project = {
  id: string
  index: string
  badge: string
  title: string
  description: string
  preview: readonly string[]
  stack: readonly string[]
  repo?: string
  demo?: string
  span: string
  dossier?: { title: string; description: string; stages: readonly string[]; notes: readonly string[] }
}

export const githubProfile = { label: 'GitHub', href: 'https://github.com/ML-CoderX' }

export const profile = {
  name: 'Saad AR',
  first: 'Saad',
  last: 'AR',
  role: 'Machine Learning & Web Developer',
  url: 'https://saadar.dev/',
  email: 'rsaadt3@gmail.com',
  resume: '/Saad_Resume.pdf',
  title: 'Saad AR // Cel-Shaded Dev Portfolio',
  description: 'Explore Saad AR’s machine learning, web, and mobile projects in a cel-shaded portfolio. See selected work, technical dossiers, and ways to get in touch.',
  ogAlt: 'Saad AR in bold pink and ink lettering beside a cel-shaded workstation',
  socials: [
    githubProfile,
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/saadar' },
    // TODO: Add X when a public profile URL is available.
  ],
}

export const copy = {
  motion: { label: 'Motion', on: 'On', off: 'Off' },
  theme: { label: 'Night mode', day: 'Day', night: 'Night' },
  skip: 'Skip to content', nav: 'Main navigation', menu: 'Menu',
  ready: '[CH.01 // READY]', resume: 'Résumé', download: 'Download full dossier',
  chooseProject: 'Choose a project', allWork: 'See all my work', github: 'GitHub', demo: 'Live demo', open: 'Open dossier', close: 'Close dossier',
  blueprint: 'Architecture blueprint', technologies: 'Technologies',
  top: 'Back to top', email: 'Email', copy: 'Copy',
  copied: 'Email copied!', copyFailed: 'Email selected. Use your device’s copy command.',
  footer: '© Saad AR — Crafted in cel-shaded code',
  notFound: 'Page not found', home: 'Return to portfolio', missing: 'This page is missing.',
  navLinks: [
    { label: 'Work', href: '#work' }, { label: 'About', href: '#about' },
    { label: 'Experience', href: '#toolkit' }, { label: 'Contact', href: '#contact' },
  ],
  hero: {
    chapter: '[PROTAGONIST ENTRY] // DEVELOPER', sfx: 'ズズズ // BAM!',
    intro: 'I build machine learning models, web applications, and mobile tools. I care about how they work, how they feel, and how reliably they run.',
    work: 'Explore my work', toolkit: 'Inspect toolkit', act: 'ACT', exp: '[EXP]',
    scroll: 'Scroll to discover', badge: '■ WORKSTATION', badgeTwo: 'CASHLIO // WALKTHROUGH',
    terminal: 'cashlio // walkthrough',
    steps: ['Select profile', 'Record transaction', 'View summary'],
  },
  work: { chapter: '[CHAPTER 01 // SELECTED WORK]', stamp: '★ DOKAN!', title: 'Notable runs &', accent: 'missions', intro: 'Web, mobile, and machine learning projects. Open a dossier to see how Cashlio and DocuAI work.' },
  about: {
    chapter: '[CHAPTER 02 // ORIGIN STORY]', stamp: '★ CHARACTER FILE', title: 'Character bio &', accent: 'philosophy',
    alt: 'Manga-style portrait of a developer in glasses and a yellow-accented hoodie',
    log: 'DIALOGUE // FIRST-PERSON',
    quote: '“I’m Saad AR. I study computer science at Anjuman Institute of Technology and Management in Bhatkal. I like building things that answer a question someone actually has.”',
    bio: 'My projects range from Cashlio, a mobile app for tracking personal finances, to DocuAI, a prototype my team built to help clinicians review symptoms. Both taught me to think about what someone needs to see on the screen to make a decision. I’d like to explore more projects in healthcare, productivity, and education.',
    facets: [
      ['Intelligent systems', 'I use Python and Pandas to explore data, then build and test prediction models with Scikit-learn.'],
      ['Digital experiences', 'I build web and mobile apps with Angular and Ionic. In Cashlio, you can record an expense and see how it changes your spending for the month.'],
      ['Connected ideas', 'I’m also interested in hardware and IoT, especially how an Arduino can take a sensor reading and share it over Bluetooth.'],
    ],
  },
  toolkit: { chapter: '[CHAPTER 03 // BATTLE RECORD & TOOLKIT]', stamp: '★ LOADOUT', title: 'Timeline &', accent: 'arsenal matrix', intro: 'Project milestones and the tools I use for data, web, and application development.', log: 'Project milestones' },
  contact: { chapter: '[FINAL CHAPTER // TRANSMISSION]', stamp: '⚡ CLIMAX', title: 'What comes', accent: 'next?', badge: 'SEND A TRANSMISSION', intro: 'Got a machine learning problem, a web application to build, or a project you’d like to discuss? Send me an email.' },
}

export const projects: readonly Project[] = [
  {
    id: 'digital-safety-hub', index: 'PAGE 01 // DIGITAL SAFETY', badge: 'SIH 2026 SHORTLISTED',
    title: 'Digital Safety Hub',
    description: 'A scam-detection platform that checks text, screenshots, and URLs and guides users through reporting and recovery. Its email tools check SPF, DKIM, and DMARC, parse headers, and show sender geolocation.',
    preview: ['Scam detection', 'Report and recover', 'Email forensics'],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    repo: 'https://github.com/mdd700155-cloud/-digital-safety-hub',
    span: 'lg:col-span-7',
    // TODO: Add a verified live demo.
  },
  {
    id: 'agro-ai', index: 'PAGE 02 // AGRICULTURE', badge: 'FIRST PLACE · COLLEGE HACKATHON',
    title: 'Agro AI Advisory Platform',
    description: 'A platform for farmers that detects crop diseases, gives advice based on soil and weather, and looks up live mandi prices.',
    preview: ['Crop disease detection', 'Soil and weather advice', 'Mandi prices'],
    stack: [],
    repo: 'https://github.com/ML-CoderX/agro_ai',
    span: 'lg:col-span-5',
    // TODO: Add a verified stack or live demo.
  },
  {
    id: 'cashlio', index: 'PAGE 03 // FINTECH', badge: 'MOBILE APPLICATION',
    title: 'Cashlio — Personal Finance App',
    description: 'Track income and expenses across profiles, review charts and transaction history, and export PDF reports from an Ionic and Angular app.',
    preview: ['Profiles', 'Spending summaries', 'PDF reports'],
    stack: ['Angular', 'Ionic', 'TypeScript', 'Chart.js'],
    repo: 'https://github.com/ML-CoderX/Cashlio', span: 'lg:col-span-7',
    // TODO: Add a hosted Cashlio demo if one becomes available.
    dossier: {
      title: 'Cashlio — Transaction tracking & reports',
      description: 'Cashlio organizes credit and debit entries by profile. History and analytics use those transactions to show running balances, income versus expenses, and spending by category.',
      stages: ['Select a profile', 'Add income or expense', 'Review history and charts', 'Export a PDF report'],
      notes: ['Profiles keep separate transaction histories.', 'Backup and restore move app data between phones.', 'The repository includes an Android build for testing.'],
    },
  },
  {
    id: 'docuai', index: 'PAGE 04 // MED AI', badge: 'CLINICAL SUPPORT PROTOTYPE',
    title: 'DocuAI — Clinical Support Prototype',
    description: 'A team project that takes symptom input, uses a machine learning model to surface possible conditions, and provides Gemini-generated suggestions for clinician review.',
    preview: ['Symptom input', 'Model prediction', 'Gemini suggestions'],
    stack: ['Python', 'Scikit-learn', 'Gemini', 'Flask', 'Streamlit'],
    repo: 'https://github.com/subhankalgond/hackprix20', span: 'lg:col-span-5',
    // TODO: Add a hosted DocuAI demo if one becomes available.
    dossier: {
      title: 'DocuAI — Symptom-to-suggestion pipeline',
      description: 'The prototype combines model predictions and generative suggestions in a Streamlit interface. It was built as a clinical support exercise.',
      stages: ['Enter symptoms', 'Run the prediction model', 'Generate Gemini suggestions', 'Review the output'],
      notes: ['Scikit-learn powers the prediction model.', 'Gemini adds generated suggestions.', 'Flask supports the backend.'],
    },
  },
]

export const timeline = [
  { badge: 'SMART INDIA HACKATHON 2026', title: 'Digital Safety Hub shortlisted', detail: 'Built a scam-detection platform with a reporting and recovery flow.', note: 'NEXT.JS + TYPESCRIPT' },
  { badge: 'COLLEGE HACKATHON', title: 'Won first place with Agro AI', detail: 'Built a farmer-facing tool for crop health, growing advice, and live mandi prices.', note: 'FIRST PLACE' },
  { badge: 'MOBILE DEVELOPMENT', title: 'Built Cashlio', detail: 'Developed a personal finance app with separate profiles, spending charts, and PDF reports.', note: 'ANGULAR + IONIC' },
  { badge: 'TEAM PROJECT', title: 'Built DocuAI with a team', detail: 'Combined symptom-based machine learning predictions with Gemini suggestions in a clinical support prototype.', note: 'SCIKIT-LEARN + GEMINI' },
]

export const toolkit = [
  { name: 'AI & Data Science', items: ['Python', 'Scikit-learn', 'Pandas', 'NumPy'] },
  { name: 'Web & Mobile', items: ['Angular', 'TypeScript', 'Ionic', 'Tailwind CSS'] },
  { name: 'Backend & Data', items: ['Flask', 'Node.js', 'REST APIs', 'PostgreSQL'] },
  { name: 'Systems & Workflow', items: ['Git', 'GitHub', 'Linux', 'Bash'] },
]
