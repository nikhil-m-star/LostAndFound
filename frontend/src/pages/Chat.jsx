import React, { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiSend, FiMessageSquare, FiArrowLeft, FiUsers } from 'react-icons/fi'

export default function Chat() {
    const { getToken, userId } = useAuth()
    const { user } = useUser()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const targetUserId = searchParams.get('userId')

    const [conversations, setConversations] = useState([])
    const [activeConversation, setActiveConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    // Search State
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    const messagesEndRef = useRef(null)

    const [currentSupabaseUser, setCurrentSupabaseUser] = useState(null)

    // Initial load
    useEffect(() => {
        fetchCurrentUser()
        fetchConversations()
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
                setCurrentSupabaseUser(data)
            }
        } catch (err) {
            console.error('Failed to fetch user', err)
        }
    }

    // If navigated with userId, try to start/open that conversation
    useEffect(() => {
        if (targetUserId) {
            const existing = conversations.find(c => c.user.id === targetUserId)
            if (existing) {
                console.log('DEBUG Found existing:', existing);
                setActiveConversation(existing)
            } else {
                // Determine if we are still loading conversations
                // If we are loading, we might want to wait, BUT:
                // If the list is truly empty, we need to fall into this block.
                // The `conversations` dependency ensures this re-runs when they load.
                // So it is safe to set a temporary placeholder here.

                // Ideally we would fetch the user name here so it doesn't say "User"
                // But for now enabling the chat is the priority.
                console.log('DEBUG setting placeholder for:', targetUserId);
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
            sender_id: currentSupabaseUser?.id || userId, // Use strict ID
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
                // Replace temp message with real one
                setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m))

                // Update conversation list but DO NOT reset activeConversation
                // We do this by calling fetchConversations, but we ensure activeConversation isn't clobbered
                // The current implementation of fetchConversations just setsConversations, which is fine.
                // activeConversation holds a reference to an object. Even if conversations array is replaced,
                // activeConversation still points to the old valid object.
                // The issue might be that the REFERENCE in the sidebar list updates, but activeConversation is old.
                // This shouldn't be an issue for React unless we rely on object identity for equality checks.
                // Sidebar uses ID check: activeConversation?.user?.id === conv.user.id

                fetchConversations()
            }
        } catch (err) {
            console.error('Send failed', err)
            // Rollback optimistic update?
            setMessages(prev => prev.filter(m => m.id !== tempId))
            alert('Failed to send message')
        }
    }

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch()
            } else {
                setSearchResults([])
            }
        }, 500) // Debounce

        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = async () => {
        try {
            setIsSearching(true)
            const token = await getToken()
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/chat/users/search?q=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data)
            }
        } catch (err) {
            console.error('Search failed', err)
        } finally {
            setIsSearching(false)
        }
    }

    const selectUser = (user) => {
        setSearchQuery('') // Clear search
        setSearchResults([])

        // check if conversation exists
        const existing = conversations.find(c => c.user.id === user.id)
        if (existing) {
            setActiveConversation(existing)
        } else {
            // Create placeholder
            setActiveConversation({ user: { id: user.id, name: user.name, email: user.email }, messages: [] })
        }
    }

    return (
        <div className={`chat-page-container ${activeConversation ? 'mobile-view-thread' : ''}`} style={{
            display: 'flex', height: 'calc(100vh - 80px)', background: 'var(--neo-white)', border: '2px solid var(--neo-black)', margin: '20px'
        }}>
            <div className="chat-sidebar" style={{
                width: '320px', borderRight: '2px solid var(--neo-black)', display: 'flex', flexDirection: 'column', background: 'var(--neo-bg)'
            }}>
                <div className="chat-sidebar-header" style={{ padding: '16px', borderBottom: '2px solid var(--neo-black)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <button onClick={() => navigate('/')} className="back-link" style={{ padding: 0, fontSize: '15px', background: 'transparent', border: 'none', color: 'var(--neo-black)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiArrowLeft /> BACK
                        </button>

                        <button onClick={() => navigate('/admin/users')} style={{
                            background: 'var(--neo-yellow)', border: '2px solid var(--neo-black)',
                            color: 'var(--neo-black)', padding: '6px 12px', fontSize: '12px', fontWeight: 900,
                            cursor: 'pointer', boxShadow: '2px 2px 0 var(--neo-black)'
                        }}>
                            FIND USERS
                        </button>
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--neo-black)' }}>Messages</h2>
                    <input
                        className="chat-search-input"
                        placeholder="SEARCH USERS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '10px', border: '2px solid var(--neo-black)', borderRadius: 0,
                            fontFamily: 'Space Grotesk', fontWeight: 700, background: 'var(--neo-white)', color: 'var(--neo-black)', outline: 'none'
                        }}
                    />
                </div>
                <div className="conversation-list" style={{ flex: 1, overflowY: 'auto' }}>
                    {searchQuery.length >= 2 ? (
                        <div className="search-results-list">
                            <div className="list-label" style={{ padding: '8px 16px', color: 'var(--neo-black)', fontWeight: 700, background: 'var(--neo-violet)', borderBottom: '2px solid var(--neo-black)' }}>
                                SEARCH RESULTS
                            </div>
                            {isSearching ? (
                                <div style={{ padding: '16px' }}>Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div style={{ padding: '16px' }}>No users found.</div>
                            ) : (
                                searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        className="conversation-item"
                                        onClick={() => selectUser(user)}
                                        style={{
                                            padding: '16px', borderBottom: '2px solid var(--neo-black)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                            background: 'var(--neo-white)', transition: 'background 0.1s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--neo-yellow)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--neo-white)'}
                                    >
                                        <div className="conv-avatar" style={{
                                            width: '40px', height: '40px', background: 'var(--neo-black)', color: 'var(--neo-white)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', border: '2px solid var(--neo-black)'
                                        }}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="conv-content">
                                            <div className="conv-name" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{user.name}</div>
                                            <div className="conv-preview" style={{ fontSize: '12px', fontWeight: 600 }}>{user.email}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        loading ? (
                            <div style={{ padding: 20 }}>Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div style={{ padding: 20, color: 'var(--neo-black)' }}>No conversations yet.</div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.user.id}
                                    className={`conversation-item ${activeConversation?.user?.id === conv.user.id ? 'active' : ''}`}
                                    onClick={() => setActiveConversation(conv)}
                                    style={{
                                        padding: '16px', borderBottom: '2px solid var(--neo-black)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                        background: activeConversation?.user?.id === conv.user.id ? 'var(--neo-yellow)' : 'var(--neo-white)',
                                        transition: 'background 0.1s'
                                    }}
                                >
                                    <div className="conv-avatar" style={{
                                        width: '40px', height: '40px', background: 'var(--neo-black)', color: 'var(--neo-white)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', border: '2px solid var(--neo-black)'
                                    }}>
                                        {conv.user.name ? conv.user.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="conv-content" style={{ flex: 1 }}>
                                        <div className="conv-name" style={{ fontWeight: 800, textTransform: 'uppercase' }}>{conv.user.name || 'User'}</div>
                                        <div className="conv-preview" style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{conv.lastMessage?.content}</div>
                                    </div>
                                    {conv.unreadCount > 0 && <div className="unread-badge" style={{
                                        background: 'var(--neo-red)', color: 'black', fontWeight: 900, padding: '2px 8px', border: '2px solid black', fontSize: '12px'
                                    }}>{conv.unreadCount}</div>}
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--neo-bg)' }}>
                {activeConversation ? (
                    <>
                        <div className="chat-header" style={{
                            padding: '16px', borderBottom: '2px solid var(--neo-black)', background: 'var(--neo-white)', display: 'flex', alignItems: 'center'
                        }}>
                            <button
                                className="mobile-only-back"
                                onClick={() => setActiveConversation(null)}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--neo-black)',
                                    marginRight: '12px', display: 'none', cursor: 'pointer'
                                }}
                            >
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="chat-partner-name" style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase' }}>
                                {activeConversation.user.name || 'User'}
                            </div>
                        </div>
                        <style>{`
                            @media (max-width: 900px) {
                                .mobile-only-back { display: block !important; }
                                .chat-page-container { flex-direction: column; height: calc(100vh - 80px); margin: 0 !important; border: none !important; }
                                .chat-sidebar { width: 100% !important; border-right: none !important; display: ${activeConversation ? 'none !important' : 'flex !important'}; }
                                .chat-main { display: ${activeConversation ? 'flex !important' : 'none !important'}; height: 100%; border-left: none !important; }
                            }
                        `}</style>
                        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map(msg => {
                                const isMe = msg.sender_id === (currentSupabaseUser?.id || userId)
                                return (
                                    <div key={msg.id} className={`message-bubble ${isMe ? 'mine' : 'theirs'}`} style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        background: isMe ? 'var(--neo-yellow)' : 'var(--neo-white)',
                                        border: '2px solid var(--neo-black)',
                                        boxShadow: isMe ? '4px 4px 0 var(--neo-black)' : '2px 2px 0 var(--neo-black)',
                                        color: 'var(--neo-black)',
                                        fontWeight: 700,
                                        fontSize: '16px'
                                    }}>
                                        {msg.content}
                                        <div className="msg-time" style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-area" onSubmit={handleSend} style={{
                            padding: '16px', borderTop: '2px solid var(--neo-black)', background: 'var(--neo-white)', display: 'flex', gap: '12px'
                        }}>
                            <input
                                placeholder="TYPE A MESSAGE..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                style={{
                                    flex: 1, padding: '12px', border: '2px solid var(--neo-black)', borderRadius: 0,
                                    fontFamily: 'Space Grotesk', fontWeight: 700, outline: 'none', background: 'transparent'
                                }}
                            />
                            <button type="submit" disabled={!newMessage.trim()} style={{
                                background: 'var(--neo-black)', color: 'var(--neo-white)', border: 'none', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FiSend size={24} style={{ stroke: 'white' }} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected" style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--neo-black)', opacity: 0.5
                    }}>
                        <FiMessageSquare size={64} style={{ marginBottom: '16px' }} />
                        <p style={{ fontWeight: 700, fontSize: '18px' }}>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}
