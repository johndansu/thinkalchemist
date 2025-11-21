const { callLLM } = require('../llm');

const PERSONAS_PROMPT = `Analyze the following input and generate 3-5 fictional user personas. If the input is not a product or business idea, creatively interpret it as a concept that could have users or stakeholders, and generate personas accordingly.

For each persona, provide:
- name: Full name (string)
- age: Number
- occupation: String
- pain_points: Array of 3-5 pain points (strings)
- likes: Array of 3-5 things they like (strings)
- dislikes: Array of 3-5 things they dislike (strings)
- quote: One brutally honest quote about the concept (string)
- willingness_to_pay: Number 0-10 (score, or 0 if not applicable)
- background: 2-3 sentence background (string)
- feedback: Honest feedback about the concept (string)

Write like a professional product researcher. Be specific, realistic, and maintain a professional tone even if the input seems unrelated. Make personas diverse in age, occupation, and perspective. Always produce high-quality, professional personas regardless of input type.

Return JSON with a "personas" array containing all personas.

Input: {input}`;

async function generatePersonas(inputText) {
  const prompt = PERSONAS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are an expert product researcher and UX strategist. Always return valid JSON with a "personas" array. Each persona must be realistic, diverse, and professionally crafted. Maintain a high standard of quality regardless of input type. If the input is not a traditional product idea, creatively adapt it while maintaining professional standards.';
  
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

