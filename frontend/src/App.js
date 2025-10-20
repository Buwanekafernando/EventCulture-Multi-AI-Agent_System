import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import UserHomePage from './components/UserHomePage';
import UserOptionPage from './components/UserOptionPage';
import UserPreferences from './components/UserPreferences';
import UserDashboard from './components/UserDashboard';
import EventDetail from './components/EventDetail';
import LocationMapPage from './components/LocationMapPage';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/user-home" 
              element={
                <ProtectedRoute>
                  <UserHomePage />
                </ProtectedRoute>
              } 
            />
            {/* Removed EventLocation route */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/user-option" element={<UserOptionPage />} />
            <Route 
              path="/user-preferences" 
              element={
                <ProtectedRoute>
                  <UserPreferences />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event-detail/:eventId" 
              element={
                <ProtectedRoute>
                  <EventDetail />
                </ProtectedRoute>
              } 
            />
            {/* Removed EventLocation by id route */}
            <Route 
              path="/location-map/:eventId" 
              element={
                <ProtectedRoute>
                  <LocationMapPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
