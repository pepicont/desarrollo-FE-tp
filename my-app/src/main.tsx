import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#37ff00ff' }}>
      <App  />
    </div>
  </StrictMode>,
)
