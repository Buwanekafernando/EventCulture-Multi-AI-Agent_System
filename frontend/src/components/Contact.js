import React, { useState } from 'react';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdPerson, 
  MdSubject, 
  MdMessage, 
  MdSend 
} from 'react-icons/md';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Contact Information</h2>
            
            <div className="contact-item">
              <div className="contact-icon">
                <MdEmail size={24} />
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <p>support@eventculture.lk</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <MdPhone size={24} />
              </div>
              <div className="contact-details">
                <h3>Phone</h3>
                <p>+94 (076) 226-5366</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <MdLocationOn size={24} />
              </div>
              <div className="contact-details">
                <h3>Address</h3>
                <p>130/B Galle Rd, Colombo, Sri Lanka</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  <MdPerson size={18} style={{ marginRight: '8px' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <MdEmail size={18} style={{ marginRight: '8px' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">
                  <MdSubject size={18} style={{ marginRight: '8px' }} />
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <MdMessage size={18} style={{ marginRight: '8px' }} />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <MdSend size={18} style={{ marginRight: '8px' }} />
                Send Message
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;


