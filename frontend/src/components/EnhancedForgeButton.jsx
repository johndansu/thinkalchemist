import React from 'react';
import { FaFire, FaSpinner } from 'react-icons/fa';

function EnhancedForgeButton({ onClick, disabled, loading, mode = 'general' }) {
  const modeLabels = {
    personas: 'Forge Personas',
    timeline: 'Forge Timeline',
    purification: 'Purify Text',
    stress_test: 'Stress Test',
    world_building: 'Build World',
    general: 'Forge'
  };

  const modeIcons = {
    personas: '👥',
    timeline: '📅',
    purification: '✨',
    stress_test: '🔍',
    world_building: '🌍',
    general: '⚡'
  };

  return (
    <button
      className={`enhanced-forge-button ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <div className="forge-button-content">
        {loading ? (
          <>
            <FaSpinner className="spinning" />
            <span>Alchemy in Progress...</span>
          </>
        ) : (
          <>
            <FaFire className="forge-icon" />
            <span>{modeLabels[mode] || 'Forge'}</span>
          </>
        )}
      </div>
      {loading && (
        <div className="forge-progress">
          <div className="forge-progress-bar"></div>
        </div>
      )}
    </button>
  );
}

export default EnhancedForgeButton;

