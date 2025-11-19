import React from 'react';
import TimelineView from './TimelineView';
import PersonaCard from './PersonaCard';

function OutputDisplay({ output, onSave }) {
  if (!output || !output.results) return null;

  const { results, classification } = output;

  return (
    <div className="output-container">
      {results.personas && (
        <section>
          <h2>Personas & Insights</h2>
          {results.personas.personas?.map((persona, idx) => (
            <PersonaCard key={idx} persona={persona} />
          ))}
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

      {results.worldBuilding && (
        <section>
          <h2>World Building</h2>
          <div className="world-building">
            <p><strong>Setting:</strong> {results.worldBuilding.setting}</p>
            {results.worldBuilding.characters && results.worldBuilding.characters.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Characters:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {results.worldBuilding.characters.map((char, idx) => (
                    <li key={idx}>
                      <strong>{char.name}</strong> ({char.role}): {char.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p><strong>Conflict:</strong> {results.worldBuilding.conflict}</p>
            {results.worldBuilding.map_description && (
              <p><strong>Map Description:</strong> {results.worldBuilding.map_description}</p>
            )}
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{results.worldBuilding.micro_story}</p>
            {results.worldBuilding.tone && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--burnt-umber)' }}>
                <strong>Tone:</strong> {results.worldBuilding.tone}
              </p>
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

