import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import UserOptionPage from './components/UserOptionPage';
import UserPreferences from './components/UserPreferences';
import UserDashboard from './components/UserDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import EventDetailEnhanced from './components/EventDetailEnhanced';
import EventLocation from './components/EventLocation';
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
            <Route path="/login" element={<LoginPage />} />
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
              path="/organizer-dashboard" 
              element={
                <ProtectedRoute requiredRole="event">
                  <OrganizerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event-detail/:eventId" 
              element={
                <ProtectedRoute>
                  <EventDetailEnhanced />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event-location/:eventId" 
              element={
                <ProtectedRoute>
                  <EventLocation />
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
