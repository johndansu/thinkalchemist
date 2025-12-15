import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { FaEye, FaUsers, FaQuoteLeft, FaLightbulb, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

function PerspectiveShiftPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState(null);

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'perspective_shift');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to shift perspectives. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'perspective_shift');
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

  const perspectiveShift = output?.results?.perspectiveShift;
  const perspectives = perspectiveShift?.perspectives || [];

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="perspective-shift-interface">
        <div className="perspective-input-container">
          <div className="perspective-input-header">
            <div className="input-header-icon">
              <FaEye />
            </div>
            <div>
              <h1>Perspective Shift</h1>
              <p>Examine your concept through multiple distinct lenses and viewpoints</p>
            </div>
          </div>

          <div className="perspective-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Concept
              </label>
              <textarea
                className="perspective-textarea"
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
                placeholder="Enter your concept, idea, or topic to examine from multiple perspectives..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="shift-perspectives-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Shifting Perspectives...' : (
                    <>
                      <FaPaperPlane /> Shift Perspectives
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && perspectiveShift && (
          <div className="perspective-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Perspective Analysis</h2>
                <span className="status-badge">{perspectives.length} Perspectives</span>
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

            {perspectiveShift.core_concept && (
              <div className="core-concept-card">
                <h3>Core Concept</h3>
                <p>{perspectiveShift.core_concept}</p>
              </div>
            )}

            <div className="perspectives-grid">
              {perspectives.map((perspective, idx) => (
                <div
                  key={idx}
                  className={`perspective-card ${selectedPerspective === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedPerspective(selectedPerspective === idx ? null : idx)}
                >
                  <div className="perspective-header">
                    <FaUsers className="perspective-icon" />
                    <h3>{perspective.name}</h3>
                  </div>
                  <div className="perspective-lens">
                    <p><strong>Lens:</strong> {perspective.lens}</p>
                  </div>
                  <div className="perspective-quote">
                    <FaQuoteLeft className="quote-icon" />
                    <p>"{perspective.quote}"</p>
                  </div>
                  {selectedPerspective === idx && (
                    <div className="perspective-details">
                      <div className="perspective-interpretation">
                        <h4>Interpretation</h4>
                        <p>{perspective.interpretation}</p>
                      </div>
                      <div className="perspective-concerns">
                        <h4>Key Concerns</h4>
                        <ul>
                          {perspective.key_concerns?.map((concern, cIdx) => (
                            <li key={cIdx}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="perspective-opportunities">
                        <h4>Opportunities</h4>
                        <ul>
                          {perspective.opportunities?.map((opp, oIdx) => (
                            <li key={oIdx}>{opp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {perspectiveShift.synthesis && (
              <div className="synthesis-card">
                <h3>
                  <FaLightbulb className="card-icon" />
                  Synthesis
                </h3>
                <p>{perspectiveShift.synthesis}</p>
              </div>
            )}

            {perspectiveShift.common_threads && perspectiveShift.common_threads.length > 0 && (
              <div className="threads-card">
                <h3>Common Threads</h3>
                <ul>
                  {perspectiveShift.common_threads.map((thread, idx) => (
                    <li key={idx}>{thread}</li>
                  ))}
                </ul>
              </div>
            )}

            {perspectiveShift.tension_points && perspectiveShift.tension_points.length > 0 && (
              <div className="tensions-card">
                <h3>
                  <FaExclamationTriangle className="card-icon" />
                  Tension Points
                </h3>
                <ul>
                  {perspectiveShift.tension_points.map((tension, idx) => (
                    <li key={idx}>{tension}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="perspective-loading">
            <div className="loading-spinner"></div>
            <p>Examining from multiple perspectives...</p>
          </div>
        )}
      </div>
    </>
  );
}

export default PerspectiveShiftPage;

