import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadField from '../components/UploadField'

export default function ReportLost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  // files managed by UploadField (previews shown there)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', description)
      fd.append('location', location)
      fd.append('status', 'lost')
      files.forEach((f) => fd.append('images', f))

      const token = localStorage.getItem('token')
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
          <div className="page-title">Report Lost Item</div>
          <div style={{color:'var(--muted)',marginTop:6}}>Describe it and add photos</div>
        </div>
      </div>
      <div className="report-panel">
        <div className="form-left">
          <div className="field-label">Photos</div>
          <UploadField files={files} setFiles={setFiles} />
          <div className="small-muted" style={{marginTop:8}}>Tip: Include any identifying marks or labels.</div>
        </div>

        <div className="form-right report-form">
          <form onSubmit={handleSubmit}>
            <label className="field-label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />

            <label className="field-label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />

            <label className="field-label">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />

            <button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Submit'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
