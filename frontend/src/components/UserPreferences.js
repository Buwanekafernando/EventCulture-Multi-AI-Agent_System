import React, { useState } from 'react';
import { 
  FaMusic, FaLaptop, FaPalette, FaRunning, FaUtensils, FaGraduationCap, FaBriefcase, FaTheaterMasks, FaTshirt, FaLaugh, FaCamera, FaRegCircle, FaStar, FaLightbulb, FaDesktop
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recommendationsAPI } from '../services/api';
import '../styles/UserPreferences.css';

const UserPreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    { id: 'music', label: 'Music', icon: <FaMusic />, description: 'Concerts, festivals, live performances' },
    { id: 'tech', label: 'Technology', icon: <FaLaptop />, description: 'Conferences, workshops, tech meetups' },
    { id: 'sports', label: 'Sports', icon: <FaRunning />, description: 'Games, tournaments, fitness events' },
    { id: 'education', label: 'Education', icon: <FaGraduationCap />, description: 'Workshops, seminars, learning events' },
    { id: 'food', label: 'Food & Drinks', icon: <FaUtensils />, description: 'Food festivals, tastings, culinary events' },
    { id: 'art', label: 'Art', icon: <FaPalette />, description: 'Art exhibitions, galleries, design events' },
    { id: 'business', label: 'Business', icon: <FaBriefcase />, description: 'Networking, conferences, professional events' },
    { id: 'cultural', label: 'Cultural', icon: <FaTheaterMasks />, description: 'Traditional events, cultural celebrations' },
    { id: 'fashion', label: 'Fashion', icon: <FaTshirt />, description: 'Fashion shows, style events, runway' },
    { id: 'comedy', label: 'Comedy', icon: <FaLaugh />, description: 'Stand-up shows, comedy nights, humor events' },
    { id: 'theater', label: 'Theater', icon: <FaTheaterMasks />, description: 'Plays, musicals, theatrical performances' },
    { id: 'photography', label: 'Photography', icon: <FaCamera />, description: 'Photo exhibitions, workshops, contests' },
    { id: 'visual', label: 'Visual (Online)', icon: <FaDesktop />, description: 'Virtual events, online conferences, webinars' }
  ];

  const handlePreferenceToggle = (preferenceId) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        return prev.filter(id => id !== preferenceId);
      } else {
        return [...prev, preferenceId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedPreferences.length === 0) {
      alert('Please select at least one event type to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save user preferences
      const preferencesString = selectedPreferences.join(', ');
      await recommendationsAPI.updateUserPreferences(user.id, preferencesString);

      // Navigate to user dashboard with preferences set
      navigate('/user-dashboard', { 
        state: { 
          preferencesSet: true, 
          selectedPreferences: selectedPreferences 
        } 
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Navigate to dashboard without setting preferences
    navigate('/user-dashboard');
  };

  return (
    <div className="user-preferences-container">
      <div className="preferences-card">
        <div className="preferences-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Let's personalize your event discovery experience</p>
          <div className="user-tier-indicator">
            {user?.tier === 'pro' ? (
              <span className="tier-badge pro"><FaStar style={{ marginRight: 6 }} />Pro User</span>
            ) : (
              <span className="tier-badge free"><FaRegCircle style={{ marginRight: 6 }} />Free User</span>
            )}
          </div>
        </div>

        <div className="preferences-content">
          <h2>What types of events interest you today?</h2>
          <p className="preferences-subtitle">
            Select one or more categories to get personalized recommendations
          </p>

          <div className="event-types-grid">
            {eventTypes.map((type) => (
              <div
                key={type.id}
                className={`event-type-card ${selectedPreferences.includes(type.id) ? 'selected' : ''}`}
                onClick={() => handlePreferenceToggle(type.id)}
              >
                <div className="event-type-icon">{type.icon}</div>
                <div className="event-type-content">
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                </div>
                <div className="selection-indicator">
                  {selectedPreferences.includes(type.id) && <span>✓</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="preferences-summary">
            <p>
              <strong>Selected:</strong> {selectedPreferences.length} event type{selectedPreferences.length !== 1 ? 's' : ''}
            </p>
            {user?.tier === 'free' && (
              <p className="tier-limit-info">
                Free users will see up to 10 personalized recommendations
              </p>
            )}
            {user?.tier === 'pro' && (
              <p className="tier-benefit-info">
                Pro users get unlimited personalized recommendations
              </p>
            )}
          </div>

          <div className="preferences-actions">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedPreferences.length === 0}
            >
              {isSubmitting ? 'Setting up your experience...' : 'Get My Recommendations'}
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          </div>

          <div className="preferences-help">
              <p>
              <FaLightbulb style={{ marginRight: 6 }} />
              <strong>Tip:</strong> You can always update your preferences later from your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;







