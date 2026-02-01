import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { FiSend, FiCpu, FiSearch, FiMessageSquare } from 'react-icons/fi'

const DUMMY_ITEMS = [
    { _id: 'd1', title: 'Blue Backpack', status: 'lost', location: 'Library', images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd2', title: 'iPhone 13', status: 'found', location: 'Canteen', images: [{ url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd3', title: 'Golden Retriever', status: 'lost', location: 'Park', images: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd4', title: 'Car Keys', status: 'found', location: 'Parking', images: [] }
]

export default function AIChat() {
    // Mode state: 'chat' or 'search'
    const [mode, setMode] = useState('chat')

    // Chat states
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Assistant. I can help you find lost items or report something. Try saying 'I lost my keys' or 'Show me found phones'.", isBot: true }
    ])
    const [chatInput, setChatInput] = useState('')
    const bottomRef = useRef(null)

    // Search/Data states
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [])

    useEffect(() => {
        if (mode === 'chat') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, mode])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const base = import.meta.env.VITE_API_BASE || '/api'
            const res = await fetch(`${base}/items?limit=100`)
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            setItems(data.length ? data : DUMMY_ITEMS)
        } catch (err) {
            setItems(DUMMY_ITEMS)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        const userText = chatInput.trim()
        const newMsg = { id: Date.now(), text: userText, isBot: false }

        // Optimistic UI update
        setMessages(prev => [...prev, newMsg])
        setChatInput('')

        // Create a temporary "Thinking..." message
        const loadingId = Date.now() + 1
        setMessages(prev => [...prev, { id: loadingId, text: "Thinking...", isBot: true, isThinking: true }])

        try {
            const base = import.meta.env.VITE_API_BASE || '/api'
            const token = await window.Clerk?.session?.getToken()

            const res = await fetch(`${base}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userText })
            })

            if (!res.ok) throw new Error('AI request failed')

            const data = await res.json()

            // Replace "Thinking..." with actual response
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId
                    ? { id: loadingId, text: data.message, isBot: true, results: data.results }
                    : msg
            ))

        } catch (err) {
            console.error(err)
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId
                    ? { id: loadingId, text: "I'm having trouble reaching the server right now. Please try again later.", isBot: true }
                    : msg
            ))
        }
    }

    // Removed local dummy processAIResponse function
    // ...
    const handleSuggestion = (text) => {
        setChatInput(text)
    }

    const filteredItems = items.filter(item => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            item.title.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            item.status.toLowerCase().includes(q)
        )
    })

    return (
        <div className="ai-chat-container" style={{
            height: 'calc(100dvh - 50px)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxHeight: '90vh'
        }}>
            {/* Header with Mode Toggles */}
            <div className="chat-header" style={{ flexShrink: 0 }}>
                <div className="chat-title-group">
                    <div className="chat-icon-circle">
                        {mode === 'chat' ? <FiCpu size={24} color="#000" /> : <FiSearch size={24} color="#000" />}
                    </div>
                    <div>
                        <div className="chat-title-text">{mode === 'chat' ? 'AI Assistant' : 'Search Items'}</div>
                        <div className="chat-subtitle-text">{mode === 'chat' ? 'Ask me anything' : 'Find quickly'}</div>
                    </div>
                </div>

                <div className="chat-toggles" style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => setMode('chat')}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: mode === 'chat' ? 'var(--neo-black)' : 'transparent',
                            color: mode === 'chat' ? 'var(--neo-white)' : 'var(--neo-black)',
                            border: '3px solid var(--neo-black)',
                            borderRight: 'none',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.1s ease'
                        }}
                    >
                        <FiMessageSquare /> Chat
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: mode === 'search' ? 'var(--neo-black)' : 'transparent',
                            color: mode === 'search' ? 'var(--neo-white)' : 'var(--neo-black)',
                            border: '3px solid var(--neo-black)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.1s ease'
                        }}
                    >
                        <FiSearch /> Search
                    </button>
                </div>
            </div>

            {/* CHAT MODE CONTENT */}
            {mode === 'chat' && (
                <>
                    <div className="messages" style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        paddingBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                                maxWidth: '85%',
                            }}>
                                <div style={{
                                    padding: '16px 20px',
                                    background: msg.isBot ? 'var(--neo-white)' : 'var(--neo-yellow)', /* White for Bot, Yellow for User */
                                    color: 'var(--neo-black)',
                                    lineHeight: '1.6',
                                    border: '2px solid var(--neo-black)',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    boxShadow: msg.isBot ? '4px 4px 0 var(--neo-black)' : '6px 6px 0 var(--neo-black)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                </div>

                                {msg.results && msg.results.length > 0 && (
                                    <div className="chat-results" style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        {msg.results.map(item => (
                                            <div key={item._id} style={{ width: '220px' }}>
                                                <Card
                                                    id={item._id}
                                                    title={item.title}
                                                    subtitle={`${item.status} in ${item.location}`}
                                                    image={item.images?.[0]?.url}
                                                    onClick={() => navigate(`/items/${item._id}`)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={bottomRef} style={{ height: '10px' }} />

                        {/* Suggestions */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                            <button className="shadow-red bg-red" onClick={() => handleSuggestion("I lost my keys")} style={{ flex: 1, minWidth: '120px', padding: '12px', border: '3px solid black', fontWeight: 900, cursor: 'pointer' }}>LOST KEYS</button>
                            <button className="shadow-green bg-green" onClick={() => handleSuggestion("Found a phone")} style={{ flex: 1, minWidth: '120px', padding: '12px', border: '3px solid black', fontWeight: 900, cursor: 'pointer' }}>FOUND PHONE</button>
                            <button className="shadow-violet bg-violet" onClick={() => handleSuggestion("Report an item")} style={{ flex: 1, minWidth: '120px', padding: '12px', border: '3px solid black', fontWeight: 900, cursor: 'pointer' }}>REPORT ITEM</button>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="chat-input-form" style={{
                        flexShrink: 0,
                        padding: '16px 0',
                        borderTop: '2px solid var(--neo-black)',
                        display: 'flex',
                        gap: '12px',
                        background: 'transparent',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            width: '100%',
                            gap: '12px',
                            background: 'var(--neo-white)',
                            padding: '8px',
                            border: '2px solid var(--neo-black)',
                            boxShadow: '4px 4px 0 var(--neo-black)',
                            boxSizing: 'border-box'
                        }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Describe lost items or ask general questions..."
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--neo-black)',
                                    fontSize: '16px',
                                    fontFamily: 'inherit',
                                    fontWeight: 700,
                                    outline: 'none',
                                    boxShadow: 'none',
                                    margin: 0
                                }}
                            />
                            <button type="submit" style={{
                                background: '#FFFFFF',
                                color: '#000000',
                                border: '2px solid #000000',
                                width: '48px',
                                height: '48px',
                                cursor: chatInput.trim() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.1s ease',
                                flexShrink: 0
                            }} disabled={!chatInput.trim()}>
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* SEARCH MODE CONTENT */}
            {mode === 'search' && (
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '24px', position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neo-black)', width: 20, height: 20, zIndex: 10 }} />
                        <input
                            type="text"
                            placeholder="Search by name, location, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 16px 16px 48px',
                                border: '2px solid var(--neo-black)',
                                background: 'var(--neo-white)',
                                color: 'var(--neo-black)',
                                fontSize: '16px',
                                fontWeight: 700,
                                fontFamily: 'inherit',
                                borderRadius: 0,
                                boxShadow: '4px 4px 0 var(--neo-black)'
                            }}
                        />
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--neo-black)', fontWeight: 700, marginTop: '40px' }}>Loading items...</div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--neo-black)', fontWeight: 700, marginTop: '40px' }}>No items found matching "{searchQuery}"</div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                            {filteredItems.map(item => (
                                <Card
                                    key={item._id}
                                    id={item._id}
                                    title={item.title}
                                    subtitle={`${item.status} in ${item.location}`}
                                    image={item.images?.[0]?.url}
                                    onClick={() => navigate(`/items/${item._id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
