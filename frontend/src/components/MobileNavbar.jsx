
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiCpu, FiMenu, FiX, FiLogOut } from 'react-icons/fi'
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
        <div className="mobile-navbar">
            <div className="mobile-header">
                <div className="brand" style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Lost & Found</div>
                <button className="hamburger-btn" onClick={toggleOpen}>
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                {isSignedIn && user && (
                    <div className="mobile-user-profile">
                        <div className="mobile-user-avatar">
                            <img src={user.imageUrl} alt={user.firstName} />
                        </div>
                        <div className="mobile-user-info">
                            <span className="mobile-user-name">{user.fullName}</span>
                            <span className="mobile-user-email">{user.primaryEmailAddress?.emailAddress}</span>
                        </div>
                    </div>
                )}

                <nav>
                    <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                        <FiHome /> <span>Home</span>
                    </NavLink>

                    <NavLink to="/ai-chat" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                        <FiCpu /> <span>AI Assistant</span>
                    </NavLink>

                    <NavLink to="/report/found" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                        <MdOutlineReport /> <span>Report Found</span>
                    </NavLink>

                    <NavLink to="/report/lost" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
                        <MdOutlineReport /> <span>Report Lost</span>
                    </NavLink>
                </nav>

                {isSignedIn && (
                    <button onClick={handleLogout} className="mobile-logout-btn">
                        <FiLogOut /> Log Out
                    </button>
                )}
            </div>
        </div>
    )
}
