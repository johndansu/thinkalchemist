const { callLLM } = require('../llm');

const TIMELINE_PROMPT = `Extract and structure events from this text into a chronological timeline. Return JSON with:
- events: Array of objects, each with:
  - timestamp: ISO 8601 date string (infer if missing)
  - event: Short event title
  - description: 2-3 sentence description
  - impact: One sentence on significance
- summary: Overall timeline summary (2-3 sentences)

Text: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a timeline extraction expert. Return valid JSON.';
  
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
      parsed.events = [{
        timestamp: new Date().toISOString().split('T')[0],
        event: 'Initial Event',
        description: 'Timeline generation started',
        impact: 'Beginning of timeline'
      }];
    }
    
    // Sort events by timestamp if possible
    parsed.events.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
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

