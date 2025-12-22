import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

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
        <div style={{ padding: 40, color: 'var(--text)' }}>
            <h1 style={{ marginBottom: 20 }}>All Users</h1>
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                border: '1px solid var(--glass)',
                overflowX: 'auto' // Allow horizontal scroll on mobile
            }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
    )
}
