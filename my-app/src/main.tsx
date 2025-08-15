import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SignIn from './components/sign-in/SignIn.tsx'
//import App from './App.tsx'+

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', backgroundColor: '#141926' }}>
      <SignIn  />
    </div>
  </StrictMode>,
)
