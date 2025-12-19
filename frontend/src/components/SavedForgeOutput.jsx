import React, { useState } from 'react';
import PersonaCard from './PersonaCard';
import TimelineView from './TimelineView';
import { 
  FaLightbulb, 
  FaPuzzlePiece, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaRocket,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaGlobe,
  FaTheaterMasks,
  FaBook,
  FaRandom,
  FaQuestionCircle,
  FaFlask,
  FaMagic
} from 'react-icons/fa';

function SavedForgeOutput({ output, mode }) {
  if (!output || !output.results) {
    return <div className="saved-output-empty">No output data available.</div>;
  }

  const results = output.results;

  // Strategic Analysis
  if (mode === 'strategic_analysis' && results.strategicAnalysis) {
    const analysis = results.strategicAnalysis;
    const risks = analysis.hidden_risks || [];
    const [activeTab, setActiveTab] = useState('overview');

    return (
      <div className="saved-strategic-analysis">
        <div className="saved-analysis-tabs">
          <button
            className={`saved-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaLightbulb /> Overview
          </button>
          <button
            className={`saved-tab ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            <FaPuzzlePiece /> Components
          </button>
          <button
            className={`saved-tab ${activeTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenarios')}
          >
            <FaChartLine /> Scenarios
          </button>
          <button
            className={`saved-tab ${activeTab === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            <FaExclamationTriangle /> Risks
          </button>
          <button
            className={`saved-tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <FaRocket /> Applications
          </button>
        </div>

        <div className="saved-analysis-content">
          {activeTab === 'overview' && (
            <div>
              {analysis.core_essence && (
                <div className="saved-card">
                  <h3>Core Essence</h3>
                  <p>{analysis.core_essence}</p>
                </div>
              )}
              {analysis.one_line_pitch && (
                <div className="saved-card">
                  <h3>One-Line Pitch</h3>
                  <p>{analysis.one_line_pitch}</p>
                </div>
              )}
              {analysis.strategic_insights && (
                <div className="saved-card">
                  <h3>Strategic Insights</h3>
                  <p>{analysis.strategic_insights}</p>
                </div>
              )}
              {analysis.next_steps && analysis.next_steps.length > 0 && (
                <div className="saved-card">
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
            <div className="saved-components-grid">
              {analysis.key_components.map((component, idx) => (
                <div key={idx} className="saved-card">
                  <h3>{component.name}</h3>
                  <span className="saved-badge">{component.importance}</span>
                  <p>{component.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div>
              {analysis.best_case && (
                <div className="saved-card">
                  <h3><FaArrowUp /> Best Case</h3>
                  <p>{analysis.best_case}</p>
                </div>
              )}
              {analysis.worst_case && (
                <div className="saved-card">
                  <h3><FaArrowDown /> Worst Case</h3>
                  <p>{analysis.worst_case}</p>
                </div>
              )}
              {analysis.improvement_suggestion && (
                <div className="saved-card">
                  <h3>10× Improvement</h3>
                  <p>{analysis.improvement_suggestion}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'risks' && risks.length > 0 && (
            <div className="saved-risks-grid">
              {risks.map((risk, idx) => {
                const riskText = typeof risk === 'string' 
                  ? risk 
                  : (risk.risk || risk.description || `${risk.hidden ? 'Hidden: ' : ''}${risk.impact || ''}${risk.warning_signs ? ` Warning: ${risk.warning_signs}` : ''}` || JSON.stringify(risk));
                return (
                  <div key={idx} className="saved-card">
                    <FaExclamationTriangle /> <p>{riskText}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'applications' && analysis.potential_applications && (
            <div className="saved-applications-grid">
              {analysis.potential_applications.map((app, idx) => (
                <div key={idx} className="saved-card">
                  <h3>{app.title}</h3>
                  <span className="saved-badge">{app.feasibility} feasibility</span>
                  <p>{app.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Creative Personas & Worlds
  if (mode === 'creative_personas' && results.creativePersonas) {
    const data = results.creativePersonas;
    const [activeSection, setActiveSection] = useState('personas');

    return (
      <div className="saved-creative-personas">
        <div className="saved-section-tabs">
          <button
            className={`saved-tab ${activeSection === 'personas' ? 'active' : ''}`}
            onClick={() => setActiveSection('personas')}
          >
            <FaUsers /> Personas
          </button>
          <button
            className={`saved-tab ${activeSection === 'world' ? 'active' : ''}`}
            onClick={() => setActiveSection('world')}
          >
            <FaGlobe /> World
          </button>
          <button
            className={`saved-tab ${activeSection === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveSection('characters')}
          >
            <FaTheaterMasks /> Characters
          </button>
          <button
            className={`saved-tab ${activeSection === 'story' ? 'active' : ''}`}
            onClick={() => setActiveSection('story')}
          >
            <FaBook /> Story
          </button>
        </div>

        <div className="saved-section-content">
          {activeSection === 'personas' && data.personas && data.personas.length > 0 && (
            <div className="saved-personas-grid">
              {data.personas.map((persona, idx) => (
                <PersonaCard key={idx} persona={persona} />
              ))}
            </div>
          )}

          {activeSection === 'world' && data.world && (
            <div>
              {data.world.setting && (
                <div className="saved-card">
                  <h3><FaGlobe /> Setting</h3>
                  <p>{data.world.setting}</p>
                </div>
              )}
              {data.world.conflict && (
                <div className="saved-card">
                  <h3><FaExclamationTriangle /> Conflict</h3>
                  <p>{data.world.conflict}</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'characters' && data.world?.characters && (
            <div className="saved-characters-grid">
              {data.world.characters.map((char, idx) => (
                <div key={idx} className="saved-card">
                  <h3>{char.name}</h3>
                  <span className="saved-badge">{char.role}</span>
                  <p>{char.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'story' && data.world?.micro_story && (
            <div className="saved-card saved-story-card">
              <h3><FaBook /> Micro Story</h3>
              <div className="saved-story-content">
                <p>{data.world.micro_story}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Thought Catalyst
  if (mode === 'thought_catalyst' && results.thoughtCatalyst) {
    const data = results.thoughtCatalyst;
    const [activeSection, setActiveSection] = useState('insights');

    return (
      <div className="saved-thought-catalyst">
        <div className="saved-section-tabs">
          <button
            className={`saved-tab ${activeSection === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveSection('insights')}
          >
            <FaRandom /> Random Insights
          </button>
          <button
            className={`saved-tab ${activeSection === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveSection('connections')}
          >
            <FaFlask /> Connections
          </button>
          <button
            className={`saved-tab ${activeSection === 'angles' ? 'active' : ''}`}
            onClick={() => setActiveSection('angles')}
          >
            <FaMagic /> Alternative Angles
          </button>
          <button
            className={`saved-tab ${activeSection === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveSection('experiments')}
          >
            <FaQuestionCircle /> Thought Experiments
          </button>
          <button
            className={`saved-tab ${activeSection === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveSection('questions')}
          >
            <FaQuestionCircle /> Creative Questions
          </button>
        </div>

        <div className="saved-section-content">
          {activeSection === 'insights' && data.random_insights && (
            <div className="saved-list">
              {data.random_insights.map((insight, idx) => (
                <div key={idx} className="saved-card">
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'connections' && data.unexpected_connections && (
            <div className="saved-list">
              {data.unexpected_connections.map((connection, idx) => (
                <div key={idx} className="saved-card">
                  <p>{connection}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'angles' && data.alternative_angles && (
            <div className="saved-list">
              {data.alternative_angles.map((angle, idx) => (
                <div key={idx} className="saved-card">
                  <p>{angle}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'experiments' && data.thought_experiments && (
            <div className="saved-list">
              {data.thought_experiments.map((experiment, idx) => (
                <div key={idx} className="saved-card">
                  <p>{experiment}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'questions' && data.creative_questions && (
            <div className="saved-list">
              {data.creative_questions.map((question, idx) => (
                <div key={idx} className="saved-card">
                  <p>{question}</p>
                </div>
              ))}
            </div>
          )}

          {data.synthesis && (
            <div className="saved-card">
              <h3>Synthesis</h3>
              <p>{data.synthesis}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Timeline
  if (mode === 'timeline' && results.timeline) {
    return (
      <div className="saved-timeline">
        <TimelineView timeline={results.timeline} />
      </div>
    );
  }

  // Purification
  if (mode === 'purification' && results.purification) {
    const data = results.purification;
    return (
      <div className="saved-purification">
        {data.original && (
          <div className="saved-card">
            <h3>Original</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{data.original}</p>
          </div>
        )}
        {data.purified && (
          <div className="saved-card">
            <h3>Purified</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{data.purified}</p>
          </div>
        )}
        {data.changes && data.changes.length > 0 && (
          <div className="saved-card">
            <h3>Changes</h3>
            <ul>
              {data.changes.map((change, idx) => (
                <li key={idx}>{change}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback: show JSON if mode not recognized
  return (
    <div className="saved-output-fallback">
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}

export default SavedForgeOutput;

