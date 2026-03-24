import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import Positions from './pages/Positions/Positions';
import Candidates from './pages/Candidates/Candidates';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/candidates" element={<Candidates />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="app-footer__inner">
          <span className="app-footer__text">© 2026 SDET Tech — Talent Acquisition Platform</span>
          <span className="app-footer__text">Powered by TA Automation</span>
        </div>
      </footer>
    </div>
  );
}
