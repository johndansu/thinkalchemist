const { callLLM } = require('../llm');

const TIMELINE_PROMPT = `Extract and structure events from this text into a chronological timeline. Return JSON with:
- events: Array of event objects, each with:
  - timestamp: ISO date string or inferred date (string)
  - event: Event title (string)
  - description: Detailed description (string)
  - impact: Impact or significance note (string, optional)
- summary: Brief summary of the timeline (string)

If dates are missing, infer reasonable timestamps based on context. Order events chronologically.

Text: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a timeline extraction expert. Return valid JSON with an "events" array and a "summary" string.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.5, true);
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.events || !Array.isArray(parsed.events)) {
      throw new Error('Invalid timeline structure');
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

