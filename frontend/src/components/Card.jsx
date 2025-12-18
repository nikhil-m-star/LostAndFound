import React from 'react'

export default function Card({ title, subtitle }) {
  return (
    <div className="card">
      <div className="thumb" />
      <div className="meta">
        <div className="title">{title}</div>
        <div className="sub">{subtitle}</div>
      </div>
    </div>
  )
}
