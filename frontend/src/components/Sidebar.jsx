import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Lost & Found</div>
      <nav>
        <NavLink to="/" end className={({isActive})=> isActive ? 'active' : ''}>🏠 Home</NavLink>
        <NavLink to="/report/found" className={({isActive})=> isActive ? 'active' : ''}>📷 Report Found</NavLink>
        <NavLink to="/report/lost" className={({isActive})=> isActive ? 'active' : ''}>🔎 Report Lost</NavLink>
      </nav>
    </aside>
  )
}
