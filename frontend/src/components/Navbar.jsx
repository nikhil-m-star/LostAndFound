import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiCpu, FiMessageSquare, FiUsers, FiBox } from 'react-icons/fi'
import { MdOutlineReport } from 'react-icons/md'
import UserMenu from './UserMenu'

export default function Navbar() {
    return (
        <nav className="liquid-navbar">
            <div className="brand">Lost & Found</div>
            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                    <FiHome /> <span>Home</span>
                </NavLink>
                <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FiCpu /> <span>AI Assistant</span>
                </NavLink>
                <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FiMessageSquare /> <span>Messages</span>
                </NavLink>
                <NavLink to="/report/found" className={({ isActive }) => isActive ? 'active' : ''}>
                    <MdOutlineReport /> <span>Report Found</span>
                </NavLink>
                <NavLink to="/report/lost" className={({ isActive }) => isActive ? 'active' : ''}>
                    <MdOutlineReport /> <span>Report Lost</span>
                </NavLink>
                <NavLink to="/my-reports" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FiBox /> <span>My Reports</span>
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                    <FiUsers /> <span>All Users</span>
                </NavLink>
            </div>

            <UserMenu />
        </nav >
    )
}
