const { callLLM } = require('../llm');

const WORLD_BUILDING_PROMPT = `Expand this creative concept into a rich world. Return JSON with:
- setting: Detailed setting description (string)
- characters: Array of 2-4 main characters, each with:
  - name: Character name (string)
  - role: Character role (string)
  - description: Character description (string)
- conflict: Central conflict or tension (string)
- map_description: Description of key locations/map (string, optional)
- micro_story: 150-word immersive micro-story (string)
- tone: Tone description (string, e.g., "mature, immersive, dark")

Make it rich, immersive, and mature (not childish).

Creative Concept: {input}`;

async function buildWorld(inputText) {
  const prompt = WORLD_BUILDING_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-building expert. Return valid JSON with all required fields. Create rich, immersive, mature content.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.9, true);
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.setting || !parsed.conflict) {
      throw new Error('Invalid world building structure');
    }
    
    if (!parsed.characters || !Array.isArray(parsed.characters)) {
      parsed.characters = [];
    }
    
    if (!parsed.micro_story) {
      parsed.micro_story = '';
    }
    
    return parsed;
  } catch (error) {
    console.error('World building error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    // Preserve the original error message for debugging
    throw new Error(`Failed to build world: ${error.message}`);
  }
}

module.exports = { buildWorld };

