import React, { useState, useEffect } from 'react';
import { 
  FaMusic, FaLaptop, FaPalette, FaRunning, FaUtensils, FaGraduationCap, FaTheaterMasks, FaTag, FaGlobe, FaTicketAlt, FaHome, FaArrowLeft, FaMapMarkedAlt, FaMapMarkerAlt, FaCalendarAlt, FaStickyNote, FaClipboardList, FaBroadcastTower, FaChartBar, FaEye, FaHandPointer, FaLock, FaStar
} from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, locationAPI, analyticsAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';
import EngagementChart from './EngagementChart';
import '../styles/eventdetail.css';
import logo from '../assets/logouser.png';

const EventDetail = () => {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
      const [eventData, locationData, analyticsData] = await Promise.all([
        eventsAPI.getEvent(eventId),
        locationAPI.getLocation(eventId),
        analyticsAPI.getEventAnalytics(eventId).catch(() => null) // Optional analytics
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
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      music: <FaMusic />, tech: <FaLaptop />,
      art: <FaPalette />, sports: <FaRunning />,
      food: <FaUtensils />, education: <FaGraduationCap />,
      cultural: <FaTheaterMasks />,
      theater: <FaTheaterMasks />,
      other: <FaTheaterMasks />
    };
    return icons[(eventType || '').toLowerCase()] || <FaTheaterMasks />;
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
      <div className="event-detail-page">
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
      <div className="event-detail-page">
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
    <div className="event-detail-page">
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
                <span className="meta-icon"><FaMapMarkerAlt /></span>
                <span className="meta-text">
                  {locationData?.cleaned_location || event.location || 'Location TBD'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon"><FaCalendarAlt /></span>
                <span className="meta-text">{formatDate(event.date)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon"><FaTag /></span>
                <span className={`sentiment-badge ${getSentimentColor(event.sentiment)}`}>
                  {event.sentiment || 'neutral'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Content Grid */}
          <div className="event-content">
            {/* Main Content */}
            <div className="event-main">
              {/* Description */}
              <div className="event-description">
                <h3><FaStickyNote style={{ marginRight: 8 }} />About This Event</h3>
                <p>{event.description || 'No description available.'}</p>
                
                {event.summary && (
                  <div className="event-summary">
                    <h4><FaClipboardList style={{ marginRight: 8 }} />Summary</h4>
                    <p>{event.summary}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  <h3>🏷️ Tags</h3>
                  <div className="tags-container">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Details */}
              <div className="location-section">
                <h3><FaMapMarkerAlt style={{ marginRight: 8 }} />Location Information</h3>
                {locationData?.is_virtual ? (
                  <div className="virtual-location">
                    <span className="location-icon"><FaGlobe /></span>
                    <p>Virtual Event</p>
                    <p>This event will be held online</p>
                  </div>
                ) : (
                  <div className="physical-location">
                    <span className="location-icon"><FaMapMarkerAlt /></span>
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
                    {user?.tier === 'pro' && (
                      <Link 
                        to={`/location-map/${eventId}`}
                        className="btn btn-primary"
                      >
                        <FaMapMarkedAlt style={{ marginRight: 6 }} />Location Map
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Section */}
              <div className="booking-section">
                <h3><FaTicketAlt style={{ marginRight: 8 }} />Booking Information</h3>
                <div className="booking-content">
                  {event.booking_url ? (
                    <div className="booking-available">
                      <p>This event is available for booking!</p>
                      {!isAuthenticated ? (
                        <div className="login-prompt">
                          <p className="login-message">
                            <FaLock style={{ marginRight: 6 }} /><strong>Sign in to book this event</strong>
                          </p>
                          <Link to="/login" className="btn btn-primary btn-large">
                            Sign In to Book
                          </Link>
                        </div>
                      ) : user?.tier === 'pro' ? (
                        <button 
                          className="btn btn-primary btn-large"
                          onClick={handleBookEvent}
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? 'Processing...' : 'Book This Event'}
                        </button>
                      ) : (
                        <div className="upgrade-prompt">
                          <p className="upgrade-message">
                            <FaStar style={{ marginRight: 6 }} /><strong>Upgrade to Pro to book events directly</strong>
                          </p>
                          <button 
                            className="btn btn-upgrade btn-large"
                            onClick={() => {
                              alert('Upgrade to Pro to book events directly!');
                            }}
                          >
                            Upgrade to Pro
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="booking-unavailable">
                      <p className="no-booking">Booking information not available for this event.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="event-sidebar">
              {/* Event Stats */}
              <div className="event-stats">
                <h3><FaChartBar style={{ marginRight: 8 }} />Event Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-icon"><FaEye /></span>
                    <span className="stat-number">{event.views || 0}</span>
                    <span className="stat-label">Views</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon"><FaHandPointer /></span>
                    <span className="stat-number">{event.clicks || 0}</span>
                    <span className="stat-label">Clicks</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📈</span>
                    <span className="stat-number">
                      {event.views > 0 ? ((event.clicks / event.views) * 100).toFixed(1) : 0}%
                    </span>
                    <span className="stat-label">Engagement</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3>Quick Actions</h3>
                <div className="actions-list">
                  {/* Removed View on Map quick action */}
                  <Link to="/user-dashboard" className="action-link">
                    <span className="action-icon"><FaHome /></span>
                    Back to Dashboard
                  </Link>
                  <button 
                    className="action-link"
                    onClick={() => window.history.back()}
                  >
                    <span className="action-icon"><FaArrowLeft /></span>
                    Go Back
                  </button>
                </div>
              </div>

              {/* Event Source */}
              <div className="event-info-section">
                <h3><FaBroadcastTower style={{ marginRight: 8 }} />Event Source</h3>
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

          {/* Engagement Analytics */}
          {analytics && <EngagementChart event={event} />}

          {/* Related Actions */}
          <section className="related-actions">
            <div className="actions-container">
              <h3>Related Actions</h3>
              <div className="actions-grid">
                {/* Removed View All Events Map card */}
                <Link to="/user-dashboard" className="action-card">
                  <div className="action-icon"><FaChartBar /></div>
                  <h4>Dashboard</h4>
                  <p>Back to your dashboard</p>
                </Link>
                <Link to="/" className="action-card">
                  <div className="action-icon"><FaHome /></div>
                  <h4>Home</h4>
                  <p>Back to homepage</p>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetail;