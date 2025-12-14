import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from '../components/PersonaCard';
import { forgeAPI, savedAPI } from '../services/api';
import { FaUsers, FaGlobe, FaMap, FaUser, FaTheaterMasks, FaBook, FaSave, FaDownload, FaExpand, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function CreativePersonasPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personas');
  const [expandedCards, setExpandedCards] = useState({});

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'creative_personas');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge creative personas. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'creative_personas');
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

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const creativePersonas = output?.results?.creativePersonas;
  const personas = creativePersonas?.personas || [];
  const world = creativePersonas?.world;

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="creative-personas-interface">
        <div className="creative-input-container">
          <div className="creative-input-header">
            <div className="input-header-icon">
              <FaUsers />
            </div>
            <div>
              <h1>Creative Personas & Worlds</h1>
              <p>Transform your concept into immersive personas and a rich creative world</p>
            </div>
          </div>

          <div className="creative-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Concept
              </label>
              <textarea
                className="creative-textarea"
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
                placeholder="Enter your product idea, creative concept, or world-building seed here..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="forge-creative-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Forging...' : (
                    <>
                      <FaPaperPlane /> Forge Creative Personas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && creativePersonas && (
          <div className="creative-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Creative Personas & World</h2>
                <span className="status-badge">Forged</span>
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

            <div className="creative-sections-tabs">
              <button
                className={`creative-tab ${activeSection === 'personas' ? 'active' : ''}`}
                onClick={() => setActiveSection('personas')}
              >
                <FaUsers /> Personas ({personas.length})
              </button>
              {world && (
                <>
                  <button
                    className={`creative-tab ${activeSection === 'world' ? 'active' : ''}`}
                    onClick={() => setActiveSection('world')}
                  >
                    <FaGlobe /> World
                  </button>
                  <button
                    className={`creative-tab ${activeSection === 'characters' ? 'active' : ''}`}
                    onClick={() => setActiveSection('characters')}
                  >
                    <FaUser /> Characters ({world.characters?.length || 0})
                  </button>
                  <button
                    className={`creative-tab ${activeSection === 'story' ? 'active' : ''}`}
                    onClick={() => setActiveSection('story')}
                  >
                    <FaBook /> Story
                  </button>
                </>
              )}
            </div>

            <div className="creative-content-panel">
              {activeSection === 'personas' && personas.length > 0 && (
                <div className="personas-section">
                  <div className="personas-grid-view">
                    {personas.map((persona, idx) => (
                      <PersonaCard 
                        key={idx} 
                        persona={persona}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'world' && world && (
                <div className="world-section">
                  <div className="world-cards">
                    <div className="world-card setting-card">
                      <div className="card-header">
                        <FaMap className="card-icon" />
                        <h3>Setting</h3>
                      </div>
                      <div className="card-body">
                        <p>{world.setting}</p>
                      </div>
                    </div>

                    {world.map_description && (
                      <div className="world-card map-card">
                        <div className="card-header">
                          <FaMap className="card-icon" />
                          <h3>Locations</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.map_description}</p>
                        </div>
                      </div>
                    )}

                    {world.conflict && (
                      <div className="world-card conflict-card">
                        <div className="card-header">
                          <FaTheaterMasks className="card-icon" />
                          <h3>Conflict</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.conflict}</p>
                        </div>
                      </div>
                    )}

                    {world.tone && (
                      <div className="world-card tone-card">
                        <div className="card-header">
                          <FaTheaterMasks className="card-icon" />
                          <h3>Tone</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.tone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'characters' && world?.characters && (
                <div className="characters-section">
                  <div className="characters-grid">
                    {world.characters.map((char, idx) => (
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

              {activeSection === 'story' && world?.micro_story && (
                <div className="story-section">
                  <div className="story-content">
                    <h3>Micro-Story</h3>
                    <div className="story-text">
                      {world.micro_story}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="creative-loading">
            <div className="loading-spinner"></div>
            <p>Forging creative personas and world...</p>
          </div>
        )}
      </div>
    </>
  );
}

export default CreativePersonasPage;

