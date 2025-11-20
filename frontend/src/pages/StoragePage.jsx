import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { savedAPI } from '../services/api';
import { FaTrash, FaEye, FaSync, FaDownload } from 'react-icons/fa';

function StoragePage() {
  const navigate = useNavigate();
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForge, setSelectedForge] = useState(null);
  const [filter, setFilter] = useState('all'); // all, personas, timeline, purification, stress_test, world_building
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
      return;
    }
    loadForges();
  }, [navigate]);

  const loadForges = async () => {
    setLoading(true);
    try {
      const response = await savedAPI.list();
      setForges(response.forges || []);
    } catch (error) {
      console.error('Failed to load forges:', error);
      if (error.response?.status === 401) {
        navigate('/auth');
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading your storage...</div>
      </div>
    );
  }

  return (
    <div className="page-container storage-page">
      <div className="storage-header">
        <h1>Storage & Management</h1>
        <p className="page-subtitle">
          Manage and organize all your saved transformations
        </p>
      </div>

      <div className="storage-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search forges by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'filter-active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({alchemyModeCounts.all || 0})
          </button>
          <button
            className={filter === 'personas' ? 'filter-active' : ''}
            onClick={() => setFilter('personas')}
          >
            Personas ({alchemyModeCounts.personas || 0})
          </button>
          <button
            className={filter === 'timeline' ? 'filter-active' : ''}
            onClick={() => setFilter('timeline')}
          >
            Timeline ({alchemyModeCounts.timeline || 0})
          </button>
          <button
            className={filter === 'purification' ? 'filter-active' : ''}
            onClick={() => setFilter('purification')}
          >
            Purification ({alchemyModeCounts.purification || 0})
          </button>
          <button
            className={filter === 'stress_test' ? 'filter-active' : ''}
            onClick={() => setFilter('stress_test')}
          >
            Stress Test ({alchemyModeCounts.stress_test || 0})
          </button>
          <button
            className={filter === 'world_building' ? 'filter-active' : ''}
            onClick={() => setFilter('world_building')}
          >
            World Building ({alchemyModeCounts.world_building || 0})
          </button>
        </div>
      </div>

      <div className="storage-content">
        <div className="storage-list">
          <h2>Your Forges ({filteredForges.length})</h2>
          
          {filteredForges.length === 0 ? (
            <div className="empty-state">
              <p>No forges found.</p>
              {forges.length === 0 ? (
                <Link to="/forge" className="primary-button">
                  Create Your First Forge
                </Link>
              ) : (
                <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="link-button">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="forge-list-grid">
              {filteredForges.map((forge) => (
                <div key={forge.id} className="forge-card-detailed">
                  <div className="forge-card-header">
                    <h3>{forge.title}</h3>
                    <span className="forge-mode-badge">{forge.alchemy_mode}</span>
                  </div>
                  <div className="forge-meta">
                    <span>{new Date(forge.created_at).toLocaleDateString()}</span>
                    <span className="forge-preview">
                      {forge.input_text.substring(0, 100)}...
                    </span>
                  </div>
                  <div className="forge-actions-detailed">
                    <button onClick={() => handleViewForge(forge.id)} className="action-btn view">
                      <FaEye /> View
                    </button>
                    <button onClick={() => handleReForge(forge.id)} className="action-btn reforge">
                      <FaSync /> Re-Forge
                    </button>
                    <button onClick={() => handleExport(forge)} className="action-btn export">
                      <FaDownload /> Export
                    </button>
                    <button onClick={() => handleDelete(forge.id)} className="action-btn delete">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedForge && (
          <div className="storage-detail-panel">
            <div className="detail-panel-header">
              <h2>{selectedForge.title}</h2>
              <button onClick={() => setSelectedForge(null)}>×</button>
            </div>
            <div className="detail-panel-content">
              <div className="detail-section">
                <h3>Original Input</h3>
                <div className="input-text-display">{selectedForge.input_text}</div>
              </div>
              <div className="detail-section">
                <h3>Output</h3>
                <div className="output-display">
                  <pre>{JSON.stringify(selectedForge.output_json, null, 2)}</pre>
                </div>
              </div>
              <div className="detail-actions">
                <button onClick={() => handleReForge(selectedForge.id)} className="primary-button">
                  Re-Forge This
                </button>
                <button onClick={() => handleExport(selectedForge)} className="secondary-button">
                  Export JSON
                </button>
                <button onClick={() => handleDelete(selectedForge.id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoragePage;

