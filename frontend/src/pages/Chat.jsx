import React, { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import { FiSend, FiMessageSquare } from 'react-icons/fi'

export default function Chat() {
    const { getToken, userId } = useAuth()
    const { user } = useUser()
    const [searchParams] = useSearchParams()
    const targetUserId = searchParams.get('userId')

    const [conversations, setConversations] = useState([])
    const [activeConversation, setActiveConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const messagesEndRef = useRef(null)

    // Initial load
    useEffect(() => {
        fetchConversations()
    }, [])

    // If navigated with userId, try to start/open that conversation
    useEffect(() => {
        if (targetUserId && conversations.length > 0) {
            const existing = conversations.find(c => c.user.id === targetUserId)
            if (existing) {
                setActiveConversation(existing)
            } else {
                // Fetch user logic if not in conversation list could be added here
                // For MVP, if they message a new person, it might be tricky without a "start new" endpoint
                // But users likely navigate from ItemDetail, so we might need a "create placeholder" logic
                // For now, let's assume we can fetch messages even if empty
                setActiveConversation({ user: { id: targetUserId, name: 'User' }, messages: [] })
            }
        }
    }, [targetUserId, conversations])

    useEffect(() => {
        let interval
        if (activeConversation) {
            fetchMessages(activeConversation.user.id)
            scrollBottom()
            // Poll for new messages every 5 seconds
            interval = setInterval(() => {
                fetchMessages(activeConversation.user.id, true)
            }, 5000)
        }
        return () => clearInterval(interval)
    }, [activeConversation?.user?.id])

    useEffect(() => {
        scrollBottom()
    }, [messages])

    const scrollBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchConversations = async () => {
        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setConversations(data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (partnerId, isPolling = false) => {
        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/chat/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
                if (!isPolling) {
                    // Mark as read
                    await fetch(`${base}/chat/mark-read`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ senderId: partnerId })
                    })
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeConversation) return

        const tempId = Date.now()
        const text = newMessage
        setNewMessage('')

        // Optimistic update
        setMessages(prev => [...prev, {
            id: tempId,
            sender_id: userId,
            content: text,
            created_at: new Date().toISOString(),
            is_read: false
        }])

        try {
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: activeConversation.user.id,
                    content: text
                })
            })

            if (res.ok) {
                const sentMsg = await res.json()
                // Replace temp message? Actually just re-fetch or let polling handle it
                // For smoother feel, let's update ID if we matched
                setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m))
                fetchConversations() // Update sidebar order
            }
        } catch (err) {
            console.error('Send failed', err)
        }
    }

    return (
        <div className="chat-page-container">
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="conversation-list">
                    {loading ? (
                        <div style={{ padding: 20 }}>Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: 20, color: 'var(--muted)' }}>No conversations yet.</div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.user.id}
                                className={`conversation-item ${activeConversation?.user?.id === conv.user.id ? 'active' : ''}`}
                                onClick={() => setActiveConversation(conv)}
                            >
                                <div className="conv-avatar">
                                    {conv.user.name ? conv.user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="conv-content">
                                    <div className="conv-name">{conv.user.name || 'User'}</div>
                                    <div className="conv-preview">{conv.lastMessage?.content}</div>
                                </div>
                                {conv.unreadCount > 0 && <div className="unread-badge">{conv.unreadCount}</div>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-main">
                {activeConversation ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-partner-name">
                                {activeConversation.user.name || 'User'}
                            </div>
                        </div>
                        <div className="chat-messages">
                            {messages.map(msg => {
                                const isMe = msg.sender_id === userId
                                return (
                                    <div key={msg.id} className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                                        {msg.content}
                                        <div className="msg-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-area" onSubmit={handleSend}>
                            <input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                <FiSend />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <FiMessageSquare size={48} color="var(--muted)" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}
