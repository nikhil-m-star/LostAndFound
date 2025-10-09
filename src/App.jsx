import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import Reportfound from './pages/Reportfound';
import Reportlost from './pages/Reportlost';

function App() {
  return (
    <Router>
      <div className="app">
        <div className="brand-row">
          <Link to="/" className="brand logo single-icon" aria-label="Lost and Found home">
            <svg className="logo-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <title>Lost & Found</title>
              <defs>
                <linearGradient id="pinGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c802ff" />
                  <stop offset="100%" stopColor="#031cff" />
                </linearGradient>
              </defs>

              <circle cx="32" cy="32" r="26" fill="url(#pinGrad)" />
              <path d="M32 16c-4.97 0-9 4.03-9 9 0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9zm0 12.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5z" fill="#fff" />
            </svg>
          </Link>
        </div>
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/" aria-label="Home">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                  <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </li>
            <li>
              <Link to="/report-found" aria-label="Report Found">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2.2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </Link>
            </li>
            <li>
              <Link to="/report-lost" aria-label="Report Lost">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </Link>
            </li>
          </ul>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report-found" element={<Reportfound />} />
            <Route path="/report-lost" element={<Reportlost />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
