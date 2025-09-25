import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import Reportfound from './pages/Reportfound';
import Reportlost from './pages/Reportlost';

function App() {
  const [count, setCount] = useState(0)

  return (
      <Router>
        <nav className="navbar">
          <h2>Lost and Found</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/report-found">Report Found</Link></li>
            <li><Link to="/report-lost">Report Lost</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path = "/" element = {<Home/>}/>
          <Route path = "/report-found" element = {<Reportfound/>}/>
          <Route path = "/report-lost" element={<Reportlost/>}/>
        </Routes>
      </Router>
  )
}

export default App
