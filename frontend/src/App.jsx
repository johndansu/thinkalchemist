import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import MyCreationsPage from './pages/MyCreationsPage';
import AuthPage from './pages/AuthPage';
import './styles/main.css';

function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('auth_token')
  );

  useEffect(() => {
    // Check auth status on route change
    setIsAuthenticated(!!localStorage.getItem('auth_token'));
  }, [location]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      <Navigation 
        isAuthenticated={isAuthenticated} 
        onSignOut={handleSignOut}
      />
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
          <Route 
            path="/forge" 
            element={<HomePage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/creations" 
            element={<MyCreationsPage />} 
          />
          <Route 
            path="/auth" 
            element={<AuthPage onAuthSuccess={handleAuthSuccess} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
