import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { FaLightbulb, FaPuzzlePiece, FaRocket, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function ConceptBreakdownPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'concept_breakdown');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to breakdown concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!output) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      const shouldSignIn = window.confirm('You need to sign in to save your work. Would you like to sign in now?');
      if (shouldSignIn) {
        navigate('/auth');
      }
      return;
    }

    try {
      const title = inputText.substring(0, 50) + (inputText.length > 50 ? '...' : '');
      await savedAPI.save(title, inputText, output, 'concept_breakdown');
      alert('✅ Saved to your library!');
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save';
      
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
        alert('❌ Your session has expired. Please sign in again.');
        localStorage.removeItem('auth_token');
        navigate('/auth');
      } else if (errorMessage.includes('Database not configured')) {
        alert('❌ Storage is not configured. Please contact support.');
      } else {
        alert(`❌ Failed to save: ${errorMessage}`);
      }
    }
  };

  const breakdown = output?.results?.conceptBreakdown;

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="idea-synthesis-interface">
        <div className="synthesis-input-container">
          <div className="synthesis-input-header">
            <div className="input-header-icon">
              <FaLightbulb />
            </div>
            <div>
              <h1>Concept Breakdown</h1>
              <p>Break down your concept into structured components and actionable insights</p>
            </div>
          </div>

          <div className="synthesis-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Idea
              </label>
              <textarea
                className="synthesis-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim() && !loading) {
                      handleForge();
                    }
                  }
                }}
                placeholder="Enter your concept, product idea, or feature request here..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="synthesize-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Breaking Down...' : (
                    <>
                      <FaPaperPlane /> Break Down Concept
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && breakdown && (
          <div className="synthesis-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Concept Breakdown</h2>
                <span className="status-badge">Broken Down</span>
              </div>
              <div className="canvas-actions-bar">
                <button onClick={handleSave} className="canvas-action save-action">
                  <FaSave /> Save
                </button>
                <button className="canvas-action export-action">
                  <FaDownload /> Export
                </button>
              </div>
            </div>

            <div className="synthesis-sections-tabs">
              <button
                className={`synthesis-tab ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                <FaLightbulb /> Overview
              </button>
              <button
                className={`synthesis-tab ${activeSection === 'components' ? 'active' : ''}`}
                onClick={() => setActiveSection('components')}
              >
                <FaPuzzlePiece /> Components ({breakdown?.key_components?.length || 0})
              </button>
              <button
                className={`synthesis-tab ${activeSection === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveSection('applications')}
              >
                <FaRocket /> Applications ({breakdown?.potential_applications?.length || 0})
              </button>
              <button
                className={`synthesis-tab ${activeSection === 'variations' ? 'active' : ''}`}
                onClick={() => setActiveSection('variations')}
              >
                <FaArrowRight /> Variations ({breakdown?.refined_variations?.length || 0})
              </button>
            </div>

            <div className="synthesis-content-panel">
              {activeSection === 'overview' && breakdown && (
                <div className="overview-section">
                  <div className="essence-card">
                    <h3>Core Essence</h3>
                    <p>{breakdown.core_essence}</p>
                  </div>

                  <div className="insights-card">
                    <h3>Breakdown Insights</h3>
                    <p>{breakdown.synthesis_insights}</p>
                  </div>

                  <div className="strengths-challenges-grid">
                    <div className="strengths-card">
                      <h3>
                        <FaCheckCircle className="card-icon" />
                        Strengths
                      </h3>
                      <ul>
                        {breakdown.strengths?.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="challenges-card">
                      <h3>
                        <FaExclamationTriangle className="card-icon" />
                        Challenges
                      </h3>
                      <ul>
                        {breakdown.challenges?.map((challenge, idx) => (
                          <li key={idx}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {breakdown.next_steps && breakdown.next_steps.length > 0 && (
                    <div className="next-steps-card">
                      <h3>Next Steps</h3>
                      <ol>
                        {breakdown.next_steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'components' && breakdown?.key_components && (
                <div className="components-section">
                  <div className="components-grid">
                    {breakdown.key_components.map((component, idx) => (
                      <div key={idx} className={`component-card ${component.importance}`}>
                        <div className="component-header">
                          <h3>{component.name}</h3>
                          <span className={`importance-badge ${component.importance}`}>
                            {component.importance}
                          </span>
                        </div>
                        <p>{component.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'applications' && breakdown?.potential_applications && (
                <div className="applications-section">
                  <div className="applications-grid">
                    {breakdown.potential_applications.map((app, idx) => (
                      <div key={idx} className={`application-card ${app.feasibility}`}>
                        <div className="application-header">
                          <h3>{app.title}</h3>
                          <span className={`feasibility-badge ${app.feasibility}`}>
                            {app.feasibility} feasibility
                          </span>
                        </div>
                        <p>{app.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'variations' && breakdown?.refined_variations && (
                <div className="variations-section">
                  <div className="variations-grid">
                    {breakdown.refined_variations.map((variation, idx) => (
                      <div key={idx} className={`variation-card ${variation.potential}`}>
                        <div className="variation-header">
                          <h3>{variation.title}</h3>
                          <span className={`potential-badge ${variation.potential}`}>
                            {variation.potential} potential
                          </span>
                        </div>
                        <p>{variation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="synthesis-loading">
            <div className="loading-spinner"></div>
            <p>Breaking down your concept...</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ConceptBreakdownPage;

