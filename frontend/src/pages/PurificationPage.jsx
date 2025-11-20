import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveInput from '../components/InteractiveInput';
import EnhancedForgeButton from '../components/EnhancedForgeButton';
import { forgeAPI, savedAPI } from '../services/api';
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaArrowRight, FaSave, FaDownload, FaSync } from 'react-icons/fa';

function PurificationPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // split, overlay, diff
  const [showChanges, setShowChanges] = useState(true);

  const purificationExamples = [
    {
      title: 'Rough Draft',
      text: 'this is a really messy text with lots of errors and bad grammar. it needs to be cleaned up and made better. the structure is poor and the spelling is wrong in many places.',
      preview: 'Messy text with grammar and spelling errors...',
      category: 'Draft'
    },
    {
      title: 'Unstructured Notes',
      text: 'meeting notes: discussed project timeline. budget concerns. need to hire more developers. deadline is tight. client wants changes.',
      preview: 'Unstructured meeting notes...',
      category: 'Notes'
    },
    {
      title: 'Poorly Written Content',
      text: 'The product is good but the marketing is bad. we need to improve. sales are down. customers are unhappy. we should do something.',
      preview: 'Poorly written business content...',
      category: 'Business'
    }
  ];

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'purification');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to purify document. Please try again.');
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
        'purification'
      );
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const cleanedText = output?.results?.purification?.cleaned_text || '';
  const improvements = output?.results?.purification?.improvements || [];

  return (
    <div className="page-container process-page purification-page-specialized">
      <div className="process-header">
        <div className="process-header-icon">
          <FaFileAlt />
        </div>
        <h1>Document Purification</h1>
        <p className="process-description-header">
          Clean and refine messy text with better grammar, clarity, and structure while maintaining a human tone.
        </p>
      </div>

      {/* Input Section - Compact */}
      <div className="purification-input-section">
        <InteractiveInput 
          value={inputText} 
          onChange={setInputText}
          placeholder="Paste your messy, unrefined, or poorly structured text here..."
          examples={purificationExamples}
          showTemplates={true}
        />
        <div className="purification-forge-action">
          <EnhancedForgeButton 
            onClick={handleForge} 
            loading={loading} 
            disabled={!inputText.trim()}
            mode="purification"
          />
        </div>
      </div>

      {/* Before/After Comparison Workspace */}
      {output && cleanedText && (
        <div className="purification-workspace">
          <div className="purification-toolbar">
            <div className="toolbar-section">
              <h2>Text Purification</h2>
              <span className="improvements-count">
                {improvements.length} improvements made
              </span>
            </div>

            <div className="purification-controls">
              <div className="view-mode-controls">
                <button
                  className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                >
                  Split View
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'overlay' ? 'active' : ''}`}
                  onClick={() => setViewMode('overlay')}
                >
                  Overlay
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'diff' ? 'active' : ''}`}
                  onClick={() => setViewMode('diff')}
                >
                  Diff View
                </button>
              </div>

              <div className="purification-actions">
                <button
                  className={`toggle-btn ${showChanges ? 'active' : ''}`}
                  onClick={() => setShowChanges(!showChanges)}
                >
                  <FaSync /> {showChanges ? 'Hide' : 'Show'} Changes
                </button>
                {isAuthenticated && (
                  <button onClick={handleSave} className="purification-action-btn save">
                    <FaSave /> Save
                  </button>
                )}
                <button className="purification-action-btn export">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          <div className={`purification-comparison ${viewMode}`}>
            {viewMode === 'split' && (
              <>
                <div className="comparison-panel original">
                  <div className="panel-header">
                    <FaTimesCircle className="panel-icon error" />
                    <h3>Original Text</h3>
                    <span className="word-count">{inputText.split(/\s+/).length} words</span>
                  </div>
                  <div className="panel-content original-text">
                    {inputText}
                  </div>
                </div>

                <div className="comparison-divider">
                  <FaArrowRight className="divider-arrow" />
                </div>

                <div className="comparison-panel cleaned">
                  <div className="panel-header">
                    <FaCheckCircle className="panel-icon success" />
                    <h3>Purified Text</h3>
                    <span className="word-count">{cleanedText.split(/\s+/).length} words</span>
                  </div>
                  <div className="panel-content cleaned-text">
                    {cleanedText}
                  </div>
                </div>
              </>
            )}

            {viewMode === 'overlay' && (
              <div className="overlay-view">
                <div className="overlay-original">{inputText}</div>
                <div className="overlay-cleaned">{cleanedText}</div>
              </div>
            )}

            {viewMode === 'diff' && (
              <div className="diff-view">
                <div className="diff-content">
                  {inputText.split('\n').map((line, idx) => {
                    const cleanedLine = cleanedText.split('\n')[idx] || '';
                    const isChanged = line.trim() !== cleanedLine.trim();
                    return (
                      <div key={idx} className={`diff-line ${isChanged ? 'changed' : ''}`}>
                        <div className="diff-original">
                          <span className="line-number">{idx + 1}</span>
                          <span className="line-content">{line || '\u00A0'}</span>
                        </div>
                        {isChanged && (
                          <div className="diff-arrow">→</div>
                        )}
                        {isChanged && (
                          <div className="diff-cleaned">
                            <span className="line-number">{idx + 1}</span>
                            <span className="line-content">{cleanedLine || '\u00A0'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {showChanges && improvements.length > 0 && (
            <div className="improvements-panel">
              <h3>
                <FaCheckCircle className="improvements-icon" />
                Improvements Made
              </h3>
              <div className="improvements-grid">
                {improvements.map((improvement, idx) => (
                  <div key={idx} className="improvement-badge">
                    {improvement}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="purification-loading">
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Purifying your text...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurificationPage;
