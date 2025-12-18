import React from 'react'

export default function Card({ title, subtitle, image }) {
  return (
    <div className="card">
      <div className="thumb">
        {image ? (
          <img src={image} alt={title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius:6}} />
        ) : null}
      </div>
      <div className="meta">
        <div className="title">{title}</div>
        <div className="sub">{subtitle}</div>
      </div>
    </div>
  )
}
