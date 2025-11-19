import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Navigation({ isAuthenticated, onSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authAPI.signout();
      if (onSignOut) {
        onSignOut();
      }
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
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
            className={location.pathname === '/forge' ? 'active' : ''}
          >
            Forge
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/creations" 
                className={location.pathname === '/creations' ? 'active' : ''}
              >
                My Creations
              </Link>
              <button onClick={handleSignOut} className="nav-button">
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className={location.pathname === '/auth' ? 'active' : ''}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

