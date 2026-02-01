import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiCpu, FiMessageSquare, FiUsers, FiBox, FiSearch, FiPlusCircle } from 'react-icons/fi'
import UserMenu from './UserMenu'

export default function Navbar() {
    const { user } = useUser()
    const isAdmin = user?.primaryEmailAddress?.emailAddress === 'nikhilm.cs24@bmsce.ac.in'

    return (
        <nav className="liquid-navbar glass-card" style={{ width: 'auto', aspectRatio: 'auto', borderRadius: '50px', padding: '10px 30px' }}>
            <div className="glass-overlay" />
            <div className="glass-specular" />

            <div className="brand" style={{ position: 'relative', zIndex: 10 }}>Lost & Found</div>
            <div className="nav-links" style={{ position: 'relative', zIndex: 10 }}>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} title="Home">
                    <FiHome /> <span>Home</span>
                </NavLink>
                <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'active' : ''} title="AI Assistant">
                    <FiCpu /> <span>AI</span>
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''} title="Messages">
                    <FiMessageSquare /> <span>Chat</span>
                </NavLink>
                <NavLink to="/report/found" className={({ isActive }) => isActive ? 'active' : ''} title="Report Found">
                    <FiPlusCircle /> <span>Found</span>
                </NavLink>
                <NavLink to="/report/lost" className={({ isActive }) => isActive ? 'active' : ''} title="Report Lost">
                    <FiSearch /> <span>Lost</span>
                </NavLink>
                <NavLink to="/my-reports" className={({ isActive }) => isActive ? 'active' : ''} title="My Reports">
                    <FiBox /> <span>My Items</span>
                </NavLink>
                {isAdmin && (
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} title="All Users">
                        <FiUsers /> <span>Users</span>
                    </NavLink>
                )}
            </div>

            <UserMenu />
        </nav >
    )
}
