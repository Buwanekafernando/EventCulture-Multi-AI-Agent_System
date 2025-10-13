import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UpgradePrompt.css';

const UpgradePrompt = ({ onUpgrade, onClose }) => {
  const { upgradeToPro } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const result = await upgradeToPro();
      if (result.status === 'success') {
        onUpgrade && onUpgrade(result);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const proFeatures = [
    'Unlimited personalized recommendations',
    'Direct event booking',
    'Enhanced location features with directions',
    'Virtual event registration',
    'Priority customer support',
    'Advanced analytics and insights',
    'Early access to new features'
  ];

  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt-modal">
        <div className="upgrade-header">
          <h2>🚀 Upgrade to Pro</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="upgrade-content">
          <div className="upgrade-benefits">
            <h3>Unlock the full EventCulture experience</h3>
            <p>Get unlimited access to all features and enhance your event discovery journey.</p>
            
            <div className="features-list">
              {proFeatures.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="checkmark">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="upgrade-pricing">
            <div className="price-display">
              <span className="price">$9.99</span>
              <span className="period">/month</span>
            </div>
            <p className="pricing-note">Cancel anytime • 30-day money-back guarantee</p>
          </div>

          <div className="upgrade-actions">
            <button
              className="upgrade-btn"
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
