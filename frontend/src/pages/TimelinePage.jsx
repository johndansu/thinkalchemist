import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimelineView from '../components/TimelineView';
import { forgeAPI, savedAPI } from '../services/api';
import { FaCalendarAlt, FaSearch, FaSearchPlus, FaSearchMinus, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function TimelinePage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState('vertical');
  const [searchQuery, setSearchQuery] = useState('');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'timeline');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      const errorMessage = error.message || 'Failed to forge timeline';
      
      // Show more helpful error messages
      if (errorMessage.includes('Cannot connect to Ollama') || errorMessage.includes('Ollama is running')) {
        alert(`⚠️ ${errorMessage}\n\nMake sure Ollama is running on your computer.`);
      } else if (errorMessage.includes('not found') && errorMessage.includes('ollama pull')) {
        alert(`⚠️ ${errorMessage}\n\nInstall the model using the command shown above.`);
      } else if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        alert('⚠️ LLM API key is not configured. Please add GROQ_API_KEY to backend/.env file.\n\nGet a free API key at: https://console.groq.com');
      } else if (errorMessage.includes('Invalid') && errorMessage.includes('key')) {
        alert('⚠️ Invalid LLM API key. Please check your GROQ_API_KEY in backend/.env file.');
      } else {
        alert(`Failed to forge timeline: ${errorMessage}\n\nPlease try again or check the backend logs for more details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!output) return;

    // Check if user is authenticated
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
      await savedAPI.save(title, inputText, output, 'timeline');
      alert('✅ Saved to your library!');
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save';
      
      // Provide specific error messages
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

  const events = output?.results?.timeline?.events || [];
  const filteredEvents = searchQuery
    ? events.filter(e =>
        e.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.event?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <>
      {/* Back Button - Outside Container */}
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="timeline-visualization-interface">
        {/* Timeline Input - Document Style */}
        <div className="timeline-document-container">
        <div className="document-header">
          <div className="document-icon">
            <FaCalendarAlt />
          </div>
          <div>
            <h1>Timeline Document</h1>
            <p>Enter events, dates, or chronological narrative</p>
          </div>
        </div>

        <div className="document-editor">
          <div className="editor-toolbar">
            <span className="toolbar-label">Timeline Content</span>
          </div>
          <textarea
            className="timeline-editor-textarea"
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
            placeholder="Enter your timeline content here. Include dates, events, or a narrative with sequential happenings..."
            rows={8}
          />
          <div className="editor-footer">
            <button
              className="process-timeline-btn"
              onClick={handleForge}
              disabled={!inputText.trim() || loading}
            >
              {loading ? 'Processing...' : (
                <>
                  <FaPaperPlane /> Extract Timeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Visualization Canvas */}
      {output && events.length > 0 && (
        <div className="timeline-canvas-workspace">
          <div className="canvas-toolbar">
            <div className="toolbar-left">
              <h2>Timeline Visualization</h2>
              <span className="events-badge">{events.length} Events</span>
            </div>

            <div className="canvas-controls">
              <div className="search-control">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="timeline-search"
                />
              </div>

              <div className="orientation-controls">
                <button
                  className={`orient-btn ${orientation === 'vertical' ? 'active' : ''}`}
                  onClick={() => setOrientation('vertical')}
                >
                  Vertical
                </button>
                <button
                  className={`orient-btn ${orientation === 'horizontal' ? 'active' : ''}`}
                  onClick={() => setOrientation('horizontal')}
                >
                  Horizontal
                </button>
              </div>

              <div className="zoom-controls">
                <button
                  className="zoom-control-btn"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <FaSearchMinus />
                </button>
                <span className="zoom-display">{Math.round(zoom * 100)}%</span>
                <button
                  className="zoom-control-btn"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                >
                  <FaSearchPlus />
                </button>
              </div>

              <div className="canvas-actions">
                <button onClick={handleSave} className="canvas-btn save-btn">
                  <FaSave /> Save Timeline
                </button>
                <button className="canvas-btn export-btn">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          <div className="timeline-viewport">
            <div
              className={`timeline-visualization ${orientation}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <TimelineView events={filteredEvents} orientation={orientation} />
            </div>
          </div>
          
          {output.results.timeline.summary && (
            <div className="timeline-summary-enhanced">
              <div className="summary-header">
                <h3>Timeline Summary</h3>
              </div>
              <p className="summary-text">{output.results.timeline.summary}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Extracting and structuring timeline events...</p>
        </div>
      )}
      </div>
    </>
  );
}

export default TimelinePage;
