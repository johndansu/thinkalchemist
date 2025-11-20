import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveInput from '../components/InteractiveInput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import PersonaCard from '../components/PersonaCard';
import { forgeAPI, savedAPI } from '../services/api';
import { FaUsers, FaFilter, FaTable, FaTh, FaChartBar, FaSave, FaDownload } from 'react-icons/fa';

function PersonasPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // cards, table, comparison
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [filter, setFilter] = useState('all'); // all, high-value, low-value, etc.

  const personasExamples = [
    {
      title: 'Mobile App Idea',
      text: 'A mobile app that helps people track their daily water intake with reminders and gamification features.',
      preview: 'Mobile app for water intake tracking...',
      category: 'Mobile'
    },
    {
      title: 'E-commerce Feature',
      text: 'A new feature for an online marketplace that allows sellers to create virtual storefronts with customizable themes.',
      preview: 'E-commerce virtual storefront feature...',
      category: 'E-commerce'
    },
    {
      title: 'SaaS Product',
      text: 'A project management tool designed specifically for remote teams with built-in video conferencing and collaborative whiteboards.',
      preview: 'Project management tool for remote teams...',
      category: 'SaaS'
    }
  ];

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
        'personas'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const personas = output?.results?.personas?.personas || [];

  return (
    <div className="page-container process-page personas-page-specialized">
      <div className="process-header">
        <div className="process-header-icon">
          <FaUsers />
        </div>
        <h1>Personas & User Insight Simulation</h1>
        <p className="process-description-header">
          Generate fictional user personas with pain points, preferences, and honest feedback for your product ideas.
        </p>
      </div>

      {/* Input Section - Compact at top */}
      <div className="personas-input-section">
        <InteractiveInput 
          value={inputText} 
          onChange={setInputText}
          placeholder="Describe your product idea, feature request, or business concept..."
          examples={personasExamples}
          showTemplates={true}
        />
        <div className="personas-forge-action">
          <EnhancedForgeButton 
            onClick={handleForge} 
            loading={loading} 
            disabled={!inputText.trim()}
            mode="personas"
          />
        </div>
      </div>

      {/* Output Section - Specialized Personas Dashboard */}
      {output && personas.length > 0 && (
        <div className="personas-dashboard">
          <div className="dashboard-header">
            <div className="dashboard-title-section">
              <h2>User Personas Dashboard</h2>
              <span className="personas-count">{personas.length} personas generated</span>
            </div>
            
            <div className="dashboard-controls">
              <div className="view-mode-selector">
                <button
                  className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  <FaTh />
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <FaTable />
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'comparison' ? 'active' : ''}`}
                  onClick={() => setViewMode('comparison')}
                  title="Comparison View"
                >
                  <FaChartBar />
                </button>
              </div>

              <div className="dashboard-actions">
                {isAuthenticated && (
                  <button onClick={handleSave} className="dashboard-action-btn save">
                    <FaSave /> Save
                  </button>
                )}
                <button className="dashboard-action-btn export">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="personas-filter-bar">
            <FaFilter className="filter-icon" />
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({personas.length})
            </button>
            <button
              className={`filter-btn ${filter === 'high-value' ? 'active' : ''}`}
              onClick={() => setFilter('high-value')}
            >
              High Value ({personas.filter(p => (p.willingness_to_pay || 0) >= 7).length})
            </button>
            <button
              className={`filter-btn ${filter === 'low-value' ? 'active' : ''}`}
              onClick={() => setFilter('low-value')}
            >
              Low Value ({personas.filter(p => (p.willingness_to_pay || 0) < 4).length})
            </button>
          </div>

          {/* Content Area */}
          <div className={`personas-content ${viewMode}`}>
            {viewMode === 'cards' && (
              <div className="personas-cards-grid">
                {personas.map((persona, idx) => (
                  <PersonaCard key={idx} persona={persona} />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="personas-table-view">
                <table className="personas-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Pain Points</th>
                      <th>Willingness to Pay</th>
                      <th>Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personas.map((persona, idx) => (
                      <tr key={idx}>
                        <td><strong>{persona.name}</strong></td>
                        <td>{persona.age || 'N/A'}</td>
                        <td>{persona.pain_points?.join(', ') || 'N/A'}</td>
                        <td>
                          <span className="willingness-badge">
                            {persona.willingness_to_pay || 0}/10
                          </span>
                        </td>
                        <td className="quote-cell">"{persona.quote || persona.feedback || 'N/A'}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'comparison' && (
              <div className="personas-comparison-view">
                <div className="comparison-metrics">
                  {personas.map((persona, idx) => (
                    <div key={idx} className="comparison-card">
                      <h3>{persona.name}</h3>
                      <div className="metric-bar">
                        <div className="metric-label">Willingness to Pay</div>
                        <div className="metric-value">
                          <div 
                            className="metric-fill" 
                            style={{ width: `${(persona.willingness_to_pay || 0) * 10}%` }}
                          ></div>
                          <span>{persona.willingness_to_pay || 0}/10</span>
                        </div>
                      </div>
                      <div className="persona-quick-info">
                        <p><strong>Key Pain:</strong> {persona.pain_points?.[0] || 'N/A'}</p>
                        <p><strong>Quote:</strong> "{persona.quote?.substring(0, 100)}..."</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="personas-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Generating user personas...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonasPage;
