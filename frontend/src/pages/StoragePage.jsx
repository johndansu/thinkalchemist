import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { savedAPI } from '../services/api';
import SavedForgeOutput from '../components/SavedForgeOutput';
import { 
  FaTrash, 
  FaFlask, 
  FaSync, 
  FaDownload, 
  FaSearch,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaChartLine,
  FaFilter,
  FaTimes,
  FaClock,
  FaChevronRight,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCheckSquare,
  FaSquare,
  FaCheck,
  FaFileWord,
  FaFilePdf,
  FaCopy
} from 'react-icons/fa';

function StoragePage() {
  const navigate = useNavigate();
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedForge, setSelectedForge] = useState(null);
  const [filter, setFilter] = useState('all'); // all, strategic_analysis, thought_catalyst, timeline, purification, creative_personas
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, title, type
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [selectedForges, setSelectedForges] = useState(new Set());
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

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

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortMenu && !event.target.closest('.storage-sort-wrapper')) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSortMenu]);

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

  const handleExport = (forge, format = 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(forge.output_json, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${forge.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    // Word and PDF export would require the same logic as in forge pages
    // For now, we'll keep it simple with JSON
  };

  const filteredForges = forges.filter(forge => {
    const matchesFilter = filter === 'all' || forge.alchemy_mode === filter;
    const matchesSearch = searchQuery === '' || 
      forge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forge.input_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at) - new Date(b.created_at);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.alchemy_mode.localeCompare(b.alchemy_mode);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSelectForge = (id) => {
    const newSelected = new Set(selectedForges);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedForges(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    if (selectedForges.size === filteredForges.length) {
      setSelectedForges(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedForges(new Set(filteredForges.map(f => f.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedForges.size} transformation(s) permanently?`)) return;
    try {
      await Promise.all(Array.from(selectedForges).map(id => savedAPI.delete(id)));
      setSelectedForges(new Set());
      setShowBulkActions(false);
      loadForges();
      if (selectedForge && selectedForges.has(selectedForge.id)) {
        setSelectedForge(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete some transformations. Please try again.');
    }
  };

  const handleBulkExport = () => {
    const selected = filteredForges.filter(f => selectedForges.has(f.id));
    const data = {
      exported_at: new Date().toISOString(),
      count: selected.length,
      forges: selected.map(f => ({
        title: f.title,
        alchemy_mode: f.alchemy_mode,
        created_at: f.created_at,
        input_text: f.input_text,
        output: f.output_json
      }))
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forge_library_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyInputText = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  const alchemyModeCounts = forges.reduce((acc, forge) => {
    acc[forge.alchemy_mode] = (acc[forge.alchemy_mode] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: forges.length });

  // Statistics
  const stats = {
    total: forges.length,
    byMode: alchemyModeCounts,
    oldest: forges.length > 0 ? new Date(Math.min(...forges.map(f => new Date(f.created_at).getTime()))) : null,
    newest: forges.length > 0 ? new Date(Math.max(...forges.map(f => new Date(f.created_at).getTime()))) : null,
    thisWeek: forges.filter(f => {
      const date = new Date(f.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length,
    thisMonth: forges.filter(f => {
      const date = new Date(f.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }).length
  };

  const getModeIcon = (mode) => {
    const icons = {
      strategic_analysis: FaChartLine,
      thought_catalyst: FaFlask,
      creative_personas: FaUsers,
      timeline: FaCalendarAlt,
      purification: FaFileAlt
    };
    return icons[mode] || FaFileAlt;
  };

  const getModeColor = (mode) => {
    const colors = {
      strategic_analysis: '#8B5A3C',
      thought_catalyst: '#A67C52',
      creative_personas: '#C9A87A',
      timeline: '#D4B896',
      purification: '#E5D4B8'
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
          {forges.length > 0 && (
            <div className="storage-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.thisWeek}</span>
                <span className="stat-label">This Week</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.thisMonth}</span>
                <span className="stat-label">This Month</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{Object.keys(stats.byMode).length - 1}</span>
                <span className="stat-label">Modes Used</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="storage-toolbar">
        <div className="storage-toolbar-left">
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

          <div className="storage-sort-wrapper">
            <button 
              className="sort-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <FaSort />
              <span>Sort</span>
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
            {showSortMenu && (
              <div className="sort-menu">
                <div className="sort-option-group">
                  <label>Sort by:</label>
                  <button 
                    className={sortBy === 'date' ? 'active' : ''}
                    onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                  >
                    Date
                  </button>
                  <button 
                    className={sortBy === 'title' ? 'active' : ''}
                    onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                  >
                    Title
                  </button>
                  <button 
                    className={sortBy === 'type' ? 'active' : ''}
                    onClick={() => { setSortBy('type'); setShowSortMenu(false); }}
                  >
                    Type
                  </button>
                </div>
                <div className="sort-option-group">
                  <label>Order:</label>
                  <button 
                    className={sortOrder === 'desc' ? 'active' : ''}
                    onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}
                  >
                    Newest First
                  </button>
                  <button 
                    className={sortOrder === 'asc' ? 'active' : ''}
                    onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
            )}
          </div>
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
              className={`filter-chip ${filter === 'strategic_analysis' ? 'active' : ''}`}
              onClick={() => setFilter('strategic_analysis')}
            >
              <FaChartLine className="chip-icon" />
              Strategic Analysis
              <span className="chip-count">{alchemyModeCounts.strategic_analysis || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'thought_catalyst' ? 'active' : ''}`}
              onClick={() => setFilter('thought_catalyst')}
            >
              <FaFlask className="chip-icon" />
              Thought Catalyst
              <span className="chip-count">{alchemyModeCounts.thought_catalyst || 0}</span>
            </button>
            <button
              className={`filter-chip ${filter === 'creative_personas' ? 'active' : ''}`}
              onClick={() => setFilter('creative_personas')}
            >
              <FaUsers className="chip-icon" />
              Creative Personas
              <span className="chip-count">{alchemyModeCounts.creative_personas || 0}</span>
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
          </div>
        </div>
      </div>

      {/* Forge Grid */}
      <div className="storage-content-area">
        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-info">
              <span>{selectedForges.size} selected</span>
            </div>
            <div className="bulk-actions-buttons">
              <button onClick={handleBulkExport} className="bulk-action-btn">
                <FaDownload /> Export Selected
              </button>
              <button onClick={handleBulkDelete} className="bulk-action-btn danger">
                <FaTrash /> Delete Selected
              </button>
              <button onClick={() => { setSelectedForges(new Set()); setShowBulkActions(false); }} className="bulk-action-btn">
                <FaTimes /> Clear
              </button>
            </div>
          </div>
        )}

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
          <>
            <div className="forge-grid-header">
              <button 
                className="select-all-btn"
                onClick={selectAll}
                title={selectedForges.size === filteredForges.length ? 'Deselect All' : 'Select All'}
              >
                {selectedForges.size === filteredForges.length ? <FaCheckSquare /> : <FaSquare />}
                <span>Select All</span>
              </button>
              <span className="forge-count">{filteredForges.length} transformation{filteredForges.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="forge-grid-modern">
              {filteredForges.map((forge) => {
                const ModeIcon = getModeIcon(forge.alchemy_mode);
                const modeColor = getModeColor(forge.alchemy_mode);
                const isSelected = selectedForges.has(forge.id);
                
                return (
                  <div 
                    key={forge.id} 
                    data-forge-id={forge.id}
                    className={`forge-card-modern ${isSelected ? 'selected' : ''}`} 
                    style={{ '--mode-color': modeColor }}
                    onClick={(e) => {
                      if (e.target.closest('.forge-card-checkbox')) return;
                    }}
                  >
                    <div className="forge-card-gradient" style={{ background: `linear-gradient(135deg, ${modeColor}15 0%, ${modeColor}05 100%)` }}></div>
                    
                    <div className="forge-card-checkbox" onClick={(e) => { e.stopPropagation(); toggleSelectForge(forge.id); }}>
                      {isSelected ? <FaCheckSquare /> : <FaSquare />}
                    </div>

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
                        {forge.input_text.substring(0, 150)}
                        {forge.input_text.length > 150 ? '...' : ''}
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
                        onClick={(e) => { e.stopPropagation(); handleViewForge(forge.id); }} 
                        className="forge-action-btn primary"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleReForge(forge.id); }} 
                        className="forge-action-btn secondary"
                        title="Re-Forge"
                      >
                        <FaSync />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExport(forge); }} 
                        className="forge-action-btn secondary"
                        title="Export"
                      >
                        <FaDownload />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(forge.id); }} 
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
          </>
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
                <div className="detail-section-header">
                  <h3 className="detail-section-title">
                    <FaFileAlt />
                    Original Input
                  </h3>
                  <button 
                    className="detail-copy-btn"
                    onClick={() => copyInputText(selectedForge.input_text)}
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                </div>
                <div className="detail-text-display">{selectedForge.input_text}</div>
              </div>

              <div className="detail-section-modern">
                <h3 className="detail-section-title">
                  <FaDownload />
                  Output
                </h3>
                <div className="detail-output-display">
                  <SavedForgeOutput output={selectedForge.output_json} mode={selectedForge.alchemy_mode} />
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
              <div className="detail-export-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const menu = e.currentTarget.nextElementSibling;
                    menu.classList.toggle('show');
                  }}
                  className="detail-action-btn secondary"
                >
                  <FaDownload />
                  Export <span className="dropdown-arrow">▼</span>
                </button>
                <div className="detail-export-menu" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { handleExport(selectedForge, 'json'); document.querySelector('.detail-export-menu')?.classList.remove('show'); }} className="export-option">
                    <FaFileAlt /> JSON
                  </button>
                </div>
              </div>
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

