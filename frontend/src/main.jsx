import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './App.css'
import './components/LiquidStyles.css'
import { ThemeProvider } from './context/ThemeContext'
import ClerkThemeWrapper from './components/ClerkThemeWrapper'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkThemeWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
)
