import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLightbulb, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaSearch, 
  FaUsers, 
  FaGlobe,
  FaSave 
} from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '1rem', verticalAlign: 'middle' }}
            >
              <circle cx="16" cy="16" r="14" stroke="var(--deep-sand)" strokeWidth="2" fill="none"/>
              <path d="M10 16 L14 20 L22 12" stroke="var(--soft-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Think Alchemist
          </h1>
          <p className="hero-tagline">Turn raw thoughts into refined clarity.</p>
          <p className="hero-description">
            Transform your ideas, stories, and messy thoughts into structured knowledge. 
            One input. One button. Infinite possibilities.
          </p>
          <div className="hero-actions">
            <Link to="/forge" className="primary-button large">
              Start Forging
            </Link>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="features-container">
          <h2 className="features-title">What Can You Forge?</h2>
          <div className="features-grid">
            <Link to="/forge/strategic-analysis" className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Strategic Analysis</h3>
              <p>Comprehensive strategic analysis combining concept breakdown with best/worst case scenarios, risks, and improvements.</p>
            </Link>
            
            <Link to="/forge/thought-catalyst" className="feature-card">
              <div className="feature-icon">
                <FaFlask />
              </div>
              <h3>Thought Catalyst</h3>
              <p>Spark unexpected insights, random connections, and creative ways of thinking about any concept or idea.</p>
            </Link>
            
            <Link to="/forge/timeline" className="feature-card">
              <div className="feature-icon">
                <FaCalendarAlt />
              </div>
              <h3>Timeline Alchemy</h3>
              <p>Extract and structure events into beautiful chronological timelines with impact analysis.</p>
            </Link>
            
            <Link to="/forge/purification" className="feature-card">
              <div className="feature-icon">
                <FaFileAlt />
              </div>
              <h3>Document Purification</h3>
              <p>Clean and refine messy text with better grammar, clarity, and structure while maintaining a human tone.</p>
            </Link>
            
            <Link to="/forge/creative-personas" className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Creative Personas & Worlds</h3>
              <p>Transform concepts into immersive user personas and rich creative worlds with characters, settings, and stories.</p>
            </Link>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaSave />
              </div>
              <h3>Save & Reuse</h3>
              <p>Save your transformations and revisit them anytime. Re-forge with new insights.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Thoughts?</h2>
          <p>Join Think Alchemist and turn your raw ideas into refined clarity.</p>
          <Link to="/forge" className="primary-button large">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

