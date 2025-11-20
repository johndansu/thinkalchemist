import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveInput from '../components/InteractiveInput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import { forgeAPI, savedAPI } from '../services/api';
import { FaGlobe, FaUser, FaMap, FaBook, FaTheaterMasks, FaSave, FaDownload, FaExpand } from 'react-icons/fa';

function WorldBuildingPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // overview, setting, characters, conflict, story
  const [expandedCards, setExpandedCards] = useState({});

  const worldBuildingExamples = [
    {
      title: 'Fantasy World',
      text: 'A world where memories can be traded as currency, and the rich live forever by hoarding the memories of others, while the poor forget their pasts.',
      preview: 'Memory-based economy fantasy world...',
      category: 'Fantasy'
    },
    {
      title: 'Sci-Fi Setting',
      text: 'A distant planet where time moves differently, and explorers must navigate temporal rifts that connect different eras of the planet\'s history.',
      preview: 'Time-bending sci-fi planet...',
      category: 'Sci-Fi'
    },
    {
      title: 'Urban Fantasy',
      text: 'A modern city where magical creatures live hidden among humans, and a secret organization maintains the balance between the two worlds.',
      preview: 'Hidden magical world in modern city...',
      category: 'Urban Fantasy'
    }
  ];

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
      await savedAPI.save(
        title,
        inputText,
        output,
        'world_building'
      );
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
    <div className="page-container process-page world-building-page-specialized">
      <div className="process-header">
        <div className="process-header-icon">
          <FaGlobe />
        </div>
        <h1>World-Building Alchemy</h1>
        <p className="process-description-header">
          Expand your creative concepts into rich settings, characters, conflicts, and immersive micro-stories.
        </p>
      </div>

      {/* Input Section */}
      <div className="world-building-input-section">
        <InteractiveInput 
          value={inputText} 
          onChange={setInputText}
          placeholder="Enter your creative concept, fantasy/sci-fi idea, or story seed..."
          examples={worldBuildingExamples}
          showTemplates={true}
        />
        <div className="world-building-forge-action">
          <EnhancedForgeButton 
            onClick={handleForge} 
            loading={loading} 
            disabled={!inputText.trim()}
            mode="world_building"
          />
        </div>
      </div>

      {/* Creative Canvas Workspace */}
      {output && worldBuilding && (
        <div className="world-building-canvas">
          <div className="canvas-header">
            <div className="canvas-title-section">
              <h2>World Building Canvas</h2>
              <span className="world-status">World Created</span>
            </div>

            <div className="canvas-actions">
              {isAuthenticated && (
                <button onClick={handleSave} className="canvas-action-btn save">
                  <FaSave /> Save World
                </button>
              )}
              <button className="canvas-action-btn export">
                <FaDownload /> Export
              </button>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="world-sections-nav">
            <button
              className={`section-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <FaGlobe /> Overview
            </button>
            <button
              className={`section-nav-btn ${activeSection === 'setting' ? 'active' : ''}`}
              onClick={() => setActiveSection('setting')}
            >
              <FaMap /> Setting
            </button>
            <button
              className={`section-nav-btn ${activeSection === 'characters' ? 'active' : ''}`}
              onClick={() => setActiveSection('characters')}
            >
              <FaUser /> Characters ({worldBuilding.characters?.length || 0})
            </button>
            <button
              className={`section-nav-btn ${activeSection === 'conflict' ? 'active' : ''}`}
              onClick={() => setActiveSection('conflict')}
            >
              <FaTheaterMasks /> Conflict
            </button>
            <button
              className={`section-nav-btn ${activeSection === 'story' ? 'active' : ''}`}
              onClick={() => setActiveSection('story')}
            >
              <FaBook /> Story
            </button>
          </div>

          {/* Content Area */}
          <div className="world-content-area">
            {activeSection === 'overview' && (
              <div className="world-overview-grid">
                <div className="world-card setting-card">
                  <div className="card-header">
                    <FaMap className="card-icon" />
                    <h3>Setting</h3>
                  </div>
                  <div className="card-content">
                    <p>{worldBuilding.setting}</p>
                  </div>
                </div>

                {worldBuilding.map_description && (
                  <div className="world-card map-card">
                    <div className="card-header">
                      <FaMap className="card-icon" />
                      <h3>Map Description</h3>
                    </div>
                    <div className="card-content">
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
                    <div className="card-content">
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
                          className="expand-btn"
                          onClick={() => toggleCard(`char-${idx}`)}
                        >
                          <FaExpand />
                        </button>
                      </div>
                      <div className="character-content">
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
        <div className="world-building-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Building your world...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldBuildingPage;
