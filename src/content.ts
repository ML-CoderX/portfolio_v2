export type Link = { label: string; href: string }
export type Project = {
  id: string
  index: string
  badge: string
  title: string
  description: string
  preview: readonly string[]
  stack: readonly string[]
  repo: string
  demo?: string
  span: string
  dossier?: { title: string; description: string; stages: readonly string[]; notes: readonly string[] }
}

export const profile = {
  name: 'Saad AR',
  first: 'Saad',
  last: 'AR',
  role: 'Machine Learning & Web Developer',
  url: 'https://saadar.dev/',
  email: 'saad.ar.dev@gmail.com',
  resume: '/Saad_Resume.pdf',
  title: 'Saad AR // Cel-Shaded Dev Portfolio',
  description: 'Explore Saad AR’s machine learning, web, and mobile projects in a cel-shaded portfolio. See selected work, technical dossiers, and ways to get in touch.',
  ogAlt: 'Saad AR in bold pink and ink lettering beside a cel-shaded workstation',
  socials: [
    { label: 'GitHub', href: 'https://github.com/ML-CoderX' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/saadar' },
    // TODO: Add X when a public profile URL is available.
  ],
}

export const copy = {
  skip: 'Skip to content', nav: 'Main navigation', menu: 'Menu',
  ready: '[CH.01 // READY]', resume: 'Résumé', download: 'Download full dossier',
  github: 'GitHub', demo: 'Live demo', open: 'Open dossier', close: 'Close dossier',
  blueprint: 'Architecture blueprint', detail: 'Inspect blueprint', technologies: 'Technologies',
  top: 'Back to top', email: 'Email', copy: 'Copy', copyEmail: 'Copy email',
  copied: 'Email copied!', copyFailed: 'Email selected. Use your device’s copy command.',
  scrollProgress: 'Reading progress', footer: '© Saad AR — Crafted in cel-shaded code',
  notFound: 'Page not found', home: 'Return to portfolio', missing: 'This page is missing.',
  resumePlaceholder: 'Resume placeholder. Replace this file before launch.',
  navLinks: [
    { label: 'Work', href: '#work' }, { label: 'About', href: '#about' },
    { label: 'Experience', href: '#toolkit' }, { label: 'Contact', href: '#contact' },
  ],
  hero: {
    chapter: '[PROTAGONIST ENTRY] // DEVELOPER', sfx: 'ズズズ // BAM!',
    intro: 'I build machine learning models, web applications, and mobile tools. I care about how they work, how they feel, and how reliably they run.',
    work: 'Explore my work', toolkit: 'Inspect toolkit', act: 'ACT', exp: '[EXP]',
    scroll: 'Scroll to discover', badge: '■ WORKSTATION', badgeTwo: 'CASHLIO // WALKTHROUGH',
    terminal: 'cashlio // walkthrough', alt: 'Cel-shaded laptop with a violet screen and pink keyboard',
    steps: ['Select profile', 'Record transaction', 'View summary'],
  },
  work: { chapter: '[CHAPTER 01 // SELECTED WORK]', stamp: '★ DOKAN!', title: 'Notable runs &', accent: 'missions', intro: 'Four projects across mobile development and applied machine learning. Open a dossier to see how Cashlio and DocuAI work.' },
  about: {
    chapter: '[CHAPTER 02 // ORIGIN STORY]', stamp: '★ CHARACTER FILE', title: 'Character bio &', accent: 'philosophy',
    alt: 'Manga-style illustrated character at a workstation',
    stats: ['CLASS: DEVELOPER', 'SPEC: CS + AI', 'STATUS: ONLINE'],
    log: 'DIALOGUE // FIRST-PERSON',
    quote: '“Hey! I’m Saad — a developer who treats code like sakuga animation: every frame and algorithm crafted with deliberate weight, rhythm, and precision.”',
    bio: 'I work across machine learning, web, and mobile development. I like following a project from the first experiment to an interface someone can actually use.',
    facets: [
      ['Careful evaluation', 'Check what a model gets right, where it fails, and how those failures affect the application.'],
      ['Dual-wielding', 'Move between Python modeling and reactive TypeScript interfaces.'],
      ['Rapid runtime', 'Keep the path from user input to useful feedback short.'],
    ],
  },
  toolkit: { chapter: '[CHAPTER 03 // BATTLE RECORD & TOOLKIT]', stamp: '★ LOADOUT', title: 'Timeline &', accent: 'arsenal matrix', intro: 'Project milestones and the tools I use for data, web, and application development.', log: 'Project milestones' },
  contact: { chapter: '[FINAL CHAPTER // TRANSMISSION]', stamp: '⚡ CLIMAX', title: 'What comes', accent: 'next?', badge: 'SEND A TRANSMISSION', intro: 'Got a machine learning problem, a web application to build, or a project you’d like to discuss? Send me an email.' },
  effects: { work: 'DODODO!', toolkit: 'ZWISH!', impact: 'BAM!', download: 'SHING!' },
}

export const projects: readonly Project[] = [
  {
    id: 'cashlio', index: 'PAGE 01 // FINTECH', badge: 'MOBILE APPLICATION',
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
    id: 'docuai', index: 'PAGE 02 // MED AI', badge: 'CLINICAL SUPPORT PROTOTYPE',
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
  {
    id: 'ipl', index: 'PAGE 03 // ML PROBABILITY', badge: 'SPORTS ANALYTICS',
    title: 'IPL Win Probability Engine',
    description: 'Explore how second-innings match conditions affect estimated win probabilities for both teams in a Streamlit interface.',
    preview: ['Second-innings inputs', 'Win probability estimate'],
    stack: ['Streamlit', 'Scikit-learn', 'Pandas'], repo: 'https://github.com/ML-CoderX/IPL_win_predictor', span: 'lg:col-span-6',
    // TODO: Restore the demo once https://ipl-win-predictor-2tp0.onrender.com responds.
  },
  {
    id: 'laptop', index: 'PAGE 04 // REGRESSION', badge: 'HARDWARE VALUATION',
    title: 'Laptop Spec & Price Predictor',
    description: 'A supervised regression project that estimates a laptop’s price in rupees from hardware specifications entered in Streamlit.',
    preview: ['Hardware specifications', 'Price estimate'],
    stack: ['Streamlit', 'Scikit-learn', 'Python'], repo: 'https://github.com/ML-CoderX/Laptop-price-predictor',
    demo: 'https://laptop-price-predictor-v64x.onrender.com/', span: 'lg:col-span-6',
  },
]

export const timeline = [
  { badge: 'MOBILE DEVELOPMENT', title: 'Built Cashlio', detail: 'Developed a personal finance app with separate profiles, spending charts, and PDF reports.', note: 'ANGULAR + IONIC' },
  { badge: 'TEAM PROJECT', title: 'Built DocuAI with a team', detail: 'Combined symptom-based machine learning predictions with Gemini suggestions in a clinical support prototype.', note: 'SCIKIT-LEARN + GEMINI' },
]

export const toolkit = [
  { name: 'AI & Data Science', items: ['Python', 'Scikit-learn', 'Pandas', 'NumPy'] },
  { name: 'Web & Mobile', items: ['Angular', 'TypeScript', 'Ionic', 'Tailwind CSS'] },
  { name: 'Backend & Data', items: ['Flask', 'Node.js', 'REST APIs', 'PostgreSQL'] },
  { name: 'Systems & Workflow', items: ['Git', 'GitHub', 'Linux', 'Bash'] },
]
