import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaFlask, FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Check if error is about email confirmation
  const needsEmailConfirmation = error && (
    error.toLowerCase().includes('email') && 
    (error.toLowerCase().includes('confirm') || error.toLowerCase().includes('verify') || error.toLowerCase().includes('not confirmed'))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess(false);
    setLoading(true);

    try {
      const response = await authAPI.signin(email, password);
      
      if (response.session?.access_token) {
        // Token is already set by the API function
        window.dispatchEvent(new Event('auth-changed'));
        
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-changed'));
          navigate('/');
        }, 150);
      } else {
        window.dispatchEvent(new Event('auth-changed'));
        navigate('/');
      }
      
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.error || 'Sign in failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      await authAPI.resendConfirmation(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.error || 'Failed to resend confirmation email';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
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
            <h1 className="auth-panel-title">Welcome Back</h1>
            <p className="auth-panel-subtitle">
              Sign in to access your saved transformations and continue your alchemical journey
            </p>
          </div>
          <div className="auth-panel-features">
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Access your saved forges</span>
            </div>
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Continue where you left off</span>
            </div>
            <div className="auth-feature-item">
              <FaCheckCircle className="auth-feature-icon" />
              <span>Sync across all devices</span>
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
            <h2 className="auth-form-title">Sign In</h2>
            <p className="auth-form-subtitle">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-redesigned">
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
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
                {needsEmailConfirmation && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading || resendSuccess}
                    className="auth-resend-button"
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      background: 'var(--burnt-umber)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: resendLoading || resendSuccess ? 'not-allowed' : 'pointer',
                      opacity: resendLoading || resendSuccess ? 0.7 : 1,
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    {resendLoading ? 'Sending...' : resendSuccess ? '✓ Email sent!' : 'Resend Confirmation Email'}
                  </button>
                )}
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
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="auth-switch-mode">
            <span className="auth-switch-text">
              Don't have an account?
            </span>
            <Link 
              to="/signup"
              className="auth-switch-button"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;

