import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import Reportfound from './pages/Reportfound';
import Reportlost from './pages/Reportlost';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h2>Lost and Found</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/report-found">Report Found</Link></li>
            <li><Link to="/report-lost">Report Lost</Link></li>
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
