import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaSearch, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaRocket, FaChartLine, FaPuzzlePiece, FaSave, FaDownload, FaLightbulb, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function StrategicAnalysisPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'strategic_analysis');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to analyze strategically. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'strategic_analysis');
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

  const analysis = output?.results?.strategicAnalysis;
  const risks = analysis?.hidden_risks || [];
  const loadingMessage = useForgeLoading(loading);

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="business-analysis-interface">
        <div className="analysis-form-container">
          <div className="analysis-form-header">
            <div className="form-header-icon">
              <FaChartLine />
            </div>
            <div>
              <h1>Strategic Analysis</h1>
              <p>Comprehensive strategic analysis with breakdown and stress testing</p>
            </div>
          </div>

          <div className="analysis-form-body">
            <div className="form-field">
              <label className="form-label">
                <FaFileAlt className="label-icon" />
                Your Concept
              </label>
              <textarea
                className="analysis-textarea"
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
                placeholder="Enter your business idea, product concept, or strategic initiative here..."
                rows={8}
              />
              <div className="form-actions">
                <button
                  className="submit-analysis-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Analyzing...' : (
                    <>
                      <FaPaperPlane /> Analyze Strategically
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && analysis && (
          <div className="strategic-analysis-results">
            <div className="analysis-header-bar">
              <div className="analysis-title">
                <h2>Strategic Analysis</h2>
                <span className="analysis-status-badge">Complete</span>
              </div>
              <div className="analysis-actions-bar">
                <button onClick={handleSave} className="analysis-action save-action">
                  <FaSave /> Save
                </button>
                <button className="analysis-action export-action">
                  <FaDownload /> Export
                </button>
              </div>
            </div>

            <div className="analysis-tabs">
              <button
                className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaLightbulb /> Overview
              </button>
              <button
                className={`analysis-tab ${activeTab === 'components' ? 'active' : ''}`}
                onClick={() => setActiveTab('components')}
              >
                <FaPuzzlePiece /> Components ({analysis.key_components?.length || 0})
              </button>
              <button
                className={`analysis-tab ${activeTab === 'scenarios' ? 'active' : ''}`}
                onClick={() => setActiveTab('scenarios')}
              >
                <FaChartLine /> Scenarios
              </button>
              <button
                className={`analysis-tab ${activeTab === 'risks' ? 'active' : ''}`}
                onClick={() => setActiveTab('risks')}
              >
                <FaExclamationTriangle /> Risks ({risks.length})
              </button>
              <button
                className={`analysis-tab ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                <FaRocket /> Applications ({analysis.potential_applications?.length || 0})
              </button>
            </div>

            <div className="analysis-content-panel">
              {activeTab === 'overview' && (
                <div className="overview-tab-content">
                  <div className="essence-card">
                    <h3>Core Essence</h3>
                    <p>{analysis.core_essence}</p>
                  </div>

                  <div className="pitch-card">
                    <h3>One-Line Pitch</h3>
                    <p className="pitch-text">{analysis.one_line_pitch}</p>
                  </div>

                  <div className="insights-card">
                    <h3>Strategic Insights</h3>
                    <p>{analysis.strategic_insights}</p>
                  </div>

                  {analysis.next_steps && analysis.next_steps.length > 0 && (
                    <div className="next-steps-card">
                      <h3>Next Steps</h3>
                      <ol>
                        {analysis.next_steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'components' && analysis.key_components && (
                <div className="components-tab-content">
                  <div className="components-grid">
                    {analysis.key_components.map((component, idx) => (
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

              {activeTab === 'scenarios' && (
                <div className="scenarios-tab-content">
                  <div className="scenario-card best-case">
                    <div className="scenario-header">
                      <FaArrowUp className="scenario-icon" />
                      <h3>Best Case</h3>
                    </div>
                    <p>{analysis.best_case}</p>
                  </div>

                  <div className="scenario-card worst-case">
                    <div className="scenario-header">
                      <FaArrowDown className="scenario-icon" />
                      <h3>Worst Case</h3>
                    </div>
                    <p>{analysis.worst_case}</p>
                  </div>

                  {analysis.improvement_suggestion && (
                    <div className="improvement-card">
                      <h3>10× Improvement</h3>
                      <p>{analysis.improvement_suggestion}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && risks.length > 0 && (
                <div className="risks-tab-content">
                  <div className="risks-grid">
                    {risks.map((risk, idx) => (
                      <div key={idx} className="risk-card">
                        <FaExclamationTriangle className="risk-icon" />
                        <p>{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'applications' && analysis.potential_applications && (
                <div className="applications-tab-content">
                  <div className="applications-grid">
                    {analysis.potential_applications.map((app, idx) => (
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
            </div>
          </div>
        )}

        {loading && (
          <div className="analysis-loading">
            <div className="loading-spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default StrategicAnalysisPage;

