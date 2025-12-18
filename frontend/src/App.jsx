import React, { useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import Home from './pages/Home'
import ReportFound from './pages/ReportFound'
import ReportLost from './pages/ReportLost'
import ItemDetail from './pages/ItemDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import AIChat from './pages/AIChat'
import Sidebar from './components/Sidebar'
import UserMenu from './components/UserMenu'

function Nav() {
  // ... existing unused Nav code ...
  const { signOut } = useClerk()
  // ...
}

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        <UserMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/found" element={<ReportFound />} />
          <Route path="/report/lost" element={<ReportLost />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-chat" element={<AIChat />} />
        </Routes>
      </main>
      {/* Player removed — not needed for Lost & Found app */}
    </div>
  )
}
