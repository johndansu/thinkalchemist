import React from 'react';

function PersonaCard({ persona }) {
  return (
    <div className="persona-card">
      <h3>{persona.name}, {persona.age} — {persona.occupation}</h3>
      <p className="persona-quote">"{persona.quote}"</p>
      <div className="persona-details">
        <div><strong>Pain Points:</strong> {persona.pain_points?.join(', ')}</div>
        <div><strong>Likes:</strong> {persona.likes?.join(', ')}</div>
        <div><strong>Dislikes:</strong> {persona.dislikes?.join(', ')}</div>
        <div><strong>Willingness to Pay:</strong> {persona.willingness_to_pay}/100</div>
      </div>
    </div>
  );
}

export default PersonaCard;

