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

      // Check if current user is the owner
      if (userId && data.reportedBy) {
        try {
          const token = await getToken();
          const userRes = await fetch(`${base}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (userRes.ok) {
            const user = await userRes.json()
            setIsOwner(user._id === data.reportedBy._id || user._id === data.reportedBy.toString())
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
    <div className="detail-container">
      <ScrollReveal>
        <button onClick={() => navigate('/')} className="back-link">
          ← Back to Home
        </button>

        {/* Header */}
        <div className="detail-header">
          <h1 className="page-title" style={{ fontSize: '3rem', marginBottom: '8px' }}>{item.title}</h1>
          <div className="detail-meta-row">
            <div className="detail-meta-tag tag-category">
              {item.category || 'Item'}
            </div>
            <div className="detail-meta-tag tag-status">
              {item.status === 'lost' ? 'Lost Item' : 'Found Item'}
            </div>
            {item.location && (
              <div className="detail-meta-tag tag-location">
                📍 {item.location}
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      <div className="detail-grid">
        {/* Left Column: Images */}
        <ScrollReveal delay={0.2}>
          <div className="detail-image-grid">
            {item.images && item.images.length > 0 ? (
              <>
                {/* Main Image */}
                <img
                  src={item.images[0].url}
                  alt={item.title}
                  className="detail-main-image"
                  onClick={() => window.open(item.images[0].url, '_blank')}
                />

                {/* Thumbnails (if more than 1) */}
                {item.images.length > 1 && (
                  <div className="detail-thumbnails">
                    {item.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`${item.title} ${idx + 1}`}
                        className={`detail-thumb ${idx === 0 ? 'active' : ''}`}
                        onClick={() => window.open(img.url, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-images-placeholder">
                <span>No images available</span>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Right Column: Details / Edit Form */}
        <ScrollReveal delay={0.3}>
          <div className="detail-info-box">
            {isEditing ? (
              <div className="report-form" style={{ padding: 0 }}>
                <div>
                  <label className="field-label">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    required
                    style={{ minHeight: '120px' }}
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {['Electronics', 'Clothing', 'Accessories', 'Documents', 'Others'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Date Event</label>
                  <input
                    type="date"
                    value={editForm.dateEvent}
                    onChange={(e) => setEditForm({ ...editForm, dateEvent: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Contact Method</label>
                  <select
                    value={editForm.contactMethod}
                    onChange={(e) => setEditForm({ ...editForm, contactMethod: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
                {editForm.contactMethod === 'phone' && (
                  <div>
                    <label className="field-label">Phone</label>
                    <input
                      value={editForm.contactPhone}
                      onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                )}
                <div>
                  <label className="field-label">Location</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={handleCancelEdit} disabled={saving} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isOwner && !isEditing && (
                  <div className="owner-action-bar">
                    <span className="owner-label">Your Report</span>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={handleEdit}>Edit</button>
                      <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                        {deleting ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Description Section */}
                <div className="info-group">
                  <div className="detail-label">About this Item</div>
                  <div className="detail-description">
                    {item.description || 'No description provided.'}
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="detail-stats-grid">
                  <div>
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{item.location || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="detail-label">{item.status === 'lost' ? 'Lost Date' : 'Found Date'}</div>
                    <div className="detail-value">
                      {item.dateEvent ? new Date(item.dateEvent).toLocaleDateString(undefined, {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Reported On</div>
                    <div className="detail-value">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'numeric', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Category</div>
                    <div className="detail-value">{item.category}</div>
                  </div>
                </div>

                {/* Reporter / Contact Card */}
                <div className="detail-reporter-card">
                  <div className="detail-label" style={{ marginBottom: '16px' }}>Reported By</div>

                  <div className="reporter-header">
                    <div className="reporter-avatar">
                      {item.reportedBy?.name ? item.reportedBy.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="reporter-info">
                      <div className="reporter-name">
                        {item.reportedBy?.name || 'Unknown User'}
                      </div>
                      <div className="reporter-email">
                        {item.reportedBy?.email || 'No Email'}
                      </div>
                    </div>
                    {/* Debug Logs */}
                    {console.log('DEBUG CHECK:', {
                      userId,
                      reporterId: item.reportedBy?._id,
                      match: userId === item.reportedBy?._id,
                      token: userId && item.reportedBy?._id && userId !== item.reportedBy?._id
                    })}
                    {userId && item.reportedBy?._id && (
                      <button
                        onClick={() => navigate(`/chat?userId=${item.reportedBy._id}`)}
                        style={{
                          marginLeft: 'auto',
                          padding: '6px 12px',
                          fontSize: '14px',
                          background: userId === item.reportedBy._id ? '#555' : 'var(--accent)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {userId === item.reportedBy._id ? 'Chat (Self)' : 'Chat'}
                      </button>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                    <div className="detail-label">Contact Information</div>

                    {item.contactMethod === 'email' && (
                      <div className="contact-row">
                        <span style={{ fontSize: '1.2em' }}>✉️</span>
                        <span style={{ color: 'var(--accent-light)' }}>
                          {item.reportedBy?.email || 'Email not available'}
                        </span>
                      </div>
                    )}

                    {item.contactPhone && (
                      <div className="contact-row">
                        <span style={{ fontSize: '1.2em' }}>📞</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '1.1em', color: 'white' }}>
                          {item.contactPhone}
                        </span>
                      </div>
                    )}

                    {!item.contactPhone && item.contactMethod !== 'email' && (
                      <div style={{ color: 'var(--muted)', marginTop: '8px', fontStyle: 'italic' }}>
                        No explicit contact details shared.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div >
  )
}
