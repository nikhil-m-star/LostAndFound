import React, { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiUser } from 'react-icons/fi'

export default function UserMenu() {
    const { user, isSignedIn } = useUser()
    const { signOut } = useClerk()
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

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
        <div className="user-menu-container" ref={menuRef} style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="user-btn"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(29, 185, 84, 0.2)',
                    padding: '6px 16px 6px 6px',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid var(--accent)'
                }}>
                    <img
                        src={user.imageUrl}
                        alt={user.firstName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{user.firstName}</span>
            </button>

            {isOpen && (
                <div className="user-dropdown" style={{
                    position: 'absolute',
                    top: '55px',
                    right: '0',
                    width: '200px',
                    background: '#141414',
                    border: '1px solid rgba(29, 185, 84, 0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{user.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.primaryEmailAddress?.emailAddress}</div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ff5555',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 85, 85, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <FiLogOut /> Log Out
                    </button>
                </div>
            )}
        </div>
    )
}
