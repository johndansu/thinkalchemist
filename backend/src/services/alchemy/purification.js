const { callLLM } = require('../llm');

const PURIFICATION_PROMPT = `Clean and refine the following text professionally. Improve grammar, spelling, clarity, and structure while maintaining a natural, human tone (not AI-generated). 

If the text is already well-written, make subtle improvements while preserving its character. If it's messy or unstructured, apply professional editing standards.

Return JSON with:
- cleaned_text: The refined text (string)
- improvements: Array of improvement types made (e.g., "grammar", "spelling", "structure", "clarity", "formatting") (array of strings)

Maintain the original meaning and tone. Do not make it sound AI-generated. Always produce professional, polished output.

Text to refine: {input}`;

async function purifyDocument(inputText) {
  const prompt = PURIFICATION_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a professional editor and writing consultant. Always return valid JSON with "cleaned_text" and "improvements" array. Write naturally and professionally, never like AI. Maintain high editorial standards regardless of input quality.';
  
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

