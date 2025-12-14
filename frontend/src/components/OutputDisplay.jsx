import React from 'react';
import TimelineView from './TimelineView';
import PersonaCard from './PersonaCard';

function OutputDisplay({ output, onSave }) {
  if (!output || !output.results) return null;

  const { results, classification } = output;

  return (
    <div className="output-container">
      {results.conceptBreakdown && (
        <section>
          <h2>Concept Breakdown</h2>
          <div className="concept-breakdown">
            <p><strong>Core Essence:</strong> {results.conceptBreakdown.core_essence}</p>
            {results.conceptBreakdown.key_components && results.conceptBreakdown.key_components.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Key Components:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.conceptBreakdown.key_components.map((component, idx) => (
                    <li key={idx}>
                      <strong>{component.name}</strong> ({component.importance}): {component.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.conceptBreakdown.synthesis_insights && (
              <p style={{ marginTop: '1rem' }}>
                <strong>Insights:</strong> {results.conceptBreakdown.synthesis_insights}
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

      {results.stressTest && (
        <section>
          <h2>Reality Check</h2>
          <div className="stress-test">
            <div>
              <strong>Best Case:</strong> {results.stressTest.best_case}
            </div>
            <div>
              <strong>Worst Case:</strong> {results.stressTest.worst_case}
            </div>
            <div>
              <strong>One-Line Pitch:</strong> {results.stressTest.one_line_pitch}
            </div>
            {results.stressTest.hidden_risks && results.stressTest.hidden_risks.length > 0 && (
              <div>
                <strong>Hidden Risks:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.stressTest.hidden_risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            {results.stressTest.improvement_suggestion && (
              <div>
                <strong>If I had to make this 10× better:</strong> {results.stressTest.improvement_suggestion}
              </div>
            )}
          </div>
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

