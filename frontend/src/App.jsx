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
import MyReports from './pages/MyReports'
import AdminUsers from './pages/AdminUsers'
import Navbar from './components/Navbar'
import UserMenu from './components/UserMenu'
import MobileNavbar from './components/MobileNavbar'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <MobileNavbar />
      <main className="main-content" style={{ position: 'relative' }}>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/report/found" element={
            <PrivateRoute>
              <ReportFound />
            </PrivateRoute>
          } />
          <Route path="/report/lost" element={
            <PrivateRoute>
              <ReportLost />
            </PrivateRoute>
          } />
          <Route path="/items/:id" element={
            <PrivateRoute>
              <ItemDetail />
            </PrivateRoute>
          } />
          <Route path="/ai-chat" element={
            <PrivateRoute>
              <AIChat />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/my-reports" element={
            <PrivateRoute>
              <MyReports />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute>
              <AdminUsers />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      {/* Player removed — not needed for Lost & Found app */}
      <Analytics />
    </div>
  )
}
