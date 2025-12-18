import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, SignUpButton, SignInButton } from '@clerk/clerk-react'
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

  const { isSignedIn, user } = useUser();
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

          {!isSignedIn && (
            <div style={{
              marginTop: 30,
              padding: '30px',
              background: 'rgba(20, 20, 20, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(29, 185, 84, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginBottom: 20, fontSize: '20px', fontWeight: 700 }}>Join the Community</h4>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, gap: '16px' }}>
                <SignUpButton mode="modal">
                  <button className="auth-btn auth-btn-signup">
                    Sign Up
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="auth-btn auth-btn-login">
                    Log In
                  </button>
                </SignInButton>
              </div>
            </div>
          )}
          {isSignedIn && (
            <div style={{ marginTop: 30 }}>
              <h3>Welcome back, {user.firstName}!</h3>
              <button onClick={() => navigate('/report/lost')} style={{
                padding: '12px 24px',
                marginTop: '10px',
                backgroundColor: '#1db954',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '16px',
                fontFamily: 'inherit',
                fontWeight: '600'
              }}>
                Report an Item
              </button>
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
