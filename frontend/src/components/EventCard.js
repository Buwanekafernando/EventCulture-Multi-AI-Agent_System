import React from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, analyticsAPI } from '../services/api';
import '../styles/EventCard.css';

const EventCard = ({ event, isTrending = false, userTier = 'free', isPublic = false }) => {
  const handleViewEvent = async () => {
    if (event.event_id || event.id) {
      const eventId = event.event_id || event.id;
      try {
        await analyticsAPI.trackInteraction(eventId, 'view');
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    }
  };

  const handleBookEvent = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user can book events based on tier
    if (userTier === 'free') {
      alert('Upgrade to Pro to book events directly!');
      return;
    }
    
    if (event.event_id || event.id) {
      const eventId = event.event_id || event.id;
      try {
        const bookingData = await eventsAPI.bookEvent(eventId);
        if (bookingData.booking_url) {
          window.open(bookingData.booking_url, '_blank');
        }
      } catch (error) {
        console.error('Error booking event:', error);
        alert('Booking not available for this event');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

  const eventId = event.event_id || event.id;
  const eventName = event.event_name || 'Event Name';
  const location = event.location || 'Location TBD';
  const date = formatDate(event.date);
  const description = event.description || 'No description available';
  const eventType = event.event_type || 'other';
  const sentiment = event.sentiment || 'neutral';
  const views = event.views || 0;
  const clicks = event.clicks || 0;
  
  // Check if event is virtual
  const isVirtualEvent = location.toLowerCase().includes('virtual') || 
                        location.toLowerCase().includes('online') ||
                        description.toLowerCase().includes('virtual') ||
                        description.toLowerCase().includes('online');
  
  // Check if user can access virtual events
  const canAccessVirtual = userTier === 'pro';

  // If this is a public view (pre-login), show minimal information
  if (isPublic) {
    return (
      <div className={`event-card public-event-card ${isTrending ? 'trending' : ''}`}>
        {isTrending && <div className="trending-badge">🔥 Trending</div>}
        
        <div className="event-header">
          <div className="event-type-icon">
            {getEventTypeIcon(eventType)}
          </div>
          <div className="event-meta">
            <span className="event-type">{eventType}</span>
          </div>
        </div>

        <div className="event-content">
          <h3 className="event-title">{eventName}</h3>
          <p className="event-date">📅 {date}</p>
          
          <div className="login-prompt">
            <p className="login-message">
              🔒 <strong>Sign in to view event details and book tickets</strong>
            </p>
          </div>
        </div>

        <div className="event-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Sign In to View Details
          </button>
        </div>
      </div>
    );
  }

  // For logged-in users, show full details based on tier
  return (
    <div className={`event-card ${isTrending ? 'trending' : ''}`}>
      {isTrending && <div className="trending-badge">🔥 Trending</div>}
      
      <div className="event-header">
        <div className="event-type-icon">
          {getEventTypeIcon(eventType)}
        </div>
        <div className="event-meta">
          <span className="event-type">{eventType}</span>
          <span className={`sentiment sentiment-${sentiment}`}>
            {sentiment}
          </span>
        </div>
      </div>

      <div className="event-content" onClick={handleViewEvent}>
        <h3 className="event-title">{eventName}</h3>
        <p className="event-location">
          📍 {location}
          {isVirtualEvent && !canAccessVirtual && (
            <span className="virtual-restriction"> (Pro only)</span>
          )}
        </p>
        <p className="event-date">📅 {date}</p>
        
        <div className="event-description">
          <p>{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
        </div>

        {event.summary && (
          <div className="event-summary">
            <p><strong>Summary:</strong> {event.summary}</p>
          </div>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="event-tags">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="event-stats">
          <span className="stat">
            👁️ {views} views
          </span>
          <span className="stat">
            👆 {clicks} clicks
          </span>
        </div>
      </div>

      <div className="event-actions">
        <Link 
          to={`/event-detail/${eventId}`} 
          className="btn btn-secondary"
          onClick={handleViewEvent}
        >
          View Details
        </Link>
        
        {/* Show booking button only for Pro users */}
        {userTier === 'pro' && (
          <button 
            className="btn btn-primary"
            onClick={handleBookEvent}
          >
            Book Now
          </button>
        )}
        
        {/* Show upgrade prompt for Free users */}
        {userTier === 'free' && (
          <button 
            className="btn btn-upgrade"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert('Upgrade to Pro to book events directly!');
            }}
          >
            Upgrade to Book
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
