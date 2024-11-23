import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';;

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">WorkHub</Link>
        <button
          className="menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
      <ul className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
        <li>
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/confirmation"
            className={location.pathname === '/confirmation' ? 'active' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Booking Summary
          </Link>
        </li>
        <li>
          <Link
            to="/history"
            className={location.pathname === '/history' ? 'active' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Booking History
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
