
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiCpu, FiMenu, FiX, FiLogOut, FiMessageSquare, FiBox, FiUsers } from 'react-icons/fi'
import { MdOutlineReport } from 'react-icons/md'
import { useUser, useClerk } from '@clerk/clerk-react'

export default function MobileNavbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, isSignedIn } = useUser()
    const { signOut } = useClerk()
    const navigate = useNavigate()

    const toggleOpen = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    const handleLogout = () => {
        signOut(() => {
            closeMenu()
            navigate('/')
        })
    }

    return (
        <>
            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={closeMenu}></div>

            {/* Mobile Menu Sidebar */}
            <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {/* User Profile Section (Inside Menu) */}
                    {isSignedIn && user ? (
                        <div className="mobile-user-profile">
                            <div className="mobile-user-avatar">
                                <img src={user.imageUrl} alt={user.firstName} />
                            </div>
                            <div className="mobile-user-info">
                                <span className="mobile-user-name">{user.fullName}</span>
                                <span className="mobile-user-email">{user.primaryEmailAddress?.emailAddress}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mobile-brand-header">
                            Lost & Found
                        </div>
                    )}

                    <nav className="mobile-nav-links">
                        <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>Home</span>
                        </NavLink>

                        <NavLink to="/ai-chat" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>AI Assistant</span>
                        </NavLink>

                        <NavLink to="/chat" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>Messages</span>
                        </NavLink>

                        <NavLink to="/my-reports" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>My Reports</span>
                        </NavLink>

                        <NavLink to="/admin/users" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>All Users</span>
                        </NavLink>

                        <NavLink to="/report/found" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>Report Found</span>
                        </NavLink>

                        <NavLink to="/report/lost" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                            <span>Report Lost</span>
                        </NavLink>
                    </nav>

                    {isSignedIn && (
                        <div className="mobile-menu-footer">
                            <button onClick={handleLogout} className="mobile-logout-btn">
                                <FiLogOut /> Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Hamburger Button (Placed last to be on top) */}
            <button
                className={`floating-menu-btn ${isOpen ? 'open' : ''}`}
                onClick={toggleOpen}
                aria-label="Toggle Menu"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
        </>
    )
}
