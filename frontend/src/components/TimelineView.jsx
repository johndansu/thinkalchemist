import React, { useState } from 'react';
import { FaCalendarAlt, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function TimelineView({ events, orientation = 'vertical' }) {
  const [expandedEvents, setExpandedEvents] = useState({});
  
  if (!events || events.length === 0) return null;

  const toggleEvent = (idx) => {
    setExpandedEvents(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBD';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp; // Return as-is if not a valid date
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className={`timeline-enhanced ${orientation}`}>
      {events.map((event, idx) => {
        const isExpanded = expandedEvents[idx];
        return (
          <div 
            key={idx} 
            className={`timeline-event-enhanced ${isExpanded ? 'expanded' : ''}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="timeline-event-marker">
              <div className="timeline-dot"></div>
              {idx < events.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="timeline-event-content">
              <div className="timeline-event-header" onClick={() => toggleEvent(idx)}>
                <div className="timeline-event-main">
                  <div className="timeline-timestamp-enhanced">
                    <FaCalendarAlt className="timestamp-icon" />
                    <span>{formatDate(event.timestamp)}</span>
                  </div>
                  <h3 className="timeline-title-enhanced">{event.event || event.title}</h3>
                </div>
                <button className="timeline-expand-btn">
                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              
              <div className={`timeline-event-body ${isExpanded ? 'expanded' : ''}`}>
                <p className="timeline-description-enhanced">{event.description}</p>
                {event.impact && (
                  <div className="timeline-impact-enhanced">
                    <FaInfoCircle className="impact-icon" />
                    <div>
                      <strong>Impact:</strong> {event.impact}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TimelineView;

