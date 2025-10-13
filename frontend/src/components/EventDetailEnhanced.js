import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, locationAPI, analyticsAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';
import EngagementChart from './EngagementChart';
import '../styles/eventdetail.css';

const EventDetailEnhanced = () => {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (eventId) {
      loadEventDetails();
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [eventData, locationData, analyticsData] = await Promise.all([
        eventsAPI.getEvent(eventId),
        locationAPI.getLocation(eventId),
        analyticsAPI.getEventAnalytics(eventId)
      ]);
      
      setEvent(eventData);
      setLocationData(locationData);
      setAnalytics(analyticsData);
      
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
        weekday: 'long'
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
      business: '💼',
      cultural: '🎭',
      fashion: '👗',
      comedy: '😂',
      theater: '🎭',
      photography: '📸',
      visual: '🖥️',
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
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading event details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="app">
        <Header />
        <div className="error-container">
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/user-dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

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

          {/* Event Content Grid */}
          <div className="event-content-grid">
            {/* Main Content */}
            <div className="event-main-content">
              {/* Description */}
              <div className="event-description">
                <h3>📝 About This Event</h3>
                <p>{event.description || 'No description available.'}</p>
                
                {event.summary && (
                  <div className="event-summary">
                    <h4>📋 Summary</h4>
                    <p>{event.summary}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  <h4>🏷️ Tags</h4>
                  <div className="tags-list">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Details */}
              {locationData && (
                <div className="location-details">
                  <h3>📍 Location Information</h3>
                  <div className="location-info">
                    <p><strong>Location:</strong> {locationData.cleaned_location || event.location}</p>
                    {locationData.is_virtual ? (
                      <div className="virtual-event-notice">
                        <span className="virtual-icon">🖥️</span>
                        <span>This is a virtual event</span>
                      </div>
                    ) : (
                      <div className="physical-location">
                        <p><strong>Type:</strong> Physical Event</p>
                        {user?.tier === 'pro' && locationData.google_maps_url && (
                          <a 
                            href={locationData.google_maps_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="maps-link"
                          >
                            🗺️ View on Google Maps
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Section */}
              <div className="booking-section">
                <h3>🎫 Booking Information</h3>
                <div className="booking-content">
                  {event.booking_url ? (
                    <div className="booking-available">
                      <p>This event is available for booking!</p>
                      {user?.tier === 'pro' ? (
                        <button 
                          className="btn btn-primary btn-large"
                          onClick={handleBookEvent}
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? 'Processing...' : 'Book This Event'}
                        </button>
                      ) : (
                        <div className="upgrade-prompt">
                          <p>🔒 Pro tier required for direct booking</p>
                          <Link to="/user-dashboard" className="btn btn-upgrade">
                            Upgrade to Pro
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="booking-unavailable">
                      <p>Booking information not available for this event.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="event-sidebar">
              {/* Event Stats */}
              <div className="event-stats-card">
                <h4>📊 Event Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon">👁️</span>
                    <div className="stat-content">
                      <span className="stat-value">{event.views || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👆</span>
                    <div className="stat-content">
                      <span className="stat-value">{event.clicks || 0}</span>
                      <span className="stat-label">Clicks</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📈</span>
                    <div className="stat-content">
                      <span className="stat-value">
                        {event.views > 0 ? ((event.clicks / event.views) * 100).toFixed(1) : 0}%
                      </span>
                      <span className="stat-label">Engagement</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h4>⚡ Quick Actions</h4>
                <div className="actions-list">
                  <Link to="/event-location" className="action-link">
                    <span className="action-icon">🗺️</span>
                    View on Map
                  </Link>
                  <Link to="/user-dashboard" className="action-link">
                    <span className="action-icon">🏠</span>
                    Back to Dashboard
                  </Link>
                  <button 
                    className="action-link"
                    onClick={() => window.history.back()}
                  >
                    <span className="action-icon">↩️</span>
                    Go Back
                  </button>
                </div>
              </div>

              {/* Event Source */}
              <div className="event-source-card">
                <h4>📡 Event Source</h4>
                <p><strong>Source:</strong> {event.source || 'Unknown'}</p>
                <p><strong>Added:</strong> {new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Engagement Analytics */}
          <EngagementChart event={event} />

          {/* Navigation */}
          <div className="event-navigation">
            <Link to="/user-dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
            <Link to="/event-location" className="btn btn-primary">
              View on Map →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetailEnhanced;
