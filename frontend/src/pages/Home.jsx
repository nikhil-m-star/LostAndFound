import React from 'react'
import Card from '../components/Card'

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
        <Card title="Black Wallet" subtitle="Found near Central Park" />
        <Card title="Set of Keys" subtitle="Reported lost at Mall" />
        <Card title="Silver Watch" subtitle="Found on bench" />
        <Card title="Backpack" subtitle="Lost on bus" />
      </div>
    </div>
  )
}
