import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, recommendationsAPI } from '../services/api';
import EventCard from './EventCard';
import TierSelection from './TierSelection';
import '../styles/homepage.css';

const HomePage = () => {
  const { isAuthenticated, user, login, selectTier } = useAuth();
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTierSelection, setShowTierSelection] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [eventsData, trendingData] = await Promise.all([
        eventsAPI.getEvents(),
        recommendationsAPI.getTrendingEvents()
      ]);
      setEvents(eventsData.slice(0, 6)); // Show first 6 events
      setTrendingEvents(trendingData.slice(0, 3)); // Show top 3 trending
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setShowTierSelection(true);
  };

  const handleTierSelected = async (tier) => {
    await selectTier(tier);
    setShowTierSelection(false);
  };

  // Show tier selection if user is not authenticated and tier selection is requested
  if (showTierSelection && !isAuthenticated) {
    return <TierSelection onTierSelected={handleTierSelected} />;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">🎭 EventCulture</span>
        </div>
        <nav className="nav-right">
          <Link to="/">Home</Link>
          <Link to="/event-location">Locations</Link>
          <Link to="/contact">Contact</Link>
          {isAuthenticated ? (
            <div className="user-menu">
              <span>Welcome, {user?.name}</span>
              <Link to={user?.role === 'event' ? '/organizer-dashboard' : '/user-dashboard'}>
                Dashboard
              </Link>
            </div>
          ) : (
            <button className="login-btn" onClick={handleLogin}>
              Login with Google
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-card">
            <h1>Discover Events in Sri Lanka</h1>
            <p>Find the perfect musicals, conferences, workshops, and exhibitions across Sri Lanka</p>
            {!isAuthenticated && (
              <button className="cta-button" onClick={handleLogin}>
                Get Started
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="categories">
        <h2>Popular Event Types</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🎵</div>
            <p>Music</p>
          </div>
          <div className="category-card">
            <div className="category-icon">💻</div>
            <p>Technology</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🎨</div>
            <p>Art & Culture</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🏃</div>
            <p>Sports</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🍽️</div>
            <p>Food & Drinks</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🎓</div>
            <p>Education</p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured">
        <h2>Featured Events</h2>
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="featured-grid">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                userTier={user?.tier || 'free'}
                isPublic={!isAuthenticated}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending Events */}
      {trendingEvents.length > 0 && (
        <section className="trending">
          <h2>🔥 Trending Events</h2>
          <div className="trending-grid">
            {trendingEvents.map((event) => (
              <EventCard 
                key={event.event_id} 
                event={event} 
                isTrending 
                userTier={user?.tier || 'free'}
                isPublic={!isAuthenticated}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-circle">1</div>
            <h3>Sign In</h3>
            <p>Login with Google and choose your role as an attendee or organizer.</p>
          </div>
          <div className="step">
            <div className="step-circle">2</div>
            <h3>Discover Events</h3>
            <p>Browse personalized recommendations based on your interests and location.</p>
          </div>
          <div className="step">
            <div className="step-circle">3</div>
            <h3>Book & Enjoy</h3>
            <p>Secure your spot with our easy booking process and enjoy amazing events.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EventCulture</h3>
            <p>Your gateway to amazing events in Sri Lanka</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/event-location">Events Map</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 EventCulture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
