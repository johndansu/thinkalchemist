import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from '../components/PersonaCard';
import { forgeAPI, savedAPI } from '../services/api';
import { useForgeLoading } from '../hooks/useForgeLoading';
import { FaUsers, FaGlobe, FaMap, FaUser, FaTheaterMasks, FaBook, FaSave, FaDownload, FaExpand, FaFileAlt, FaPaperPlane, FaArrowLeft, FaFileWord, FaFilePdf } from 'react-icons/fa';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

function CreativePersonasPage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personas');
  const [expandedCards, setExpandedCards] = useState({});

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText, 'creative_personas');
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge creative personas. Please try again.');
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
      await savedAPI.save(title, inputText, output, 'creative_personas');
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

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const creativePersonas = output?.results?.creativePersonas;
  const personas = creativePersonas?.personas || [];
  const world = creativePersonas?.world;
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
    if (!output || !creativePersonas) {
      alert('❌ No data to export. Please generate results first.');
      return;
    }

    const title = inputText.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'creative_personas';

    if (format === 'json') {
      try {
        const dataStr = JSON.stringify(output, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}_creative_personas.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export. Please try again.');
      }
    } else if (format === 'word') {
      handleExportWord(creativePersonas, title);
    } else if (format === 'pdf') {
      handleExportPDF(creativePersonas, title);
    }
  };

  const handleExportWord = async (data, title) => {
    try {
      const children = [];

      children.push(
        new Paragraph({
          text: 'Creative Personas & Worlds',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 300 },
        })
      );

      // Personas
      if (data.personas && data.personas.length > 0) {
        children.push(
          new Paragraph({
            text: 'Personas',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        data.personas.forEach((persona, idx) => {
          children.push(
            new Paragraph({
              text: `${persona.name} (Age ${persona.age})`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: `Occupation: ${persona.occupation}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: persona.background || '',
              spacing: { after: 100 },
            })
          );

          if (persona.pain_points && persona.pain_points.length > 0) {
            children.push(
              new Paragraph({
                text: 'Pain Points:',
                spacing: { before: 100, after: 50 },
              })
            );
            persona.pain_points.forEach((point) => {
              children.push(
                new Paragraph({
                  text: `• ${point}`,
                  spacing: { after: 50 },
                })
              );
            });
          }

          if (persona.quote) {
            children.push(
              new Paragraph({
                text: `Quote: "${persona.quote}"`,
                spacing: { before: 100, after: 100 },
              })
            );
          }

          if (persona.feedback) {
            children.push(
              new Paragraph({
                text: `Feedback: ${persona.feedback}`,
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      // World
      if (data.world) {
        children.push(
          new Paragraph({
            text: 'Creative World',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          })
        );

        if (data.world.setting) {
          children.push(
            new Paragraph({
              text: 'Setting',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: data.world.setting,
              spacing: { after: 200 },
            })
          );
        }

        if (data.world.characters && data.world.characters.length > 0) {
          children.push(
            new Paragraph({
              text: 'Characters',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
          data.world.characters.forEach((char) => {
            children.push(
              new Paragraph({
                text: `${char.name} - ${char.role}`,
                heading: HeadingLevel.HEADING_4,
                spacing: { before: 100, after: 50 },
              }),
              new Paragraph({
                text: char.description,
                spacing: { after: 100 },
              })
            );
          });
        }

        if (data.world.conflict) {
          children.push(
            new Paragraph({
              text: 'Conflict',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: data.world.conflict,
              spacing: { after: 200 },
            })
          );
        }

        if (data.world.micro_story) {
          children.push(
            new Paragraph({
              text: 'Micro-Story',
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: data.world.micro_story,
              spacing: { after: 200 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_creative_personas.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('❌ Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = async (data, title) => {
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

      addText('Creative Personas & Worlds', 20, true, 10);
      yPosition += 5;

      if (data.personas && data.personas.length > 0) {
        addText('Personas', 16, true, 8);
        yPosition += 3;

        data.personas.forEach((persona) => {
          addText(`${persona.name} (Age ${persona.age})`, 14, true, 7);
          addText(`Occupation: ${persona.occupation}`, 10, false, 5);
          if (persona.background) {
            addText(persona.background, 10, false, 5);
          }
          if (persona.quote) {
            addText(`"${persona.quote}"`, 10, false, 5);
          }
          yPosition += 5;
        });
      }

      if (data.world) {
        addText('Creative World', 16, true, 8);
        yPosition += 3;

        if (data.world.setting) {
          addText('Setting', 14, true, 7);
          addText(data.world.setting, 10, false, 5);
          yPosition += 3;
        }

        if (data.world.characters && data.world.characters.length > 0) {
          addText('Characters', 14, true, 7);
          yPosition += 3;
          data.world.characters.forEach((char) => {
            addText(`${char.name} - ${char.role}`, 12, true, 6);
            addText(char.description, 10, false, 5);
            yPosition += 3;
          });
        }

        if (data.world.micro_story) {
          addText('Micro-Story', 14, true, 7);
          addText(data.world.micro_story, 10, false, 5);
        }
      }

      pdf.save(`${title}_creative_personas.pdf`);
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

      <div className="creative-personas-interface">
        <div className="creative-input-container">
          <div className="creative-input-header">
            <div className="input-header-icon">
              <FaUsers />
            </div>
            <div>
              <h1>Creative Personas & Worlds</h1>
              <p>Transform your concept into immersive personas and a rich creative world</p>
            </div>
          </div>

          <div className="creative-input-body">
            <div className="input-field">
              <label className="input-label">
                <FaFileAlt className="label-icon" />
                Your Concept
              </label>
              <textarea
                className="creative-textarea"
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
                placeholder="Enter your product idea, creative concept, or world-building seed here..."
                rows={8}
              />
              <div className="input-actions">
                <button
                  className="forge-creative-btn"
                  onClick={handleForge}
                  disabled={!inputText.trim() || loading}
                >
                  {loading ? 'Forging...' : (
                    <>
                      <FaPaperPlane /> Forge Creative Personas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {output && creativePersonas && (
          <div className="creative-results-canvas">
            <div className="canvas-header-bar">
              <div className="canvas-title">
                <h2>Creative Personas & World</h2>
                <span className="status-badge">Forged</span>
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

            <div className="creative-sections-tabs">
              <button
                className={`creative-tab ${activeSection === 'personas' ? 'active' : ''}`}
                onClick={() => setActiveSection('personas')}
              >
                <FaUsers /> Personas ({personas.length})
              </button>
              {world && (
                <>
                  <button
                    className={`creative-tab ${activeSection === 'world' ? 'active' : ''}`}
                    onClick={() => setActiveSection('world')}
                  >
                    <FaGlobe /> World
                  </button>
                  <button
                    className={`creative-tab ${activeSection === 'characters' ? 'active' : ''}`}
                    onClick={() => setActiveSection('characters')}
                  >
                    <FaUser /> Characters ({world.characters?.length || 0})
                  </button>
                  <button
                    className={`creative-tab ${activeSection === 'story' ? 'active' : ''}`}
                    onClick={() => setActiveSection('story')}
                  >
                    <FaBook /> Story
                  </button>
                </>
              )}
            </div>

            <div className="creative-content-panel">
              {activeSection === 'personas' && personas.length > 0 && (
                <div className="personas-section">
                  <div className="personas-grid-view">
                    {personas.map((persona, idx) => (
                      <PersonaCard 
                        key={idx} 
                        persona={persona}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'world' && world && (
                <div className="world-section">
                  <div className="world-cards">
                    <div className="world-card setting-card">
                      <div className="card-header">
                        <FaMap className="card-icon" />
                        <h3>Setting</h3>
                      </div>
                      <div className="card-body">
                        <p>{world.setting}</p>
                      </div>
                    </div>

                    {world.map_description && (
                      <div className="world-card map-card">
                        <div className="card-header">
                          <FaMap className="card-icon" />
                          <h3>Locations</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.map_description}</p>
                        </div>
                      </div>
                    )}

                    {world.conflict && (
                      <div className="world-card conflict-card">
                        <div className="card-header">
                          <FaTheaterMasks className="card-icon" />
                          <h3>Conflict</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.conflict}</p>
                        </div>
                      </div>
                    )}

                    {world.tone && (
                      <div className="world-card tone-card">
                        <div className="card-header">
                          <FaTheaterMasks className="card-icon" />
                          <h3>Tone</h3>
                        </div>
                        <div className="card-body">
                          <p>{world.tone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'characters' && world?.characters && (
                <div className="characters-section">
                  <div className="characters-grid">
                    {world.characters.map((char, idx) => (
                      <div
                        key={idx}
                        className={`character-card ${expandedCards[`char-${idx}`] ? 'expanded' : ''}`}
                      >
                        <div className="character-header">
                          <div>
                            <h3>{char.name}</h3>
                            <span className="character-role">{char.role}</span>
                          </div>
                          <button
                            className="expand-character-btn"
                            onClick={() => toggleCard(`char-${idx}`)}
                          >
                            <FaExpand />
                          </button>
                        </div>
                        <div className="character-body">
                          <p>{char.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'story' && world?.micro_story && (
                <div className="story-section">
                  <div className="story-content">
                    <h3>Micro-Story</h3>
                    <div className="story-text">
                      {world.micro_story}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="creative-loading">
            <div className="loading-spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default CreativePersonasPage;

