import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaSearch, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaRocket, FaChartLine, FaPuzzlePiece, FaSave, FaDownload, FaLightbulb, FaFileAlt, FaPaperPlane, FaArrowLeft, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

function StrategicAnalysisPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'strategic_analysis');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to analyze strategically. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'strategic_analysis');
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

  const analysis = output?.results?.strategicAnalysis;
  const risks = analysis?.hidden_risks || [];
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
    if (!output || !analysis) {
      alert('❌ No analysis data to export. Please generate results first.');
      return;
    }

    const title = inputText.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'strategic_analysis';

    if (format === 'json') {
      try {
        const dataStr = JSON.stringify(output, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}_strategic_analysis.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export. Please try again.');
      }
    } else if (format === 'word') {
      handleExportWord(analysis, title);
    } else if (format === 'pdf') {
      handleExportPDF(analysis, title);
    }
  };

  const handleExportWord = async (analysis, title) => {
    try {
      const children = [];

      children.push(
        new Paragraph({
          text: 'Strategic Analysis',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 300 },
        })
      );

      if (analysis.core_essence) {
        children.push(
          new Paragraph({
            text: 'Core Essence',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: analysis.core_essence,
            spacing: { after: 300 },
          })
        );
      }

      if (analysis.one_line_pitch) {
        children.push(
          new Paragraph({
            text: 'One-Line Pitch',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: analysis.one_line_pitch,
            spacing: { after: 300 },
          })
        );
      }

      if (analysis.key_components && analysis.key_components.length > 0) {
        children.push(
          new Paragraph({
            text: 'Key Components',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        analysis.key_components.forEach((component) => {
          children.push(
            new Paragraph({
              text: `${component.name} (${component.importance})`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: component.description,
              spacing: { after: 200 },
            })
          );
        });
      }

      if (analysis.best_case) {
        children.push(
          new Paragraph({
            text: 'Best Case Scenario',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: analysis.best_case,
            spacing: { after: 300 },
          })
        );
      }

      if (analysis.worst_case) {
        children.push(
          new Paragraph({
            text: 'Worst Case Scenario',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: analysis.worst_case,
            spacing: { after: 300 },
          })
        );
      }

      if (risks.length > 0) {
        children.push(
          new Paragraph({
            text: 'Hidden Risks',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        risks.forEach((risk) => {
          const riskText = typeof risk === 'string' 
            ? risk 
            : (risk.risk || risk.description || `${risk.hidden ? 'Hidden: ' : ''}${risk.impact || ''}${risk.warning_signs ? ` Warning: ${risk.warning_signs}` : ''}` || JSON.stringify(risk));
          children.push(
            new Paragraph({
              text: `• ${riskText}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      if (analysis.strategic_insights) {
        children.push(
          new Paragraph({
            text: 'Strategic Insights',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            text: analysis.strategic_insights,
            spacing: { after: 300 },
          })
        );
      }

      if (analysis.potential_applications && analysis.potential_applications.length > 0) {
        children.push(
          new Paragraph({
            text: 'Potential Applications',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        analysis.potential_applications.forEach((app) => {
          children.push(
            new Paragraph({
              text: `${app.title} (${app.feasibility} feasibility)`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: app.description,
              spacing: { after: 200 },
            })
          );
        });
      }

      if (analysis.next_steps && analysis.next_steps.length > 0) {
        children.push(
          new Paragraph({
            text: 'Next Steps',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        analysis.next_steps.forEach((step, idx) => {
          const stepText = typeof step === 'string' ? step : (step.step || step.description || JSON.stringify(step));
          children.push(
            new Paragraph({
              text: `${idx + 1}. ${stepText}`,
              spacing: { after: 100 },
            })
          );
        });
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_strategic_analysis.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('❌ Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = async (analysis, title) => {
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

      addText('Strategic Analysis', 20, true, 10);
      yPosition += 5;

      if (analysis.core_essence) {
        addText('Core Essence', 16, true, 8);
        addText(analysis.core_essence, 11, false, 6);
        yPosition += 5;
      }

      if (analysis.one_line_pitch) {
        addText('One-Line Pitch', 16, true, 8);
        addText(analysis.one_line_pitch, 11, false, 6);
        yPosition += 5;
      }

      if (analysis.key_components && analysis.key_components.length > 0) {
        addText('Key Components', 16, true, 8);
        yPosition += 3;
        analysis.key_components.forEach((component) => {
          addText(`${component.name} (${component.importance})`, 14, true, 7);
          addText(component.description, 10, false, 5);
          yPosition += 3;
        });
      }

      if (analysis.best_case) {
        addText('Best Case Scenario', 16, true, 8);
        addText(analysis.best_case, 11, false, 6);
        yPosition += 5;
      }

      if (analysis.worst_case) {
        addText('Worst Case Scenario', 16, true, 8);
        addText(analysis.worst_case, 11, false, 6);
        yPosition += 5;
      }

      if (risks.length > 0) {
        addText('Hidden Risks', 16, true, 8);
        yPosition += 3;
        risks.forEach((risk) => {
          const riskText = typeof risk === 'string' 
            ? risk 
            : (risk.risk || risk.description || `${risk.hidden ? 'Hidden: ' : ''}${risk.impact || ''}${risk.warning_signs ? ` Warning: ${risk.warning_signs}` : ''}` || JSON.stringify(risk));
          addText(`• ${riskText}`, 10, false, 5);
        });
        yPosition += 3;
      }

      if (analysis.strategic_insights) {
        addText('Strategic Insights', 16, true, 8);
        addText(analysis.strategic_insights, 11, false, 6);
        yPosition += 5;
      }

      if (analysis.potential_applications && analysis.potential_applications.length > 0) {
        addText('Potential Applications', 16, true, 8);
        yPosition += 3;
        analysis.potential_applications.forEach((app) => {
          addText(`${app.title} (${app.feasibility} feasibility)`, 14, true, 7);
          addText(app.description, 10, false, 5);
          yPosition += 3;
        });
      }

      if (analysis.next_steps && analysis.next_steps.length > 0) {
        addText('Next Steps', 16, true, 8);
        yPosition += 3;
        analysis.next_steps.forEach((step, idx) => {
          const stepText = typeof step === 'string' ? step : (step.step || step.description || JSON.stringify(step));
          addText(`${idx + 1}. ${stepText}`, 10, false, 5);
        });
      }

      pdf.save(`${title}_strategic_analysis.pdf`);
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

      <div className="business-analysis-interface">
        <div className="analysis-form-container">
          <div className="analysis-form-header">
            <div className="form-header-icon">
              <FaChartLine />
            </div>
            <div>
              <h1>Strategic Analysis</h1>
              <p>Comprehensive strategic analysis with breakdown and stress testing</p>
            </div>
          </div>

          <div className="analysis-form-body">
            <div className="form-field">
              <label className="form-label">
                <FaFileAlt className="label-icon" />
                Your Concept
              </label>
              <textarea
                className="analysis-textarea"
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
                placeholder="Enter your business idea, product concept, or strategic initiative here..."
                rows={8}
              />
              <div className="form-actions">
                <button
                  className="submit-analysis-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Analyzing...' : (
                    <>
                      <FaPaperPlane /> Analyze Strategically
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && analysis && (
          <div className="strategic-analysis-results">
            <div className="analysis-header-bar">
              <div className="analysis-title">
                <h2>Strategic Analysis</h2>
                <span className="analysis-status-badge">Complete</span>
              </div>
              <div className="analysis-actions-bar">
                <button onClick={handleSave} className="analysis-action save-action">
                  <FaSave /> Save
                </button>
                <div className="export-dropdown">
                  <button className="analysis-action export-action" onClick={(e) => {
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

            <div className="analysis-tabs">
              <button
                className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaLightbulb /> Overview
              </button>
              <button
                className={`analysis-tab ${activeTab === 'components' ? 'active' : ''}`}
                onClick={() => setActiveTab('components')}
              >
                <FaPuzzlePiece /> Components ({analysis.key_components?.length || 0})
              </button>
              <button
                className={`analysis-tab ${activeTab === 'scenarios' ? 'active' : ''}`}
                onClick={() => setActiveTab('scenarios')}
              >
                <FaChartLine /> Scenarios
              </button>
              <button
                className={`analysis-tab ${activeTab === 'risks' ? 'active' : ''}`}
                onClick={() => setActiveTab('risks')}
              >
                <FaExclamationTriangle /> Risks ({risks.length})
              </button>
              <button
                className={`analysis-tab ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                <FaRocket /> Applications ({analysis.potential_applications?.length || 0})
              </button>
            </div>

            <div className="analysis-content-panel">
              {activeTab === 'overview' && (
                <div className="overview-tab-content">
                  <div className="essence-card">
                    <h3>Core Essence</h3>
                    <p>{analysis.core_essence}</p>
                  </div>

                  <div className="pitch-card">
                    <h3>One-Line Pitch</h3>
                    <p className="pitch-text">{analysis.one_line_pitch}</p>
                  </div>

                  <div className="insights-card">
                    <h3>Strategic Insights</h3>
                    <p>{analysis.strategic_insights}</p>
                  </div>

                  {analysis.next_steps && analysis.next_steps.length > 0 && (
                    <div className="next-steps-card">
                      <h3>Next Steps</h3>
                      <ol>
                        {analysis.next_steps.map((step, idx) => {
                          const stepText = typeof step === 'string' ? step : (step.step || step.description || JSON.stringify(step));
                          return <li key={idx}>{stepText}</li>;
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'components' && analysis.key_components && (
                <div className="components-tab-content">
                  <div className="components-grid">
                    {analysis.key_components.map((component, idx) => (
                      <div key={idx} className={`component-card ${component.importance}`}>
                        <div className="component-header">
                          <h3>{component.name}</h3>
                          <span className={`importance-badge ${component.importance}`}>
                            {component.importance}
                          </span>
                        </div>
                        <p>{component.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'scenarios' && (
                <div className="scenarios-tab-content">
                  <div className="scenario-card best-case">
                    <div className="scenario-header">
                      <FaArrowUp className="scenario-icon" />
                      <h3>Best Case</h3>
                    </div>
                    <p>{analysis.best_case}</p>
                  </div>

                  <div className="scenario-card worst-case">
                    <div className="scenario-header">
                      <FaArrowDown className="scenario-icon" />
                      <h3>Worst Case</h3>
                    </div>
                    <p>{analysis.worst_case}</p>
                  </div>

                  {analysis.improvement_suggestion && (
                    <div className="improvement-card">
                      <h3>10× Improvement</h3>
                      <p>{analysis.improvement_suggestion}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && risks.length > 0 && (
                <div className="risks-tab-content">
                  <div className="risks-grid">
                    {risks.map((risk, idx) => {
                      const riskText = typeof risk === 'string' 
                        ? risk 
                        : (risk.risk || risk.description || `${risk.hidden ? 'Hidden: ' : ''}${risk.impact || ''}${risk.warning_signs ? ` Warning: ${risk.warning_signs}` : ''}` || JSON.stringify(risk));
                      return (
                        <div key={idx} className="risk-card">
                          <FaExclamationTriangle className="risk-icon" />
                          <p>{riskText}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'applications' && analysis.potential_applications && (
                <div className="applications-tab-content">
                  <div className="applications-grid">
                    {analysis.potential_applications.map((app, idx) => (
                      <div key={idx} className={`application-card ${app.feasibility}`}>
                        <div className="application-header">
                          <h3>{app.title}</h3>
                          <span className={`feasibility-badge ${app.feasibility}`}>
                            {app.feasibility} feasibility
                          </span>
                        </div>
                        <p>{app.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="analysis-loading">
            <div className="loading-spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default StrategicAnalysisPage;

