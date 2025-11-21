import React, { useState } from 'react';
import { FaUser, FaHeart, FaThumbsDown, FaDollarSign, FaQuoteLeft } from 'react-icons/fa';

function PersonaCard({ persona }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const wtpScore = persona.willingness_to_pay || 0;
  const wtpPercentage = (wtpScore / 10) * 100;
  
  return (
    <div className={`persona-card-enhanced ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
      <div className="persona-card-header">
        <div className="persona-avatar">
          <FaUser />
        </div>
        <div className="persona-header-info">
          <h3 className="persona-name">{persona.name}</h3>
          <p className="persona-meta">{persona.age} • {persona.occupation}</p>
        </div>
        <div className="persona-wtp-badge">
          <FaDollarSign />
          <span>{wtpScore}/10</span>
        </div>
      </div>
      
      <div className="persona-quote-section">
        <FaQuoteLeft className="quote-icon" />
        <p className="persona-quote">"{persona.quote}"</p>
      </div>
      
      <div className="persona-wtp-meter">
        <div className="wtp-bar">
          <div 
            className="wtp-fill" 
            style={{ width: `${wtpPercentage}%` }}
          ></div>
        </div>
        <span className="wtp-label">Willingness to Pay</span>
      </div>
      
      {isExpanded && (
        <div className="persona-details-expanded">
          {persona.background && (
            <div className="persona-section">
              <h4>Background</h4>
              <p>{persona.background}</p>
            </div>
          )}
          
          <div className="persona-section">
            <h4>
              <FaThumbsDown className="section-icon" />
              Pain Points
            </h4>
            <ul className="persona-list">
              {persona.pain_points?.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div className="persona-section">
            <h4>
              <FaHeart className="section-icon" />
              Likes
            </h4>
            <ul className="persona-list">
              {persona.likes?.map((like, idx) => (
                <li key={idx}>{like}</li>
              ))}
            </ul>
          </div>
          
          <div className="persona-section">
            <h4>
              <FaThumbsDown className="section-icon" />
              Dislikes
            </h4>
            <ul className="persona-list">
              {persona.dislikes?.map((dislike, idx) => (
                <li key={idx}>{dislike}</li>
              ))}
            </ul>
          </div>
          
          {persona.feedback && (
            <div className="persona-section">
              <h4>Feedback</h4>
              <p className="persona-feedback">{persona.feedback}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="persona-card-footer">
        <button className="expand-toggle">
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
}

export default PersonaCard;

