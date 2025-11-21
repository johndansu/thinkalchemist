const { callLLM } = require('../llm');

const PURIFICATION_PROMPT = `Clean and refine this text. Improve grammar, spelling, clarity, and structure while maintaining a human, natural tone (not AI-generated). Return JSON with:
- cleaned_text: The refined text (string)
- improvements: Array of improvement types made (e.g., "grammar", "spelling", "structure", "clarity") (array of strings)

Maintain the original meaning and tone. Do not make it sound AI-generated.

Original text: {input}`;

async function purifyDocument(inputText) {
  const prompt = PURIFICATION_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a professional editor. Return valid JSON with "cleaned_text" and "improvements" array. Write naturally, not like AI.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.3, true);
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.cleaned_text) {
      throw new Error('Invalid purification structure');
    }
    
    if (!parsed.improvements || !Array.isArray(parsed.improvements)) {
      parsed.improvements = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Purification error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to purify document: ${error.message}`);
  }
}

module.exports = { purifyDocument };

