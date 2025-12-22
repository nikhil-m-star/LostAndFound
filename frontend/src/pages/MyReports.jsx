import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { motion } from 'framer-motion'

export default function MyReports() {
    const { getToken } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [debugUser, setDebugUser] = useState(null)

    useEffect(() => {
        fetchMyItems()
        fetchCurrentUser()
    }, [])

    const fetchCurrentUser = async () => {
        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setDebugUser(data)
                console.log('Current DB User:', data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const fetchMyItems = async () => {
        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/items/my-items`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch your reports')
            const data = await res.json()
            setItems(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={{ padding: 40, color: 'var(--text)' }}>Loading your reports...</div>
    if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>

    return (
        <div className="home-container" style={{ padding: 20 }}>
            <h1 className="page-title intro-title" style={{ marginBottom: 10 }}>My Reports</h1>
            <p className="intro-subtitle" style={{ marginBottom: 40 }}>From Lost to Found.</p>

            {items.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 50 }}>
                    <h3 style={{ fontSize: 24, marginBottom: 20 }}>No items reported yet.</h3>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                        <Link to="/report/lost" className="primary-action-btn" style={{ textDecoration: 'none' }}>Report Lost</Link>
                        <Link to="/report/found" className="primary-action-btn" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--accent)' }}>Report Found</Link>
                    </div>
                </div>
            ) : (
                <div className="grid">
                    {items.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card item={item} />
                        </motion.div>
                    ))}
                </div>
            )}
            {/* DEBUG INFO: Remove after fixing */}
            {debugUser && (
                <div style={{ marginTop: 40, padding: 20, background: '#333', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}>
                    <p style={{ color: '#aaa' }}>DEBUG INFO (Please report this ID):</p>
                    <p>Database User ID: <span style={{ color: 'var(--accent)' }}>{debugUser.id}</span></p>
                    <p>Email: {debugUser.email}</p>
                    <p>Clerk ID: {debugUser.clerk_id}</p>
                </div>
            )}
        </div>
    )
}
