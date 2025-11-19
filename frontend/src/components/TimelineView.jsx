import React from 'react';

function TimelineView({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="timeline">
      {events.map((event, idx) => (
        <div key={idx} className="timeline-event">
          <div className="timeline-timestamp">
            {new Date(event.timestamp).toLocaleDateString()}
          </div>
          <div className="timeline-title">{event.title}</div>
          <div className="timeline-description">{event.description}</div>
          {event.impact && (
            <div className="timeline-impact">Impact: {event.impact}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TimelineView;

