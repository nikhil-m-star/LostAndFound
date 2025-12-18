import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGoogleLogin } from '@react-oauth/google'
import { isAuthenticated, setToken } from '../utils/auth'
import Card from '../components/Card'
import ThreeDCube from '../components/ThreeDCube'
import ThreeDPyramid from '../components/ThreeDPyramid'
import ThreeDRing from '../components/ThreeDRing'

const DUMMY_ITEMS = [
  {
    _id: 'dummy_1',
    title: 'Blue Backpack',
    status: 'lost',
    location: 'Central Library',
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' }]
  },
  {
    _id: 'dummy_2',
    title: 'iPhone 13 Pro',
    status: 'found',
    location: 'Cafeteria',
    images: [{ url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80' }]
  },
  {
    _id: 'dummy_3',
    title: 'Golden Retriever',
    status: 'lost',
    location: 'Park Lane',
    images: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' }]
  },
  {
    _id: 'dummy_4',
    title: 'Car Keys',
    status: 'found',
    location: 'Parking Lot B',
    images: []
  }
]

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Auth State for Home Page Sign Up
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const base = import.meta.env.VITE_API_BASE || '/api'
      const url = `${base}/items?limit=20`
      console.log('Fetching items from:', url)

      const res = await fetch(url)

      if (!res.ok) {
        throw new Error('Backend unreachable')
      }

      const data = await res.json()

      if (data.length === 0) {
        setItems(DUMMY_ITEMS)
      } else {
        setItems(data)
      }

    } catch (err) {
      console.warn('Backend error or unreachable, showing dummy data:', err)
      // Fallback to dummy data
      setItems(DUMMY_ITEMS)
    } finally {
      setLoading(false)
    }
  }

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const base = import.meta.env.VITE_API_BASE || '/api'
        const res = await fetch(`${base}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })
        if (!res.ok) {
          const data = await res.json()
          alert('Google Login failed: ' + (data.message || 'Unknown error'))
          return
        }
        const data = await res.json()
        setToken(data.token)
        window.location.reload()
      } catch (err) {
        console.error(err)
        alert('Google Login failed')
      }
    },
    onError: () => alert('Login Failed'),
    flow: 'implicit' // default, but explicit for clarity
  });

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
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
        setAuthLoading(false)
        return
      }
      const data = await res.json()
      setToken(data.token)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Registration failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCardClick = (itemId) => {
    navigate(`/items/${itemId}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="top-hero" style={{ marginTop: '60px', marginBottom: '40px', gap: '40px' }}>
        <ThreeDPyramid />
        <ThreeDCube />
        <div>
          <div className="page-title">Welcome to Lost & Found</div>
          <div style={{ color: 'var(--muted)', marginTop: 20, fontSize: '32px' }}>Browse reports or add a new one</div>

          {!isAuthenticated() && (
            <div style={{ marginTop: 30, padding: 20, background: 'rgba(255,255,255,0.8)', borderRadius: 12, border: '1px solid #eee', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ marginBottom: 15 }}>Join the Community</h4>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <button
                  onClick={() => login()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#fff',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" style={{ width: 18, height: 18 }} />
                  Sign up with Google
                </button>
              </div>
              <div style={{ textAlign: 'center', margin: '10px 0', color: '#999' }}>- OR -</div>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <button type="submit" disabled={authLoading} style={{ padding: 8, marginTop: 5 }}>{authLoading ? 'Joining...' : 'Sign Up with Email'}</button>
              </form>
            </div>
          )}
        </div>
        <ThreeDCube />
        <ThreeDRing />
      </div>

      <h3 style={{ width: '100%', textAlign: 'center' }}>Recent reports {loading && '(Loading...)'}</h3>

      {/* Show notice if using dummy data */}


      {/* Error is now handled by fallback, but if something catastrophic happens: */}
      {error && items.length === 0 && (
        <div style={{ color: 'red', padding: 20 }}>
          Error: {error}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--muted)',
          backgroundColor: 'rgba(29,185,84,0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(29,185,84,0.1)'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>📭 No items found</div>
          <div style={{ fontSize: '14px' }}>Be the first to report a lost or found item!</div>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid">
          {items.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              title={item.title}
              subtitle={`${item.status === 'lost' ? 'Lost' : 'Found'} ${item.location ? `at ${item.location}` : ''}`}
              image={item.images && item.images.length > 0 ? item.images[0].url : null}
              onClick={() => handleCardClick(item._id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
