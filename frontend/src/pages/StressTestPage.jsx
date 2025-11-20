import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { FaSearch, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaRocket, FaChartLine, FaSave, FaDownload, FaLightbulb, FaFileAlt, FaPaperPlane } from 'react-icons/fa';

function StressTestPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [riskLevel, setRiskLevel] = useState('all');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'stress_test');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to stress test idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!output) return;

    try {
      const title = inputText.substring(0, 50) + (inputText.length > 50 ? '...' : '');
      await savedAPI.save(title, inputText, output, 'stress_test');
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const stressTest = output?.results?.stressTest;
  const risks = stressTest?.hidden_risks || [];

  return (
    <div className="business-analysis-interface">
      {/* Business Analysis Form */}
      <div className="analysis-form-container">
        <div className="analysis-form-header">
          <div className="form-header-icon">
            <FaSearch />
          </div>
          <div>
            <h1>Business Idea Analysis</h1>
            <p>Submit your idea for comprehensive stress testing</p>
          </div>
        </div>

        <div className="analysis-form-body">
          <div className="form-field">
            <label className="form-label">
              <FaFileAlt className="label-icon" />
              Business Idea Description
            </label>
            <textarea
              className="analysis-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your business idea, product concept, or strategic plan in detail..."
              rows={6}
            />
            <div className="form-actions">
              <button
                className="analyze-btn"
                onClick={handleForge}
                disabled={!inputText.trim() || loading}
              >
                {loading ? 'Analyzing...' : (
                  <>
                    <FaPaperPlane /> Analyze Idea
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Dashboard */}
      {output && stressTest && (
        <div className="analysis-dashboard">
          <div className="dashboard-header-bar">
            <div className="dashboard-title">
              <h2>Analysis Report</h2>
              <span className="report-status">Complete</span>
            </div>
            <div className="dashboard-actions-bar">
              {isAuthenticated && (
                <button onClick={handleSave} className="action-button save-button">
                  <FaSave /> Save Report
                </button>
              )}
              <button className="action-button export-button">
                <FaDownload /> Export
              </button>
            </div>
          </div>

          <div className="analysis-tabs-bar">
            <button
              className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine /> Overview
            </button>
            <button
              className={`analysis-tab ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => setActiveTab('risks')}
            >
              <FaExclamationTriangle /> Risks ({risks.length})
            </button>
            <button
              className={`analysis-tab ${activeTab === 'improvement' ? 'active' : ''}`}
              onClick={() => setActiveTab('improvement')}
            >
              <FaLightbulb /> Improvement
            </button>
          </div>

          <div className="analysis-content-area">
            {activeTab === 'overview' && (
              <div className="overview-cards-grid">
                <div className="analysis-card best-case-card">
                  <div className="card-header">
                    <FaArrowUp className="card-icon" />
                    <h3>Best Case</h3>
                  </div>
                  <div className="card-body">
                    <p>{stressTest.best_case}</p>
                  </div>
                </div>

                <div className="analysis-card worst-case-card">
                  <div className="card-header">
                    <FaArrowDown className="card-icon" />
                    <h3>Worst Case</h3>
                  </div>
                  <div className="card-body">
                    <p>{stressTest.worst_case}</p>
                  </div>
                </div>

                <div className="analysis-card pitch-card">
                  <div className="card-header">
                    <FaRocket className="card-icon" />
                    <h3>One-Line Pitch</h3>
                  </div>
                  <div className="card-body">
                    <p className="pitch-text">{stressTest.one_line_pitch}</p>
                  </div>
                </div>

                <div className="analysis-card viability-card">
                  <div className="card-header">
                    <FaChartLine className="card-icon" />
                    <h3>Viability Score</h3>
                  </div>
                  <div className="card-body">
                    <div className="viability-meter">
                      <div className="meter-bar" style={{ width: '65%' }}></div>
                      <span className="meter-label">Moderate-High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="risks-panel">
                <div className="risk-filter-bar">
                  <button
                    className={`risk-filter ${riskLevel === 'all' ? 'active' : ''}`}
                    onClick={() => setRiskLevel('all')}
                  >
                    All Risks ({risks.length})
                  </button>
                  <button
                    className={`risk-filter ${riskLevel === 'high' ? 'active' : ''}`}
                    onClick={() => setRiskLevel('high')}
                  >
                    High Priority
                  </button>
                </div>

                <div className="risks-list">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="risk-item-card">
                      <div className="risk-header">
                        <FaExclamationTriangle className="risk-icon" />
                        <h4>Risk #{idx + 1}</h4>
                        <span className="risk-badge">High</span>
                      </div>
                      <p className="risk-text">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'improvement' && stressTest.improvement_suggestion && (
              <div className="improvement-panel">
                <div className="improvement-header">
                  <FaLightbulb className="improvement-icon" />
                  <h3>10× Improvement Strategy</h3>
                </div>
                <div className="improvement-content">
                  <p>{stressTest.improvement_suggestion}</p>
                </div>
                <div className="improvement-actions">
                  <button className="strategy-btn primary">Apply Strategy</button>
                  <button className="strategy-btn secondary">Learn More</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <p>Conducting comprehensive analysis...</p>
        </div>
      )}
    </div>
  );
}

export default StressTestPage;
