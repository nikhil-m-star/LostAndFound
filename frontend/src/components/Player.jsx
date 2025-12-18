import React from 'react'

export default function Player() {
  return (
    <div className="player">
      <div style={{width:64,height:48,background:'#222',borderRadius:6}} />
      <div style={{flex:'1 1 auto'}}>
        <div style={{fontWeight:700}}>Now Playing — Demo</div>
        <div style={{color:'var(--muted)',fontSize:13}}>No track</div>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <button style={{background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer'}}>◀</button>
        <button style={{background:'var(--accent)',color:'#000',border:'none',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}>▶</button>
      </div>
    </div>
  )
}
