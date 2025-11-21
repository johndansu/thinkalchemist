const { callLLM } = require('../llm');

const TIMELINE_PROMPT = `Analyze the following input and extract or create a chronological timeline. If the input doesn't contain explicit events, interpret it as a sequence of logical steps, phases, or developments and structure them chronologically.

Return JSON with:
- events: Array of event objects, each with:
  - timestamp: ISO date string or inferred date/phase (string, use logical progression if dates unavailable)
  - event: Event title (string)
  - description: Detailed description (string)
  - impact: Impact or significance note (string, optional)
- summary: Brief professional summary of the timeline (string)

Always maintain a professional tone. If the input is abstract or non-temporal, create a logical sequence that makes sense. Order events chronologically or logically.

Input: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a professional timeline analyst and historian. Always return valid JSON with an "events" array and a "summary" string. Maintain professional quality regardless of input type. If the input lacks explicit events, create a logical chronological structure that makes sense.';
  
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

