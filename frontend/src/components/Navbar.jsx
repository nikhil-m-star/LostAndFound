import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiCpu, FiMessageSquare, FiUsers, FiBox, FiSearch, FiPlusCircle } from 'react-icons/fi'
import UserMenu from './UserMenu'

export default function Navbar() {
    const { user } = useUser()
    const isAdmin = user?.primaryEmailAddress?.emailAddress === 'nikhilm.cs24@bmsce.ac.in'

    return (
        <nav className="neo-navbar">
            <div className="neo-brand">Lost & Found</div>
            <div className="neo-nav-links" style={{ display: 'flex', gap: '16px' }}>
                <NavLink to="/" end className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="Home">
                    <span>Home</span>
                </NavLink>
                <NavLink to="/ai-chat" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="AI Assistant">
                    <span>AI</span>
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="Messages">
                    <span>Chat</span>
                </NavLink>
                <NavLink to="/report/found" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="Report Found">
                    <span>Found</span>
                </NavLink>
                <NavLink to="/report/lost" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="Report Lost">
                    <span>Lost</span>
                </NavLink>
                <NavLink to="/my-reports" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="My Reports">
                    <span>My Items</span>
                </NavLink>
                {isAdmin && (
                    <NavLink to="/admin/users" className={({ isActive }) => `neo-nav-link ${isActive ? 'active' : ''}`} title="All Users">
                        <span>Users</span>
                    </NavLink>
                )}
            </div>

            <UserMenu />
        </nav >
    )
}
