import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../utils/auth'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const txt = await res.text()
        alert('Login failed: ' + txt)
        setLoading(false)
        return
      }
      const data = await res.json()
      setToken(data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const base = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${base}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert('Google Login failed: ' + (data.message || 'Unknown error'))
        return
      }

      const data = await res.json()
      setToken(data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Google Login failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
      </form>

      <div style={{ marginTop: 20, borderTop: '1px solid #ddd', paddingTop: 20 }}>
        <p style={{ marginBottom: 10, textAlign: 'center', color: '#666' }}>Or sign in with BMSCE Google Account</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              alert('Google Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  )
}
