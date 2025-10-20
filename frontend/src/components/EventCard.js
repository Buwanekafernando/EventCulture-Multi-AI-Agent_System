import React from 'react';
import { 
  FaMusic, FaLaptop, FaPalette, FaRunning, FaUtensils, FaGraduationCap, FaBriefcase, FaTheaterMasks, FaTshirt, FaLaugh, FaCamera, FaDesktop, FaQuestionCircle,
  FaCalendarAlt, FaMapMarkerAlt, FaClipboardList, FaEye, FaHandPointer, FaStar, FaTicketAlt, FaLock
} from 'react-icons/fa';
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
      music: <FaMusic />, 
      tech: <FaLaptop />, 
      art: <FaPalette />, 
      sports: <FaRunning />, 
      food: <FaUtensils />, 
      education: <FaGraduationCap />, 
      business: <FaBriefcase />, 
      cultural: <FaTheaterMasks />, 
      fashion: <FaTshirt />, 
      comedy: <FaLaugh />, 
      theater: <FaTheaterMasks />, 
      photography: <FaCamera />, 
      visual: <FaDesktop />, 
      other: <FaTheaterMasks />
    };
    return icons[(eventType || '').toLowerCase()] || <FaTheaterMasks />;
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
        {isTrending && <div className="trending-badge">Trending</div>}
        
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
          <p className="event-date"><FaCalendarAlt style={{ marginRight: 6 }} />{date}</p>
          
          <div className="login-prompt">
            <p className="login-message">
              <FaLock style={{ marginRight: 6 }} /><strong>Sign in to view event details and book tickets</strong>
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
      {isTrending && <div className="trending-badge"> Trending</div>}
      
      {/* Card Header with Trending Badge */}
      <div className="event-header">
        <div className="event-icon-container">
          <div className="event-type-icon">{getEventTypeIcon(eventType)}</div>
        </div>
        <div className="event-meta">
          <span className={`sentiment sentiment-${sentiment}`}>
            {sentiment}
          </span>
        </div>
      </div>

      {/* Main Content Area - Ordered Information */}
      <div className="event-content" onClick={handleViewEvent}>
        {/* 1. Type of the event */}
        <div className="event-type-section">
          <span className="event-type">{eventType}</span>
        </div>

        {/* 2. Name of the event */}
        <div className="event-title-section">
          <h3 className="event-title">{eventName}</h3>
        </div>

        {/* 3. Date and time of the event */}
        <div className="event-date-section">
          <div className="event-detail-item">
            <span className="detail-icon"><FaCalendarAlt /></span>
            <span className="detail-text">{date}</span>
          </div>
        </div>

        {/* 4. Location of the event */}
        <div className="event-location-section">
          <div className="event-detail-item">
            <span className="detail-icon"><FaMapMarkerAlt /></span>
            <span className="detail-text">
              {location}
              {isVirtualEvent && !canAccessVirtual && (
                <span className="virtual-restriction"> (Pro only)</span>
              )}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="event-description">
          <p>{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
        </div>

        {/* Summary Section */}
        {event.summary && (
          <div className="event-summary">
            <div className="summary-header">
              <span className="summary-icon"><FaClipboardList /></span>
              <span className="summary-title">Summary</span>
            </div>
            <p className="summary-text">{event.summary}</p>
          </div>
        )}

        {/* Tags Section */}
        {event.tags && event.tags.length > 0 && (
          <div className="event-tags">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 5. Views and clicks button */}
      <div className="event-stats-section">
        <div className="event-stats">
          <div className="stat-item">
            <span className="stat-icon"><FaEye /></span>
            <span className="stat-value">{views}</span>
            <span className="stat-label">views</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><FaHandPointer /></span>
            <span className="stat-value">{clicks}</span>
            <span className="stat-label">clicks</span>
          </div>
        </div>
      </div>

      {/* 6. Two buttons (view details and book now) */}
      <div className="event-actions">
        <Link 
          to={`/event-detail/${eventId}`} 
          className="btn btn-secondary"
          onClick={handleViewEvent}
        >
          <span className="btn-icon"><FaEye /></span>
          View Details
        </Link>
        
        {/* Show booking button only for Pro users */}
        {userTier === 'pro' && (
          <button 
            className="btn btn-primary"
            onClick={handleBookEvent}
          >
            <span className="btn-icon"><FaTicketAlt /></span>
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
            <span className="btn-icon"><FaStar /></span>
            Upgrade to Book
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
