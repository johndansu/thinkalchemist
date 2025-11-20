import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaCopy, FaExpand, FaCompress } from 'react-icons/fa';

function AnimatedOutput({ children, title, defaultExpanded = true, onCopy }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      // Try to copy the text content
      const text = typeof children === 'string' ? children : '';
      if (text) {
        navigator.clipboard.writeText(text);
      }
    }
  };

  return (
    <div className={`animated-output ${isVisible ? 'visible' : ''}`}>
      <div className="animated-output-header">
        <h3 className="animated-output-title">{title}</h3>
        <div className="animated-output-actions">
          <button 
            onClick={handleCopy}
            className="output-action-btn"
            title="Copy"
          >
            <FaCopy />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="output-action-btn"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="animated-output-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default AnimatedOutput;

