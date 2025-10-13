import React from 'react';
import '../styles/login.css'; // Assume CSS file for styling

const Login = () => {
  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth implementation
    console.log('Google login initiated');
    // Integrate with Google Auth API here
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">🎭 EventCulture</span>
        </div>
      </header>

      {/* Login Section */}
      <section className="login-section">
        <div className="login-card">
          <div className="logo-placeholder"></div>
          <h1>EventCulture</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to discover and manage your events</p>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <span className="google-icon">G</span> Login with Google
          </button>
          <p className="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </section>
    </div>
  );
};

export default Login;