import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/TierSelection.css';

const TierSelection = ({ onTierSelected }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const { login } = useAuth();

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
  };

  const handleContinue = () => {
    if (selectedTier) {
      // Store the selected tier in sessionStorage for the auth flow
      sessionStorage.setItem('selectedTier', selectedTier);
      onTierSelected(selectedTier);
      login();
    }
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'View all events',
        'Up to 10 personalized recommendations',
        'Basic location features (Google Maps view)',
        'Event browsing and discovery',
        'Basic analytics for your interactions'
      ],
      limitations: [
        'Cannot register for virtual events',
        'Limited to 10 recommendations per session',
        'No advanced location features (directions)',
        'No priority customer support'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Free',
        'Unlimited personalized recommendations',
        'Direct event booking',
        'Enhanced location features with directions',
        'Virtual event registration',
        'Priority customer support',
        'Advanced analytics and insights',
        'Early access to new features'
      ],
      limitations: [],
      popular: true
    }
  ];

  return (
    <div className="tier-selection-container">
      <div className="tier-selection-header">
        <h1>Choose Your EventCulture Plan</h1>
        <p>Select the plan that best fits your event discovery needs</p>
      </div>

      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`tier-card ${selectedTier === tier.id ? 'selected' : ''} ${tier.popular ? 'popular' : ''}`}
            onClick={() => handleTierSelect(tier.id)}
          >
            {tier.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="tier-header">
              <h3>{tier.name}</h3>
              <div className="tier-price">
                <span className="price">{tier.price}</span>
                <span className="period">/{tier.period}</span>
              </div>
            </div>

            <div className="tier-features">
              <h4>What's included:</h4>
              <ul>
                {tier.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {tier.limitations.length > 0 && (
              <div className="tier-limitations">
                <h4>Limitations:</h4>
                <ul>
                  {tier.limitations.map((limitation, index) => (
                    <li key={index} className="limitation-item">
                      <span className="cross">✗</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="tier-selection-indicator">
              {selectedTier === tier.id && (
                <div className="selected-indicator">Selected</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="tier-selection-actions">
        <button
          className="continue-btn"
          onClick={handleContinue}
          disabled={!selectedTier}
        >
          Continue with {selectedTier ? tiers.find(t => t.id === selectedTier).name : 'Plan'}
        </button>
        <p className="tier-note">
          You can upgrade or downgrade your plan at any time from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default TierSelection;
