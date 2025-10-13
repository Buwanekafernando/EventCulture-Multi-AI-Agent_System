import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/eventdetail.css';

const EventPage = () => {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">EventCulture</span>
        </div>
        <nav className="nav-right">
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

     
      <section className="hero">
        <div className="hero-image"></div>
        <div className="event-info">
          <h1>Music Festival 2023</h1>
          <p>October 15, 2023 • Colombo, Sri Lanka</p>
          <button className="book-btn">Book Now</button>
        </div>
      </section>

      {/* Event Summary and Details */}
      <section className="event-details">
        <div className="summary">
          <h2>Event Summary</h2>
          <p>Experience the ultimate musical celebration at Music Festival 2023 in Colombo. This three-day event brings together top artists from around the world for an unforgettable weekend of live performances, set against the stunning backdrop of Colombo's waterfront. This festival offers an immersive experience with state-of-the-art sound systems and breathtaking visuals.</p>
        </div>
        <div className="details">
          <h2>Event Details</h2>
          <ul>
            <li><strong>Date:</strong> October 15 - 17, 2023</li>
            <li><strong>Time:</strong> 6:00 PM - 11:00 PM</li>
            <li><strong>Price:</strong> Rs 7,500/day per person</li>
            <li><strong>Early Bird:</strong> Rs 6,000 per person</li>
            <li><strong>Dress Code:</strong> Casual & Festive</li>
            <li><strong>Venue:</strong> Colombo Waterfront</li>
          </ul>
          <Link to="/event-location" className="location-btn">View Event Location</Link>
        </div>
      </section>

      {/* Location */}
      <section className="location">
        <h2>Location</h2>
        <div className="map-placeholder"></div>
        <p>Interactive Map Placeholder</p>
      </section>

      {/* Past Events */}
      <section className="past-events">
        <h2>Past Events in Sri Lanka</h2>
        <div className="past-events-grid">
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Colombo Jazz Night</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Kandy Culture Festival</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Galle International Music</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Sri Lanka Food Fair</p>
          </div>
          <div classclassName="event-card">
            <div className="image-placeholder"></div>
            <p>Beruwela Beach Party</p>
          </div>
        </div>
      </section>

      {/* Recommended Events */}
      <section className="recommended-events">
        <h2>Recommended Events You Might Like</h2>
        <div className="recommended-events-grid">
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Dance Under the Stars • November 15, 2023 • Kandy</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Traditional Arts Exhibition • December 10, 2023 • Galle</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Tech Innovation Summit • January 20, 2024 • Colombo</p>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Mountain Hiking Adventure • March 15, 2024 • Nuwara Eliya</p>
          </div>
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
              <li><a href="/">Home</a></li>
              <li><a href="/events">Events</a></li>
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
            <p>Email: info@eventculture.com</p>
            <p>Phone: +94 (112) 345-678</p>
            <p>Address: 123 Galle Rd, Colombo, Sri Lanka</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 EventCulture. All rights reserved.</p>
          <div className="social-links">
            <a href="https://facebook.com">Facebook</a>
            <a href="https://twitter.com">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventPage;