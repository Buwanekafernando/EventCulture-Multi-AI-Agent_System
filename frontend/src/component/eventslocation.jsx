import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/eventsloation.css'; 

const EventLocation = () => {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">EventCulture</span>
        </div>
        <nav className="nav-right">
          <Link to="/">Home</Link>
          <Link to="/event-detail">Event Details</Link>
          <a href="/features">Features</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      
      <section className="hero">
        <h1>Event Location</h1>
        <p>Join us at our venue. Find directions and explore the area before you arrive.</p>
      </section>

      {/* Venue Details and Map Preview */}
      <section className="details-section">
        <div className="venue-details">
          <h2>Venue Details</h2>
          <p><strong>Venue Name:</strong> Colombo Conference Hall</p>
          <p><strong>Address:</strong> 123 Galle Road, Colombo 00300, Sri Lanka</p>
          <p><strong>Contact:</strong> +94 (112) 345-678</p>
          <p><strong>Event Time:</strong> 6:00 PM</p>
          <button className="directions-btn">→ Get Directions</button>
          <p className="view-maps">[ View in Google Maps ]</p>
        </div>
        <div className="map-preview">
          <h2>Map Preview</h2>
          <div className="map-placeholder"></div>
        </div>
      </section>

      {/* Tip */}
      <p className="tip">Tip: Click on the map to interact or use the buttons above to get directions directly in Google Maps.</p>

      {/* Interactive Map */}
      <section className="interactive-map">
        <h2>Interactive Map</h2>
        <div className="large-map-placeholder"></div>
      </section>

      {/* Transportation Options */}
      <section className="transportation">
        <div className="transport-card">
          <div className="icon">Car</div>
          <h3>By Car</h3>
          <p>Free parking available on site. Follow GPS directions to our main entrance.</p>
        </div>
        <div className="transport-card">
          <div className="icon">Bus</div>
          <h3>Public Transit</h3>
          <p>Accessible via bus routes 100 and 101 at Fort Station.</p>
        </div>
        <div className="transport-card">
          <div className="icon">Walk</div>
          <h3>Walking</h3>
          <p>Located in the heart of Colombo, easily walkable from nearby hotels.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EventCulture</h3>
            <p>Discover the best events like musicals, conferences, workshops, and exhibitions in Sri Lanka.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/event-detail">Event Details</Link></li>
              <li><a href="/features">Features</a></li>
              <li><a href="/pricing">Pricing</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>info@eventculture.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 EventCulture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventLocation;