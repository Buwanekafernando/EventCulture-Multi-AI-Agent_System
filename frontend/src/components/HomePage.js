import React, { useState, useEffect, useCallback } from 'react';
import { FaMusic, FaLaptop, FaPalette, FaRunning, FaUtensils, FaGraduationCap, FaFire } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, recommendationsAPI } from '../services/api';
import EventCard from './EventCard';
import TierSelection from './TierSelection';
import '../styles/homepage.css';
import logoUser from '../assets/logouser.png';

const HomePage = () => {
  const { isAuthenticated, user, selectTier, login } = useAuth();
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTierSelection, setShowTierSelection] = useState(false);

  const loadEvents = useCallback(async () => {
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
      // Fallback to public events if authenticated call fails
      try {
        const [eventsData, trendingData] = await Promise.all([
          eventsAPI.getEvents(), // This will fallback to public endpoint
          recommendationsAPI.getTrendingEvents() // This will fallback to public endpoint
        ]);
        setEvents(eventsData.slice(0, 6));
        setTrendingEvents(trendingData.slice(0, 3));
      } catch (fallbackError) {
        console.error('Error loading public events:', fallbackError);
        setEvents([]);
        setTrendingEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPublicEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Use public endpoints for unauthenticated users
      const [eventsData, trendingData] = await Promise.all([
        eventsAPI.getEvents(), // This will fallback to public endpoint
        recommendationsAPI.getTrendingEvents() // This will fallback to public endpoint
      ]);
      setEvents(eventsData.slice(0, 6)); // Show first 6 events
      setTrendingEvents(trendingData.slice(0, 3)); // Show top 3 trending
    } catch (error) {
      console.error('Error loading public events:', error);
      // Set empty arrays if all else fails
      setEvents([]);
      setTrendingEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load events if user is authenticated or after a delay to allow auth state to settle
    if (isAuthenticated) {
      loadEvents();
    } else {
      // For unauthenticated users, load public events after a short delay
      const timer = setTimeout(() => {
        loadPublicEvents();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loadEvents, loadPublicEvents]);

  const handleLogin = () => {
    setShowTierSelection(true);
  };

  const handleTierSelected = async (tier) => {
    await selectTier(tier);
    setShowTierSelection(false);
  };

  // Listen for header-initiated login requests
  useEffect(() => {
    const openTierSelection = () => setShowTierSelection(true);
    window.addEventListener('open-tier-selection', openTierSelection);
    return () => window.removeEventListener('open-tier-selection', openTierSelection);
  }, []);

  // Redirect authenticated users 
  if (isAuthenticated) {
    return <Navigate to="/user-home" replace />;
  }

  // Show tier selection if user is not authenticated and tier selection is requested
  if (showTierSelection && !isAuthenticated) {
    return <TierSelection onTierSelected={handleTierSelected} />;
  }

  return (
    <div className="app homepage-with-bg">
      
      <Header />

      
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

      
      <section className="categories">
        <h2>Popular Event Types</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon"><FaMusic /></div>
            <p>Music</p>
          </div>
          <div className="category-card">
            <div className="category-icon"><FaLaptop /></div>
            <p>Technology</p>
          </div>
          <div className="category-card">
            <div className="category-icon"><FaPalette /></div>
            <p>Art & Culture</p>
          </div>
          <div className="category-card">
            <div className="category-icon"><FaRunning /></div>
            <p>Sports</p>
          </div>
          <div className="category-card">
            <div className="category-icon"><FaUtensils /></div>
            <p>Food & Drinks</p>
          </div>
          <div className="category-card">
            <div className="category-icon"><FaGraduationCap /></div>
            <p>Education</p>
          </div>
        </div>
      </section>

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

      
      {trendingEvents.length > 0 && (
        <section className="trending">
          <h2><FaFire style={{ marginRight: 8 }} />Trending Events</h2>
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

      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={logoUser} alt="EventCulture Logo" className="footer-logo-img" />
              <h3>EventCulture</h3>
            </div>
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
