import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check authentication status and fetch user info
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const nowAuthenticated = !!token;
      
      // Use functional update to always get latest state
      setIsAuthenticated(prev => {
        if (prev !== nowAuthenticated) {
          console.log('Auth state changed:', nowAuthenticated ? 'authenticated' : 'not authenticated');
        }
        return nowAuthenticated;
      });

      // If authenticated, fetch user info
      if (nowAuthenticated && token) {
        try {
          const userData = await authAPI.getCurrentUser();
          if (userData?.user) {
            const user = userData.user;
            setUserEmail(user.email || '');
            // Get ONLY username from user_metadata.username (no fallback to email or name)
            if (user.user_metadata?.username) {
              setUsername(user.user_metadata.username);
            } else {
              setUsername(null);
            }
          }
        } catch (error) {
          // If token is invalid, clear auth state immediately and stop retrying
          if (error.response?.status === 401 || error.message?.includes('Invalid token') || error.message?.includes('Unauthorized')) {
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
            setUsername(null);
            setUserEmail('');
            return; // Exit early to prevent further processing
          }
          console.error('Failed to fetch user info:', error);
        }
      } else {
        // Clear user info when not authenticated
        setUsername(null);
        setUserEmail('');
      }
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
    // Only check if there's a token to avoid unnecessary API calls
    // Increased interval to reduce API calls - only check every 30 seconds
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('auth_token');
      if (currentToken) {
        checkAuth();
      }
    }, 30000); // 30 seconds - much less frequent

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
      setUsername('');
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
      setUsername('');
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
              {username && (
                <div className="nav-user-info">
                  <FaUser className="nav-user-icon" />
                  <div className="nav-user-details">
                    <span className="nav-username" title={userEmail}>
                      {username}
                    </span>
                  </div>
                </div>
              )}
              <button 
                onClick={handleSignOut}
                className="nav-signout-btn"
                title="Sign Out"
              >
                <FaSignOutAlt className="nav-signout-icon" />
                <span className="nav-signout-text">Sign Out</span>
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

