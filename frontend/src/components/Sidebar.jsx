import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiSearch, FiCpu } from 'react-icons/fi'
import { BiLibrary } from 'react-icons/bi'
import { AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineReport } from 'react-icons/md'

// Playlists removed - not relevant for Lost & Found app

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Lost & Found</div>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}><FiHome style={{ width: 18, height: 18 }} /> <span>Home</span></NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}><FiSearch style={{ width: 18, height: 18 }} /> <span>Search</span></NavLink>
        <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'active' : ''}><FiCpu style={{ width: 18, height: 18 }} /> <span>AI Assistant</span></NavLink>
        <NavLink to="/report/found" className={({ isActive }) => isActive ? 'active' : ''}><MdOutlineReport style={{ width: 18, height: 18 }} /> <span>Report Found</span></NavLink>
        <NavLink to="/report/lost" className={({ isActive }) => isActive ? 'active' : ''}><MdOutlineReport style={{ width: 18, height: 18 }} /> <span>Report Lost</span></NavLink>
      </nav>
    </aside>
  )
}
