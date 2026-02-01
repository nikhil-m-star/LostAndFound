import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiCpu, FiMessageSquare, FiUsers, FiBox } from 'react-icons/fi'
import { MdOutlineReport } from 'react-icons/md'
import UserMenu from './UserMenu'

export default function Navbar() {
    const { user } = useUser()
    const isAdmin = user?.primaryEmailAddress?.emailAddress === 'nikhilm.cs24@bmsce.ac.in'

    return (
        <nav className="liquid-navbar">
            <div className="brand">Lost & Found</div>
            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} title="Home">
                    <FiHome />
                </NavLink>
                <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'active' : ''} title="AI Assistant">
                    <FiCpu />
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''} title="Messages">
                    <FiMessageSquare />
                </NavLink>
                <NavLink to="/report/found" className={({ isActive }) => isActive ? 'active' : ''} title="Report Found">
                    <MdOutlineReport />
                </NavLink>
                <NavLink to="/report/lost" className={({ isActive }) => isActive ? 'active' : ''} title="Report Lost">
                    <MdOutlineReport />
                </NavLink>
                <NavLink to="/my-reports" className={({ isActive }) => isActive ? 'active' : ''} title="My Reports">
                    <FiBox />
                </NavLink>
                {isAdmin && (
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} title="All Users">
                        <FiUsers />
                    </NavLink>
                )}
            </div>

            <UserMenu />
        </nav >
    )
}
