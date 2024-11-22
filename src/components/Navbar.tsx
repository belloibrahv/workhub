import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Workhub</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
