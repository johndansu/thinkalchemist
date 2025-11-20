import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveInput from '../components/InteractiveInput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import TimelineView from '../components/TimelineView';
import { forgeAPI, savedAPI } from '../services/api';
import { FaCalendarAlt, FaFilter, FaSearch, FaSearchPlus, FaSearchMinus, FaSave, FaDownload } from 'react-icons/fa';

function TimelinePage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState('vertical'); // vertical, horizontal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const timelineExamples = [
    {
      title: 'Project Timeline',
      text: 'In January 2020, we started the project. By March, we had the first prototype. The beta launch was in June 2020, and we reached 10,000 users by September.',
      preview: 'Project timeline from January to September 2020...',
      category: 'Project'
    },
    {
      title: 'Historical Events',
      text: 'The Renaissance began in Italy around 1400. The printing press was invented in 1440. Leonardo da Vinci was born in 1452. The Age of Exploration started in the late 1400s.',
      preview: 'Renaissance and historical events timeline...',
      category: 'History'
    },
    {
      title: 'Story Sequence',
      text: 'First, the hero discovered the ancient map. Then, they gathered their team. After that, they journeyed to the hidden temple. Finally, they uncovered the secret.',
      preview: 'Adventure story sequence...',
      category: 'Story'
    }
  ];

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'timeline');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge timeline. Please try again.');
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
        'timeline'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const events = output?.results?.timeline?.events || [];
  const filteredEvents = searchQuery 
    ? events.filter(e => 
        e.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.event?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <div className="page-container process-page timeline-page-specialized">
      <div className="process-header">
        <div className="process-header-icon">
          <FaCalendarAlt />
        </div>
        <h1>Timeline Alchemy</h1>
        <p className="process-description-header">
          Extract and structure events into beautiful chronological timelines with impact analysis.
        </p>
      </div>

      {/* Input Section */}
      <div className="timeline-input-section">
        <InteractiveInput 
          value={inputText} 
          onChange={setInputText}
          placeholder="Enter events, dates, or a narrative with sequential happenings..."
          examples={timelineExamples}
          showTemplates={true}
        />
        <div className="timeline-forge-action">
          <EnhancedForgeButton 
            onClick={handleForge} 
            loading={loading} 
            disabled={!inputText.trim()}
            mode="timeline"
          />
        </div>
      </div>

      {/* Timeline Visualization Workspace */}
      {output && events.length > 0 && (
        <div className="timeline-workspace">
          <div className="timeline-toolbar">
            <div className="toolbar-section">
              <h2>Timeline Visualization</h2>
              <span className="events-count">{events.length} events</span>
            </div>

            <div className="toolbar-controls">
              <div className="search-box-timeline">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="timeline-search-input"
                />
              </div>

              <div className="view-controls">
                <button
                  className={`view-control-btn ${orientation === 'vertical' ? 'active' : ''}`}
                  onClick={() => setOrientation('vertical')}
                  title="Vertical Timeline"
                >
                  Vertical
                </button>
                <button
                  className={`view-control-btn ${orientation === 'horizontal' ? 'active' : ''}`}
                  onClick={() => setOrientation('horizontal')}
                  title="Horizontal Timeline"
                >
                  Horizontal
                </button>
              </div>

              <div className="zoom-controls">
                <button
                  className="zoom-btn"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  title="Zoom Out"
                >
                  <FaSearchMinus />
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button
                  className="zoom-btn"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  title="Zoom In"
                >
                  <FaSearchPlus />
                </button>
              </div>

              <div className="timeline-actions">
                {isAuthenticated && (
                  <button onClick={handleSave} className="timeline-action-btn save">
                    <FaSave /> Save
                  </button>
                )}
                <button className="timeline-action-btn export">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          <div className="timeline-visualization-container">
            <div 
              className={`timeline-canvas ${orientation}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <TimelineView events={filteredEvents} orientation={orientation} />
            </div>
          </div>

          {output.results.timeline.summary && (
            <div className="timeline-summary-panel">
              <h3>Timeline Summary</h3>
              <p>{output.results.timeline.summary}</p>
            </div>
          )}

          {selectedEvent && (
            <div className="event-detail-panel">
              <button 
                className="close-detail"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
              <h3>{selectedEvent.event}</h3>
              <p className="event-timestamp">{selectedEvent.timestamp}</p>
              <p className="event-description">{selectedEvent.description}</p>
              {selectedEvent.impact && (
                <div className="event-impact">
                  <strong>Impact:</strong> {selectedEvent.impact}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="timeline-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Extracting timeline events...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelinePage;
