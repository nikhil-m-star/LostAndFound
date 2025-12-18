import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiSearch } from 'react-icons/fi'
import { BiLibrary } from 'react-icons/bi'
import { AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineReport } from 'react-icons/md'

const Playlists = () => (
  <div style={{marginTop:16}}>
    <div style={{color:'var(--muted)', fontSize:12, marginBottom:8}}>Your Playlists</div>
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <a className="playlist" href="#">Lost Items</a>
      <a className="playlist" href="#">Found Items</a>
      <a className="playlist" href="#">Favorites</a>
    </div>
  </div>
)

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Lost & Found</div>
      <nav>
        <NavLink to="/" end className={({isActive})=> isActive ? 'active' : ''}><FiHome style={{width:18,height:18}} /> <span>Home</span></NavLink>
        <NavLink to="/search" className={({isActive})=> isActive ? 'active' : ''}><FiSearch style={{width:18,height:18}} /> <span>Search</span></NavLink>
        <NavLink to="/report/found" className={({isActive})=> isActive ? 'active' : ''}><MdOutlineReport style={{width:18,height:18}} /> <span>Report Found</span></NavLink>
        <NavLink to="/report/lost" className={({isActive})=> isActive ? 'active' : ''}><MdOutlineReport style={{width:18,height:18}} /> <span>Report Lost</span></NavLink>
        <NavLink to="/library" className={({isActive})=> isActive ? 'active' : ''}><BiLibrary style={{width:18,height:18}} /> <span>Your Library</span></NavLink>
        <button style={{background:'transparent',border:'none',color:'var(--muted)',display:'flex',gap:8,alignItems:'center',padding:'8px 0',cursor:'pointer'}}><AiOutlinePlus style={{width:18,height:18}}/> <span>Create Playlist</span></button>
      </nav>
      <Playlists />
    </aside>
  )
}
