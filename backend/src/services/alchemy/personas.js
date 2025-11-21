const { callLLM } = require('../llm');

const PERSONAS_PROMPT = `You are a senior UX researcher and product strategist. Analyze the following input deeply and generate 4-6 highly detailed, realistic user personas that would interact with or be affected by this concept.

CRITICAL REQUIREMENTS:
- Each persona must be a fully realized individual, not a stereotype
- Include diverse demographics: age (20s-60s), occupations, backgrounds, tech-savviness, income levels
- Make personas feel like real people with authentic motivations and behaviors
- Pain points must be specific, relatable, and directly relevant
- Feedback should be brutally honest, as if from a real user interview

For each persona, provide EXACTLY:
- name: Full name (string) - use realistic, diverse names
- age: Number (20-70)
- occupation: String - be specific (e.g., "Senior Marketing Manager at a mid-size tech company" not just "Marketing Manager")
- pain_points: Array of 4-6 specific pain points (strings) - make them detailed and contextual
- likes: Array of 4-6 things they genuinely like (strings) - be specific and realistic
- dislikes: Array of 4-6 things they genuinely dislike (strings) - be specific and realistic
- quote: One brutally honest, authentic quote about the concept (string) - should sound like a real person speaking, 1-2 sentences
- willingness_to_pay: Number 0-10 (score) - be realistic based on their profile
- background: 3-4 sentence detailed background (string) - include education, career path, life situation, personality traits
- feedback: 2-3 sentence honest, detailed feedback about the concept (string) - should feel like real user research feedback

QUALITY STANDARDS:
- Each persona should feel like you could meet them in real life
- Avoid generic descriptions - be specific and vivid
- Ensure personas represent different user segments and use cases
- Make pain points and feedback directly relevant to the input concept
- Write in a professional but human tone

Return JSON with a "personas" array containing all personas. Minimum 4 personas, ideally 5-6.

Input to analyze: {input}`;

async function generatePersonas(inputText) {
  const prompt = PERSONAS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-class UX researcher with 15+ years of experience at top tech companies. You specialize in creating deeply insightful, realistic user personas based on extensive research. Your personas are used by Fortune 500 companies for product strategy. Always return valid JSON with a "personas" array. Each persona must be: (1) Highly detailed and realistic, (2) Diverse in demographics and perspectives, (3) Based on real user research principles, (4) Professionally crafted with specific, authentic details. Never create generic or stereotypical personas. Think deeply about how different types of people would actually interact with the concept. Maintain exceptional quality standards - these personas should feel like real people you interviewed.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.8, true);
    
    // Log raw response for debugging (first 500 chars)
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Handle both formats: array directly or wrapped in object
    let personasArray;
    if (Array.isArray(parsed)) {
      // Model returned array directly
      personasArray = parsed;
    } else if (parsed.personas && Array.isArray(parsed.personas)) {
      // Model returned object with personas property
      personasArray = parsed.personas;
    } else {
      throw new Error('Invalid personas structure - expected array or object with personas array');
    }
    
    // Return in expected format
    return { personas: personasArray };
  } catch (error) {
    console.error('Personas generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    // Preserve the original error message for debugging
    throw new Error(`Failed to generate personas: ${error.message}`);
  }
}

module.exports = { generatePersonas };

