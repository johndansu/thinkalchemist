import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { savedAPI } from '../services/api';
import { 
  FaTrash, 
  FaEye, 
  FaSync, 
  FaDownload, 
  FaSearch,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaSearch as FaStressTest,
  FaGlobe,
  FaFilter,
  FaTimes,
  FaClock,
  FaChevronRight,
  FaLock,
  FaSignInAlt
} from 'react-icons/fa';

function StoragePage() {
  const navigate = useNavigate();
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedForge, setSelectedForge] = useState(null);
  const [filter, setFilter] = useState('all'); // all, personas, timeline, purification, stress_test, world_building
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
      
      if (token) {
        loadForges();
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const loadForges = async () => {
    setLoading(true);
    try {
      const response = await savedAPI.list();
      setForges(response.forges || []);
    } catch (error) {
      console.error('Failed to load forges:', error);
      // If error is due to authentication, update auth state
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('auth-changed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewForge = async (id) => {
    try {
      const response = await savedAPI.get(id);
      setSelectedForge(response.forge);
    } catch (error) {
      console.error('Failed to load forge:', error);
      alert('Failed to load forge. Please try again.');
    }
  };

  const handleReForge = async (id) => {
    try {
      const response = await savedAPI.get(id);
      navigate('/forge', { state: { inputText: response.forge.input_text, autoForge: true } });
    } catch (error) {
      console.error('Failed to load forge:', error);
      alert('Failed to load forge. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this forge permanently?')) return;
    try {
      await savedAPI.delete(id);
      loadForges();
      if (selectedForge?.id === id) {
        setSelectedForge(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete forge. Please try again.');
    }
  };

  const handleExport = (forge) => {
    const dataStr = JSON.stringify(forge.output_json, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${forge.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredForges = forges.filter(forge => {
    const matchesFilter = filter === 'all' || forge.alchemy_mode === filter;
    const matchesSearch = searchQuery === '' || 
      forge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forge.input_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const alchemyModeCounts = forges.reduce((acc, forge) => {
    acc[forge.alchemy_mode] = (acc[forge.alchemy_mode] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: forges.length });

  const getModeIcon = (mode) => {
    const icons = {
      personas: FaUsers,
      timeline: FaCalendarAlt,
      purification: FaFileAlt,
      stress_test: FaStressTest,
      world_building: FaGlobe
    };
    return icons[mode] || FaFileAlt;
  };

  const getModeColor = (mode) => {
    const colors = {
      personas: '#8B5A3C',
      timeline: '#A67C52',
      purification: '#C9A87A',
      stress_test: '#D4B896',
      world_building: '#E5D4B8'
    };
    return colors[mode] || '#C9A87A';
  };

  const formatModeName = (mode) => {
    return mode.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="storage-page-wrapper">
        <div className="storage-loading-state">
          <div className="loading-spinner-large"></div>
          <p>Loading your transformations...</p>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="storage-page-wrapper">
        <div className="storage-auth-required">
          <div className="auth-required-content">
            <div className="auth-required-icon">
              <FaLock />
            </div>
            <h2 className="auth-required-title">Authentication Required</h2>
            <p className="auth-required-message">
              Please sign in to access your saved transformations and manage your forge library.
            </p>
            <div className="auth-required-actions">
              <Link to="/signin" className="auth-required-button primary">
                <FaSignInAlt />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="auth-required-button secondary">
                <span>Create Account</span>
              </Link>
            </div>
            <p className="auth-required-hint">
              Don't have an account? Sign up to start saving your transformations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="storage-page-wrapper">
      {/* Hero Header */}
      <div className="storage-hero">
        <div className="storage-hero-content">
          <h1 className="storage-hero-title">
            <span className="hero-icon">⚗️</span>
            Your Forge Library
          </h1>
          <p className="storage-hero-subtitle">
            {forges.length === 0 
              ? "Start creating to build your collection"
              : `${forges.length} transformation${forges.length !== 1 ? 's' : ''} saved`
            }
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="storage-toolbar">
        <div className="storage-search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your transformations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="storage-search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="storage-filters">
          <FaFilter className="filter-icon" />
          <div className="filter-chips">
            <button
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              <span className="chip-count">{alchemyModeCounts.all || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'personas' ? 'active' : ''}`}
              onClick={() => setFilter('personas')}
            >
              <FaUsers className="chip-icon" />
              Personas
              <span className="chip-count">{alchemyModeCounts.personas || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'timeline' ? 'active' : ''}`}
              onClick={() => setFilter('timeline')}
            >
              <FaCalendarAlt className="chip-icon" />
              Timeline
              <span className="chip-count">{alchemyModeCounts.timeline || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'purification' ? 'active' : ''}`}
              onClick={() => setFilter('purification')}
            >
              <FaFileAlt className="chip-icon" />
              Purification
              <span className="chip-count">{alchemyModeCounts.purification || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'stress_test' ? 'active' : ''}`}
              onClick={() => setFilter('stress_test')}
            >
              <FaStressTest className="chip-icon" />
              Stress Test
              <span className="chip-count">{alchemyModeCounts.stress_test || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'world_building' ? 'active' : ''}`}
              onClick={() => setFilter('world_building')}
            >
              <FaGlobe className="chip-icon" />
              World Building
              <span className="chip-count">{alchemyModeCounts.world_building || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forge Grid */}
      <div className="storage-content-area">
        {filteredForges.length === 0 ? (
          <div className="storage-empty-state">
            <div className="empty-state-icon">📦</div>
            <h2 className="empty-state-title">
              {forges.length === 0 ? 'No transformations yet' : 'No matches found'}
            </h2>
            <p className="empty-state-text">
              {forges.length === 0 
                ? 'Start forging to see your transformations here'
                : 'Try adjusting your search or filters'
              }
            </p>
            {forges.length === 0 ? (
              <Link to="/forge" className="empty-state-cta">
                Create Your First Forge
                <FaChevronRight />
              </Link>
            ) : (
              <button 
                onClick={() => { setFilter('all'); setSearchQuery(''); }} 
                className="empty-state-cta secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="forge-grid-modern">
            {filteredForges.map((forge) => {
              const ModeIcon = getModeIcon(forge.alchemy_mode);
              const modeColor = getModeColor(forge.alchemy_mode);
              
              return (
                <div key={forge.id} className="forge-card-modern" style={{ '--mode-color': modeColor }}>
                  <div className="forge-card-gradient" style={{ background: `linear-gradient(135deg, ${modeColor}15 0%, ${modeColor}05 100%)` }}></div>
                  
                  <div className="forge-card-header-modern">
                    <div className="forge-mode-indicator" style={{ backgroundColor: modeColor }}>
                      <ModeIcon />
                    </div>
                    <div className="forge-header-content">
                      <h3 className="forge-card-title">{forge.title}</h3>
                      <span className="forge-mode-label">{formatModeName(forge.alchemy_mode)}</span>
                    </div>
                  </div>

                  <div className="forge-card-body">
                    <p className="forge-preview-text">
                      {forge.input_text.substring(0, 120)}
                      {forge.input_text.length > 120 ? '...' : ''}
                    </p>
                    <div className="forge-meta-modern">
                      <div className="forge-date">
                        <FaClock />
                        <span>{new Date(forge.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="forge-card-actions">
                    <button 
                      onClick={() => handleViewForge(forge.id)} 
                      className="forge-action-btn primary"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleReForge(forge.id)} 
                      className="forge-action-btn secondary"
                      title="Re-Forge"
                    >
                      <FaSync />
                    </button>
                    <button 
                      onClick={() => handleExport(forge)} 
                      className="forge-action-btn secondary"
                      title="Export"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      onClick={() => handleDelete(forge.id)} 
                      className="forge-action-btn danger"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel Modal */}
      {selectedForge && (
        <div className="storage-detail-modal" onClick={() => setSelectedForge(null)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-header-info">
                {(() => {
                  const ModeIcon = getModeIcon(selectedForge.alchemy_mode);
                  const modeColor = getModeColor(selectedForge.alchemy_mode);
                  return (
                    <div className="detail-mode-badge" style={{ backgroundColor: modeColor }}>
                      <ModeIcon />
                      <span>{formatModeName(selectedForge.alchemy_mode)}</span>
                    </div>
                  );
                })()}
                <h2 className="detail-modal-title">{selectedForge.title}</h2>
                <div className="detail-meta-info">
                  <FaClock />
                  <span>Created {new Date(selectedForge.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              <button 
                className="detail-modal-close"
                onClick={() => setSelectedForge(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-section-modern">
                <h3 className="detail-section-title">
                  <FaFileAlt />
                  Original Input
                </h3>
                <div className="detail-text-display">{selectedForge.input_text}</div>
              </div>

              <div className="detail-section-modern">
                <h3 className="detail-section-title">
                  <FaDownload />
                  Output
                </h3>
                <div className="detail-json-display">
                  <pre>{JSON.stringify(selectedForge.output_json, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="detail-modal-footer">
              <button 
                onClick={() => handleReForge(selectedForge.id)} 
                className="detail-action-btn primary"
              >
                <FaSync />
                Re-Forge This
              </button>
              <button 
                onClick={() => handleExport(selectedForge)} 
                className="detail-action-btn secondary"
              >
                <FaDownload />
                Export JSON
              </button>
              <button 
                onClick={() => {
                  handleDelete(selectedForge.id);
                  setSelectedForge(null);
                }} 
                className="detail-action-btn danger"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoragePage;

