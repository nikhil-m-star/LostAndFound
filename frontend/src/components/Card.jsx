import React from 'react'

export default function Card({ id, title, subtitle, image, onClick }) {
  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="thumb">
        {image ? (
          <img src={image} alt={title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius:6}} />
        ) : (
          <div style={{width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: '#999'}}>
            No Image
          </div>
        )}
      </div>
      <div className="meta">
        <div className="title">{title}</div>
        <div className="sub">{subtitle}</div>
      </div>
    </div>
  )
}
