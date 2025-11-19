import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedAPI } from '../services/api';

function MyCreationsPage() {
  const navigate = useNavigate();
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForge, setSelectedForge] = useState(null);

  useEffect(() => {
    loadForges();
  }, []);

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
    if (!window.confirm('Delete this forge?')) return;
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

  if (loading) {
    return <div className="loading">Loading your creations...</div>;
  }

  return (
    <div className="page-container">
      <div className="creations-layout">
        <div className="creations-list">
          <h2>My Creations</h2>
          {forges.length === 0 ? (
            <div className="empty-state">
              <p>No saved forges yet.</p>
              <button onClick={() => navigate('/')} className="primary-button">
                Create Your First Forge
              </button>
            </div>
          ) : (
            <div className="forge-grid">
              {forges.map((forge) => (
                <div key={forge.id} className="forge-card">
                  <h3>{forge.title}</h3>
                  <div className="forge-meta">
                    {new Date(forge.created_at).toLocaleDateString()} • {forge.alchemy_mode}
                  </div>
                  <div className="forge-actions">
                    <button onClick={() => handleViewForge(forge.id)}>View</button>
                    <button onClick={() => handleReForge(forge.id)}>Re-Forge</button>
                    <button onClick={() => handleDelete(forge.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedForge && (
          <div className="forge-detail">
            <div className="detail-header">
              <h2>{selectedForge.title}</h2>
              <button onClick={() => setSelectedForge(null)}>×</button>
            </div>
            <div className="detail-content">
              <div className="detail-section">
                <h3>Original Input</h3>
                <p className="input-text">{selectedForge.input_text}</p>
              </div>
              <div className="detail-section">
                <h3>Output</h3>
                <pre className="output-json">
                  {JSON.stringify(selectedForge.output_json, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCreationsPage;

