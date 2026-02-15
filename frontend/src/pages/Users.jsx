import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'
import { IoSend } from 'react-icons/io5'

export default function Users() {
    const { getToken } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={{ padding: 40, color: 'var(--neo-black)', fontWeight: 700 }}>Loading users...</div>
    if (error) return <div style={{ padding: 40, color: 'red', fontWeight: 700 }}>Error: {error}</div>

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: 32, textAlign: 'center' }}>All Users</h1>

            <style>{`
                .user-card-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                .user-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                }
                .user-joined {
                    display: none;
                }
                @media (min-width: 768px) {
                    .user-card-grid {
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    }
                    .user-joined {
                        display: block;
                        font-size: 14px;
                        font-weight: 700;
                        margin-right: 16px;
                    }
                }
            `}</style>
            <div className="user-card-grid">
                {users.map(user => (
                    <div key={user.id} className="neo-card user-item">
                        <div style={{
                            width: '48px', height: '48px', minWidth: '48px', // Fixed size
                            background: 'var(--neo-black)',
                            color: 'var(--neo-white)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 900,
                            border: '2px solid var(--neo-black)'
                        }}>
                            {user.imageUrl ? (
                                <img src={user.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={user.name} />
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() : '?'
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 /* Allow text truncation */ }}>
                            <div style={{
                                fontSize: '16px', fontWeight: 900, textTransform: 'uppercase',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {user.name || 'Unknown'}
                            </div>
                            <div style={{
                                fontSize: '12px', fontWeight: 700, opacity: 0.8,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {user.email}
                            </div>
                        </div>

                        <div className="user-joined">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                        </div>

                        <button
                            onClick={() => navigate(`/chat?userId=${user.id}&userName=${encodeURIComponent(user.name)}`)}
                            title="Message User"
                            style={{
                                background: 'var(--neo-black)',
                                color: 'var(--neo-white)',
                                border: '2px solid var(--neo-black)',
                                width: '44px', height: '44px', minWidth: '44px', // Fixed size
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                padding: 0
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <IoSend size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
