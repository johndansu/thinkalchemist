const { callLLM } = require('../llm');

const TIMELINE_PROMPT = `You are a professional historian and timeline analyst. Deeply analyze the following input and create a comprehensive, detailed chronological timeline.

CRITICAL REQUIREMENTS:
- Extract ALL significant events, milestones, phases, or developments
- If dates are missing, infer logical timestamps based on context and progression
- Each event must be meaningful and contribute to the overall narrative
- Descriptions should be detailed and informative
- Impact notes should explain why each event matters

For each event, provide EXACTLY:
- timestamp: ISO date string (YYYY-MM-DD) or logical phase identifier (string) - be specific and consistent
- event: Clear, descriptive event title (string) - should be informative and specific
- description: Detailed 2-4 sentence description (string) - explain what happened, who was involved, context
- impact: Impact or significance note (string) - explain why this event matters, its consequences, or its role in the larger narrative

QUALITY STANDARDS:
- Minimum 5 events, ideally 8-12 for comprehensive timelines
- Events should flow logically and tell a complete story
- Descriptions should be rich in detail and context
- Impact notes should add value and insight
- Timeline should feel complete and well-researched

Return JSON with:
- events: Array of event objects (minimum 5, ideally 8-12)
- summary: Comprehensive 3-5 sentence professional summary (string) - should synthesize the timeline, highlight key themes, and provide context

If the input is abstract or non-temporal, create a logical sequence that makes sense and tells a compelling story. Always maintain a professional, analytical tone.

Input to analyze: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a senior historian and timeline specialist with expertise in creating comprehensive, detailed chronological narratives. You have worked with major historical institutions and research organizations. Always return valid JSON with an "events" array (minimum 5 events, ideally 8-12) and a detailed "summary" string. Each event must be: (1) Well-researched and detailed, (2) Properly timestamped or phased, (3) Rich in context and description, (4) Accompanied by meaningful impact analysis. Your timelines are used for academic research and professional analysis. Maintain exceptional quality - create timelines that feel authoritative, comprehensive, and insightful. If the input lacks explicit events, use your expertise to create a logical, compelling chronological structure that tells a complete story.';
  
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

