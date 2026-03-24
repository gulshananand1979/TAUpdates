import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/positions', label: 'Positions', icon: Briefcase },
  { to: '/candidates', label: 'Candidates', icon: Users },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Sparkles className="brand-icon" size={24} />
          <span className="brand-text">SDET Tech</span>
          <span className="brand-badge">TA</span>
        </div>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              end={item.to === '/'}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
