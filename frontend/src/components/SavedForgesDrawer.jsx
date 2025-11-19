import React, { useState, useEffect } from 'react';
import { savedAPI } from '../services/api';

function SavedForgesDrawer({ isOpen, onClose, onLoadForge, onReForge }) {
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadForges();
    }
  }, [isOpen]);

  const loadForges = async () => {
    setLoading(true);
    try {
      const response = await savedAPI.list();
      setForges(response.forges || []);
    } catch (error) {
      console.error('Failed to load forges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this forge?')) return;
    try {
      await savedAPI.delete(id);
      loadForges();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete forge. Please try again.');
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>My Creations</h2>
          <button onClick={onClose}>×</button>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : forges.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--burnt-umber)', padding: '2rem' }}>
            No saved forges yet.
          </div>
        ) : (
          <div className="forge-list">
            {forges.map((forge) => (
              <div key={forge.id} className="forge-item">
                <h3>{forge.title}</h3>
                <div className="forge-meta">
                  {new Date(forge.created_at).toLocaleDateString()} • {forge.alchemy_mode}
                </div>
                <div className="forge-actions">
                  <button onClick={() => onLoadForge(forge.id)}>Open</button>
                  <button onClick={() => onReForge(forge.id)}>Re-Forge</button>
                  <button onClick={() => handleDelete(forge.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SavedForgesDrawer;

