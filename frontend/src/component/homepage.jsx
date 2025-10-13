import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const EventCulture = () => {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">EventCulture</span>
        </div>
        <nav className="nav-right">
          <Link to="/">Home</Link>
          <a href="/locations">Locations</a>
          <a href="/contact">Contact</a>
          <button className="login-btn">Login</button>
        </nav>
      </header>

      
      <section className="hero">
        <div className="hero-content">
          <div className="hero-card">
            <h1>Discover Events in Sri Lanka</h1>
            <p>Find the perfect musicals, conferences, workshops, and exhibitions</p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="categories">
        <h2>Popular Event Types</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="placeholder-circle"></div>
            <p>Musicals</p>
          </div>
          <div className="category-card">
            <div className="placeholder-circle"></div>
            <p>Conferences</p>
          </div>
          <div className="category-card">
            <div className="placeholder-circle"></div>
            <p>Workshops</p>
          </div>
          <div className="category-card">
            <div className="placeholder-circle"></div>
            <p>Exhibitions</p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured">
        <h2>Featured Events</h2>
        <div className="featured-grid">
          <div className="event-card">
            <div className="image-placeholder"></div>
            <div className="card-content">
              <h3>Colombo Music Festival</h3>
              <p>Colombo, Sri Lanka</p>
              <p className="price">Rs 7,500 per person</p>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <div className="card-content">
              <h3>Kandy Business Conference</h3>
              <p>Kandy, Sri Lanka</p>
              <p className="price">Rs 12,000 per person</p>
            </div>
          </div>
          <div className="event-card">
            <div className="image-placeholder"></div>
            <div className="card-content">
              <h3>Galle Art Exhibition</h3>
              <p>Galle, Sri Lanka</p>
              <p className="price">Rs 3,000 per person</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-circle">1</div>
            <h3>Search Events</h3>
            <p>Browse events in Sri Lanka based on your interests.</p>
          </div>
          <div className="step">
            <div className="step-circle">2</div>
            <h3>Compare Options</h3>
            <p>View details, schedules, and pricing for different events.</p>
          </div>
          <div className="step">
            <div className="step-circle">3</div>
            <h3>Book Your Tickets</h3>
            <p>Secure your spot with our easy booking process.</p>
          </div>
        </div>
      </section>

      {/* What Our Clients Say */}
      <section className="testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="client-avatar"></div>
            <div className="stars">★★★★★</div>
            <p>"The Colombo Music Festival was amazing! Great platform to find events."</p>
            <p><strong>Amaya Perera</strong></p>
          </div>
          <div className="testimonial-card">
            <div className="client-avatar"></div>
            <div className="stars">★★★★★</div>
            <p>"Found the perfect workshop in Kandy through EventCulture. Highly recommend!"</p>
            <p><strong>Rohan Silva</strong></p>
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
              <li><a href="/locations">Locations</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li>Musicals</li>
              <li>Conferences</li>
              <li>Workshops</li>
              <li>Exhibitions</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>123 Event St, Colombo, Sri Lanka</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 EventCulture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventCulture;