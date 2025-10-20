import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaRegCircle, FaRocket, FaBullseye, FaFire, FaCalendarAlt, FaMapMarkerAlt, FaCog, FaHome } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, recommendationsAPI } from '../services/api';
import EventCard from './EventCard';
import PreferencesModal from './PreferencesModal';
import UpgradePrompt from './UpgradePrompt';
import Header from './Header';
import Footer from './Footer';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userPreferences, setUserPreferences] = useState('');
  const [recommendationCount, setRecommendationCount] = useState(0);

  const loadPersonalizedRecommendations = useCallback(async () => {
    try {
      const recData = await recommendationsAPI.getUserPersonalizedRecommendations(user.id);
      
      if (recData.status === 'success' && recData.recommendations.length > 0) {
        setRecommendations(recData.recommendations);
        setRecommendationCount(recData.recommendation_count);
        setUserPreferences(recData.preferences);
      } else {
        // If no preferences set, show message
        setRecommendations([]);
        setRecommendationCount(0);
      }
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
    }
  }, [user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load public data first (events and trending) - these work without auth
      const [eventsData, trendingData] = await Promise.all([
        eventsAPI.getEvents(),
        recommendationsAPI.getTrendingEvents()
      ]);
      
      setEvents(eventsData.slice(0, 8));
      setTrendingEvents(trendingData.slice(0, 4));
      
      // Only load user-specific data if user is authenticated
      if (user && user.id) {
        try {
          const preferencesData = await recommendationsAPI.getUserPreferences(user.id);
          setUserPreferences(preferencesData.preferences || '');
          
          // Load personalized recommendations if user has preferences
          if (preferencesData.preferences) {
            await loadPersonalizedRecommendations();
          }
        } catch (prefError) {
          console.warn('Could not load user preferences:', prefError);
          // Continue without user preferences
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, loadPersonalizedRecommendations]);

  useEffect(() => {
    // Always load public data (events and trending) - these work without auth
    loadDashboardData();
    
    // Check if user came from preferences page and load personalized recommendations
    if (location.state?.preferencesSet && user) {
      loadPersonalizedRecommendations();
    }
  }, [location.state, user, loadDashboardData, loadPersonalizedRecommendations]);

  const handlePreferencesUpdate = async (newPreferences) => {
    try {
      await recommendationsAPI.updateUserPreferences(user.id, newPreferences);
      setUserPreferences(newPreferences);
      await loadPersonalizedRecommendations();
      setShowPreferences(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Error updating preferences. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradePrompt(false);
    // Reload recommendations without limits
    loadPersonalizedRecommendations();
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-header">
            <h1>Welcome back, {user?.name}!</h1>
            <div className="user-tier-badge">
              {user?.tier === 'pro' ? (
                <span className="tier-badge pro"><FaStar style={{ marginRight: 6 }} />Pro</span>
              ) : (
                <span className="tier-badge free"><FaRegCircle style={{ marginRight: 6 }} />Free</span>
              )}
            </div>
          </div>
          <p>Discover amazing events happening around Sri Lanka</p>
          
          {user?.tier === 'free' && (
            <div className="upgrade-prompt-banner">
              <p><FaRocket style={{ marginRight: 6 }} />Unlock unlimited recommendations and premium features!</p>
              <button 
                className="btn btn-upgrade"
                onClick={() => setShowUpgradePrompt(true)}
              >
                Upgrade to Pro
              </button>
            </div>
          )}
          
          {!userPreferences && (
            <div className="preferences-prompt">
              <p><FaBullseye style={{ marginRight: 6 }} />Set your preferences to get personalized recommendations!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowPreferences(true)}
              >
                Set Preferences
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Personalized Recommendations - Prominently Displayed */}
      <section className="recommendations-section">
        <div className="section-header">
          <h2><FaBullseye style={{ marginRight: 8 }} />Recommended for You</h2>
          {userPreferences ? (
            <p>Based on your interests: {userPreferences}</p>
          ) : (
            <p>Set your preferences to get personalized recommendations</p>
          )}
          {user?.tier === 'free' && recommendations.length > 0 && (
            <div className="recommendation-limit">
              <p>Showing {recommendationCount} of 10 recommendations (Free tier limit)</p>
              <button 
                className="btn btn-upgrade-small"
                onClick={() => setShowUpgradePrompt(true)}
              >
                Upgrade for unlimited
              </button>
            </div>
          )}
        </div>
        
        {recommendations.length > 0 ? (
          <div className="events-grid">
            {recommendations.map((event) => (
              <EventCard key={event.event_id || Math.random()} event={event} userTier={user?.tier} />
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <div className="no-recommendations-content">
              <h3>🎯 Get Personalized Recommendations</h3>
              <p>Set your event preferences to discover events tailored just for you!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowPreferences(true)}
              >
                Set My Preferences
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Trending Events */}
      <section className="trending-section">
        <div className="section-header">
          <h2><FaFire style={{ marginRight: 8 }} />Trending Events</h2>
          <p>Most popular events right now</p>
        </div>
        <div className="events-grid">
          {trendingEvents.map((event) => (
            <EventCard key={event.event_id} event={event} isTrending userTier={user?.tier} />
          ))}
        </div>
      </section>

      {/* All Events */}
      <section className="all-events-section">
        <div className="section-header">
          <h2><FaCalendarAlt style={{ marginRight: 8 }} />All Events</h2>
          <p>Browse all available events</p>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} userTier={user?.tier} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/event-location" className="action-card">
            <div className="action-icon"><FaMapMarkerAlt /></div>
            <h3>Event Map</h3>
            <p>View events on interactive map</p>
          </Link>
          <button 
            className="action-card"
            onClick={() => setShowPreferences(true)}
          >
            <div className="action-icon"><FaCog /></div>
            <h3>Preferences</h3>
            <p>Update your interests</p>
          </button>
          <Link to="/" className="action-card">
            <div className="action-icon"><FaHome /></div>
            <h3>Home</h3>
            <p>Back to homepage</p>
          </Link>
        </div>
      </section>

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          currentPreferences={userPreferences}
          onSave={handlePreferencesUpdate}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          onUpgrade={handleUpgradeSuccess}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default UserDashboard;
