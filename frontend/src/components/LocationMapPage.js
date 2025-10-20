import React, { useState, useEffect } from 'react';
import { FaBus, FaTrain, FaWalking, FaCar, FaGlobe, FaMapMarkerAlt, FaRoute, FaStopwatch, FaRuler, FaMapSigns } from 'react-icons/fa';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { locationAPI, eventsAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';
import '../styles/LocationMapPage.css';

const LocationMapPage = () => {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [mapsData, setMapsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [directions, setDirections] = useState(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const [multiSummary, setMultiSummary] = useState(null);
  const [userRoutes, setUserRoutes] = useState([]);
  const [userRoutesLoading, setUserRoutesLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (user?.tier !== 'pro') {
      navigate('/user-dashboard');
      return;
    }

    if (eventId) {
      loadEventAndMapsData();
    }
  }, [eventId, isAuthenticated, user, navigate]);

  const loadEventAndMapsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventData, mapsData] = await Promise.all([
        eventsAPI.getEvent(eventId),
        locationAPI.getGoogleMapsData(eventId)
      ]);
      
      setEvent(eventData);
      setMapsData(mapsData);
    } catch (err) {
      console.error('Error loading event and maps data:', err);
      setError('Failed to load event location data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLocationRoutes = async (userLoc) => {
    if (!userLoc || !userLoc.trim()) return;
    
    try {
      setUserRoutesLoading(true);
      const userRoutesData = await locationAPI.getUserLocationRoutes(eventId, userLoc);
      setUserRoutes(userRoutesData.user_routes || []);
    } catch (err) {
      console.error('Error fetching user location routes:', err);
      setUserRoutes([]);
    } finally {
      setUserRoutesLoading(false);
    }
  };

  const handleOpenLocationInput = () => {
    setShowLocationInput(true);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(`${latitude}, ${longitude}`);
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  };

  const handleFetchDirections = async () => {
    if (!userLocation || !mapsData?.location_name) return;
    try {
      setDirectionsLoading(true);
      const [result, summary] = await Promise.all([
        locationAPI.getDirections(userLocation, mapsData.location_name, travelMode),
        locationAPI.getDirectionsSummary(userLocation, mapsData.location_name)
      ]);
      setDirections(result);
      setMultiSummary(summary?.summaries || null);
      
      // Also fetch user location routes for the new functionality
      await fetchUserLocationRoutes(userLocation);
    } catch (e) {
      console.error('Failed to fetch directions', e);
      alert('Failed to get directions. Please try again.');
    } finally {
      setDirectionsLoading(false);
    }
  };


  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    // Open Google Maps with directions
    if (route.google_maps_url) {
      window.open(route.google_maps_url, '_blank');
    }
  };

  const getRouteIcon = (mode) => {
    const icons = {
      bus: <FaBus />,
      train: <FaTrain />,
      walk: <FaWalking />
    };
    return icons[mode] || <FaCar />;
  };

  const getRouteColor = (mode) => {
    const colors = {
      bus: '#FF6B6B',
      train: '#4ECDC4',
      walk: '#45B7D1'
    };
    return colors[mode] || '#95A5A6';
  };

  if (loading) {
    return (
      <div className="location-map-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading location map...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-map-page">
        <Header />
        <div className="error-container">
          <h2>Error Loading Map</h2>
          <p>{error}</p>
          <Link to={`/event-detail/${eventId}`} className="btn btn-primary">
            Back to Event
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event || !mapsData) {
    return (
      <div className="location-map-page">
        <Header />
        <div className="error-container">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/user-dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (mapsData.is_virtual) {
    return (
      <div className="location-map-page">
        <Header />
        <div className="virtual-event-container">
            <div className="virtual-event-card">
            <div className="virtual-icon"><FaGlobe /></div>
            <h2>Virtual Event</h2>
            <p>This event will be held online. No physical location to display.</p>
            <Link to={`/event-detail/${eventId}`} className="btn btn-primary">
              Back to Event Details
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="location-map-page">
      <Header />

      {/* Page Header */}
      <section className="page-header">
        <div className="header-container">
          <div className="breadcrumb">
            <Link to="/user-dashboard">Dashboard</Link>
            <span> / </span>
            <Link to={`/event-detail/${eventId}`}>Event Details</Link>
            <span> / </span>
            <span>Location Map</span>
          </div>
          <h1><FaMapMarkerAlt style={{ marginRight: 8 }} />Event Location</h1>
          <p>{event.event_name} - {mapsData.location_name}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="map-content">
        <div className="content-container">

          {/* User Location Input Card */}
          <div className="user-location-card">
            <div className="user-location-header">
              <h2><FaMapSigns style={{ marginRight: 8 }} />Find your route</h2>
              <p>Where do you live? Enter your current location to see directions to this event.</p>
            </div>
            {!showLocationInput ? (
              <div className="user-location-actions">
                <button className="btn btn-primary" onClick={handleOpenLocationInput}>Enter your current location</button>
                <button className="btn btn-outline" onClick={handleUseMyLocation}>Use my current location</button>
              </div>
            ) : (
              <div className="user-location-form">
                <input
                  type="text"
                  className="location-input"
                  placeholder="Type an address, city, or coordinates"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                />
                <div className="travel-mode-selector">
                  <label>Travel mode:</label>
                  <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
                    <option value="driving">Driving</option>
                    <option value="walking">Walking</option>
                    <option value="transit">Transit</option>
                    <option value="bicycling">Bicycling</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={handleFetchDirections} disabled={directionsLoading || !userLocation}>
                  {directionsLoading ? 'Fetching directions...' : 'Show directions'}
                </button>
              </div>
            )}
          </div>


          {/* User Location Routes */}
          {userRoutes.length > 0 && (
            <div className="routes-section">
              <div className="routes-header">
                <h2><FaRoute style={{ marginRight: 8 }} />Routes from Your Location</h2>
                <p>Multiple transportation options from {userLocation} to {mapsData.location_name}</p>
              </div>
              
              <div className="routes-grid">
                {userRoutes.map((route, index) => (
                  <div 
                    key={`user-${index}`} 
                    className={`route-card user-route ${selectedRoute === route ? 'selected' : ''}`}
                    onClick={() => handleRouteSelect(route)}
                    style={{ borderLeftColor: getRouteColor(route.mode) }}
                  >
                    <div className="route-header">
                      <div className="route-icon">
                        {getRouteIcon(route.mode)}
                      </div>
                      <div className="route-info">
                        <h3>{route.mode.charAt(0).toUpperCase() + route.mode.slice(1)}</h3>
                        <p className="route-from">From: {route.from}</p>
                      </div>
                    </div>
                    
                    <div className="route-details">
                      <div className="route-meta">
                        <span className="duration"><FaStopwatch style={{ marginRight: 6 }} />{route.duration}</span>
                        <span className="distance"><FaRuler style={{ marginRight: 6 }} />{route.distance}</span>
                      </div>
                      <p className="route-description">{route.description}</p>
                      {route.note && (
                        <p className="route-note" style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
                          {route.note}
                        </p>
                      )}
                    </div>
                    
                    <div className="route-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(route.google_maps_url, '_blank');
                        }}
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userRoutesLoading && (
            <div className="loading-section">
              <div className="loading-spinner">Loading routes from your location...</div>
            </div>
          )}

          {/* Route Options */}
          <div className="routes-section">
            <div className="routes-header">
              <h2><FaRoute style={{ marginRight: 8 }} />Route Options from Landmarks</h2>
              <p>Choose your preferred mode of transportation from major landmarks</p>
            </div>
            
            {mapsData.routes && mapsData.routes.length > 0 ? (
              <div className="routes-grid">
                {mapsData.routes.map((route, index) => (
                  <div 
                    key={index} 
                    className={`route-card ${selectedRoute === route ? 'selected' : ''}`}
                    onClick={() => handleRouteSelect(route)}
                    style={{ borderLeftColor: getRouteColor(route.mode) }}
                  >
                    <div className="route-header">
                      <div className="route-icon">
                        {getRouteIcon(route.mode)}
                      </div>
                      <div className="route-info">
                        <h3>{route.mode.charAt(0).toUpperCase() + route.mode.slice(1)}</h3>
                        <p className="route-from">From: {route.from}</p>
                      </div>
                    </div>
                    
                    <div className="route-details">
                      <div className="route-meta">
                        <span className="duration"><FaStopwatch style={{ marginRight: 6 }} />{route.duration}</span>
                        <span className="distance"><FaRuler style={{ marginRight: 6 }} />{route.distance}</span>
                      </div>
                      <p className="route-description">{route.description}</p>
                    </div>
                    
                    <div className="route-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(route.google_maps_url, '_blank');
                        }}
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-routes">
                <p>No route options available for this location.</p>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="location-details">
            <h2><FaMapMarkerAlt style={{ marginRight: 8 }} />Location Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Event Name:</span>
                <span className="detail-value">{event.event_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{mapsData.location_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {mapsData.coordinates ? 
                    `${mapsData.coordinates.lat.toFixed(6)}, ${mapsData.coordinates.lon.toFixed(6)}` : 
                    'Not available'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Event Date:</span>
                <span className="detail-value">
                  {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="action-buttons">
        <div className="actions-container">
          <Link to={`/event-detail/${eventId}`} className="btn btn-secondary">
            ← Back to Event
          </Link>
          <Link to="/user-dashboard" className="btn btn-outline">
            Dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LocationMapPage;
