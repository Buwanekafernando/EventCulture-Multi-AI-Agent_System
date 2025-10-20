import React, { useState } from 'react';
import { FaBullseye } from 'react-icons/fa';
import '../styles/PreferencesModal.css';

const PreferencesModal = ({ currentPreferences, onSave, onClose }) => {
  const [preferences, setPreferences] = useState(currentPreferences);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const availableInterests = [
    'Music', 'Technology', 'Art', 'Sports', 'Food', 'Education',
    'Business', 'Health', 'Travel', 'Photography', 'Dance', 'Theater',
    'Gaming', 'Fashion', 'Science', 'Literature', 'Comedy', 'Networking'
  ];

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    const preferencesString = selectedInterests.join(', ');
    onSave(preferencesString);
  };

  const handleTextChange = (e) => {
    setPreferences(e.target.value);
  };

  const handleTextSave = () => {
    onSave(preferences);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaBullseye style={{ marginRight: 8 }} />Set Your Preferences</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="preferences-section">
            <h3>Choose Your Interests</h3>
            <p>Select topics that interest you to get better recommendations:</p>
            
            <div className="interests-grid">
              {availableInterests.map((interest) => (
                <button
                  key={interest}
                  className={`interest-chip ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="selected-interests">
              <h4>Selected Interests:</h4>
              <div className="selected-chips">
                {selectedInterests.map((interest) => (
                  <span key={interest} className="selected-chip">
                    {interest}
                    <button 
                      className="remove-chip"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={selectedInterests.length === 0}
            >
              Save Selected Interests
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="text-preferences-section">
            <h3>Custom Preferences</h3>
            <p>Or enter your interests as comma-separated text:</p>
            
            <textarea
              value={preferences}
              onChange={handleTextChange}
              placeholder="e.g., Music, Technology, Art, Sports..."
              className="preferences-textarea"
              rows={4}
            />
            
            <button 
              className="btn btn-secondary"
              onClick={handleTextSave}
              disabled={!preferences.trim()}
            >
              Save Text Preferences
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
