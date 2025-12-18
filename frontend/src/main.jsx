import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import App from './App.jsx'
import './App.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#1DB954',
          colorText: '#e6e6e6',
          colorBackground: '#0b0b0b',
          colorInputBackground: '#141414',
          colorInputText: '#fff',
          fontFamily: 'Poppins, sans-serif',
          colorTextSecondary: '#b3b3b3',
          borderRadius: '12px'
        },
        elements: {
          card: {
            boxShadow: '0 0 30px rgba(29, 185, 84, 0.1), 0 0 60px rgba(29, 185, 84, 0.05)',
            border: '1px solid rgba(29, 185, 84, 0.1)',
            background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.98))',
            backdropFilter: 'blur(10px)',
            padding: '2rem'
          },
          headerTitle: {
            fontSize: '24px',
            fontWeight: 800,
            color: '#fff'
          },
          headerSubtitle: {
            color: '#b3b3b3'
          },
          formFieldInput: {
            border: '1px solid rgba(29, 185, 84, 0.1)',
            transition: 'all 0.2s',
            fontSize: '16px',
            padding: '12px'
          },
          formButtonPrimary: {
            background: 'linear-gradient(90deg, #179f46, #1DB954)',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none',
            border: 'none',
            boxShadow: '0 5px 15px rgba(29, 185, 84, 0.2)'
          },
          socialButtonsBlockButton: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '15px'
          },
          dividerLine: {
            background: 'rgba(255,255,255,0.08)'
          },
          dividerText: {
            color: '#666'
          },
          footerActionLink: {
            color: '#1DB954',
            fontWeight: 600
          }
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
)
