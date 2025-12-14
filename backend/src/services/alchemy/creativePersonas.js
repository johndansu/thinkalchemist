const { callLLM } = require('../llm');

const CREATIVE_PERSONAS_PROMPT = `You are a masterful creative strategist combining UX research with world-building expertise. Transform the following input into a rich, immersive experience that includes both realistic user personas AND a creative world that brings them to life.

CRITICAL REQUIREMENTS:
1. PERSONAS (4-6 personas):
   - Each persona must be a fully realized individual, not a stereotype
   - Include diverse demographics: age (20s-60s), occupations, backgrounds, tech-savviness, income levels
   - Make personas feel like real people with authentic motivations and behaviors
   - Pain points must be specific, relatable, and directly relevant
   - Feedback should be brutally honest, as if from a real user interview

2. CREATIVE WORLD:
   - Build a vivid, immersive world that these personas inhabit
   - Create a setting that feels alive and compelling
   - Develop 3-4 complex characters that represent or interact with the personas
   - Establish meaningful conflicts that drive narrative tension
   - Craft an immersive micro-story that brings the world and personas together

For each persona, provide EXACTLY:
- name: Full name (string) - use realistic, diverse names
- age: Number (20-70)
- occupation: String - be specific (e.g., "Senior Marketing Manager at a mid-size tech company")
- pain_points: Array of 4-6 specific pain points (strings)
- likes: Array of 4-6 things they genuinely like (strings)
- dislikes: Array of 4-6 things they genuinely dislike (strings)
- quote: One brutally honest, authentic quote about the concept (string) - 1-2 sentences
- willingness_to_pay: Number 0-10 (score)
- background: 3-4 sentence detailed background (string)
- feedback: 2-3 sentence honest, detailed feedback about the concept (string)

For the creative world, provide:
- setting: Rich 4-6 sentence setting description (string) - include geography, atmosphere, culture, time period, unique features, sensory details
- characters: Array of 3-4 main characters, each with:
  - name: Character name (string)
  - role: Character role (string) - be specific
  - description: Detailed 3-4 sentence character description (string)
- conflict: Detailed 3-4 sentence central conflict (string)
- map_description: Detailed 3-4 sentence description of key locations (string)
- micro_story: 150-200 word immersive micro-story (string) - should connect the personas to the world
- tone: Detailed tone description (string)

QUALITY STANDARDS:
- Personas should feel like real people you could meet
- World should feel fully realized and immersive
- Everything should work together cohesively
- Writing quality should match professional creative work

Return JSON with:
- personas: Array of persona objects
- world: Object with setting, characters, conflict, map_description, micro_story, tone

Input to transform: {input}`;

async function generateCreativePersonas(inputText) {
  const prompt = CREATIVE_PERSONAS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-class creative strategist who combines deep UX research expertise with masterful world-building skills. You create immersive experiences that blend realistic user insights with rich creative worlds. Your work is used by Fortune 500 companies and award-winning creative teams. Always return valid JSON with both "personas" array and "world" object. Each persona must be highly detailed and realistic. The world must be fully realized and immersive. Everything must work together cohesively to create a compelling, integrated experience.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.85, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.personas || !Array.isArray(parsed.personas)) {
      throw new Error('Invalid creative personas structure - expected personas array');
    }
    
    if (!parsed.world || typeof parsed.world !== 'object') {
      throw new Error('Invalid creative personas structure - expected world object');
    }
    
    // Ensure world has required fields
    if (!parsed.world.setting) {
      parsed.world.setting = 'A rich, immersive world waiting to be explored.';
    }
    
    if (!parsed.world.characters || !Array.isArray(parsed.world.characters)) {
      parsed.world.characters = [];
    }
    
    if (!parsed.world.conflict) {
      parsed.world.conflict = 'A central conflict drives the narrative forward.';
    }
    
    if (!parsed.world.micro_story) {
      parsed.world.micro_story = '';
    }
    
    return {
      personas: parsed.personas,
      world: parsed.world
    };
  } catch (error) {
    console.error('Creative personas generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to generate creative personas: ${error.message}`);
  }
}

module.exports = { generateCreativePersonas };

