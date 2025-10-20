import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import logoUser from '../assets/logouser.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <img src={logoUser} alt="logo" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} />
            <h3>EventCulture</h3>
            <p>Discover amazing events happening around Sri Lanka with our AI-powered recommendation system.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/user-dashboard">Dashboard</Link></li>
              {/* Removed Event Map link */}
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>AI-Powered Recommendations</li>
              <li>Event Discovery</li>
              <li>Interactive Maps</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 EventCulture Multi-AI-Agent System. All rights reserved.</p>
            <div className="footer-social">
              <span>Built with ❤️ for Sri Lankan Events</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
