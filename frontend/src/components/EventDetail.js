import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, locationAPI, analyticsAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';
import EngagementChart from './EngagementChart';
import '../styles/eventdetail.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [eventData, locationData] = await Promise.all([
        eventsAPI.getEvent(eventId),
        locationAPI.getLocation(eventId)
      ]);
      
      setEvent(eventData);
      setLocationData(locationData);
      
      // Track view
      await analyticsAPI.trackInteraction(eventId, 'view');
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = async () => {
    try {
      setBookingLoading(true);
      const bookingData = await eventsAPI.bookEvent(eventId);
      
      if (bookingData.booking_url) {
        window.open(bookingData.booking_url, '_blank');
      } else {
        alert('Booking URL not available for this event');
      }
    } catch (error) {
      console.error('Error booking event:', error);
      alert('Error booking event. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      music: '🎵',
      tech: '💻',
      art: '🎨',
      sports: '🏃',
      food: '🍽️',
      education: '🎓',
      other: '🎭'
    };
    return icons[eventType?.toLowerCase()] || '🎭';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      exciting: 'exciting',
      formal: 'formal',
      casual: 'casual',
      neutral: 'neutral'
    };
    return colors[sentiment] || 'neutral';
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Event not found</h2>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
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
        <nav className="nav-right">
          <Link to={user?.role === 'event' ? '/organizer-dashboard' : '/user-dashboard'}>
            Dashboard
          </Link>
          <Link to="/event-location">Map</Link>
          <Link to="/">Home</Link>
        </nav>
      </header>

      {/* Event Detail Section */}
      <section className="event-detail-section">
        <div className="event-detail-container">
          {/* Event Header */}
          <div className="event-header">
            <div className="event-type-badge">
              <span className="event-type-icon">
                {getEventTypeIcon(event.event_type)}
              </span>
              <span className="event-type-text">{event.event_type || 'Event'}</span>
            </div>
            
            <h1 className="event-title">{event.event_name}</h1>
            
            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span className="meta-text">
                  {locationData?.cleaned_location || event.location || 'Location TBD'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">{formatDate(event.date)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🏷️</span>
                <span className={`sentiment-badge ${getSentimentColor(event.sentiment)}`}>
                  {event.sentiment || 'neutral'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Content */}
          <div className="event-content">
            <div className="event-main">
              {/* Description */}
              <div className="event-description">
                <h3>About This Event</h3>
                <p>{event.description || 'No description available.'}</p>
              </div>

              {/* Summary */}
              {event.summary && (
                <div className="event-summary">
                  <h3>Summary</h3>
                  <p>{event.summary}</p>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  <h3>Tags</h3>
                  <div className="tags-container">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Stats */}
              <div className="event-stats">
                <h3>Event Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-number">{event.views || 0}</span>
                    <span className="stat-label">Views</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👆</span>
                    <span className="stat-number">{event.clicks || 0}</span>
                    <span className="stat-label">Clicks</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span className="stat-number">
                      {((event.clicks || 0) / Math.max(event.views || 1, 1) * 100).toFixed(1)}%
                    </span>
                    <span className="stat-label">Engagement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Sidebar */}
            <div className="event-sidebar">
              {/* Booking Section */}
              <div className="booking-section">
                <h3>Book This Event</h3>
                {!isAuthenticated ? (
                  <div className="login-prompt">
                    <p className="login-message">
                      🔒 <strong>Sign in to book this event</strong>
                    </p>
                    <Link to="/login" className="btn btn-primary btn-large">
                      Sign In to Book
                    </Link>
                  </div>
                ) : user?.tier === 'pro' ? (
                  event.booking_url ? (
                    <button 
                      className="btn btn-primary btn-large"
                      onClick={handleBookEvent}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Processing...' : 'Book Now'}
                    </button>
                  ) : (
                    <p className="no-booking">Booking not available for this event</p>
                  )
                ) : (
                  <div className="upgrade-prompt">
                    <p className="upgrade-message">
                      ⭐ <strong>Upgrade to Pro to book events directly</strong>
                    </p>
                    <button 
                      className="btn btn-upgrade btn-large"
                      onClick={() => {
                        // This would trigger the upgrade modal
                        alert('Upgrade to Pro to book events directly!');
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="location-section">
                <h3>Location</h3>
                {locationData?.is_virtual ? (
                  <div className="virtual-location">
                    <span className="location-icon">🌐</span>
                    <p>Virtual Event</p>
                    <p>This event will be held online</p>
                  </div>
                ) : (
                  <div className="physical-location">
                    <span className="location-icon">📍</span>
                    <p>{locationData?.cleaned_location || event.location}</p>
                    {locationData?.map_url && (
                      <a 
                        href={locationData.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View on Google Maps
                      </a>
                    )}
                    <Link 
                      to={`/event-location/${eventId}`}
                      className="btn btn-outline"
                    >
                      View on Map
                    </Link>
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="event-info-section">
                <h3>Event Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Source:</span>
                    <span className="info-value">{event.source || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">{event.event_type || 'Other'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sentiment:</span>
                    <span className={`info-value sentiment-${getSentimentColor(event.sentiment)}`}>
                      {event.sentiment || 'neutral'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Actions */}
      <section className="related-actions">
        <div className="actions-container">
          <h3>Related Actions</h3>
          <div className="actions-grid">
            <Link to="/event-location" className="action-card">
              <div className="action-icon">🗺️</div>
              <h4>View All Events Map</h4>
              <p>See all events on interactive map</p>
            </Link>
            <Link to={user?.role === 'event' ? '/organizer-dashboard' : '/user-dashboard'} className="action-card">
              <div className="action-icon">📊</div>
              <h4>Dashboard</h4>
              <p>Back to your dashboard</p>
            </Link>
            <Link to="/" className="action-card">
              <div className="action-icon">🏠</div>
              <h4>Home</h4>
              <p>Back to homepage</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;
