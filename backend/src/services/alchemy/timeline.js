const { callLLM } = require('../llm');

const TIMELINE_PROMPT = `Analyze this text deeply and create a comprehensive, detailed chronological timeline. Extract ALL significant events, milestones, phases, developments, and turning points.

For each event, provide rich, detailed information:
- timestamp: Primary date (YYYY-MM-DD) or descriptive phase name - the main date when the event occurred or started
- start: Start date (YYYY-MM-DD) if the event spans a period, otherwise same as timestamp
- end: End date (YYYY-MM-DD) if the event spans a period, otherwise same as timestamp or null for single-day events
- event: Clear, informative, descriptive title that captures the essence
- description: Detailed 4-6 sentence explanation covering:
  * What exactly happened (comprehensive details)
  * Who was involved (people, organizations, entities, roles)
  * Where it occurred (location, context, setting)
  * The circumstances and background leading up to it
  * Key details, specifics, and notable aspects
  * How it unfolded (process, sequence, methodology)
- impact: Comprehensive 3-4 sentence analysis explaining:
  * Why this event is significant and important
  * Immediate consequences and effects
  * Long-term implications and ripple effects
  * How it influenced subsequent events
  * Its role in the larger narrative
  * Connections to other events in the timeline
- context: Additional context about the event's place in history, its background, or related information

Return JSON format:
{
  "events": [
    {
      "timestamp": "2024-01-15",
      "start": "2024-01-10",
      "end": "2024-01-20",
      "event": "Descriptive Event Title",
      "description": "Comprehensive, detailed description with context, participants, location, circumstances, key specifics, and how it unfolded. Make it rich, informative, and thorough.",
      "impact": "Thorough analysis of significance, immediate and long-term consequences, influence on future events, role in the overall story, and connections to other events.",
      "context": "Additional context about background, historical significance, or related information that enriches understanding."
    }
  ],
  "summary": "Comprehensive 5-7 sentence overview that synthesizes the timeline, highlights major themes, identifies patterns and trends, explains the overall narrative arc, provides meaningful context, and draws insightful conclusions."
}

Create 10-15 meaningful, well-developed events. Be thorough, specific, and detailed. Include extensive context, background, and rich information for each event. For events that span time periods, use start and end dates. For single-day events, set start and end to the same date.

Input: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are an expert timeline analyst and historian with deep knowledge. Create comprehensive, detailed, and informative timelines with rich context, thorough analysis, and extensive information. Always return valid JSON with events array and summary. Be thorough, include extensive details, and ensure each event has start and end dates.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.5, true);
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.events || !Array.isArray(parsed.events)) {
      console.error('Invalid timeline structure:', JSON.stringify(parsed, null, 2));
      // Try to create a minimal valid structure if parsing partially worked
      if (parsed && typeof parsed === 'object') {
        parsed.events = parsed.events || [];
        parsed.summary = parsed.summary || 'Timeline generated from input.';
      } else {
        throw new Error('Invalid timeline structure - missing events array');
      }
    }
    
    // Ensure minimum events - create placeholder if needed
    if (parsed.events.length === 0) {
      console.warn('No events generated, creating placeholder');
      const today = new Date().toISOString().split('T')[0];
      parsed.events = [{
        timestamp: today,
        start: today,
        end: today,
        event: 'Initial Event',
        description: 'Timeline generation started',
        impact: 'Beginning of timeline',
        context: 'Timeline initialization'
      }];
    }
    
    // Ensure all events have start and end dates
    parsed.events = parsed.events.map(event => {
      // If start/end don't exist, use timestamp
      if (!event.start) {
        event.start = event.timestamp || new Date().toISOString().split('T')[0];
      }
      if (!event.end) {
        event.end = event.timestamp || event.start || new Date().toISOString().split('T')[0];
      }
      // Ensure context field exists
      if (!event.context) {
        event.context = '';
      }
      return event;
    });
    
    // Sort events by start date (or timestamp if start doesn't exist)
    parsed.events.sort((a, b) => {
      const dateA = new Date(a.start || a.timestamp || 0);
      const dateB = new Date(b.start || b.timestamp || 0);
      return dateA - dateB;
    });
    
    return parsed;
  } catch (error) {
    console.error('Timeline generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to generate timeline: ${error.message}`);
  }
}

module.exports = { generateTimeline };

