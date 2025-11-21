const { callLLM } = require('../llm');

const PURIFICATION_PROMPT = `You are a professional editor and writing consultant with expertise in refining text to publication standards. Analyze and improve the following text comprehensively.

EDITING APPROACH:
1. Grammar & Spelling: Fix all errors, ensure proper punctuation, correct word usage
2. Clarity & Flow: Improve sentence structure, eliminate ambiguity, enhance readability
3. Organization: Add logical structure, improve paragraph flow, ensure coherent progression
4. Style & Tone: Maintain the original voice while polishing it professionally
5. Formatting: Ensure proper spacing, paragraph breaks, and visual hierarchy

CRITICAL REQUIREMENTS:
- Preserve the original meaning, intent, and voice completely
- Do NOT make it sound AI-generated - keep it natural and human
- If the text is already good, make subtle but meaningful improvements
- If the text is messy, apply comprehensive professional editing
- Enhance readability without changing the core message
- Maintain appropriate tone (formal, casual, technical, etc.) based on context

Return JSON with:
- cleaned_text: The fully refined, polished text (string) - should be publication-ready
- improvements: Detailed array of improvement types made (array of strings) - be specific, e.g., ["grammar corrections", "sentence restructuring", "clarity enhancements", "paragraph reorganization", "punctuation fixes", "word choice improvements", "formatting standardization"]

QUALITY STANDARDS:
- The cleaned text should read smoothly and professionally
- All improvements should be meaningful and noticeable
- The text should feel polished but natural
- Maintain the author's original voice and style

Text to refine: {input}`;

async function purifyDocument(inputText) {
  const prompt = PURIFICATION_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a senior editor with 20+ years of experience at major publishing houses and editorial firms. You specialize in transforming rough drafts into polished, publication-ready content while preserving the author\'s unique voice. Always return valid JSON with "cleaned_text" (publication-ready) and a detailed "improvements" array. Your editing must: (1) Fix all grammatical and spelling errors, (2) Enhance clarity and flow significantly, (3) Improve structure and organization, (4) Maintain the original tone and voice, (5) Never sound AI-generated - keep it natural and human. Apply the highest editorial standards. The cleaned text should be ready for professional publication while feeling authentic and natural.';
  
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

