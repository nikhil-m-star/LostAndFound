import React, { useState } from 'react'
import { Analytics } from "@vercel/analytics/react"
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import Home from './pages/Home'
import ReportFound from './pages/ReportFound'
import ReportLost from './pages/ReportLost'
import ItemDetail from './pages/ItemDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import AIChat from './pages/AIChat'
import Chat from './pages/Chat'
import Sidebar from './components/Sidebar'
import UserMenu from './components/UserMenu'
import MobileNavbar from './components/MobileNavbar'
import FluidBackground from './components/FluidBackground'

export default function App() {
  return (
    <div className="app">
      <FluidBackground />
      <Sidebar />
      <MobileNavbar />
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
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
      {/* Player removed — not needed for Lost & Found app */}
      <Analytics />
    </div>
  )
}
