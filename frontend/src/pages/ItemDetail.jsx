import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

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

        <div className="owner-actions">
          {isOwner && !isEditing && (
            <>
              <button className="btn-edit" onClick={handleEdit}>Edit Report</button>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column: Images */}
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

        {/* Right Column: Details / Edit Form */}
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
              <div className="info-group">
                <div className="detail-label">Description</div>
                <div className="detail-description">
                  {item.description || 'No description provided'}
                </div>
              </div>

              <div className="info-group">
                <div className="detail-label">Location</div>
                <div className="detail-value">
                  {item.location || 'Unknown Location'}
                </div>
              </div>

              <div className="info-group">
                <div className="detail-label">Reported On</div>
                <div className="detail-value">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>

              {item.dateEvent && (
                <div className="info-group">
                  <div className="detail-label">{item.status === 'lost' ? 'Lost On' : 'Found On'}</div>
                  <div className="detail-value">
                    {new Date(item.dateEvent).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                </div>
              )}

              <div className="info-group">
                <div className="detail-label">Reported By</div>
                <div className="detail-value">
                  {item.reportedBy ? (
                    <span>
                      <span style={{ fontWeight: 'bold' }}>{item.reportedBy.name}</span>
                      <br />
                      <span style={{ fontSize: '0.9em', color: 'var(--muted)' }}>{item.reportedBy.email}</span>
                    </span>
                  ) : 'Unknown'}
                </div>
              </div>

              <div className="info-group">
                <div className="detail-label">Contact Info</div>
                <div className="detail-value">
                  {item.contactMethod === 'email' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📧 <span>{item.reportedBy?.email || 'Email (Attached to Reporter)'}</span>
                    </div>
                  )}
                  {item.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      📞 <span style={{ fontFamily: 'monospace' }}>{item.contactPhone}</span>
                    </div>
                  )}
                  {!item.contactPhone && item.contactMethod !== 'email' && (
                    <span style={{ color: 'var(--muted)' }}>No explicit contact info provided.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
