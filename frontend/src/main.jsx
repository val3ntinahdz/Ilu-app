import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import Login from './App.jsx'
import HomePage from './homePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   {/* <Login />*/}
   <HomePage />
    
    
  </StrictMode>,
)
