import React, { useState, useEffect } from 'react';
import { FaCopy, FaExpand, FaCompress, FaDownload, FaShare, FaBookmark } from 'react-icons/fa';

function InteractiveOutput({ 
  children, 
  title, 
  type = 'default',
  onCopy,
  onSave,
  onExport,
  metadata = {}
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    let textToCopy = '';
    
    if (onCopy) {
      textToCopy = onCopy();
    } else if (typeof children === 'string') {
      textToCopy = children;
    } else {
      // Try to extract text from React elements
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = typeof children === 'object' ? '' : children;
      textToCopy = tempDiv.textContent || tempDiv.innerText || '';
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`interactive-output ${type} ${isVisible ? 'visible' : ''}`}>
      <div className="output-header-bar">
        <div className="output-title-section">
          <h2 className="output-title">{title}</h2>
          {metadata.timestamp && (
            <span className="output-timestamp">
              {new Date(metadata.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="output-actions-bar">
          {onSave && (
            <button 
              onClick={onSave}
              className="output-action-btn save-btn"
              title="Save"
            >
              <FaBookmark /> Save
            </button>
          )}
          <button 
            onClick={handleCopy}
            className={`output-action-btn copy-btn ${copied ? 'copied' : ''}`}
            title="Copy"
          >
            <FaCopy /> {copied ? 'Copied!' : 'Copy'}
          </button>
          {onExport && (
            <button 
              onClick={onExport}
              className="output-action-btn export-btn"
              title="Export"
            >
              <FaDownload /> Export
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="output-action-btn expand-btn"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="output-content-wrapper">
          <div className="output-content">
            {children}
          </div>
        </div>
      )}

      {metadata.stats && (
        <div className="output-footer">
          <div className="output-stats">
            {Object.entries(metadata.stats).map(([key, value]) => (
              <span key={key} className="output-stat">
                <strong>{value}</strong> {key}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveOutput;

