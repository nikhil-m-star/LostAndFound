import React, { useState } from 'react'

export default function ReportFound() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFiles = (e) => setFiles(Array.from(e.target.files))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', description)
      fd.append('location', location)
      fd.append('status', 'found')
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
      alert('Item created: ' + item._id)
      // Reset
      setTitle('')
      setDescription('')
      setLocation('')
      setFiles([])
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
          <div style={{color:'var(--muted)',marginTop:6}}>Add details and photos</div>
        </div>
      </div>
      <div className="report-form">
        <form onSubmit={handleSubmit}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <input type="file" multiple accept="image/*" onChange={handleFiles} />
          <button type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Submit'}</button>
        </form>
      </div>
    </div>
  )
}
