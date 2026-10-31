import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/inter'
import './styles/base.css'
import './styles/layout.css'
import './styles/timeline.css'
import './styles/constellation.css'
import './styles/sections.css'
import './styles/dialog.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
