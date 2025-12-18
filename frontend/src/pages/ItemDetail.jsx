import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { isAuthenticated, getToken } from '../utils/auth'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      const token = getToken()
      if (token && data.reportedBy) {
        try {
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
      const token = getToken()
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
      const token = getToken()
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
    <div>
      <div className="top-hero">
        <div>
          <div className="page-title">{item.title}</div>
          <div style={{ color: 'var(--muted)', marginTop: 6, display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: 4, fontSize: '0.9em' }}>{item.category || 'Item'}</span>
            <span>{item.status === 'lost' ? 'Lost Item' : 'Found Item'}</span>
            {item.location && <span>• {item.location}</span>}
          </div>
        </div>
        <div>
          {isOwner && !isEditing && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete} disabled={deleting} style={{ backgroundColor: '#dc3545' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Images */}
        <div>
          <h3 style={{ marginBottom: '12px' }}>Photos</h3>
          {item.images && item.images.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {item.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${item.title} - ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px', color: '#999' }}>
              No images available
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h3 style={{ marginBottom: '12px' }}>Details</h3>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Title"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px', minHeight: '120px' }}
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
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
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label className="field-label">Contact Method</label>
                <select
                  value={editForm.contactMethod}
                  onChange={(e) => setEditForm({ ...editForm, contactMethod: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
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
                    style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                  />
                </div>
              )}
              <div>
                <label className="field-label">Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div className="field-label">Description</div>
                <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                  {item.description || 'No description provided'}
                </div>
              </div>
              {item.location && (
                <div>
                  <div className="field-label">Location</div>
                  <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    {item.location}
                  </div>
                </div>
              )}
              {item.reportedBy && (
                <div>
                  <div className="field-label">Reported By</div>
                  <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    {item.reportedBy.name || item.reportedBy.email || 'Unknown'}
                  </div>
                </div>
              )}
              <div>
                <div className="field-label">Reported On</div>
                <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              {item.dateEvent && (
                <div>
                  <div className="field-label">{item.status === 'lost' ? 'Lost On' : 'Found On'}</div>
                  <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    {new Date(item.dateEvent).toLocaleDateString()}
                  </div>
                </div>
              )}
              {(item.contactMethod === 'phone' || item.contactPhone) && (
                <div>
                  <div className="field-label">Contact Phone</div>
                  <div style={{ marginTop: '4px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    {item.contactPhone || 'No phone provided'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  )
}
