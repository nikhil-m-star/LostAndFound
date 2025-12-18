import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import ReportFound from './pages/ReportFound'
import ReportLost from './pages/ReportLost'
import Login from './pages/Login'
import Register from './pages/Register'
import { isAuthenticated, removeToken } from './utils/auth'
import Sidebar from './components/Sidebar'
import Player from './components/Player'

function Nav() {
  const navigate = useNavigate()
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/report/found">Report Found</Link>
      <Link to="/report/lost">Report Lost</Link>
      {!isAuthenticated() ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <button
          style={{ marginLeft: 12 }}
          onClick={() => {
            removeToken()
            navigate('/')
          }}
        >
          Logout
        </button>
      )}
    </nav>
  )
}

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report/found" element={<ReportFound />} />
          <Route path="/report/lost" element={<ReportLost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Player />
    </div>
  )
}
