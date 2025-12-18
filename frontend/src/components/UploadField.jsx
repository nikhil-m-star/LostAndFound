import React from 'react'
import { FiUpload, FiX } from 'react-icons/fi'

export default function UploadField({ files, setFiles, max = 6 }) {
  const inputRef = React.useRef()

  const onFiles = (fileList) => {
    const arr = Array.from(fileList).slice(0, max)
    setFiles(prev => [...prev, ...arr].slice(0, max))
  }

  const handleChange = (e) => onFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }

  const removeAt = (index) => setFiles(prev => {
    const removed = prev[index]
    if (removed && removed.preview) URL.revokeObjectURL(removed.preview)
    return prev.filter((_, i) => i !== index)
  })

  // ensure each file has a preview url (mutate file objects so previews can be revoked)
  const filesWithPreview = files.map(f => {
    if (!f.preview) f.preview = URL.createObjectURL(f)
    return f
  })

  React.useEffect(() => {
    return () => {
      // revoke object URLs on unmount
      filesWithPreview.forEach(f => f.preview && URL.revokeObjectURL(f.preview))
    }
  }, [filesWithPreview])

  return (
    <div>
      <div className="file-drop" onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()} onClick={() => inputRef.current.click()} role="button" tabIndex={0}>
        <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleChange} style={{display:'none'}} />
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <FiUpload style={{width:20,height:20}} />
          <div>
            <div style={{fontWeight:700}}>Drag and drop photos here</div>
            <div style={{color:'var(--muted)',fontSize:13}}>or click to select (up to {max})</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
        {filesWithPreview.map((f, i) => (
          <div key={i} className="thumb-preview">
            <img src={f.preview} alt={f.name || `file-${i}`} />
            <button className="thumb-remove" onClick={(e)=>{e.stopPropagation(); removeAt(i)}} aria-label={`Remove ${f.name || 'image'}`}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
