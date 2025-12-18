import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { FiSend, FiCpu } from 'react-icons/fi'

const DUMMY_ITEMS = [
    { _id: 'd1', title: 'Blue Backpack', status: 'lost', location: 'Library', images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd2', title: 'iPhone 13', status: 'found', location: 'Canteen', images: [{ url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd3', title: 'Golden Retriever', status: 'lost', location: 'Park', images: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' }] },
    { _id: 'd4', title: 'Car Keys', status: 'found', location: 'Parking', images: [] }
]

export default function AIChat() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Assistant. I can help you find lost items or report something. Try saying 'I lost my keys' or 'Show me found phones'.", isBot: true }
    ])
    const [input, setInput] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchItems()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userText = input.trim()
        const newMsg = { id: Date.now(), text: userText, isBot: false }
        setMessages(prev => [...prev, newMsg])
        setInput('')

        // Simulate AI thinking
        setTimeout(() => {
            processAIResponse(userText)
        }, 600)
    }

    const processAIResponse = (query) => {
        const lowerQ = query.toLowerCase()
        let foundItems = []
        let responseText = "I couldn't find anything matching that description."

        // Simple keyword matching
        foundItems = items.filter(item => {
            const combined = `${item.title} ${item.location} ${item.status}`.toLowerCase()
            return lowerQ.split(' ').some(word => word.length > 2 && combined.includes(word))
        })

        if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
            responseText = "Hello! How can I help you today?"
            foundItems = []
        } else if (foundItems.length > 0) {
            responseText = `I found ${foundItems.length} items that might match what you're looking for:`
        }

        const botMsg = {
            id: Date.now() + 1,
            text: responseText,
            isBot: true,
            results: foundItems.slice(0, 5) // limit results
        }
        setMessages(prev => [...prev, botMsg])
    }

    return (
        <div className="ai-chat-container" style={{
            maxWidth: '1000px',
            margin: '0 auto',
            height: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, rgba(29, 185, 84, 0.02), rgba(0,0,0,0))',
            borderRadius: '20px',
            border: '1px solid rgba(29, 185, 84, 0.1)',
            overflow: 'hidden'
        }}>
            <div className="chat-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, background: 'var(--neon-green-strong)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCpu size={24} color="#000" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>Lost & Found AI</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Always here to help</div>
                </div>
            </div>

            <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            borderTopLeftRadius: msg.isBot ? '4px' : '16px',
                            borderTopRightRadius: msg.isBot ? '16px' : '4px',
                            background: msg.isBot ? '#1a1a1a' : 'var(--accent-700)',
                            color: msg.isBot ? '#fff' : '#000',
                            lineHeight: '1.5',
                            border: msg.isBot ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            fontSize: '16px'
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
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Describe what you're looking for..."
                    style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#1a1a1a',
                        color: '#fff',
                        fontSize: '16px'
                    }}
                />
                <button type="submit" style={{
                    background: 'var(--accent)',
                    border: 'none',
                    width: '56px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiSend size={20} color="#000" />
                </button>
            </form>
        </div>
    )
}
