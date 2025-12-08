import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      // Use functional update to always get latest state
      setIsAuthenticated(prev => {
        const nowAuthenticated = !!token;
        if (prev !== nowAuthenticated) {
          console.log('Auth state changed:', nowAuthenticated ? 'authenticated' : 'not authenticated');
        }
        return nowAuthenticated;
      });
    };

    // Initial check
    checkAuth();
    
    // Listen for storage changes (when auth token is set/removed from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' || !e.key) {
        // Small delay to ensure localStorage is updated
        setTimeout(checkAuth, 50);
      }
    };

    // Listen for custom auth events (from same tab)
    const handleAuthChange = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(checkAuth, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange);
    
    // Also check periodically in case token is removed in same tab
    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
      clearInterval(interval);
    };
  }, []); // Empty deps - event listeners handle updates

  const handleSignOut = async () => {
    try {
      await authAPI.signout();
      setIsAuthenticated(false);
      setUserEmail('');
      // Trigger event to update other components
      window.dispatchEvent(new Event('auth-changed'));
      // Redirect to home after sign out
      if (location.pathname === '/storage' || location.pathname.startsWith('/creations')) {
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API call fails, clear local state
      setIsAuthenticated(false);
      setUserEmail('');
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('auth-changed'));
    }
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}
          >
            <circle cx="16" cy="16" r="14" stroke="var(--deep-sand)" strokeWidth="2" fill="none"/>
            <path d="M10 16 L14 20 L22 12" stroke="var(--soft-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Think Alchemist</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/forge" 
            className={location.pathname.startsWith('/forge') ? 'active' : ''}
          >
            Forge
          </Link>
          
          <Link 
            to="/storage" 
            className={location.pathname === '/storage' ? 'active' : ''}
          >
            Storage
          </Link>

          {isAuthenticated ? (
            <div className="nav-auth-section">
              <span className="nav-user-info">
                <FaUser className="nav-user-icon" />
                <span className="nav-user-text">Signed In</span>
              </span>
              <button 
                onClick={handleSignOut}
                className="nav-signout-btn"
                title="Sign Out"
              >
                <FaSignOutAlt />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/signin" 
              className={`nav-signin-button ${location.pathname === '/signin' || location.pathname === '/signup' ? 'active' : ''}`}
            >
              <FaUser className="nav-signin-icon" />
              <span className="nav-signin-text">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

