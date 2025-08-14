import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SignIn from './sign-in/SignIn.tsx'
//import App from './App.tsx'+

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignIn />
  </StrictMode>,
)
