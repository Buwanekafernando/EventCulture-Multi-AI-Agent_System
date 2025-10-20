import React from 'react';
import { FaStar, FaRegCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';
import logo from '../assets/logouser.png';

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
          <img src={logo} alt="logo" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} />
            EventCulture

          </Link>
        </div>
        
        <nav className="nav-right">
          {isAuthenticated ? (
            <>
              <Link to="/user-dashboard" className="nav-link">
                Dashboard
              </Link>
              {/* Removed Map link */}
              <Link to="/admin" className="nav-link">
                Refresh
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
                  {user?.tier === 'pro' ? (<><FaStar style={{ marginRight: 6 }} />Pro</>) : (<><FaRegCircle style={{ marginRight: 6 }} />Free</>)}
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
              <button
                type="button"
                className="login-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('open-tier-selection'))}
              >
                Login with Google
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
