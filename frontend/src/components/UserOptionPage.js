import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UserOptionPage.css';

const UserOptionPage = () => {
  const { user, setUserRole, triggerAgents } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // Check if user came from successful auth
    const authSuccess = searchParams.get('auth');
    const userName = searchParams.get('user');
    
    if (authSuccess === 'success' && userName) {
      // User successfully authenticated
      console.log(`Welcome ${userName}!`);
    }
  }, [searchParams]);

  const handleRoleSelection = async (role) => {
    setLoading(true);
    try {
      await setUserRole(role);
      await triggerAgents(); // Trigger agents after role selection
      
      // Navigate based on role
      if (role === 'event') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/user-preferences');
      }
    } catch (error) {
      console.error('Error setting role:', error);
      alert('Error setting role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Setting up your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">🎭 EventCulture</span>
        </div>
      </header>

      {/* Role Selection Section */}
      <section className="role-selection-section">
        <div className="role-selection-container">
          <div className="welcome-header">
            <h1>Welcome to EventCulture!</h1>
            <p>Hi {user?.name}, please choose how you'd like to use EventCulture</p>
          </div>

          <div className="role-cards">
            <div 
              className={`role-card ${selectedRole === 'person' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('person')}
            >
              <div className="role-icon">
                <span className="icon">👤</span>
              </div>
              <h3>Event Attendee</h3>
              <p>I want to discover and attend events</p>
              <ul className="role-features">
                <li>🎯 Personalized event recommendations</li>
                <li>📍 Interactive event maps</li>
                <li>🎫 Easy event booking</li>
                <li>📱 Mobile-friendly experience</li>
                <li>💾 Save favorite events</li>
              </ul>
              <button 
                className="role-select-btn"
                onClick={() => handleRoleSelection('person')}
                disabled={loading}
              >
                Continue as Attendee
              </button>
            </div>

            <div 
              className={`role-card ${selectedRole === 'event' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('event')}
            >
              <div className="role-icon">
                <span className="icon">🎪</span>
              </div>
              <h3>Event Organizer</h3>
              <p>I want to manage events and view analytics</p>
              <ul className="role-features">
                <li>📊 Analytics dashboard</li>
                <li>📈 Event performance metrics</li>
                <li>👥 Audience insights</li>
                <li>📋 Event management tools</li>
                <li>📧 Communication features</li>
              </ul>
              <button 
                className="role-select-btn"
                onClick={() => handleRoleSelection('event')}
                disabled={loading}
              >
                Continue as Organizer
              </button>
            </div>
          </div>

          <div className="role-info">
            <p>
              <strong>Note:</strong> You can change your role later in your profile settings.
              This helps us personalize your experience and show you relevant features.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="role-footer">
        <p>&copy; 2024 EventCulture. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserOptionPage;
