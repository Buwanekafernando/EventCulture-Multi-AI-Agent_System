import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, eventsAPI } from '../services/api';
import AnalyticsChart from './AnalyticsChart';
import Header from './Header';
import Footer from './Footer';
import '../styles/OrganizerDashboard.css';

const OrganizerDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, eventsData] = await Promise.all([
        analyticsAPI.getOrganizerDashboard(),
        eventsAPI.getEvents()
      ]);
      
      setDashboardData(dashboardResponse.dashboard);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getEngagementLevel = (rate) => {
    if (rate > 10) return { level: 'High', color: 'green' };
    if (rate > 5) return { level: 'Medium', color: 'orange' };
    return { level: 'Low', color: 'red' };
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1>Analytics Dashboard</h1>
          <p>Welcome back, {user?.name}! Here's your event performance overview.</p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>{dashboardData?.total_events || 0}</h3>
              <p>Total Events</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👁️</div>
            <div className="metric-content">
              <h3>{dashboardData?.total_views || 0}</h3>
              <p>Total Views</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">👆</div>
            <div className="metric-content">
              <h3>{dashboardData?.total_clicks || 0}</h3>
              <p>Total Clicks</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📈</div>
            <div className="metric-content">
              <h3>{dashboardData?.overall_engagement_rate || 0}%</h3>
              <p>Engagement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Summary */}
      <section className="engagement-summary">
        <h2>Engagement Overview</h2>
        <div className="engagement-cards">
          <div className="engagement-card high">
            <div className="engagement-icon">🔥</div>
            <h3>{dashboardData?.engagement_summary?.high_engagement || 0}</h3>
            <p>High Engagement Events</p>
            <span className="engagement-desc">>10% click rate</span>
          </div>
          <div className="engagement-card medium">
            <div className="engagement-icon">⚡</div>
            <h3>{dashboardData?.engagement_summary?.medium_engagement || 0}</h3>
            <p>Medium Engagement Events</p>
            <span className="engagement-desc">5-10% click rate</span>
          </div>
          <div className="engagement-card low">
            <div className="engagement-icon">📉</div>
            <h3>{dashboardData?.engagement_summary?.low_engagement || 0}</h3>
            <p>Low Engagement Events</p>
            <span className="engagement-desc">&lt; 5% click rate</span>
          </div>
        </div>
      </section>

      {/* Top Performing Events */}
      <section className="top-events-section">
        <h2>🏆 Top Performing Events</h2>
        <div className="top-events-grid">
          {dashboardData?.top_events?.map((event, index) => {
            const engagement = getEngagementLevel(event.engagement_rate);
            return (
              <div key={event.event_id} className="top-event-card">
                <div className="event-rank">#{index + 1}</div>
                <div className="event-info">
                  <h4>{event.event_name}</h4>
                  <div className="event-stats">
                    <span className="stat">👁️ {event.views} views</span>
                    <span className="stat">👆 {event.clicks} clicks</span>
                  </div>
                  <div className={`engagement-badge ${engagement.color}`}>
                    {engagement.level} Engagement ({event.engagement_rate}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Event Type Performance */}
      <section className="event-type-performance">
        <h2>📊 Event Type Performance</h2>
        <div className="performance-grid">
          {Object.entries(dashboardData?.event_type_performance || {}).map(([type, data]) => {
            const avgEngagement = data.clicks / Math.max(data.views, 1) * 100;
            const engagement = getEngagementLevel(avgEngagement);
            return (
              <div key={type} className="performance-card">
                <div className="performance-header">
                  <h4>{type}</h4>
                  <span className={`engagement-indicator ${engagement.color}`}>
                    {engagement.level}
                  </span>
                </div>
                <div className="performance-stats">
                  <div className="stat">
                    <span className="stat-number">{data.count}</span>
                    <span className="stat-label">Events</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{data.views}</span>
                    <span className="stat-label">Views</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{data.clicks}</span>
                    <span className="stat-label">Clicks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{avgEngagement.toFixed(1)}%</span>
                    <span className="stat-label">Avg Engagement</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Analytics Chart */}
      <section className="analytics-chart-section">
        <h2>📈 Engagement Trends</h2>
        <AnalyticsChart events={events} />
      </section>

      {/* All Events Table */}
      <section className="all-events-section">
        <h2>📋 All Events</h2>
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Engagement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const engagementRate = (event.clicks || 0) / Math.max(event.views || 1, 1) * 100;
                const engagement = getEngagementLevel(engagementRate);
                return (
                  <tr key={event.id}>
                    <td>{event.event_name}</td>
                    <td>{event.location || 'Virtual'}</td>
                    <td>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</td>
                    <td>{event.views || 0}</td>
                    <td>{event.clicks || 0}</td>
                    <td>
                      <span className={`engagement-badge ${engagement.color}`}>
                        {engagementRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <Link 
                        to={`/event-detail/${event.id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/event-location" className="action-card">
            <div className="action-icon">📍</div>
            <h3>Event Map</h3>
            <p>View events on interactive map</p>
          </Link>
          <button 
            className="action-card"
            onClick={loadDashboardData}
          >
            <div className="action-icon">🔄</div>
            <h3>Refresh Data</h3>
            <p>Update analytics</p>
          </button>
          <Link to="/" className="action-card">
            <div className="action-icon">🏠</div>
            <h3>Home</h3>
            <p>Back to homepage</p>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrganizerDashboard;
