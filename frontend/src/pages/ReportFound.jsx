
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
    <div className="report-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'transparent', border: 'none', boxShadow: 'none', textDecoration: 'underline' }}>
        <span style={{ fontSize: '20px' }}>←</span> BACK TO HOME
      </button>

      <div style={{ marginBottom: '40px', borderBottom: '4px solid var(--neo-black)', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--neo-black)', marginBottom: '8px' }}>REPORT FOUND ITEM</h1>
        <p style={{ fontWeight: 700, color: 'var(--muted)', fontSize: '1.2rem' }}>Help return it to its owner.</p>
      </div>

      <style>{`
        .form-found input:focus,
        .form-found textarea:focus,
        .form-found select:focus {
          background-color: var(--neo-green) !important;
        }
      `}</style>

      <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {/* Left: Photos */}
        <div className="form-left">
          <div className="neo-label" style={{ marginBottom: '16px', fontSize: '18px' }}>EVIDENCE PHOTOS</div>
          <div style={{ background: 'var(--neo-white)', padding: '16px', border: '3px solid var(--neo-black)', boxShadow: '6px 6px 0 var(--neo-black)' }}>
            <UploadField files={files} setFiles={setFiles} />
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-right form-found">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="neo-label">TITLE</label>
              <input className="neo-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you find?" required />
            </div>

            <div>
              <label className="neo-label">DESCRIPTION</label>
              <textarea className="neo-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item..." required style={{ minHeight: '120px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="neo-label">CATEGORY</label>
                <select className="neo-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {['Electronics', 'Clothing', 'Accessories', 'Documents', 'Others'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="neo-label">DATE FOUND</label>
                <input className="neo-input" type="date" value={dateEvent} onChange={(e) => setDateEvent(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="neo-label">LOCATION</label>
              <input className="neo-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where was it found?" />
            </div>

            <div style={{ background: 'var(--neo-yellow)', border: '3px solid var(--neo-black)', padding: '16px' }}>
              <label className="neo-label" style={{ marginBottom: '12px', display: 'block' }}>CONTACT METHOD</label>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="radio" value="email" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} style={{ width: '20px', height: '20px', accentColor: 'var(--neo-black)' }} />
                  <span>EMAIL</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="radio" value="phone" checked={contactMethod === 'phone'} onChange={() => setContactMethod('phone')} style={{ width: '20px', height: '20px', accentColor: 'var(--neo-black)' }} />
                  <span>PHONE</span>
                </label>
              </div>
              {contactMethod === 'phone' && (
                <input className="neo-input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Enter Phone Number" required />
              )}
            </div>

            <button type="submit" disabled={loading} className="primary-action-btn" style={{ width: '100%', marginTop: '16px', fontSize: '18px', background: 'var(--neo-green)', color: 'var(--neo-black)', border: '3px solid var(--neo-black)' }}>
              {loading ? 'SUBMITTING...' : 'SUBMIT REPORT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
