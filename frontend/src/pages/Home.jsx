import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, SignUpButton, SignInButton } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import Card from '../components/Card'

import ScrollReveal from '../components/ScrollReveal'


// Variants for the grid container to stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Variants for each item card
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mouse position state for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const { isSignedIn, user } = useUser();
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()

    const handleMouseMove = (e) => {
      // Normalize mouse position from -1 to 1
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
      setItems(data)

    } catch (err) {
      console.error('Error fetching items:', err)
      setError('Could not load items. Please try again later.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (itemId) => {
    navigate(`/items/${itemId}`)
  }

  return (
    <div className="home-container">
      <ScrollReveal>
        <div className="top-hero hero-layout">
          {/* Parallax Wrappers for 3D Elements */}


          <div className="hero-content">
            <div className="page-title intro-title">Welcome to Lost & Found</div>

            {!isSignedIn && (
              // ... existing code ...
              <div className="auth-card">
                <h4 className="auth-title">Join the Community</h4>
                <div className="auth-buttons">
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
              <div className="welcome-section">
                <button onClick={() => navigate('/report/lost')} className="primary-action-btn">
                  Report an Item
                </button>
              </div>
            )}
          </div>


        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <h3 style={{ width: '100%', textAlign: 'center' }}>Recent reports {loading && '(Loading...)'}</h3>
      </ScrollReveal>

      {/* Show notice if using dummy data */}


      {/* Error is now handled by fallback, but if something catastrophic happens: */}
      {error && items.length === 0 && (
        <div style={{ color: 'red', padding: 20 }}>
          Error: {error}
        </div>
      )}

      {!loading && items.length === 0 && (
        <ScrollReveal>
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
        </ScrollReveal>
      )}

      {items.length > 0 && (
        <motion.div
          className="grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {items.map((item, index) => {
            const variants = ['red', 'yellow', 'green', 'violet'];
            const variant = variants[index % variants.length];
            return (
              <motion.div key={item._id} variants={itemVariants}>
                <Card
                  id={item._id}
                  title={item.title}
                  subtitle={`${item.status === 'lost' ? 'Lost' : 'Found'} ${item.location ? `at ${item.location}` : ''}`}
                  image={item.images && item.images.length > 0 ? item.images[0].url : null}
                  onClick={() => handleCardClick(item._id)}
                  variant={variant}
                />
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
