import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveInput from '../components/InteractiveInput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import { forgeAPI, savedAPI } from '../services/api';
import { FaSearch, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaRocket, FaChartLine, FaSave, FaDownload, FaLightbulb } from 'react-icons/fa';

function StressTestPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, risks, improvement
  const [riskLevel, setRiskLevel] = useState('all'); // all, high, medium, low

  const stressTestExamples = [
    {
      title: 'SaaS Startup',
      text: 'A subscription-based project management tool for remote teams with AI-powered task prioritization and automated reporting.',
      preview: 'SaaS project management tool idea...',
      category: 'SaaS'
    },
    {
      title: 'E-commerce Feature',
      text: 'A new feature that allows customers to virtually try on clothes using AR technology before purchasing online.',
      preview: 'AR virtual try-on feature...',
      category: 'E-commerce'
    },
    {
      title: 'Mobile App',
      text: 'A fitness app that uses AI to create personalized workout plans based on user goals, fitness level, and available equipment.',
      preview: 'AI-powered fitness app...',
      category: 'Mobile'
    }
  ];

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
      await savedAPI.save(
        title,
        inputText,
        output,
        'stress_test'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const stressTest = output?.results?.stressTest;
  const risks = stressTest?.hidden_risks || [];

  return (
    <div className="page-container process-page stress-test-page-specialized">
      <div className="process-header">
        <div className="process-header-icon">
          <FaSearch />
        </div>
        <h1>Idea Stress Test Engine</h1>
        <p className="process-description-header">
          Get a reality check on your ideas with best-case scenarios, risks, and improvement suggestions.
        </p>
      </div>

      {/* Input Section */}
      <div className="stress-test-input-section">
        <InteractiveInput 
          value={inputText} 
          onChange={setInputText}
          placeholder="Describe your business idea, product concept, or strategic plan..."
          examples={stressTestExamples}
          showTemplates={true}
        />
        <div className="stress-test-forge-action">
          <EnhancedForgeButton 
            onClick={handleForge} 
            loading={loading} 
            disabled={!inputText.trim()}
            mode="stress_test"
          />
        </div>
      </div>

      {/* Analysis Dashboard */}
      {output && stressTest && (
        <div className="stress-test-dashboard">
          <div className="dashboard-header">
            <div className="dashboard-title-section">
              <h2>Idea Analysis Dashboard</h2>
              <span className="analysis-status">Analysis Complete</span>
            </div>

            <div className="dashboard-actions">
              {isAuthenticated && (
                <button onClick={handleSave} className="dashboard-action-btn save">
                  <FaSave /> Save Analysis
                </button>
              )}
              <button className="dashboard-action-btn export">
                <FaDownload /> Export Report
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="analysis-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine /> Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => setActiveTab('risks')}
            >
              <FaExclamationTriangle /> Risks ({risks.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'improvement' ? 'active' : ''}`}
              onClick={() => setActiveTab('improvement')}
            >
              <FaLightbulb /> Improvement
            </button>
          </div>

          {/* Tab Content */}
          <div className="analysis-content">
            {activeTab === 'overview' && (
              <div className="overview-grid">
                <div className="analysis-card best-case">
                  <div className="card-header">
                    <FaArrowUp className="card-icon" />
                    <h3>Best Case Scenario</h3>
                  </div>
                  <div className="card-content">
                    <p>{stressTest.best_case}</p>
                  </div>
                </div>

                <div className="analysis-card worst-case">
                  <div className="card-header">
                    <FaArrowDown className="card-icon" />
                    <h3>Worst Case Scenario</h3>
                  </div>
                  <div className="card-content">
                    <p>{stressTest.worst_case}</p>
                  </div>
                </div>

                <div className="analysis-card pitch">
                  <div className="card-header">
                    <FaRocket className="card-icon" />
                    <h3>One-Line Pitch</h3>
                  </div>
                  <div className="card-content">
                    <p className="pitch-text">{stressTest.one_line_pitch}</p>
                  </div>
                </div>

                <div className="analysis-card viability">
                  <div className="card-header">
                    <FaChartLine className="card-icon" />
                    <h3>Viability Score</h3>
                  </div>
                  <div className="card-content">
                    <div className="viability-meter">
                      <div className="meter-fill" style={{ width: '65%' }}></div>
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
                    className={`risk-filter-btn ${riskLevel === 'all' ? 'active' : ''}`}
                    onClick={() => setRiskLevel('all')}
                  >
                    All Risks ({risks.length})
                  </button>
                  <button
                    className={`risk-filter-btn ${riskLevel === 'high' ? 'active' : ''}`}
                    onClick={() => setRiskLevel('high')}
                  >
                    High Priority
                  </button>
                </div>

                <div className="risks-list">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="risk-item">
                      <div className="risk-header">
                        <FaExclamationTriangle className="risk-icon" />
                        <h4>Risk #{idx + 1}</h4>
                        <span className="risk-badge high">High Priority</span>
                      </div>
                      <p className="risk-description">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'improvement' && stressTest.improvement_suggestion && (
              <div className="improvement-panel">
                <div className="improvement-header">
                  <FaLightbulb className="improvement-icon" />
                  <h3>10× Improvement Suggestion</h3>
                </div>
                <div className="improvement-content">
                  <p>{stressTest.improvement_suggestion}</p>
                </div>
                <div className="improvement-actions">
                  <button className="improvement-btn primary">
                    Apply This Strategy
                  </button>
                  <button className="improvement-btn secondary">
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="stress-test-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Analyzing your idea...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StressTestPage;
