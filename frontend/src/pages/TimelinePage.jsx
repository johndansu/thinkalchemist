import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedInputBox from '../components/EnhancedInputBox';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import TimelineView from '../components/TimelineView';
import AnimatedOutput from '../components/AnimatedOutput';
import { forgeAPI, savedAPI } from '../services/api';
import { FaCalendarAlt, FaLightbulb, FaSave } from 'react-icons/fa';

function TimelinePage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const timelineExamples = [
    {
      title: 'Project Timeline',
      text: 'In January 2020, we started the project. By March, we had the first prototype. The beta launch was in June 2020, and we reached 10,000 users by September.',
      preview: 'Project timeline from January to September 2020...'
    },
    {
      title: 'Historical Events',
      text: 'The Renaissance began in Italy around 1400. The printing press was invented in 1440. Leonardo da Vinci was born in 1452. The Age of Exploration started in the late 1400s.',
      preview: 'Renaissance and historical events timeline...'
    },
    {
      title: 'Story Sequence',
      text: 'First, the hero discovered the ancient map. Then, they gathered their team. After that, they journeyed to the hidden temple. Finally, they uncovered the secret.',
      preview: 'Adventure story sequence...'
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

  return (
    <div className="page-container process-page timeline-page">
      <div className="process-header">
        <div className="process-header-icon">
          <FaCalendarAlt />
        </div>
        <h1>Timeline Alchemy</h1>
        <p className="process-description-header">
          Extract and structure events into beautiful chronological timelines with impact analysis.
        </p>
      </div>

      <div className="process-guidance">
        <div className="guidance-card">
          <FaLightbulb className="guidance-icon" />
          <div>
            <h3>What to Input</h3>
            <p>Provide text with events, dates, or a narrative with sequential happenings. Timestamps can be explicit or inferred.</p>
            <ul>
              <li>Historical narratives</li>
              <li>Project timelines</li>
              <li>Story sequences</li>
              <li>Event descriptions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="process-input-section">
        <EnhancedInputBox 
          value={inputText} 
          onChange={setInputText}
          placeholder="Enter events, dates, or a narrative with sequential happenings..."
          examples={timelineExamples}
          showSuggestions={true}
        />
      </div>

      <EnhancedForgeButton 
        onClick={handleForge} 
        loading={loading} 
        disabled={!inputText.trim()}
        mode="timeline"
      />

      {output && output.results?.timeline && (
        <div className="process-output-section">
          <AnimatedOutput title="Chronological Timeline">
            <div className="output-actions-top">
              {isAuthenticated && (
                <button onClick={handleSave} className="save-button-process">
                  <FaSave /> Save This Forge
                </button>
              )}
            </div>
            <TimelineView events={output.results.timeline.events} />
            {output.results.timeline.summary && (
              <div className="timeline-summary">
                <h3>Summary</h3>
                <p>{output.results.timeline.summary}</p>
              </div>
            )}
          </AnimatedOutput>
        </div>
      )}

      {loading && (
        <div className="loading">Forging timeline...</div>
      )}
    </div>
  );
}

export default TimelinePage;

