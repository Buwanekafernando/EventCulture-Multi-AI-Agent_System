import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Auth API calls
export const authAPI = {
  login: () => {
    window.location.href = `${API_BASE_URL}/login`;
  },
  
  logout: async () => {
    try {
      await api.get('/logout');
      // Don't redirect here - let the AuthContext handle it
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we should still clear local state
    }
  },
  
  getUser: async () => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await api.get(`/user?t=${timestamp}`);
    return response.data;
  },
  
  setUserRole: async (role) => {
    const response = await api.post('/user/role', { role });
    return response.data;
  },
  
  selectTier: async (tier) => {
    const response = await api.post('/select-tier', { tier });
    return response.data;
  },
  
  upgradeToPro: async () => {
    const response = await api.post('/user/upgrade');
    return response.data;
  },
  
  triggerAgents: async () => {
    const response = await api.post('/trigger-agents');
    return response.data;
  },
  
  triggerEventCollection: async () => {
    const response = await api.post('/trigger-event-collection');
    return response.data;
  },
  
  triggerNLPProcessing: async () => {
    const response = await api.post('/trigger-nlp-processing');
    return response.data;
  }
};

// Events API calls
export const eventsAPI = {
  getEvents: async () => {
    try {
      const response = await api.get('/api/collector/events/');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Fallback to public endpoint if not authenticated
        const response = await api.get('/api/collector/events/public/');
        return response.data;
      }
      throw error;
    }
  },
  
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/api/collector/events/${eventId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Fallback to public endpoint if not authenticated
        const response = await api.get(`/api/collector/events/${eventId}/public`);
        return response.data;
      }
      throw error;
    }
  },
  
  collectEvents: async () => {
    const response = await api.post('/api/collector/collect-events/');
    return response.data;
  },
  
  trackView: async (eventId) => {
    const response = await api.post(`/api/collector/events/${eventId}/view`);
    return response.data;
  },
  
  trackClick: async (eventId) => {
    const response = await api.post(`/api/collector/events/${eventId}/click`);
    return response.data;
  },
  
  getBookingInfo: async (eventId) => {
    const response = await api.get(`/api/collector/events/${eventId}/booking`);
    return response.data;
  },
  
  bookEvent: async (eventId) => {
    const response = await api.post(`/api/collector/events/${eventId}/book`);
    return response.data;
  }
};

// Location API calls
export const locationAPI = {
  getLocation: async (eventId) => {
    const response = await api.get(`/api/location/locate-event/${eventId}`);
    return response.data;
  },
  
  getOpenLayersLocation: async (eventId) => {
    const response = await api.get(`/api/location/openlayers-location/${eventId}`);
    return response.data;
  },
  
  getEventsMapData: async () => {
    const response = await api.get('/api/location/events-map');
    return response.data;
  }
};

// Recommendations API calls
export const recommendationsAPI = {
  discoverEvents: async (userProfile) => {
    const response = await api.post('/api/recommend/discover-events', userProfile);
    return response.data;
  },
  
  getPersonalizedRecommendations: async (userProfile) => {
    const response = await api.post('/api/recommend/personalized-recommendations', userProfile);
    return response.data;
  },
  
  getTrendingEvents: async () => {
    try {
      const response = await api.get('/api/recommend/trending-events');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Fallback to public endpoint if not authenticated
        const response = await api.get('/api/recommend/trending-events/public');
        return response.data;
      }
      throw error;
    }
  },
  
  getPastRecommendations: async (userId) => {
    const response = await api.get(`/api/recommend/recommendations/${userId}`);
    return response.data;
  },
  
  getUserPreferences: async (userId) => {
    const response = await api.get(`/api/recommend/user-preferences/${userId}`);
    return response.data;
  },
  
  updateUserPreferences: async (userId, preferences) => {
    const response = await api.put(`/api/recommend/user-preferences/${userId}`, { preferences });
    return response.data;
  },
  
  getUserPersonalizedRecommendations: async (userId) => {
    const response = await api.get(`/api/recommend/personalized-recommendations/${userId}`);
    return response.data;
  }
};

// Analytics API calls
export const analyticsAPI = {
  trackInteraction: async (eventId, interactionType) => {
    const response = await api.post('/api/analytics/track-interaction', {
      event_id: eventId,
      interaction_type: interactionType
    });
    return response.data;
  },
  
  getEventAnalytics: async (eventId) => {
    const response = await api.get(`/api/analytics/event-analytics/${eventId}`);
    return response.data;
  },
  
  getOrganizerDashboard: async () => {
    const response = await api.get('/api/analytics/organizer-dashboard');
    return response.data;
  },
  
  getUserEngagement: async (userId) => {
    const response = await api.get(`/api/analytics/user-engagement/${userId}`);
    return response.data;
  },
  
  getAnalyticsSummary: async () => {
    const response = await api.get('/api/analytics/analytics-summary');
    return response.data;
  }
};

// NLP API calls
export const nlpAPI = {
  enhanceEvent: async (eventId) => {
    const response = await api.post('/api/nlp/nlp/enhance', { event_id: eventId });
    return response.data;
  },
  
  batchEnhanceEvents: async () => {
    const response = await api.post('/api/nlp/batch-enhance');
    return response.data;
  }
};

export default api;
