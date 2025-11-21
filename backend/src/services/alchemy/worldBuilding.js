const { callLLM } = require('../llm');

const WORLD_BUILDING_PROMPT = `You are a master world-builder and creative writing expert. Transform the following input into a rich, immersive, fully-realized creative world that feels alive and compelling.

WORLD-BUILDING REQUIREMENTS:
1. Setting: Create a vivid, detailed world that readers can visualize and feel
2. Characters: Develop 3-4 complex, multi-dimensional characters with depth
3. Conflict: Establish meaningful, engaging conflicts that drive narrative tension
4. Locations: Build a world with distinct, memorable places
5. Story: Craft an immersive micro-story that brings the world to life
6. Tone: Establish a clear, consistent tone that sets the mood

CRITICAL REQUIREMENTS:
- Setting should be 4-6 sentences, rich in sensory details and atmosphere
- Characters must feel real with complex motivations, not one-dimensional
- Conflict should be meaningful and drive narrative interest
- Locations should be vivid and memorable
- Micro-story should be 150-200 words, well-written, and immersive
- Overall quality should match published fantasy/sci-fi world-building

Return JSON with:
- setting: Rich 4-6 sentence setting description (string) - include geography, atmosphere, culture, time period, unique features, sensory details
- characters: Array of 3-4 main characters, each with:
  - name: Character name (string) - use evocative, memorable names
  - role: Character role (string) - be specific (e.g., "Rogue mage seeking redemption" not just "Mage")
  - description: Detailed 3-4 sentence character description (string) - include appearance, personality, background, motivations, flaws, and strengths
- conflict: Detailed 3-4 sentence central conflict (string) - should be engaging, meaningful, and drive narrative tension
- map_description: Detailed 3-4 sentence description of key locations (string) - describe 3-5 distinct locations with atmosphere and significance
- micro_story: 150-200 word immersive micro-story (string) - should be well-written, engaging, showcase the world and characters, and feel like a published excerpt
- tone: Detailed tone description (string) - e.g., "Mature, dark fantasy with elements of hope. Atmospheric and immersive, balancing grim realism with moments of wonder. Think 'The Witcher' meets 'The Name of the Wind'."

QUALITY STANDARDS:
- World should feel fully realized and immersive
- Characters should be complex and compelling
- Writing quality should match published creative fiction
- Everything should work together to create a cohesive, engaging world
- If input is abstract, creatively adapt it into something compelling

Input to expand: {input}`;

async function buildWorld(inputText) {
  const prompt = WORLD_BUILDING_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-renowned world-building expert and creative writing master. Your worlds have been featured in award-winning fantasy and sci-fi novels. You specialize in creating rich, immersive, fully-realized worlds that feel alive and compelling. Always return valid JSON with all required fields. Your world-building must: (1) Create vivid, detailed settings with sensory richness, (2) Develop complex, multi-dimensional characters with depth, (3) Establish meaningful conflicts that drive narrative, (4) Build memorable locations with atmosphere, (5) Craft immersive micro-stories that showcase the world, (6) Maintain the highest creative writing standards. Your work should feel like it could be published in a major fantasy/sci-fi novel. Think at the level of Brandon Sanderson, N.K. Jemisin, or Patrick Rothfuss. Maintain exceptional quality regardless of input type - if the input is not creative, transform it into something compelling while maintaining professional standards.';
  
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

