
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import UploadField from '../components/UploadField'

export default function ReportFound() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { user } = useUser()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Others')
  const [dateEvent, setDateEvent] = useState('')
  const [contactMethod, setContactMethod] = useState('email')
  const [contactPhone, setContactPhone] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  // files are managed by UploadField (previews generated there)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', description)
      fd.append('location', location)
      fd.append('category', category)
      fd.append('dateEvent', dateEvent)
      fd.append('contactMethod', contactMethod)
      if (contactMethod === 'phone') fd.append('contactPhone', contactPhone)
      fd.append('status', 'found')
      files.forEach((f) => fd.append('images', f))

      const token = await getToken()
      if (!token) {
        alert('You must be logged in to report items')
        setLoading(false)
        return
      }
      const base = import.meta.env.VITE_API_BASE || '/api'
      const res = await fetch(`${base}/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      if (!res.ok) {
        const text = await res.text()
        alert('Upload failed: ' + text)
        setLoading(false)
        return
      }

      const item = await res.json()
      // Redirect to item detail page
      navigate(`/items/${item._id}`)
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="top-hero">
        <div>
          <div className="page-title">Report Found Item</div>
          <div style={{ color: 'var(--muted)', marginTop: 6 }}>Add details and photos</div>
        </div>
      </div>
      <div className="report-panel">
        <div className="form-left">
          <div className="field-label">Photos</div>
          <UploadField files={files} setFiles={setFiles} />
          <div className="small-muted" style={{ marginTop: 8 }}>Tip: Add clear photos of the item and any distinguishing marks.</div>
        </div>

        <div className="form-right report-form">
          <form onSubmit={handleSubmit}>
            <label className="field-label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />

            <label className="field-label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />

            <label className="field-label">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />

            <label className="field-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Electronics', 'Clothing', 'Accessories', 'Documents', 'Others'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="field-label">Date Found</label>
            <input type="date" value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} required />

            <label className="field-label">Contact Method</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <label><input type="radio" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} /> Email</label>
              <label><input type="radio" checked={contactMethod === 'phone'} onChange={() => setContactMethod('phone')} /> Phone</label>
            </div>
            {contactMethod === 'phone' && (
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone Number" style={{ marginBottom: '12px' }} required />
            )}

            <button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Submit'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
