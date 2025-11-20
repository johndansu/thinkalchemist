import React, { useState } from 'react';
import { FaExpand, FaCompress, FaSync } from 'react-icons/fa';

function WorkspaceLayout({ 
  inputSection, 
  outputSection, 
  loading = false,
  mode = 'split' // 'split', 'input-focused', 'output-focused'
}) {
  const [viewMode, setViewMode] = useState(mode);
  const [isResizing, setIsResizing] = useState(false);

  const handleResize = (e) => {
    if (!isResizing) return;
    // Resize logic could be added here for manual resizing
  };

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div className="workspace-controls">
          <button
            className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Split View"
          >
            <FaSync />
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'input-focused' ? 'active' : ''}`}
            onClick={() => setViewMode('input-focused')}
            title="Focus Input"
          >
            <FaExpand />
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'output-focused' ? 'active' : ''}`}
            onClick={() => setViewMode('output-focused')}
            title="Focus Output"
          >
            <FaCompress />
          </button>
        </div>
      </div>

      <div 
        className={`workspace-content ${viewMode} ${loading ? 'processing' : ''}`}
        onMouseMove={handleResize}
        onMouseUp={() => setIsResizing(false)}
      >
        <div className="workspace-panel input-panel">
          <div className="panel-header">
            <h3>Input Workspace</h3>
            <div className="panel-indicator input-indicator">
              <span className="indicator-dot"></span>
              <span>Ready</span>
            </div>
          </div>
          <div className="panel-content">
            {inputSection}
          </div>
        </div>

        {viewMode === 'split' && (
          <div className="workspace-divider">
            <div className="divider-handle"></div>
          </div>
        )}

        {viewMode !== 'input-focused' && (
          <div className={`workspace-panel output-panel ${loading ? 'loading' : ''}`}>
            <div className="panel-header">
              <h3>Output Workspace</h3>
              <div className={`panel-indicator output-indicator ${loading ? 'processing' : outputSection ? 'ready' : 'empty'}`}>
                <span className="indicator-dot"></span>
                <span>
                  {loading ? 'Processing...' : outputSection ? 'Ready' : 'Empty'}
                </span>
              </div>
            </div>
            <div className="panel-content">
              {loading ? (
                <div className="workspace-loading">
                  <div className="loading-animation">
                    <div className="loading-spinner"></div>
                    <p>Transforming your thoughts...</p>
                  </div>
                </div>
              ) : (
                outputSection || (
                  <div className="workspace-empty">
                    <div className="empty-state-icon">⚡</div>
                    <p>Your transformed content will appear here</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspaceLayout;

