import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaFlask, FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      const response = await authAPI.signup(email, password, name);
      
      // Check if we have a session token (signup might require email confirmation)
      if (response.session?.access_token) {
        window.dispatchEvent(new Event('auth-changed'));
        
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-changed'));
          navigate('/');
        }, 150);
      } else {
        // Signup successful but email confirmation required
        setError('Account created! Please check your email to confirm your account before signing in.');
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
        return;
      }
      
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.error || 'Sign up failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <h1 className="auth-panel-title">Join Think Alchemist</h1>
            <p className="auth-panel-subtitle">
              Create your account and start transforming your thoughts into structured knowledge
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
              <span>Secure and private storage</span>
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
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">
              Start your journey with Think Alchemist
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-redesigned">
            <div className="auth-input-group">
              <label htmlFor="name" className="auth-input-label">
                <FaUser className="auth-input-icon" />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="auth-input-field"
              />
            </div>
            
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
                <span className="auth-password-hint"> (min. 6 characters)</span>
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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
              <div className={`auth-error-message ${error.includes('Account created') ? 'auth-success-message' : ''}`}>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="auth-switch-mode">
            <span className="auth-switch-text">
              Already have an account?
            </span>
            <Link 
              to="/signin"
              className="auth-switch-button"
            >
              Sign In
            </Link>
          </div>

          {/* Footer Info */}
          <div className="auth-footer-info">
            <p>
              By creating an account, you agree to our terms of service and privacy policy.
              Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;

