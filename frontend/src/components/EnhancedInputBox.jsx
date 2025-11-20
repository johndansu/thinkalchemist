import React, { useState, useRef, useEffect } from 'react';
import { FaLightbulb, FaTimes, FaCopy, FaUndo, FaRedo, FaMagic } from 'react-icons/fa';

function EnhancedInputBox({ 
  value, 
  onChange, 
  placeholder = "Enter your thoughts here...",
  examples = [],
  onExampleSelect,
  showSuggestions = true
}) {
  const textareaRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(value.length);
  }, [value]);

  const handleChange = (newValue) => {
    onChange(newValue);
    // Add to history
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
    navigator.clipboard.writeText(value);
    // Could add a toast notification here
  };

  const handleClear = () => {
    onChange('');
    setHistory(['']);
    setHistoryIndex(0);
    textareaRef.current?.focus();
  };

  const handleExampleClick = (example) => {
    if (onExampleSelect) {
      onExampleSelect(example);
    } else {
      onChange(example.text);
    }
    setShowExamples(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="enhanced-input-container">
      <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="input-header">
          <div className="input-header-left">
            <FaMagic className="input-icon" />
            <span className="input-label">Your Raw Thoughts</span>
          </div>
          <div className="input-actions">
            {value && (
              <>
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex === 0}
                  className="input-action-btn"
                  title="Undo"
                >
                  <FaUndo />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex === history.length - 1}
                  className="input-action-btn"
                  title="Redo"
                >
                  <FaRedo />
                </button>
                <button 
                  onClick={handleCopy} 
                  className="input-action-btn"
                  title="Copy"
                >
                  <FaCopy />
                </button>
                <button 
                  onClick={handleClear} 
                  className="input-action-btn"
                  title="Clear"
                >
                  <FaTimes />
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className="enhanced-input-box"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={8}
        />

        <div className="input-footer">
          <div className="input-stats">
            <span className="stat-item">
              <strong>{wordCount}</strong> words
            </span>
            <span className="stat-item">
              <strong>{charCount}</strong> characters
            </span>
          </div>
          
          {showSuggestions && examples.length > 0 && (
            <button 
              className="examples-toggle"
              onClick={() => setShowExamples(!showExamples)}
            >
              <FaLightbulb /> {showExamples ? 'Hide' : 'Show'} Examples
            </button>
          )}
        </div>
      </div>

      {showExamples && examples.length > 0 && (
        <div className="examples-panel">
          <div className="examples-header">
            <FaLightbulb className="examples-icon" />
            <h3>Example Prompts</h3>
            <button 
              onClick={() => setShowExamples(false)}
              className="examples-close"
            >
              <FaTimes />
            </button>
          </div>
          <div className="examples-grid">
            {examples.map((example, idx) => (
              <div 
                key={idx}
                className="example-card"
                onClick={() => handleExampleClick(example)}
              >
                <div className="example-title">{example.title}</div>
                <div className="example-preview">{example.preview}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedInputBox;

