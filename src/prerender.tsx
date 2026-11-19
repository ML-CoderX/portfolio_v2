import { renderToString } from 'react-dom/server'
import { App } from './App'
import { copy, profile } from './content'

export { copy, profile }
export const render = () => renderToString(<App />)
