import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { FaGlobe, FaUser, FaMap, FaBook, FaTheaterMasks, FaSave, FaDownload, FaExpand, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function WorldBuildingPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCards, setExpandedCards] = useState({});

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'world_building');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to build world. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'world_building');
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const worldBuilding = output?.results?.worldBuilding;

  return (
    <>
      {/* Back Button - Outside Container */}
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="creative-workspace-interface">
        {/* Creative Notebook Input */}
        <div className="notebook-container">
        <div className="notebook-header">
          <div className="notebook-icon">
            <FaGlobe />
          </div>
          <div>
            <h1>Creative Notebook</h1>
            <p>Enter your creative concept to build a world</p>
          </div>
        </div>

        <div className="notebook-page">
          <div className="notebook-margin">
            <div className="margin-line"></div>
          </div>
          <div className="notebook-content">
            <textarea
              className="notebook-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write your creative concept, fantasy/sci-fi idea, or story seed here..."
              rows={10}
            />
            <div className="notebook-footer">
              <button
                className="build-world-btn"
                onClick={handleForge}
                disabled={!inputText.trim() || loading}
              >
                {loading ? 'Building World...' : (
                  <>
                    <FaPaperPlane /> Build World
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* World Building Canvas */}
      {output && worldBuilding && (
        <div className="world-canvas">
          <div className="canvas-header-bar">
            <div className="canvas-title">
              <h2>World Building Canvas</h2>
              <span className="world-status-badge">World Created</span>
            </div>
            <div className="canvas-actions-bar">
              {isAuthenticated && (
                <button onClick={handleSave} className="canvas-action save-action">
                  <FaSave /> Save World
                </button>
              )}
              <button className="canvas-action export-action">
                <FaDownload /> Export
              </button>
            </div>
          </div>

          <div className="world-sections-tabs">
            <button
              className={`world-tab ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <FaGlobe /> Overview
            </button>
            <button
              className={`world-tab ${activeSection === 'setting' ? 'active' : ''}`}
              onClick={() => setActiveSection('setting')}
            >
              <FaMap /> Setting
            </button>
            <button
              className={`world-tab ${activeSection === 'characters' ? 'active' : ''}`}
              onClick={() => setActiveSection('characters')}
            >
              <FaUser /> Characters ({worldBuilding.characters?.length || 0})
            </button>
            <button
              className={`world-tab ${activeSection === 'conflict' ? 'active' : ''}`}
              onClick={() => setActiveSection('conflict')}
            >
              <FaTheaterMasks /> Conflict
            </button>
            <button
              className={`world-tab ${activeSection === 'story' ? 'active' : ''}`}
              onClick={() => setActiveSection('story')}
            >
              <FaBook /> Story
            </button>
          </div>

          <div className="world-content-panel">
            {activeSection === 'overview' && (
              <div className="overview-cards">
                <div className="world-card setting-card">
                  <div className="card-header">
                    <FaMap className="card-icon" />
                    <h3>Setting</h3>
                  </div>
                  <div className="card-body">
                    <p>{worldBuilding.setting}</p>
                  </div>
                </div>

                {worldBuilding.map_description && (
                  <div className="world-card map-card">
                    <div className="card-header">
                      <FaMap className="card-icon" />
                      <h3>Map Description</h3>
                    </div>
                    <div className="card-body">
                      <p>{worldBuilding.map_description}</p>
                    </div>
                  </div>
                )}

                {worldBuilding.tone && (
                  <div className="world-card tone-card">
                    <div className="card-header">
                      <FaTheaterMasks className="card-icon" />
                      <h3>Tone</h3>
                    </div>
                    <div className="card-body">
                      <p>{worldBuilding.tone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'setting' && (
              <div className="setting-panel">
                <div className="setting-content">
                  <h3>World Setting</h3>
                  <p>{worldBuilding.setting}</p>
                  {worldBuilding.map_description && (
                    <div className="map-section">
                      <h4>Geographical Layout</h4>
                      <p>{worldBuilding.map_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'characters' && worldBuilding.characters && (
              <div className="characters-panel">
                <div className="characters-grid">
                  {worldBuilding.characters.map((char, idx) => (
                    <div
                      key={idx}
                      className={`character-card ${expandedCards[`char-${idx}`] ? 'expanded' : ''}`}
                    >
                      <div className="character-header">
                        <div>
                          <h3>{char.name}</h3>
                          <span className="character-role">{char.role}</span>
                        </div>
                        <button
                          className="expand-character-btn"
                          onClick={() => toggleCard(`char-${idx}`)}
                        >
                          <FaExpand />
                        </button>
                      </div>
                      <div className="character-body">
                        <p>{char.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'conflict' && (
              <div className="conflict-panel">
                <div className="conflict-content">
                  <h3>Central Conflict</h3>
                  <p>{worldBuilding.conflict}</p>
                </div>
              </div>
            )}

            {activeSection === 'story' && (
              <div className="story-panel">
                <div className="story-content">
                  <h3>Micro-Story</h3>
                  <div className="story-text">
                    {worldBuilding.micro_story}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="world-loading">
          <div className="loading-spinner"></div>
          <p>Building your world...</p>
        </div>
      )}
      </div>
    </>
  );
}

export default WorldBuildingPage;
