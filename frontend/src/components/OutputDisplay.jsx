import React from 'react';
import TimelineView from './TimelineView';
import PersonaCard from './PersonaCard';

function OutputDisplay({ output, onSave }) {
  if (!output || !output.results) return null;

  const { results, classification } = output;

  return (
    <div className="output-container">
      {results.strategicAnalysis && (
        <section>
          <h2>Strategic Analysis</h2>
          <div className="strategic-analysis">
            <p><strong>Core Essence:</strong> {results.strategicAnalysis.core_essence}</p>
            <p><strong>One-Line Pitch:</strong> {results.strategicAnalysis.one_line_pitch}</p>
            {results.strategicAnalysis.key_components && results.strategicAnalysis.key_components.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Key Components:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.strategicAnalysis.key_components.map((component, idx) => (
                    <li key={idx}>
                      <strong>{component.name}</strong> ({component.importance}): {component.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <strong>Best Case:</strong> {results.strategicAnalysis.best_case}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Worst Case:</strong> {results.strategicAnalysis.worst_case}
            </div>
            {results.strategicAnalysis.hidden_risks && results.strategicAnalysis.hidden_risks.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Hidden Risks:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.strategicAnalysis.hidden_risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.strategicAnalysis.strategic_insights && (
              <p style={{ marginTop: '1rem' }}>
                <strong>Strategic Insights:</strong> {results.strategicAnalysis.strategic_insights}
              </p>
            )}
          </div>
        </section>
      )}

      {results.thoughtCatalyst && (
        <section>
          <h2>Thought Catalyst</h2>
          <div className="thought-catalyst">
            <p><strong>Input:</strong> {results.thoughtCatalyst.core_input}</p>
            {results.thoughtCatalyst.random_insights && results.thoughtCatalyst.random_insights.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Random Insights:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.thoughtCatalyst.random_insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.thoughtCatalyst.unexpected_connections && results.thoughtCatalyst.unexpected_connections.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Unexpected Connections:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.thoughtCatalyst.unexpected_connections.map((connection, idx) => (
                    <li key={idx}>{connection}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.thoughtCatalyst.synthesis && (
              <p style={{ marginTop: '1rem' }}>
                <strong>Synthesis:</strong> {results.thoughtCatalyst.synthesis}
              </p>
            )}
          </div>
        </section>
      )}

      {results.creativePersonas && (
        <section>
          <h2>Creative Personas & Worlds</h2>
          {results.creativePersonas.personas && results.creativePersonas.personas.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3>Personas</h3>
              {results.creativePersonas.personas.map((persona, idx) => (
                <PersonaCard key={idx} persona={persona} />
              ))}
            </div>
          )}
          {results.creativePersonas.world && (
            <div className="world-building">
              <h3>Creative World</h3>
              <p><strong>Setting:</strong> {results.creativePersonas.world.setting}</p>
              {results.creativePersonas.world.characters && results.creativePersonas.world.characters.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Characters:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {results.creativePersonas.world.characters.map((char, idx) => (
                      <li key={idx}>
                        <strong>{char.name}</strong> ({char.role}): {char.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p style={{ marginTop: '1rem' }}><strong>Conflict:</strong> {results.creativePersonas.world.conflict}</p>
              {results.creativePersonas.world.micro_story && (
                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{results.creativePersonas.world.micro_story}</p>
              )}
            </div>
          )}
        </section>
      )}

      {results.timeline && (
        <section>
          <h2>Timeline</h2>
          <TimelineView events={results.timeline.events} />
          {results.timeline.summary && (
            <p style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--burnt-umber)' }}>
              {results.timeline.summary}
            </p>
          )}
        </section>
      )}

      {results.purification && (
        <section>
          <h2>Refined Text</h2>
          <div className="purified-text">
            {results.purification.cleaned_text}
          </div>
          {results.purification.improvements && results.purification.improvements.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--burnt-umber)' }}>
              <strong>Improvements made:</strong> {results.purification.improvements.join(', ')}
            </div>
          )}
        </section>
      )}



      {onSave && (
        <button onClick={onSave} className="save-button">
          Save This Forge
        </button>
      )}
    </div>
  );
}

export default OutputDisplay;

