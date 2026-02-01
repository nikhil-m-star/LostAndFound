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
                    width: '240px',
                    background: '#141414',
                    border: '1px solid var(--accent-muted)',
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ padding: '0 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{user.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.primaryEmailAddress?.emailAddress}</div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', paddingLeft: '4px' }}>
                            THEME
                        </div>
                        <div style={{ display: 'flex', gap: '8px', padding: '0 4px' }}>
                            {Object.values(themes).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setCurrentTheme(t)}
                                    title={t.name}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: t.accent,
                                        border: currentTheme.id === t.id ? '2px solid white' : 'none',
                                        cursor: 'pointer',
                                        boxShadow: currentTheme.id === t.id ? `0 0 10px ${t.accent}` : 'none',
                                        transition: 'transform 0.2s',
                                        display: 'block', // Override global button flex
                                        padding: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '10px 8px',
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
                </div>
            )}
        </div>
    )
}
