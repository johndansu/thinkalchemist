import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authAPI.signup(email, password, name);
      } else {
        await authAPI.signin(email, password);
      }
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      navigate('/');
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-container">
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        <p className="auth-subtitle">
          {isSignUp 
            ? 'Create an account to save your forges' 
            : 'Sign in to access your saved forges'}
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              Password
              {isSignUp && <span className="password-hint"> (minimum 6 characters)</span>}
            </label>
            <input
              id="password"
              type="password"
              placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 6 : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {isSignUp && (
            <div className="form-info">
              <p>By signing up, you agree to save and manage your forges securely.</p>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setName('');
              setEmail('');
              setPassword('');
              setError('');
            }}
            className="link-button"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        <div className="auth-footer">
          <button onClick={() => navigate('/')} className="link-button">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

