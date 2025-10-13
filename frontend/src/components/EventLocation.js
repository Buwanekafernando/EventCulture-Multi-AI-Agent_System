import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { locationAPI, eventsAPI } from '../services/api';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Style, Icon, Text } from 'ol/style';
import '../styles/EventLocation.css';

const EventLocation = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [locationData, setLocationData] = useState(null);
  const [eventsMapData, setEventsMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('single'); // 'single' or 'all'

  useEffect(() => {
    if (eventId) {
      loadSingleEventLocation();
    } else {
      loadAllEventsMap();
    }
  }, [eventId]);

  useEffect(() => {
    if (mapRef.current && (locationData || eventsMapData)) {
      initializeMap();
    }
  }, [locationData, eventsMapData]);

  const loadSingleEventLocation = async () => {
    try {
      setLoading(true);
      const data = await locationAPI.getOpenLayersLocation(eventId);
      setLocationData(data);
      setMapMode('single');
    } catch (error) {
      console.error('Error loading event location:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllEventsMap = async () => {
    try {
      setLoading(true);
      const data = await locationAPI.getEventsMapData();
      setEventsMapData(data);
      setMapMode('all');
    } catch (error) {
      console.error('Error loading events map:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.dispose();
    }

    let center, zoom, features = [];

    if (mapMode === 'single' && locationData) {
      center = fromLonLat([locationData.map_center.lon, locationData.map_center.lat]);
      zoom = locationData.zoom_level;
      
      if (locationData.coordinates && !locationData.is_virtual) {
        const feature = new Feature({
          geometry: new Point(fromLonLat([locationData.coordinates.lon, locationData.coordinates.lat])),
          name: locationData.location_name
        });
        
        feature.setStyle(new Style({
          image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.8
          }),
          text: new Text({
            text: locationData.location_name,
            offsetY: -30,
            font: '12px Arial',
            fill: { color: '#000' },
            stroke: { color: '#fff', width: 2 }
          })
        }));
        
        features.push(feature);
      }
    } else if (mapMode === 'all' && eventsMapData) {
      center = fromLonLat([eventsMapData.map_center.lon, eventsMapData.map_center.lat]);
      zoom = eventsMapData.zoom_level;
      
      eventsMapData.events.forEach((event, index) => {
        if (event.coordinates && !event.is_virtual) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([event.coordinates.lon, event.coordinates.lat])),
            name: event.event_name,
            eventId: event.event_id,
            eventType: event.event_type,
            date: event.date
          });
          
          const eventTypeIcons = {
            music: '🎵',
            tech: '💻',
            art: '🎨',
            sports: '🏃',
            food: '🍽️',
            education: '🎓',
            other: '🎭'
          };
          
          feature.setStyle(new Style({
            image: new Icon({
              src: `data:image/svg+xml;base64,${btoa(`
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r="12" fill="#4285F4" stroke="#fff" stroke-width="2"/>
                  <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">${eventTypeIcons[event.event_type] || '🎭'}</text>
                </svg>
              `)}`,
              scale: 1
            }),
            text: new Text({
              text: event.event_name,
              offsetY: -35,
              font: '10px Arial',
              fill: { color: '#000' },
              stroke: { color: '#fff', width: 2 }
            })
          }));
          
          features.push(feature);
        }
      });
    }

    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: center,
        zoom: zoom
      })
    });

    mapInstanceRef.current = map;

    // Add click handler for event markers
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
        return feature;
      });
      
      if (feature && feature.get('eventId')) {
        window.location.href = `/event-detail/${feature.get('eventId')}`;
      }
    });

    // Change cursor on hover
    map.on('pointermove', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
        return feature;
      });
      
      map.getTarget().style.cursor = feature ? 'pointer' : '';
    });
  };

  const handleMapModeChange = (mode) => {
    setMapMode(mode);
    if (mode === 'single' && eventId) {
      loadSingleEventLocation();
    } else {
      loadAllEventsMap();
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="nav-left">
          <span className="logo">🎭 EventCulture</span>
        </div>
        <nav className="nav-right">
          <Link to={user?.role === 'event' ? '/organizer-dashboard' : '/user-dashboard'}>
            Dashboard
          </Link>
          <Link to="/event-location">Map</Link>
          <Link to="/">Home</Link>
        </nav>
      </header>

      {/* Map Controls */}
      <section className="map-controls">
        <div className="controls-container">
          <h1>📍 Event Locations</h1>
          <div className="map-mode-selector">
            <button 
              className={`mode-btn ${mapMode === 'all' ? 'active' : ''}`}
              onClick={() => handleMapModeChange('all')}
            >
              All Events
            </button>
            {eventId && (
              <button 
                className={`mode-btn ${mapMode === 'single' ? 'active' : ''}`}
                onClick={() => handleMapModeChange('single')}
              >
                This Event
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Map Container */}
      <section className="map-section">
        <div className="map-container">
          <div ref={mapRef} className="map" style={{ width: '100%', height: '600px' }}></div>
        </div>
        
        {/* Map Info */}
        <div className="map-info">
          {mapMode === 'single' && locationData && (
            <div className="location-info">
              <h3>📍 {locationData.location_name}</h3>
              {locationData.is_virtual ? (
                <p className="virtual-event">🌐 This is a virtual event</p>
              ) : (
                <div>
                  <p>📍 Physical Location</p>
                  {locationData.coordinates && (
                    <p>Coordinates: {locationData.coordinates.lat.toFixed(4)}, {locationData.coordinates.lon.toFixed(4)}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {mapMode === 'all' && eventsMapData && (
            <div className="events-summary">
              <h3>🗺️ Events Map Summary</h3>
              <p>Showing {eventsMapData.events.length} events</p>
              <div className="legend">
                <h4>Legend:</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-icon">🎵</span>
                    <span>Music</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">💻</span>
                    <span>Technology</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">🎨</span>
                    <span>Art</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">🏃</span>
                    <span>Sports</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">🍽️</span>
                    <span>Food</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon">🎓</span>
                    <span>Education</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map Instructions */}
      <section className="map-instructions">
        <div className="instructions-container">
          <h3>🗺️ Map Instructions</h3>
          <ul>
            <li>Click on event markers to view event details</li>
            <li>Use mouse wheel to zoom in/out</li>
            <li>Drag to pan around the map</li>
            <li>Switch between "All Events" and "This Event" views</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default EventLocation;
