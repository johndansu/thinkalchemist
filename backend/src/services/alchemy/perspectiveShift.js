const { callLLM } = require('../llm');

const PERSPECTIVE_SHIFT_PROMPT = `You are a master of perspective and viewpoint analysis. Transform the following input by examining it through multiple distinct lenses and perspectives, revealing how different viewpoints interpret and understand the same concept differently.

PERSPECTIVE FRAMEWORK:
Examine the input through 5-6 distinct perspectives, each with their own lens, concerns, and insights.

Return JSON with:
- core_concept: 2-3 sentence summary of what the concept is (string)
- perspectives: Array of 5-6 perspective objects, each with:
  - name: Perspective name (string) - e.g., "User Perspective", "Business Perspective", "Technical Perspective", "Creative Perspective", "Ethical Perspective", "Future Perspective"
  - lens: 1-2 sentence description of how this perspective views things (string)
  - interpretation: 3-4 sentence interpretation of the concept from this perspective (string)
  - key_concerns: Array of 3-4 specific concerns or questions from this perspective (array of strings)
  - opportunities: Array of 3-4 opportunities or benefits seen from this perspective (array of strings)
  - quote: One representative quote that captures this perspective's view (string) - should sound authentic to that viewpoint
- synthesis: 3-4 sentence synthesis of how these perspectives connect and what emerges when they're combined (string)
- common_threads: Array of 3-4 themes or patterns that appear across multiple perspectives (array of strings)
- tension_points: Array of 2-3 areas where perspectives conflict or create tension (array of strings)

QUALITY STANDARDS:
- Each perspective should feel authentic and distinct
- Perspectives should reveal different aspects of the concept
- Show both alignment and tension between perspectives
- Make it feel like you're seeing the concept from multiple angles
- Write in a clear, insightful tone

Input to examine: {input}`;

async function shiftPerspectives(inputText) {
  const prompt = PERSPECTIVE_SHIFT_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-renowned perspective analyst and systems thinker. You specialize in examining concepts through multiple lenses to reveal hidden insights and connections. Your work has been used by leading design firms, consulting companies, and innovation labs. Always return valid JSON with all required fields. Your perspective analysis must: (1) Create distinct, authentic perspectives, (2) Show how each perspective interprets the concept differently, (3) Reveal both alignment and tension between perspectives, (4) Synthesize insights across perspectives, (5) Identify common threads and tension points. Think like a design thinking expert combined with a systems analyst. Make each perspective feel real and valuable.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.8, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.core_concept) {
      parsed.core_concept = 'A concept waiting to be examined from multiple perspectives.';
    }
    
    if (!parsed.perspectives || !Array.isArray(parsed.perspectives)) {
      parsed.perspectives = [];
    }
    
    if (!parsed.synthesis) {
      parsed.synthesis = 'Perspective synthesis reveals deeper insights.';
    }
    
    if (!parsed.common_threads || !Array.isArray(parsed.common_threads)) {
      parsed.common_threads = [];
    }
    
    if (!parsed.tension_points || !Array.isArray(parsed.tension_points)) {
      parsed.tension_points = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Perspective shift error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to shift perspectives: ${error.message}`);
  }
}

module.exports = { shiftPerspectives };

