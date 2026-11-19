import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource/space-mono/latin.css'
import './style.css'
import { App } from './App'

const root = document.getElementById('root')!
if (root.firstElementChild) hydrateRoot(root, <App />)
else createRoot(root).render(<App />)
