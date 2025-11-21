const { callLLM } = require('../llm');

const PERSONAS_PROMPT = `Generate 3-5 fictional user personas for this product/idea. For each persona, provide:
- name: Full name (string)
- age: Number
- occupation: String
- pain_points: Array of 3-5 pain points (strings)
- likes: Array of 3-5 things they like (strings)
- dislikes: Array of 3-5 things they dislike (strings)
- quote: One brutally honest quote about the product (string)
- willingness_to_pay: Number 0-10 (score)
- background: 2-3 sentence background (string)
- feedback: Honest feedback about the product (string)

Write like a real product researcher. Be specific and realistic. Make personas diverse in age, occupation, and perspective.

Return JSON with a "personas" array containing all personas.

Product/Idea: {input}`;

async function generatePersonas(inputText) {
  const prompt = PERSONAS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are an expert product researcher. Return valid JSON with a "personas" array. Each persona should be realistic and diverse.';
  
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

