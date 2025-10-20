import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, recommendationsAPI } from '../services/api';
import EventCard from './EventCard';
import '../styles/homepage.css';
import logoUser from '../assets/logouser.png';

const UserHomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsData, trendingData] = await Promise.all([
        eventsAPI.getEvents(),
        recommendationsAPI.getTrendingEvents()
      ]);
      setEvents(eventsData.slice(0, 6));
      setTrendingEvents(trendingData.slice(0, 3));
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
      setTrendingEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // For authenticated user homepage, always load full events
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, loadEvents]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="nav-left">
            <span className="logo"><img src={logoUser} alt="logo" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} />EventCulture</span>
          </div>
          <nav className="nav-right">
            <Link to="/user-home">Home</Link>
            <Link to="/contact">Contact</Link>
            <div className="user-menu">
              <span>Welcome, {user?.name}</span>
              <Link className="linklike" to="/user-dashboard">Dashboard</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-card">
            <h1>Discover Events Tailored For You</h1>
            <p>Personalized picks based on your preferences and activity</p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured">
        <h2>Recommended For You</h2>
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="featured-grid">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                userTier={user?.tier || 'free'}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending Events */}
      {trendingEvents.length > 0 && (
        <section className="trending">
          <h2>Trending Now</h2>
          <div className="trending-grid">
            {trendingEvents.map((event) => (
              <EventCard 
                key={event.event_id} 
                event={event} 
                isTrending 
                userTier={user?.tier || 'free'}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="how-it-works">
        <h2>Make The Most Of EventCulture</h2>
        <div className="steps">
          <div className="step">
            <div className="step-circle">1</div>
            <h3>Explore</h3>
            <p>Discover events across your favorite categories and cities.</p>
          </div>
          <div className="step">
            <div className="step-circle">2</div>
            <h3>Personalize</h3>
            <p>Tune your preferences to improve recommendations.</p>
          </div>
          <div className="step">
            <div className="step-circle">3</div>
            <h3>Attend</h3>
            <p>Book tickets and enjoy curated experiences.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src={logoUser} alt="logo" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} />
            <h3>EventCulture</h3>
            <p>Your gateway to amazing events in Sri Lanka</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/user-home">Home</Link></li>
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

export default UserHomePage;


