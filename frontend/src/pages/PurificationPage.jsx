import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaArrowRight, FaSave, FaDownload, FaSync, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

function PurificationPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('split');
  const [showChanges, setShowChanges] = useState(true);

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
      await savedAPI.save(title, inputText, output, 'purification');
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const cleanedText = output?.results?.purification?.cleaned_text || '';
  const improvements = output?.results?.purification?.improvements || [];

  return (
    <>
      {/* Back Button - Outside Container */}
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="document-editor-interface">
        {/* Document Editor Input */}
        <div className="editor-input-panel">
        <div className="editor-header">
          <div className="editor-header-icon">
            <FaFileAlt />
          </div>
          <div>
            <h1>Document Editor</h1>
            <p>Paste your text to refine and improve</p>
          </div>
        </div>

        <div className="editor-workspace">
          <div className="editor-tabs">
            <div className="editor-tab active">
              <FaFileAlt /> Original Document
            </div>
          </div>
          <textarea
            className="document-editor-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your messy, unrefined, or poorly structured text here..."
            rows={10}
          />
          <div className="editor-status-bar">
            <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <span>{inputText.length} characters</span>
            <button
              className="purify-btn"
              onClick={handleForge}
              disabled={!inputText.trim() || loading}
            >
              {loading ? 'Purifying...' : (
                <>
                  <FaPaperPlane /> Purify Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Before/After Comparison View */}
      {output && cleanedText && (
        <div className="comparison-workspace">
          <div className="comparison-header">
            <div className="comparison-title">
              <h2>Document Comparison</h2>
              <span className="improvements-badge">{improvements.length} improvements</span>
            </div>
            <div className="comparison-toolbar">
              <div className="view-mode-switcher">
                <button
                  className={`mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                >
                  Split View
                </button>
                <button
                  className={`mode-btn ${viewMode === 'overlay' ? 'active' : ''}`}
                  onClick={() => setViewMode('overlay')}
                >
                  Overlay
                </button>
                <button
                  className={`mode-btn ${viewMode === 'diff' ? 'active' : ''}`}
                  onClick={() => setViewMode('diff')}
                >
                  Diff View
                </button>
              </div>
              <div className="comparison-actions">
                <button
                  className={`toggle-changes-btn ${showChanges ? 'active' : ''}`}
                  onClick={() => setShowChanges(!showChanges)}
                >
                  <FaSync /> {showChanges ? 'Hide' : 'Show'} Changes
                </button>
                {isAuthenticated && (
                  <button onClick={handleSave} className="comparison-btn save-btn">
                    <FaSave /> Save
                  </button>
                )}
                <button className="comparison-btn export-btn">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>

          <div className={`comparison-view ${viewMode}`}>
            {viewMode === 'split' && (
              <>
                <div className="comparison-panel original-panel">
                  <div className="panel-header-bar">
                    <FaTimesCircle className="panel-status-icon error" />
                    <h3>Original</h3>
                    <span className="word-count">{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  </div>
                  <div className="panel-content original-content">
                    {inputText}
                  </div>
                </div>

                <div className="comparison-divider-bar">
                  <FaArrowRight className="divider-icon" />
                </div>

                <div className="comparison-panel cleaned-panel">
                  <div className="panel-header-bar">
                    <FaCheckCircle className="panel-status-icon success" />
                    <h3>Purified</h3>
                    <span className="word-count">{cleanedText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  </div>
                  <div className="panel-content cleaned-content">
                    {cleanedText}
                  </div>
                </div>
              </>
            )}

            {viewMode === 'overlay' && (
              <div className="overlay-container">
                <div className="overlay-layer original-layer">{inputText}</div>
                <div className="overlay-layer cleaned-layer">{cleanedText}</div>
              </div>
            )}

            {viewMode === 'diff' && (
              <div className="diff-container">
                {inputText.split('\n').map((line, idx) => {
                  const cleanedLine = cleanedText.split('\n')[idx] || '';
                  const isChanged = line.trim() !== cleanedLine.trim();
                  return (
                    <div key={idx} className={`diff-line ${isChanged ? 'changed' : ''}`}>
                      <div className="diff-original-line">
                        <span className="line-num">{idx + 1}</span>
                        <span className="line-text">{line || '\u00A0'}</span>
                      </div>
                      {isChanged && (
                        <>
                          <div className="diff-arrow">→</div>
                          <div className="diff-cleaned-line">
                            <span className="line-num">{idx + 1}</span>
                            <span className="line-text">{cleanedLine || '\u00A0'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showChanges && improvements.length > 0 && (
            <div className="improvements-section">
              <h3>
                <FaCheckCircle className="improvements-icon" />
                Improvements Made
              </h3>
              <div className="improvements-tags">
                {improvements.map((improvement, idx) => (
                  <span key={idx} className="improvement-tag">{improvement}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="purification-loading">
          <div className="loading-spinner"></div>
          <p>Refining your document...</p>
        </div>
      )}
      </div>
    </>
  );
}

export default PurificationPage;
