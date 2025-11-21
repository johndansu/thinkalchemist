import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import MyCreationsPage from './pages/MyCreationsPage';
import ProcessesPage from './pages/ProcessesPage';
import StoragePage from './pages/StoragePage';
import PersonasPage from './pages/PersonasPage';
import TimelinePage from './pages/TimelinePage';
import PurificationPage from './pages/PurificationPage';
import StressTestPage from './pages/StressTestPage';
import WorldBuildingPage from './pages/WorldBuildingPage';
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
            element={<ProcessesPage />} 
          />
          <Route 
            path="/forge/personas" 
            element={<PersonasPage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/forge/timeline" 
            element={<TimelinePage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/forge/purification" 
            element={<PurificationPage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/forge/stress-test" 
            element={<StressTestPage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/forge/world-building" 
            element={<WorldBuildingPage isAuthenticated={isAuthenticated} />} 
          />
          <Route 
            path="/creations" 
            element={<MyCreationsPage />} 
          />
          <Route 
            path="/storage" 
            element={<StoragePage />} 
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
