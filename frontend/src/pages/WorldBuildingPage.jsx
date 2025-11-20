import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputBox from '../components/InputBox';
import ForgeButton from '../components/ForgeButton';
import { forgeAPI, savedAPI } from '../services/api';
import { FaGlobe, FaLightbulb, FaSave, FaUser, FaMap, FaBook, FaExclamationTriangle } from 'react-icons/fa';

function WorldBuildingPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="page-container process-page world-building-page">
      <div className="process-header">
        <div className="process-header-icon">
          <FaGlobe />
        </div>
        <h1>World-Building Alchemy</h1>
        <p className="process-description-header">
          Expand your creative concepts into rich settings, characters, conflicts, and immersive micro-stories.
        </p>
      </div>

      <div className="process-guidance">
        <div className="guidance-card">
          <FaLightbulb className="guidance-icon" />
          <div>
            <h3>What to Input</h3>
            <p>Provide a creative concept, fantasy/sci-fi idea, or story seed. The more unique and interesting, the richer the world will be.</p>
            <ul>
              <li>Fantasy concepts</li>
              <li>Sci-fi ideas</li>
              <li>Story seeds</li>
              <li>Creative projects</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="process-input-section">
        <label className="process-input-label">Enter Your Creative Concept</label>
        <InputBox 
          value={inputText} 
          onChange={setInputText}
          placeholder="Example: A world where memories can be traded as currency, and the rich live forever by hoarding the memories of others..."
        />
      </div>

      <ForgeButton onClick={handleForge} loading={loading} disabled={!inputText.trim()} />

      {output && output.results?.worldBuilding && (
        <div className="process-output-section">
          <div className="output-header">
            <h2>Built World</h2>
            {isAuthenticated && (
              <button onClick={handleSave} className="save-button-process">
                <FaSave /> Save This Forge
              </button>
            )}
          </div>
          
          <div className="world-building-results">
            <div className="world-section">
              <div className="world-section-header">
                <FaMap className="world-icon" />
                <h3>Setting</h3>
              </div>
              <p>{output.results.worldBuilding.setting}</p>
            </div>

            {output.results.worldBuilding.characters && output.results.worldBuilding.characters.length > 0 && (
              <div className="world-section">
                <div className="world-section-header">
                  <FaUser className="world-icon" />
                  <h3>Characters</h3>
                </div>
                <div className="characters-grid">
                  {output.results.worldBuilding.characters.map((char, idx) => (
                    <div key={idx} className="character-card">
                      <h4>{char.name}</h4>
                      <p className="character-role">{char.role}</p>
                      <p className="character-description">{char.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="world-section">
              <div className="world-section-header">
                <FaExclamationTriangle className="world-icon" />
                <h3>Conflict</h3>
              </div>
              <p>{output.results.worldBuilding.conflict}</p>
            </div>

            {output.results.worldBuilding.map_description && (
              <div className="world-section">
                <div className="world-section-header">
                  <FaMap className="world-icon" />
                  <h3>Map Description</h3>
                </div>
                <p>{output.results.worldBuilding.map_description}</p>
              </div>
            )}

            <div className="world-section story-section">
              <div className="world-section-header">
                <FaBook className="world-icon" />
                <h3>Micro-Story</h3>
              </div>
              <p className="micro-story">{output.results.worldBuilding.micro_story}</p>
            </div>

            {output.results.worldBuilding.tone && (
              <div className="world-section tone-section">
                <p className="tone-text">
                  <strong>Tone:</strong> {output.results.worldBuilding.tone}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">Building your world...</div>
      )}
    </div>
  );
}

export default WorldBuildingPage;

