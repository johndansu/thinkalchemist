import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaLightbulb, FaRandom, FaQuestionCircle, FaFlask, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft, FaMagic } from 'react-icons/fa';

function ThoughtCatalystPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('insights');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'thought_catalyst');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to catalyze thoughts. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'thought_catalyst');
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

  const catalyst = output?.results?.thoughtCatalyst;
  const loadingMessage = useForgeLoading(loading);

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="thought-catalyst-interface">
        <div className="catalyst-input-container">
          <div className="catalyst-input-header">
            <div className="input-header-icon">
              <FaFlask />
            </div>
            <div>
              <h1>Thought Catalyst</h1>
              <p>Spark unexpected insights, connections, and creative ways of thinking</p>
            </div>
          </div>

          <div className="catalyst-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Thought
              </label>
              <textarea
                className="catalyst-textarea"
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
                placeholder="Enter any thought, idea, or concept to catalyze into unexpected insights..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="catalyze-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Catalyzing...' : (
                    <>
                      <FaMagic /> Catalyze Thoughts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && catalyst && (
          <div className="catalyst-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Catalyzed Thoughts</h2>
                <span className="status-badge">Sparks Generated</span>
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

            {catalyst.core_input && (
              <div className="core-input-card">
                <h3>Input</h3>
                <p>{catalyst.core_input}</p>
              </div>
            )}

            <div className="catalyst-sections-tabs">
              <button
                className={`catalyst-tab ${activeSection === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveSection('insights')}
              >
                <FaLightbulb /> Random Insights ({catalyst.random_insights?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'connections' ? 'active' : ''}`}
                onClick={() => setActiveSection('connections')}
              >
                <FaRandom /> Connections ({catalyst.unexpected_connections?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'angles' ? 'active' : ''}`}
                onClick={() => setActiveSection('angles')}
              >
                <FaFlask /> Alternative Angles ({catalyst.alternative_angles?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'experiments' ? 'active' : ''}`}
                onClick={() => setActiveSection('experiments')}
              >
                <FaQuestionCircle /> Thought Experiments ({catalyst.thought_experiments?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveSection('questions')}
              >
                <FaQuestionCircle /> Creative Questions ({catalyst.creative_questions?.length || 0})
              </button>
            </div>

            <div className="catalyst-content-panel">
              {activeSection === 'insights' && catalyst.random_insights && (
                <div className="insights-section">
                  <div className="insights-grid">
                    {catalyst.random_insights.map((insight, idx) => (
                      <div key={idx} className="insight-card">
                        <FaLightbulb className="insight-icon" />
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'connections' && catalyst.unexpected_connections && (
                <div className="connections-section">
                  <div className="connections-grid">
                    {catalyst.unexpected_connections.map((connection, idx) => (
                      <div key={idx} className="connection-card">
                        <FaRandom className="connection-icon" />
                        <p>{connection}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'angles' && catalyst.alternative_angles && (
                <div className="angles-section">
                  <div className="angles-grid">
                    {catalyst.alternative_angles.map((angle, idx) => (
                      <div key={idx} className="angle-card">
                        <FaFlask className="angle-icon" />
                        <p>{angle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'experiments' && catalyst.thought_experiments && (
                <div className="experiments-section">
                  <div className="experiments-grid">
                    {catalyst.thought_experiments.map((experiment, idx) => (
                      <div key={idx} className="experiment-card">
                        <FaQuestionCircle className="experiment-icon" />
                        <p>{experiment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'questions' && catalyst.creative_questions && (
                <div className="questions-section">
                  <div className="questions-grid">
                    {catalyst.creative_questions.map((question, idx) => (
                      <div key={idx} className="question-card">
                        <FaQuestionCircle className="question-icon" />
                        <p>{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {catalyst.synthesis && (
              <div className="synthesis-card">
                <h3>
                  <FaMagic className="card-icon" />
                  Synthesis
                </h3>
                <p>{catalyst.synthesis}</p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="catalyst-loading">
            <div className="loading-spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ThoughtCatalystPage;

