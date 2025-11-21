import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  return (
    <div className="app">
      <Navigation />
      
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
            element={<PersonasPage />} 
          />
          <Route 
            path="/forge/timeline" 
            element={<TimelinePage />} 
          />
          <Route 
            path="/forge/purification" 
            element={<PurificationPage />} 
          />
          <Route 
            path="/forge/stress-test" 
            element={<StressTestPage />} 
          />
          <Route 
            path="/forge/world-building" 
            element={<WorldBuildingPage />} 
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
            element={<AuthPage />} 
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
