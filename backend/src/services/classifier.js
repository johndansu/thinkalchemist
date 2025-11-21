const { callLLM } = require('./llm');

const CLASSIFICATION_PROMPT = `Analyze the following text and classify it into one or more categories. Return a JSON object with:
- primary_type: "idea" | "story" | "event_sequence" | "messy_document" | "world_building" | "mixed"
- confidence: 0-1 (number)
- suggested_modes: array of alchemy modes to apply (can include: "personas", "timeline", "purification", "stress_test", "world_building")
- keywords: array of relevant keywords

Categories:
- idea: Product concepts, business ideas, feature requests, startup pitches
- story: Narratives, creative writing, fictional content, stories
- event_sequence: Historical events, timelines, chronological sequences, project timelines
- messy_document: Unstructured text, poor grammar, needs cleaning, rough drafts
- world_building: Fantasy/sci-fi settings, character descriptions, lore, creative concepts
- mixed: Multiple types present

Text to classify: {input}`;

async function classifyInput(inputText) {
  if (!inputText || inputText.trim().length === 0) {
    throw new Error('Input text is required');
  }

  const prompt = CLASSIFICATION_PROMPT.replace('{input}', inputText.substring(0, 2000)); // Limit input length
  const systemPrompt = 'You are a text classification expert. Always return valid JSON.';
  
  try {
    const { parseJSONResponse } = require('../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.3, true);
    const classification = parseJSONResponse(result);
    
    // Validate and normalize
    if (!classification.suggested_modes || !Array.isArray(classification.suggested_modes)) {
      classification.suggested_modes = [];
    }
    
    if (!classification.primary_type) {
      classification.primary_type = 'mixed';
    }
    
    return classification;
  } catch (error) {
    console.error('Classification error:', error);
    // Fallback classification
    return {
      primary_type: 'mixed',
      confidence: 0.5,
      suggested_modes: ['purification'],
      keywords: []
    };
  }
}

module.exports = { classifyInput };

