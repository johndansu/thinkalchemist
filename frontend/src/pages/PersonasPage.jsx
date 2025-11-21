import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from '../components/PersonaCard';
import { forgeAPI, savedAPI } from '../services/api';
import { FaUsers, FaFilter, FaTable, FaTh, FaChartBar, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function PersonasPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [filter, setFilter] = useState('all');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'personas');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge personas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!output) return;

    try {
      const title = inputText.substring(0, 50) + (inputText.length > 50 ? '...' : '');
      await savedAPI.save(title, inputText, output, 'personas');
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const personas = output?.results?.personas?.personas || [];

  return (
    <>
      {/* Back Button - Outside Container */}
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="personas-research-interface">
        {/* Research Form Interface - Not Chat */}
        <div className="research-form-container">
        <div className="research-form-header">
          <div className="form-header-icon">
            <FaUsers />
          </div>
          <div>
            <h1>User Research Form</h1>
            <p>Describe your product concept to generate user personas</p>
          </div>
        </div>

        <div className="research-form-body">
          <div className="form-field">
            <label className="form-label">
              <FaFileAlt className="label-icon" />
              Product Concept Description
            </label>
            <textarea
              className="research-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your product idea, feature request, or business concept here..."
              rows={6}
            />
            <div className="form-actions">
              <button
                className="submit-research-btn"
                onClick={handleForge}
                disabled={!inputText.trim() || loading}
              >
                {loading ? 'Generating Personas...' : (
                  <>
                    <FaPaperPlane /> Generate Personas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personas Results - Dashboard View */}
      {output && personas.length > 0 && (
        <div className="personas-results-dashboard">
          <div className="dashboard-header-bar">
            <div className="dashboard-title">
              <h2>Research Results</h2>
              <span className="results-count">{personas.length} Personas Generated</span>
            </div>
            <div className="dashboard-toolbar">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  <FaTh /> Cards
                </button>
                <button
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <FaTable /> Table
                </button>
                <button
                  className={`view-btn ${viewMode === 'comparison' ? 'active' : ''}`}
                  onClick={() => setViewMode('comparison')}
                >
                  <FaChartBar /> Compare
                </button>
              </div>
              <div className="dashboard-actions">
                <button onClick={handleSave} className="action-btn save-btn">
                  <FaSave /> Save Research
                </button>
                <button className="action-btn export-btn">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <FaFilter className="filter-icon" />
            <button
              className={`filter-tag ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({personas.length})
            </button>
            <button
              className={`filter-tag ${filter === 'high-value' ? 'active' : ''}`}
              onClick={() => setFilter('high-value')}
            >
              High Value
            </button>
            <button
              className={`filter-tag ${filter === 'low-value' ? 'active' : ''}`}
              onClick={() => setFilter('low-value')}
            >
              Low Value
            </button>
          </div>

          <div className={`personas-display ${viewMode}`}>
            {viewMode === 'cards' && (
              <div className="personas-grid-view">
                {personas.map((persona, idx) => (
                  <PersonaCard 
                    key={idx} 
                    persona={persona}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="personas-table-view">
                <table className="research-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Pain Points</th>
                      <th>WTP</th>
                      <th>Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personas.map((persona, idx) => (
                      <tr key={idx}>
                        <td><strong>{persona.name}</strong></td>
                        <td>{persona.age || 'N/A'}</td>
                        <td>{persona.pain_points?.join(', ') || 'N/A'}</td>
                        <td>{persona.willingness_to_pay || 0}/10</td>
                        <td className="quote-cell">"{persona.quote || 'N/A'}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'comparison' && (
              <div className="personas-comparison-view">
                {personas.map((persona, idx) => (
                  <div key={idx} className="comparison-card">
                    <h3>{persona.name}</h3>
                    <div className="metric-row">
                      <span>Willingness to Pay</span>
                      <div className="metric-bar">
                        <div
                          className="metric-fill"
                          style={{ width: `${(persona.willingness_to_pay || 0) * 10}%` }}
                        ></div>
                        <span>{persona.willingness_to_pay || 0}/10</span>
                      </div>
                    </div>
                    <p className="key-pain">{persona.pain_points?.[0] || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="research-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your product concept and generating user personas...</p>
        </div>
      )}
      </div>
    </>
  );
}

export default PersonasPage;
