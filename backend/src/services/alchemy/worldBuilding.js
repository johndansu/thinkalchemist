const { callLLM } = require('../llm');

const WORLD_BUILDING_PROMPT = `Expand the following input into a rich, immersive creative world. If the input is not explicitly a creative concept, interpret it creatively as a foundation for world-building.

Return JSON with:
- setting: Detailed setting description (string, rich and immersive)
- characters: Array of 2-4 main characters, each with:
  - name: Character name (string)
  - role: Character role (string)
  - description: Character description (string, detailed and compelling)
- conflict: Central conflict or tension (string, engaging and meaningful)
- map_description: Description of key locations/map (string, optional but recommended)
- micro_story: 150-word immersive micro-story (string, well-written and engaging)
- tone: Tone description (string, e.g., "mature, immersive, dark")

Make it rich, immersive, mature, and professionally crafted. Maintain high creative writing standards regardless of input type. If the input is abstract or non-creative, creatively adapt it into a compelling world.

Input to expand: {input}`;

async function buildWorld(inputText) {
  const prompt = WORLD_BUILDING_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a professional world-building expert and creative writing consultant. Always return valid JSON with all required fields. Create rich, immersive, mature content that meets professional creative writing standards. Maintain high quality regardless of input type. If the input is not creative, adapt it creatively while maintaining professional standards.';
  
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

