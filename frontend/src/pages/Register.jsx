import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from '../utils/auth'
import { GoogleLogin } from '@react-oauth/google'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const txt = await res.text()
        alert('Registration failed: ' + txt)
        setLoading(false)
        return
      }
      const data = await res.json()
      setToken(data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Registration failed')
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
        alert('Google Signup failed: ' + (data.message || 'Unknown error'))
        return
      }

      const data = await res.json()
      setToken(data.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Google Signup failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit" disabled={loading}>{loading ? 'Registering…' : 'Register'}</button>
      </form>

      <div style={{ marginTop: 20, borderTop: '1px solid #ddd', paddingTop: 20 }}>
        <p style={{ marginBottom: 10, textAlign: 'center', color: '#666' }}>Or sign up with BMSCE Google Account</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Signup Failed');
              alert('Google Signup Failed');
            }}
            text="signup_with"
          />
        </div>
      </div>
    </div>
  )
}
