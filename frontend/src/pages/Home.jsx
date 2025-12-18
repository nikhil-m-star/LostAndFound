import React from 'react'
import Card from '../components/Card'

const sampleReports = [
  {
    title: 'Black Wallet',
    subtitle: 'Found near Central Park',
    image: 'https://images.unsplash.com/photo-1580894908361-6c9d7b8ea3f7?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3f9ac6a5b8bf3b7c9d88d5b8b55a2f2e'
  },
  {
    title: 'Set of Keys',
    subtitle: 'Reported lost at Mall',
    image: 'https://images.unsplash.com/photo-1579547621706-1a9c79d5d4c2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3c2c0b8e8f3b8f4c5f5d6e7a8b9c1d2e'
  },
  {
    title: 'Silver Watch',
    subtitle: 'Found on bench',
    image: 'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=9b7b5c9e7b3f8d4a1b2c3d4e5f6a7b8c'
  },
  {
    title: 'Backpack',
    subtitle: 'Lost on bus',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2f1a7d9b8c3d4e5f6a7b8c9d0e1f2a3b'
  }
]

export default function Home() {
  return (
    <div>
      <div className="top-hero">
        <div>
          <div className="page-title">Welcome to Lost & Found</div>
          <div style={{color:'var(--muted)',marginTop:6}}>Browse reports or add a new one</div>
        </div>
      </div>

      <h3 style={{marginTop:8,marginBottom:12}}>Recent reports</h3>
      <div className="grid">
        {sampleReports.map((r, idx) => (
          <Card key={idx} title={r.title} subtitle={r.subtitle} image={r.image} />
        ))}
      </div>
    </div>
  )
}
