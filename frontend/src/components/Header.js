import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            🎭 EventCulture
          </Link>
        </div>
        
        <nav className="nav-right">
          {isAuthenticated ? (
            <>
              <Link to="/user-dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/event-location" className="nav-link">
                Map
              </Link>
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
              <button 
                className="preferences-btn nav-link"
                onClick={() => window.location.href = '/user-preferences'}
              >
                Preferences
              </button>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className={`tier-badge ${user?.tier === 'pro' ? 'pro' : 'free'}`}>
                  {user?.tier === 'pro' ? '⭐ Pro' : '🆓 Free'}
                </span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
