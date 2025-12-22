import React, { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiSend, FiMessageSquare, FiArrowLeft } from 'react-icons/fi'

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

    // Initial load
    useEffect(() => {
        fetchConversations()
    }, [])

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
        <div className="chat-page-container">
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <button onClick={() => navigate('/')} className="back-link" style={{ marginBottom: '10px', padding: 0, fontSize: '15px' }}>
                        <FiArrowLeft style={{ marginBottom: '-2px' }} /> Back to Home
                    </button>
                    <h2>Messages</h2>
                    <input
                        className="chat-search-input"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="conversation-list">
                    {searchQuery.length >= 2 ? (
                        <div className="search-results-list">
                            <div className="list-label" style={{ padding: '0 15px 10px', color: 'var(--muted)', fontSize: '0.9em' }}>
                                Search Results
                            </div>
                            {isSearching ? (
                                <div style={{ padding: '0 15px' }}>Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div style={{ padding: '0 15px' }}>No users found.</div>
                            ) : (
                                searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        className="conversation-item"
                                        onClick={() => selectUser(user)}
                                    >
                                        <div className="conv-avatar">
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div className="conv-content">
                                            <div className="conv-name">{user.name}</div>
                                            <div className="conv-preview" style={{ fontSize: '0.8em', color: 'var(--muted)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        loading ? (
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
                        )
                    )}
                </div>
            </div>

            <div className="chat-main">
                {console.log('DEBUG Render activeConversation:', activeConversation)}
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
                                // console.log('Message:', msg.content, 'isMe:', isMe, 'sender:', msg.sender_id, 'myId:', userId)
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
