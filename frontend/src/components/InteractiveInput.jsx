import React, { useState, useRef, useEffect } from 'react';
import { FaMagic, FaLightbulb, FaTimes, FaCopy, FaUndo, FaRedo, FaFileAlt } from 'react-icons/fa';

function InteractiveInput({ 
  value, 
  onChange, 
  placeholder = "Enter your thoughts here...",
  examples = [],
  onExampleSelect,
  suggestions = [],
  onSuggestionSelect,
  showTemplates = true
}) {
  const textareaRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(value.length);
  }, [value]);

  const handleChange = (newValue) => {
    onChange(newValue);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
    } else {
      navigator.clipboard.writeText(value);
    }
  };

  const handleClear = () => {
    onChange('');
    setHistory(['']);
    setHistoryIndex(0);
    textareaRef.current?.focus();
  };

  const handleSelection = () => {
    const selection = window.getSelection().toString();
    setSelectedText(selection);
  };

  return (
    <div className="interactive-input-container">
      <div className={`input-workspace ${isFocused ? 'focused' : ''}`}>
        <div className="input-toolbar">
          <div className="toolbar-left">
            <FaMagic className="toolbar-icon" />
            <span className="toolbar-label">Your Raw Thoughts</span>
          </div>
          <div className="toolbar-actions">
            {value && (
              <>
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex === 0}
                  className="toolbar-btn"
                  title="Undo (Ctrl+Z)"
                >
                  <FaUndo />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex === history.length - 1}
                  className="toolbar-btn"
                  title="Redo (Ctrl+Y)"
                >
                  <FaRedo />
                </button>
                <button 
                  onClick={handleCopy} 
                  className="toolbar-btn"
                  title="Copy"
                >
                  <FaCopy />
                </button>
                <button 
                  onClick={handleClear} 
                  className="toolbar-btn"
                  title="Clear"
                >
                  <FaTimes />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="input-editor-wrapper">
          <textarea
            ref={textareaRef}
            className="interactive-textarea"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onSelect={handleSelection}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={12}
          />
          {!value && (
            <div className="input-placeholder-overlay">
              <FaFileAlt className="placeholder-icon" />
              <p className="placeholder-text">{placeholder}</p>
            </div>
          )}
        </div>

        <div className="input-status-bar">
          <div className="status-stats">
            <span className="stat-badge">
              <strong>{wordCount}</strong> words
            </span>
            <span className="stat-badge">
              <strong>{charCount}</strong> chars
            </span>
            {selectedText && (
              <span className="stat-badge highlight">
                <strong>{selectedText.length}</strong> selected
              </span>
            )}
          </div>
          
          <div className="status-actions">
            {showTemplates && examples.length > 0 && (
              <button 
                className="status-btn"
                onClick={() => setShowExamples(!showExamples)}
              >
                <FaLightbulb /> {showExamples ? 'Hide' : 'Show'} Templates
              </button>
            )}
            {suggestions.length > 0 && (
              <button 
                className="status-btn"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <FaMagic /> Suggestions ({suggestions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {showExamples && examples.length > 0 && (
        <div className="templates-panel">
          <div className="templates-header">
            <FaLightbulb className="templates-icon" />
            <h3>Template Library</h3>
            <button 
              onClick={() => setShowExamples(false)}
              className="templates-close"
            >
              <FaTimes />
            </button>
          </div>
          <div className="templates-grid">
            {examples.map((example, idx) => (
              <div 
                key={idx}
                className="template-card"
                onClick={() => {
                  if (onExampleSelect) {
                    onExampleSelect(example);
                  } else {
                    onChange(example.text);
                  }
                  setShowExamples(false);
                  textareaRef.current?.focus();
                }}
              >
                <div className="template-title">{example.title}</div>
                <div className="template-preview">{example.preview}</div>
                <div className="template-badge">{example.category || 'Template'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-panel">
          <div className="suggestions-header">
            <FaMagic className="suggestions-icon" />
            <h3>AI Suggestions</h3>
            <button 
              onClick={() => setShowSuggestions(false)}
              className="suggestions-close"
            >
              <FaTimes />
            </button>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, idx) => (
              <div 
                key={idx}
                className="suggestion-item"
                onClick={() => {
                  if (onSuggestionSelect) {
                    onSuggestionSelect(suggestion);
                  } else {
                    onChange(suggestion);
                  }
                  setShowSuggestions(false);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveInput;

