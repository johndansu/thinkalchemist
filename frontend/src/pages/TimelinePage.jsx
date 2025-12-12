import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TimelineView from '../components/TimelineView';
import { forgeAPI, savedAPI } from '../services/api';
import { FaCalendarAlt, FaSearch, FaSearchPlus, FaSearchMinus, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function TimelinePage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [orientation, setOrientation] = useState('vertical');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'timeline');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      const errorMessage = error.message || 'Failed to forge timeline';
      
      // Show more helpful error messages
      if (errorMessage.includes('Cannot connect to Ollama') || errorMessage.includes('Ollama is running')) {
        alert(`⚠️ ${errorMessage}\n\nMake sure Ollama is running on your computer.`);
      } else if (errorMessage.includes('not found') && errorMessage.includes('ollama pull')) {
        alert(`⚠️ ${errorMessage}\n\nInstall the model using the command shown above.`);
      } else if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        alert('⚠️ LLM API key is not configured. Please add GROQ_API_KEY to backend/.env file.\n\nGet a free API key at: https://console.groq.com');
      } else if (errorMessage.includes('Invalid') && errorMessage.includes('key')) {
        alert('⚠️ Invalid LLM API key. Please check your GROQ_API_KEY in backend/.env file.');
      } else {
        alert(`Failed to forge timeline: ${errorMessage}\n\nPlease try again or check the backend logs for more details.`);
      }
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
      await savedAPI.save(title, inputText, output, 'timeline');
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

  const handleExport = (format = 'json') => {
    if (!output || !output.results || !output.results.timeline) {
      alert('❌ No timeline data to export');
      return;
    }

    const title = inputText.substring(0, 30).replace(/[^a-z0-9]/gi, '_') || 'timeline';
    const timeline = output.results.timeline;

    if (format === 'json') {
      const dataStr = JSON.stringify(timeline, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_timeline.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'word') {
      handleExportWord(timeline, title);
    } else if (format === 'pdf') {
      handleExportPDF(timeline, title);
    }
  };

  const handleExportWord = async (timeline, title) => {
    try {
      const children = [
        new Paragraph({
          text: 'Timeline',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ];

      // Add summary if available
      if (timeline.summary) {
        children.push(
          new Paragraph({
            text: 'Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            text: timeline.summary,
            spacing: { after: 400 },
          })
        );
      }

      // Add events
      if (timeline.events && timeline.events.length > 0) {
        children.push(
          new Paragraph({
            text: 'Events',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 300 },
          })
        );

        timeline.events.forEach((event, idx) => {
          const dateStr = event.start && event.end && event.start !== event.end
            ? `${event.start} - ${event.end}`
            : event.timestamp || event.start || 'Date TBD';

          children.push(
            new Paragraph({
              text: `Event ${idx + 1}: ${event.event || event.title || 'Untitled Event'}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 },
            }),
            new Paragraph({
              text: `Date: ${dateStr}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: event.description || 'No description available.',
              spacing: { after: 200 },
            })
          );

          if (event.impact) {
            children.push(
              new Paragraph({
                text: 'Impact:',
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                text: event.impact,
                spacing: { after: 200 },
              })
            );
          }

          if (event.context) {
            children.push(
              new Paragraph({
                text: 'Context:',
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                text: event.context,
                spacing: { after: 400 },
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_timeline.docx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('❌ Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = async (timeline, title) => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pdf.internal.pageSize.width - (margin * 2);

      // Helper function to add text with word wrap
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

      // Title
      addText('Timeline', 20, true, 10);
      yPosition += 5;

      // Summary
      if (timeline.summary) {
        addText('Summary', 16, true, 8);
        addText(timeline.summary, 11, false, 6);
        yPosition += 5;
      }

      // Events
      if (timeline.events && timeline.events.length > 0) {
        addText('Events', 16, true, 8);
        yPosition += 3;

        timeline.events.forEach((event, idx) => {
          const dateStr = event.start && event.end && event.start !== event.end
            ? `${event.start} - ${event.end}`
            : event.timestamp || event.start || 'Date TBD';

          addText(`Event ${idx + 1}: ${event.event || event.title || 'Untitled Event'}`, 14, true, 7);
          addText(`Date: ${dateStr}`, 10, false, 5);
          addText(event.description || 'No description available.', 10, false, 5);

          if (event.impact) {
            addText('Impact:', 11, true, 6);
            addText(event.impact, 10, false, 5);
          }

          if (event.context) {
            addText('Context:', 11, true, 6);
            addText(event.context, 10, false, 5);
          }

          yPosition += 5;
        });
      }

      pdf.save(`${title}_timeline.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('❌ Failed to export to PDF. Please try again.');
    }
  };

  const events = output?.results?.timeline?.events || [];
  const filteredEvents = searchQuery
    ? events.filter(e =>
        e.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.event?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <>
      {/* Back Button - Outside Container */}
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="timeline-visualization-interface">
        {/* Timeline Input - Document Style */}
        <div className="timeline-document-container">
        <div className="document-header">
          <div className="document-icon">
            <FaCalendarAlt />
          </div>
          <div>
            <h1>Timeline Document</h1>
            <p>Enter events, dates, or chronological narrative</p>
          </div>
        </div>

        <div className="document-editor">
          <div className="editor-toolbar">
            <span className="toolbar-label">Timeline Content</span>
          </div>
          <textarea
            className="timeline-editor-textarea"
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
            placeholder="Enter your timeline content here. Include dates, events, or a narrative with sequential happenings..."
            rows={8}
          />
          <div className="editor-footer">
            <button
              className="process-timeline-btn"
              onClick={handleForge}
              disabled={!inputText.trim() || loading}
            >
              {loading ? 'Processing...' : (
                <>
                  <FaPaperPlane /> Extract Timeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Visualization Canvas */}
      {output && events.length > 0 && (
        <div className="timeline-canvas-workspace">
          <div className="canvas-toolbar">
            <div className="toolbar-left">
              <h2>Timeline Visualization</h2>
              <span className="events-badge">{events.length} Events</span>
            </div>

            <div className="canvas-controls">
              <div className="search-control">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="timeline-search"
                />
              </div>

              <div className="orientation-controls">
                <button
                  className={`orient-btn ${orientation === 'vertical' ? 'active' : ''}`}
                  onClick={() => setOrientation('vertical')}
                >
                  Vertical
                </button>
                <button
                  className={`orient-btn ${orientation === 'horizontal' ? 'active' : ''}`}
                  onClick={() => setOrientation('horizontal')}
                >
                  Horizontal
                </button>
              </div>

              <div className="zoom-controls">
                <button
                  className="zoom-control-btn"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <FaSearchMinus />
                </button>
                <span className="zoom-display">{Math.round(zoom * 100)}%</span>
                <button
                  className="zoom-control-btn"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                >
                  <FaSearchPlus />
                </button>
              </div>

              <div className="canvas-actions">
                <button onClick={handleSave} className="canvas-btn save-btn">
                  <FaSave /> Save Timeline
                </button>
                <div className="export-dropdown">
                  <button className="canvas-btn export-btn" onClick={(e) => {
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

          <div className="timeline-viewport">
            <div
              className={`timeline-visualization ${orientation}`}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <TimelineView events={filteredEvents} orientation={orientation} />
            </div>
          </div>
          
          {output.results.timeline.summary && (
            <div className="timeline-summary-enhanced">
              <div className="summary-header">
                <h3>Timeline Summary</h3>
              </div>
              <p className="summary-text">{output.results.timeline.summary}</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="timeline-loading">
          <div className="loading-spinner"></div>
          <p>Extracting and structuring timeline events...</p>
        </div>
      )}
      </div>
    </>
  );
}

export default TimelinePage;
