import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ScrollReveal from '../components/ScrollReveal'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken, userId } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', category: '', dateEvent: '', contactMethod: '', contactPhone: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const base = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${base}/items/${id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch item')
      }
      const data = await res.json()
      setItem(data)
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        category: data.category || 'Others',
        dateEvent: data.dateEvent ? data.dateEvent.split('T')[0] : '',
        contactMethod: data.contactMethod || 'email',
        contactPhone: data.contactPhone || ''
      })

      // Check if current user is the owner OR Admin
      if (userId && data.reportedBy) {
        try {
          const token = await getToken();
          const userRes = await fetch(`${base}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (userRes.ok) {
            const user = await userRes.json()
            const isAdmin = user.email === 'nikhilm.cs24@bmsce.ac.in';
            // Allow if owner OR admin
            setIsOwner(user._id === data.reportedBy._id || user._id === data.reportedBy.toString() || isAdmin)
          }
        } catch (e) {
          console.error('Error checking ownership:', e)
        }
      }
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load item. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (item) {
      setEditForm({
        title: item.title || '',
        description: item.description || '',
        location: item.location || '',
        category: item.category || 'Others',
        dateEvent: item.dateEvent ? item.dateEvent.split('T')[0] : '',
        contactMethod: item.contactMethod || 'email',
        contactPhone: item.contactPhone || ''
      })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const base = import.meta.env.VITE_API_BASE || '/api'
      const token = await getToken()
      if (!token) {
        alert('You must be logged in to edit items')
        return
      }

      const res = await fetch(`${base}/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) {
        const text = await res.text()
        alert('Update failed: ' + text)
        return
      }

      const updatedItem = await res.json()
      setItem(updatedItem)
      setIsEditing(false)
      alert('Item updated successfully!')
    } catch (err) {
      console.error(err)
      alert('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      const base = import.meta.env.VITE_API_BASE || '/api'
      const token = await getToken()
      if (!token) {
        alert('You must be logged in to delete items')
        return
      }

      const res = await fetch(`${base}/items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const text = await res.text()
        alert('Delete failed: ' + text)
        return
      }

      alert('Item deleted successfully!')
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red' }}>{error || 'Item not found'}</div>
        <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="detail-container" style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '20px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          background: 'var(--neo-white)',
          padding: '12px 24px',
          border: '3px solid var(--neo-black)',
          fontWeight: 900,
          boxShadow: '4px 4px 0 var(--neo-black)',
          fontSize: '16px'
        }}
      >
        <span style={{ fontSize: '20px' }}>←</span> BACK TO HOME
      </button>

      {/* Header */}
      <div className="detail-header" style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          marginBottom: '24px',
          lineHeight: 1,
          color: 'var(--neo-black)'
        }}>{item.title}</h1>

        <div className="detail-meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{
            background: 'var(--neo-violet)',
            border: '2px solid var(--neo-black)',
            padding: '8px 16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            boxShadow: '3px 3px 0 var(--neo-black)'
          }}>
            {item.category || 'Item'}
          </div>
          <div style={{
            background: item.status === 'lost' ? 'var(--neo-red)' : 'var(--neo-yellow)',
            border: '2px solid var(--neo-black)',
            padding: '8px 16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            boxShadow: '3px 3px 0 var(--neo-black)'
          }}>
            {item.status === 'lost' ? 'Lost Item' : 'Found Item'}
          </div>
          {item.location && (
            <div style={{
              background: 'var(--neo-white)',
              border: '2px solid var(--neo-black)',
              padding: '8px 16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '3px 3px 0 var(--neo-black)'
            }}>
              📍 {item.location}
            </div>
          )}
        </div>
      </div>

      <div className="detail-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px'
      }}>
        {/* Left Column: Images */}
        <div className="detail-image-section">
          <div className="detail-main-image-container" style={{
            border: '4px solid var(--neo-black)',
            background: 'var(--neo-black)',
            boxShadow: '8px 8px 0 var(--neo-black)',
            aspectRatio: '1/1',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0].url}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(item.images[0].url, '_blank')}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--neo-white)',
                color: 'var(--neo-black)',
                fontSize: '24px',
                fontWeight: 900
              }}>NO IMAGE</div>
            )}
          </div>

          {/* Thumbnails */}
          {item.images && item.images.length > 1 && (
            <div className="detail-thumbnails" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
              {item.images.map((img, idx) => (
                <div key={idx} style={{
                  width: '80px',
                  height: '80px',
                  border: '2px solid var(--neo-black)',
                  flexShrink: 0,
                  cursor: 'pointer',
                  background: 'var(--neo-black)'
                }}>
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={() => window.open(img.url, '_blank')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="detail-info-column" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Description Box */}
          <div style={{
            background: 'var(--neo-white)',
            border: '3px solid var(--neo-black)',
            padding: '24px',
            boxShadow: '6px 6px 0 var(--neo-black)'
          }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '3px solid var(--neo-black)', paddingBottom: '8px' }}>DESCRIPTION</h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              fontWeight: 500
            }}>{item.description || 'No description provided.'}</p>
          </div>

          {/* Action Bar (Edit/Delete) - Only Owner */}
          {isOwner && !isEditing && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={handleEdit} style={{
                flex: 1, background: 'var(--neo-yellow)', border: '3px solid var(--neo-black)', fontWeight: 900
              }}>EDIT THIS ITEM</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, background: 'var(--neo-red)', border: '3px solid var(--neo-black)', fontWeight: 900
              }}>
                {deleting ? 'DELETING...' : 'DELETE ITEM'}
              </button>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <div className="edit-form-panel" style={{
              background: 'var(--neo-white)',
              border: '3px solid var(--neo-black)',
              padding: '24px',
              boxShadow: '6px 6px 0 var(--neo-black)'
            }}>
              <h3 style={{ marginBottom: '16px' }}>EDIT ITEM</h3>
              {/* Reusing simple inputs with neo style */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="TITLE" style={{ padding: '12px', border: '3px solid var(--neo-black)', fontWeight: 700 }} />
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="DESCRIPTION" style={{ padding: '12px', border: '3px solid var(--neo-black)', fontWeight: 700, minHeight: '100px', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: 'var(--neo-black)', color: 'white' }}>SAVE</button>
                  <button onClick={handleCancelEdit} style={{ flex: 1 }}>CANCEL</button>
                </div>
              </div>
            </div>
          )}

          {/* Meta Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{ border: '2px solid var(--neo-black)', padding: '12px', background: 'var(--neo-white)' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase' }}>DATE</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {item.dateEvent ? new Date(item.dateEvent).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
            <div style={{ border: '2px solid var(--neo-black)', padding: '12px', background: 'var(--neo-white)' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase' }}>REPORTED ON</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Reporter Card */}

          <div className="reporter-card" style={{
            background: 'var(--neo-black)',
            color: 'var(--neo-white)',
            padding: '24px',
            border: '3px solid var(--neo-black)',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--neo-white)' }}>REPORTED BY</h3>
              {userId && item.reportedBy?._id && userId !== item.reportedBy?._id && (
                <button onClick={() => navigate(`/chat?userId=${item.reportedBy._id}`)} style={{
                  background: 'var(--neo-yellow)', color: 'black', border: '2px solid white', padding: '8px 16px', fontSize: '14px'
                }}>
                  MESSAGE USER
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '50px', height: '50px',
                background: 'var(--neo-white)', color: 'var(--neo-black)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 900,
                border: '2px solid var(--neo-white)'
              }}>
                {item.reportedBy?.name ? item.reportedBy.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{item.reportedBy?.name || 'Unknown'}</div>
                <div style={{ opacity: 0.7 }}>{item.reportedBy?.email}</div>
              </div>
            </div>

            <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, opacity: 0.6, marginBottom: '8px' }}>CONTACT INFO</div>
              {item.contactMethod === 'email' ? (
                <div style={{ fontWeight: 700, fontSize: '18px' }}>✉️ {item.reportedBy?.email}</div>
              ) : (
                <div style={{ fontWeight: 700, fontSize: '18px' }}>📞 {item.contactPhone || 'No Phone provided'}</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
