import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { FiUser } from 'react-icons/fi'

export default function AdminUsers() {
    const { getToken } = useAuth()
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

    if (loading) return <div style={{ padding: 40, color: 'var(--text)' }}>Loading users...</div>
    if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>

    return (
        <div style={{ padding: '20px 20px 80px', color: 'var(--text)' }}>
            <h1 style={{ marginBottom: 20 }}>All Users</h1>

            {/* Desktop Table View */}
            <div className="desktop-view">
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    border: '1px solid var(--glass)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.3)' }}>
                            <tr>
                                <th style={{ padding: 15, borderBottom: '1px solid var(--glass)' }}>Name</th>
                                <th style={{ padding: 15, borderBottom: '1px solid var(--glass)' }}>Email</th>
                                <th style={{ padding: 15, borderBottom: '1px solid var(--glass)' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: 15 }}>{user.name}</td>
                                    <td style={{ padding: 15, color: 'var(--muted)' }}>{user.email}</td>
                                    <td style={{ padding: 15, color: 'var(--muted)' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Grid View */}
            <div className="mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
                {users.map(user => (
                    <div key={user.id} style={{
                        background: 'rgba(30,30,30,0.6)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--accent)', color: '#000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px'
                        }}>
                            <FiUser />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>{user.name}</div>
                            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '2px' }}>{user.email}</div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-view { display: none !important; }
                    .mobile-view { display: flex !important; }
                }
            `}</style>
        </div>
    )
}
