import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/userhomepage.css';

const EventCultureHome = () => {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">EventCulture</span>
        </div>
        <nav className="nav-right">
          <Link to="/user-home">Home</Link>
          <Link to="/event-detail">Event Details</Link>
          <Link to="/event-location">Event Location</Link>
          <input type="text" placeholder="Search events..." className="search-bar" />
          <button className="login-btn">Logout</button>
        </nav>
      </header>

      
      <section className="hero">
        <div className="hero-image"></div>
        <div className="hero-content">
          <h1>Summer Music Festival 2023</h1>
          <p>Join the biggest music celebration of the year with top artists from around the world.</p>
          <button className="view-details-btn">View Details</button>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="categories">
        <h2>Browse by Category</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="icon">Music</div>
            <p>Music</p>
          </div>
          <div className="category-card">
            <div className="icon">Tech</div>
            <p>Technology</p>
          </div>
          <div className="category-card">
            <div className="icon">Food</div>
            <p>Food & Drinks</p>
          </div>
          <div className="category-card">
            <div className="icon">Sports</div>
            <p>Sports</p>
          </div>
          <div className="category-card">
            <div className="icon">Art</div>
            <p>Art & Culture</p>
          </div>
        </div>
      </section>

      {/* Recommended for You */}
      <section className="recommended">
        <h2>Recommended for You</h2>
        <div className="recommended-grid">
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Electronic Dance Night</p>
            <p>Tomorrow • 9:00 PM</p>
            <p>Downtown Club • Electronic</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Tech Conference 2023</p>
            <p>Aug 15-17 • 9:00 AM</p>
            <p>Convention Center • Innovation</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Food Truck Festival</p>
            <p>Aug 20 • 12:00 PM</p>
            <p>Central Park • Culinary</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Art Gallery Opening</p>
            <p>Aug 25 • 6:00 PM</p>
            <p>Modern Art Museum • Visual Arts</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Marathon Challenge</p>
            <p>Sep 5 • 7:00 AM</p>
            <p>City Center • Athletics</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Events */}
      <section className="popular">
        <h2>Popular Events</h2>
        <div className="popular-grid">
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Starlight in the Park</p>
            <p>Aug 12 • 8:00 PM</p>
            <p>City Park • Jazz</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Startup Pitch Night</p>
            <p>Aug 12 • 7:00 PM</p>
            <p>Innovation Hub • Business</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Wine Tasting Experience</p>
            <p>Aug 20 • 6:00 PM</p>
            <p>Vineyard Estate • Culinary</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Sculpture Exhibition</p>
            <p>Sep 1-30 • All Day</p>
            <p>City Gallery • Arts</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <p>Basketball Championship</p>
            <p>Sep 12 • 6:00 PM</p>
            <p>Sports Arena • Basketball</p>
            <div className="card-buttons">
              <Link to="/event-detail" className="view-details-btn">View Details</Link>
              <Link to="/event-location" className="location-btn">View Location</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>EventCulture</h3>
            <p>Discover and connect with amazing events happening around you.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://facebook.com">Facebook</a>
              <a href="https://twitter.com">Twitter</a>
              <a href="https://instagram.com">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 EventCulture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventCultureHome;