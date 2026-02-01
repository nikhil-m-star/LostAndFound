import React, { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiUser } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'

export default function UserMenu() {
    const { user, isSignedIn } = useUser()
    const { signOut } = useClerk()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)
    const { currentTheme, setCurrentTheme, themes } = useTheme()

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    if (!isSignedIn || !user) return null

    const handleLogout = () => {
        signOut(() => navigate('/'))
    }

    return (
        <div className="user-menu-container" ref={menuRef} style={{ position: 'relative', zIndex: 100 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="user-btn"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--neo-yellow)', /* Vibrant background */
                    border: '2px solid var(--neo-black)',
                    padding: '6px 16px 6px 6px',
                    borderRadius: '0', /* Sharp corners */
                    cursor: 'pointer',
                    color: 'var(--neo-black)',
                    boxShadow: '4px 4px 0 var(--neo-black)',
                    transition: 'all 0.1s ease',
                    transform: isOpen ? 'translate(2px, 2px)' : 'none'
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--neo-black)'
                }}>
                    <img
                        src={user.imageUrl}
                        alt={user.firstName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <span style={{ fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>{user.firstName}</span>
            </button>

            {isOpen && (
                <div className="user-dropdown" style={{
                    position: 'absolute',
                    top: '60px',
                    right: '0',
                    width: '260px',
                    background: 'var(--neo-white)',
                    border: '3px solid var(--neo-black)',
                    borderRadius: '0',
                    padding: '16px',
                    boxShadow: '8px 8px 0 var(--neo-black)',
                    overflow: 'hidden',
                    zIndex: 101
                }}>
                    <div style={{ padding: '0 0 16px 0', borderBottom: '3px solid var(--neo-black)', marginBottom: '16px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--neo-black)', textTransform: 'uppercase' }}>{user.fullName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--neo-black)', opacity: 0.7, fontWeight: 700 }}>{user.primaryEmailAddress?.emailAddress}</div>
                    </div>

                    {/* Removed Theme Section as requested */}

                    <div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                padding: '12px',
                                background: 'var(--neo-red)',
                                border: '2px solid var(--neo-black)',
                                color: 'var(--neo-black)',
                                borderRadius: '0',
                                fontSize: '16px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '4px 4px 0 var(--neo-black)',
                                transition: 'all 0.1s'
                            }}
                            onMouseEnter={(e) => { e.target.style.transform = 'translate(-2px, -2px)'; e.target.style.boxShadow = '6px 6px 0 var(--neo-black)'; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '4px 4px 0 var(--neo-black)'; }}
                        >
                            <FiLogOut /> Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
