import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaLightbulb, FaRandom, FaQuestionCircle, FaFlask, FaSave, FaDownload, FaFileAlt, FaPaperPlane, FaArrowLeft, FaMagic, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

function ThoughtCatalystPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('insights');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'thought_catalyst');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to catalyze thoughts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!output) return;

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
      await savedAPI.save(title, inputText, output, 'thought_catalyst');
      alert('✅ Saved to your library!');
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save';
      
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

  const catalyst = output?.results?.thoughtCatalyst;
  const loadingMessage = useForgeLoading(loading);

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
    if (!output || !catalyst) {
      alert('❌ No data to export. Please generate results first.');
      return;
    }

    const title = inputText.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'thought_catalyst';

    if (format === 'json') {
      try {
        const dataStr = JSON.stringify(output, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}_thought_catalyst.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export. Please try again.');
      }
    } else if (format === 'word') {
      handleExportWord(catalyst, title);
    } else if (format === 'pdf') {
      handleExportPDF(catalyst, title);
    }
  };

  const handleExportWord = async (catalyst, title) => {
    try {
      const children = [];

      children.push(
        new Paragraph({
          text: 'Thought Catalyst',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 300 },
        })
      );

      if (catalyst.core_input) {
        children.push(
          new Paragraph({
            text: 'Input',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: catalyst.core_input,
            spacing: { after: 300 },
          })
        );
      }

      if (catalyst.random_insights && catalyst.random_insights.length > 0) {
        children.push(
          new Paragraph({
            text: 'Random Insights',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        catalyst.random_insights.forEach((insight) => {
          children.push(
            new Paragraph({
              text: `• ${insight}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (catalyst.unexpected_connections && catalyst.unexpected_connections.length > 0) {
        children.push(
          new Paragraph({
            text: 'Unexpected Connections',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        catalyst.unexpected_connections.forEach((connection) => {
          children.push(
            new Paragraph({
              text: `• ${connection}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (catalyst.alternative_angles && catalyst.alternative_angles.length > 0) {
        children.push(
          new Paragraph({
            text: 'Alternative Angles',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        catalyst.alternative_angles.forEach((angle) => {
          children.push(
            new Paragraph({
              text: `• ${angle}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (catalyst.thought_experiments && catalyst.thought_experiments.length > 0) {
        children.push(
          new Paragraph({
            text: 'Thought Experiments',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        catalyst.thought_experiments.forEach((experiment) => {
          children.push(
            new Paragraph({
              text: `• ${experiment}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (catalyst.creative_questions && catalyst.creative_questions.length > 0) {
        children.push(
          new Paragraph({
            text: 'Creative Questions',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );
        catalyst.creative_questions.forEach((question) => {
          children.push(
            new Paragraph({
              text: `• ${question}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (catalyst.synthesis) {
        children.push(
          new Paragraph({
            text: 'Synthesis',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: catalyst.synthesis,
            spacing: { after: 300 },
          })
        );
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_thought_catalyst.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('❌ Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = async (catalyst, title) => {
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

      addText('Thought Catalyst', 20, true, 10);
      yPosition += 5;

      if (catalyst.core_input) {
        addText('Input', 16, true, 8);
        addText(catalyst.core_input, 11, false, 6);
        yPosition += 5;
      }

      if (catalyst.random_insights && catalyst.random_insights.length > 0) {
        addText('Random Insights', 16, true, 8);
        yPosition += 3;
        catalyst.random_insights.forEach((insight) => {
          addText(`• ${insight}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (catalyst.unexpected_connections && catalyst.unexpected_connections.length > 0) {
        addText('Unexpected Connections', 16, true, 8);
        yPosition += 3;
        catalyst.unexpected_connections.forEach((connection) => {
          addText(`• ${connection}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (catalyst.alternative_angles && catalyst.alternative_angles.length > 0) {
        addText('Alternative Angles', 16, true, 8);
        yPosition += 3;
        catalyst.alternative_angles.forEach((angle) => {
          addText(`• ${angle}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (catalyst.thought_experiments && catalyst.thought_experiments.length > 0) {
        addText('Thought Experiments', 16, true, 8);
        yPosition += 3;
        catalyst.thought_experiments.forEach((experiment) => {
          addText(`• ${experiment}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (catalyst.creative_questions && catalyst.creative_questions.length > 0) {
        addText('Creative Questions', 16, true, 8);
        yPosition += 3;
        catalyst.creative_questions.forEach((question) => {
          addText(`• ${question}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (catalyst.synthesis) {
        addText('Synthesis', 16, true, 8);
        addText(catalyst.synthesis, 11, false, 6);
      }

      pdf.save(`${title}_thought_catalyst.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('❌ Failed to export to PDF. Please try again.');
    }
  };

  return (
    <>
      <div className="process-back-button-container">
        <button className="back-button-redesigned" onClick={() => navigate('/forge')}>
          <FaArrowLeft className="back-icon" />
          <span className="back-text">Back to Forge</span>
        </button>
      </div>

      <div className="thought-catalyst-interface">
        <div className="catalyst-input-container">
          <div className="catalyst-input-header">
            <div className="input-header-icon">
              <FaFlask />
            </div>
            <div>
              <h1>Thought Catalyst</h1>
              <p>Spark unexpected insights, connections, and creative ways of thinking</p>
            </div>
          </div>

          <div className="catalyst-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Thought
              </label>
              <textarea
                className="catalyst-textarea"
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
                placeholder="Enter any thought, idea, or concept to catalyze into unexpected insights..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="catalyze-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Catalyzing...' : (
                    <>
                      <FaMagic /> Catalyze Thoughts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && catalyst && (
          <div className="catalyst-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Catalyzed Thoughts</h2>
                <span className="status-badge">Sparks Generated</span>
              </div>
              <div className="canvas-actions-bar">
                <button onClick={handleSave} className="canvas-action save-action">
                  <FaSave /> Save
                </button>
                <div className="export-dropdown">
                  <button className="canvas-action export-action" onClick={(e) => {
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

            {catalyst.core_input && (
              <div className="core-input-card">
                <h3>Input</h3>
                <p>{catalyst.core_input}</p>
              </div>
            )}

            <div className="catalyst-sections-tabs">
              <button
                className={`catalyst-tab ${activeSection === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveSection('insights')}
              >
                <FaLightbulb /> Random Insights ({catalyst.random_insights?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'connections' ? 'active' : ''}`}
                onClick={() => setActiveSection('connections')}
              >
                <FaRandom /> Connections ({catalyst.unexpected_connections?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'angles' ? 'active' : ''}`}
                onClick={() => setActiveSection('angles')}
              >
                <FaFlask /> Alternative Angles ({catalyst.alternative_angles?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'experiments' ? 'active' : ''}`}
                onClick={() => setActiveSection('experiments')}
              >
                <FaQuestionCircle /> Thought Experiments ({catalyst.thought_experiments?.length || 0})
              </button>
              <button
                className={`catalyst-tab ${activeSection === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveSection('questions')}
              >
                <FaQuestionCircle /> Creative Questions ({catalyst.creative_questions?.length || 0})
              </button>
            </div>

            <div className="catalyst-content-panel">
              {activeSection === 'insights' && catalyst.random_insights && (
                <div className="insights-section">
                  <div className="insights-grid">
                    {catalyst.random_insights.map((insight, idx) => (
                      <div key={idx} className="insight-card">
                        <FaLightbulb className="insight-icon" />
                        <p>{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'connections' && catalyst.unexpected_connections && (
                <div className="connections-section">
                  <div className="connections-grid">
                    {catalyst.unexpected_connections.map((connection, idx) => (
                      <div key={idx} className="connection-card">
                        <FaRandom className="connection-icon" />
                        <p>{connection}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'angles' && catalyst.alternative_angles && (
                <div className="angles-section">
                  <div className="angles-grid">
                    {catalyst.alternative_angles.map((angle, idx) => (
                      <div key={idx} className="angle-card">
                        <FaFlask className="angle-icon" />
                        <p>{angle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'experiments' && catalyst.thought_experiments && (
                <div className="experiments-section">
                  <div className="experiments-grid">
                    {catalyst.thought_experiments.map((experiment, idx) => (
                      <div key={idx} className="experiment-card">
                        <FaQuestionCircle className="experiment-icon" />
                        <p>{experiment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'questions' && catalyst.creative_questions && (
                <div className="questions-section">
                  <div className="questions-grid">
                    {catalyst.creative_questions.map((question, idx) => (
                      <div key={idx} className="question-card">
                        <FaQuestionCircle className="question-icon" />
                        <p>{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {catalyst.synthesis && (
              <div className="synthesis-card">
                <h3>
                  <FaMagic className="card-icon" />
                  Synthesis
                </h3>
                <p>{catalyst.synthesis}</p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="catalyst-loading">
            <div className="loading-spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ThoughtCatalystPage;

