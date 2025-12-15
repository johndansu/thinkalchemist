import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaArrowRight, FaSave, FaDownload, FaSync, FaPaperPlane, FaArrowLeft, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

function PurificationPage() {
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
      await savedAPI.save(title, inputText, output, 'purification');
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

  const loadingMessage = useForgeLoading(loading);
  const cleanedText = output?.results?.purification?.cleaned_text || '';
  const improvements = output?.results?.purification?.improvements || [];

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-menu').forEach(menu => menu.classList.remove('show'));
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleExport = (format = 'json') => {
    if (!output || !cleanedText) {
      alert('❌ No data to export. Please generate results first.');
      return;
    }

    const title = inputText.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'purified_document';

    if (format === 'json') {
      try {
        const dataStr = JSON.stringify(output, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}_purified.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export. Please try again.');
      }
    } else if (format === 'word') {
      handleExportWord(cleanedText, improvements, title);
    } else if (format === 'pdf') {
      handleExportPDF(cleanedText, improvements, title);
    }
  };

  const handleExportWord = async (text, improvements, title) => {
    try {
      const children = [];

      children.push(
        new Paragraph({
          text: 'Purified Document',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 300 },
        })
      );

      if (improvements && improvements.length > 0) {
        children.push(
          new Paragraph({
            text: 'Improvements Made',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        improvements.forEach((improvement) => {
          children.push(
            new Paragraph({
              text: `• ${improvement}`,
              spacing: { after: 100 },
            })
          );
        });
        children.push(
          new Paragraph({
            text: '',
            spacing: { after: 300 },
          })
        );
      }

      // Split text into paragraphs
      const paragraphs = text.split('\n').filter(p => p.trim());
      paragraphs.forEach((para) => {
        children.push(
          new Paragraph({
            text: para.trim(),
            spacing: { after: 200 },
          })
        );
      });

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_purified.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('❌ Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = async (text, improvements, title) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pdf.internal.pageSize.width - (margin * 2);

      const addText = (text, fontSize = 12, isBold = false, spacing = lineHeight) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        if (yPosition + (lines.length * spacing) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line) => {
          pdf.text(line, margin, yPosition);
          yPosition += spacing;
        });
        yPosition += spacing * 0.5;
      };

      addText('Purified Document', 20, true, 10);
      yPosition += 5;

      if (improvements && improvements.length > 0) {
        addText('Improvements Made', 16, true, 8);
        yPosition += 3;
        improvements.forEach((improvement) => {
          addText(`• ${improvement}`, 10, false, 5);
        });
        yPosition += 5;
      }

      // Split text into paragraphs
      const paragraphs = text.split('\n').filter(p => p.trim());
      paragraphs.forEach((para) => {
        addText(para.trim(), 11, false, 6);
      });

      pdf.save(`${title}_purified.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('❌ Failed to export to PDF. Please try again.');
    }
  };

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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputText.trim() && !loading) {
                  handleForge();
                }
              }
            }}
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
                <button onClick={handleSave} className="comparison-btn save-btn">
                  <FaSave /> Save Document
                </button>
                <div className="export-dropdown">
                  <button className="comparison-btn export-btn" onClick={(e) => {
                    e.stopPropagation();
                    const menu = e.currentTarget.nextElementSibling;
                    menu.classList.toggle('show');
                  }}>
                    <FaDownload /> Export <span className="dropdown-arrow">▼</span>
                  </button>
                  <div className="export-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { handleExport('json'); document.querySelector('.export-menu')?.classList.remove('show'); }} className="export-option">
                      <FaFileAlt /> JSON
                    </button>
                    <button onClick={() => { handleExport('word'); document.querySelector('.export-menu')?.classList.remove('show'); }} className="export-option">
                      <FaFileWord /> Word
                    </button>
                    <button onClick={() => { handleExport('pdf'); document.querySelector('.export-menu')?.classList.remove('show'); }} className="export-option">
                      <FaFilePdf /> PDF
                    </button>
                  </div>
                </div>
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
          <p>{loadingMessage}</p>
        </div>
      )}
      </div>
    </>
  );
}

export default PurificationPage;
