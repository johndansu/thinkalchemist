import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaFlask, FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isSignUp) {
        response = await authAPI.signup(email, password, username);
      } else {
        response = await authAPI.signin(email, password);
      }
      
      // Check if we have a session token (signup might require email confirmation)
      if (response.session?.access_token) {
        // Token is already set by the API function
        // Trigger event multiple times to ensure navigation catches it
        window.dispatchEvent(new Event('auth-changed'));
        
        // Small delay to ensure navigation updates before navigating
        setTimeout(() => {
          // Trigger again just before navigation
          window.dispatchEvent(new Event('auth-changed'));
          if (onAuthSuccess) {
            onAuthSuccess();
          }
          navigate('/');
        }, 150);
      } else if (isSignUp) {
        // Signup successful but email confirmation required
        setError('Account created! Please check your email to confirm your account before signing in.');
        setIsSignUp(false); // Switch to sign in mode
        setEmail('');
        setPassword('');
        setUsername('');
        return;
      } else {
        // Sign in should always have a token, but just in case
        window.dispatchEvent(new Event('auth-changed'));
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        navigate('/');
      }
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.error || 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="auth-page-redesigned">
      {/* Decorative Side Panel */}
      <div className="auth-panel-decorative">
        <div className="auth-panel-content">
          <div className="auth-panel-logo">
            <div className="auth-logo-icon">
              <FaFlask />
            </div>
            <h1 className="auth-panel-title">Think Alchemist</h1>
            <p className="auth-panel-subtitle">
              Transform your thoughts into structured knowledge
            </p>
          </div>
          <div className="auth-panel-features">
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Save your transformations</span>
            </div>
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Access your library anywhere</span>
            </div>
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Secure and private</span>
            </div>
          </div>
        </div>
        <div className="auth-panel-pattern"></div>
      </div>

      {/* Main Auth Form */}
      <div className="auth-panel-form">
        <div className="auth-form-wrapper">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')} 
            className="auth-back-button"
            aria-label="Back to home"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="auth-form-subtitle">
              {isSignUp 
                ? 'Start saving and organizing your transformations' 
                : 'Sign in to access your saved forges'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-redesigned">
            {isSignUp && (
              <div className="auth-input-group">
                <label htmlFor="username" className="auth-input-label">
                  <FaUser className="auth-input-icon" />
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="auth-input-field"
                />
              </div>
            )}
            
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-input-label">
                <FaEnvelope className="auth-input-icon" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="auth-input-field"
              />
            </div>
            
            <div className="auth-input-group">
              <label htmlFor="password" className="auth-input-label">
                <FaLock className="auth-input-icon" />
                Password
                {isSignUp && <span className="auth-password-hint"> (min. 6 characters)</span>}
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignUp ? 6 : undefined}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="auth-input-field"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error-message">
                <FaExclamationCircle className="auth-error-icon" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-loading-spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="auth-switch-mode">
            <span className="auth-switch-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
              type="button"
              onClick={switchMode}
              className="auth-switch-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Footer Info */}
          {isSignUp && (
            <div className="auth-footer-info">
              <p>
                By creating an account, you agree to our terms of service and privacy policy.
                Your data is encrypted and secure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

