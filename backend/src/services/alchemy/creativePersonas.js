const { callLLM } = require('../llm');

const CREATIVE_PERSONAS_PROMPT = `You are a world-class creative strategist and UX researcher who combines deep human psychology insights with masterful storytelling and world-building. Your task is to transform the following input into an extraordinary, immersive experience featuring both highly realistic user personas AND a rich, compelling creative world.

═══════════════════════════════════════════════════════════════
PERSONAS REQUIREMENTS (Generate 5-7 personas):
═══════════════════════════════════════════════════════════════

Each persona must be a COMPLETE, THREE-DIMENSIONAL INDIVIDUAL:

1. DEMOGRAPHIC DIVERSITY (MANDATORY):
   - Ages: Mix of 22-68 years old
   - Occupations: Diverse roles (executives, creatives, service workers, entrepreneurs, students, retirees, freelancers)
   - Geographic locations: Mix of urban, suburban, rural, international
   - Income levels: Range from struggling to affluent
   - Tech-savviness: From tech-averse to early adopters
   - Education: High school to PhD
   - Family status: Singles, couples, parents, empty nesters
   - Cultural backgrounds: Diverse ethnicities and backgrounds

2. PSYCHOLOGICAL DEPTH (CRITICAL):
   - Each persona must have a unique personality, not a stereotype
   - Include specific fears, aspirations, values, and worldviews
   - Show contradictions and complexity (real people aren't one-dimensional)
   - Include personal history that shapes their current behavior
   - Show how their background influences their relationship with the concept

3. PAIN POINTS (Must be SPECIFIC and ACTIONABLE):
   - Not generic: "Wants better UX" 
   - Instead: "Frustrated that current solution requires 5 clicks to complete a task they do 20 times daily, costing 15 minutes per day"
   - Each pain point should be: Specific, Measurable, Relatable, Actionable
   - Include emotional pain points, not just functional ones
   - Show pain points that reveal deeper needs and motivations

4. LIKES & DISLIKES (Must be AUTHENTIC):
   - Likes should reveal personality, values, and lifestyle
   - Dislikes should show boundaries, pet peeves, and deal-breakers
   - Make them specific and personal (not generic "likes technology")
   - Show preferences that connect to how they'd use the concept

5. QUOTE (Must be BRUTALLY HONEST):
   - Should sound like a real person speaking, not marketing copy
   - Include hesitation, skepticism, or enthusiasm as appropriate
   - Show personality through word choice and tone
   - Should reveal their true feelings, not what they think you want to hear
   - 1-3 sentences, conversational tone

6. WILLINGNESS TO PAY (Realistic scoring):
   - 0-2: Not interested, wouldn't pay
   - 3-4: Mildly interested, might pay if very cheap
   - 5-6: Interested, would pay fair price
   - 7-8: Very interested, would pay premium
   - 9-10: Extremely interested, would pay top dollar
   - Base on their income, pain point severity, and perceived value

7. BACKGROUND (Rich context):
   - 4-6 sentences minimum
   - Include: Where they grew up, key life experiences, current situation, what drives them
   - Show how their past shapes their present needs
   - Include relevant personal details that make them feel real

8. FEEDBACK (Honest, detailed critique):
   - 3-5 sentences minimum
   - Should include: What they like, what concerns them, what's missing, how it fits their life
   - Show skepticism where appropriate
   - Include specific questions or concerns they'd have
   - Make it feel like a real user interview transcript

For each persona, provide EXACTLY:
- name: Full realistic name (string) - use diverse, authentic names
- age: Number (22-68)
- occupation: Specific string (e.g., "Freelance graphic designer working from a co-working space in Portland, specializing in sustainable brands")
- pain_points: Array of 5-7 highly specific pain points (strings) - each should be detailed and actionable
- likes: Array of 5-7 specific likes (strings) - reveal personality
- dislikes: Array of 5-7 specific dislikes (strings) - show boundaries
- quote: Brutally honest 1-3 sentence quote (string) - conversational, authentic
- willingness_to_pay: Number 0-10 (realistic score based on their situation)
- background: 4-6 sentence detailed background (string) - rich context
- feedback: 3-5 sentence honest, detailed feedback (string) - like a real interview

═══════════════════════════════════════════════════════════════
CREATIVE WORLD REQUIREMENTS:
═══════════════════════════════════════════════════════════════

The world must be IMMERSIVE, VIVID, and FULLY REALIZED:

1. SETTING (Rich, sensory description):
   - 6-8 sentences minimum
   - Include: Geography, climate, architecture, atmosphere, time period, culture, social dynamics
   - Add sensory details: What does it look, sound, smell, feel like?
   - Show unique features that make this world distinct
   - Create atmosphere and mood through description
   - Make it feel like a place you could visit

2. CHARACTERS (MANDATORY: Generate EXACTLY 6-8 complex characters - ALL MUST BE UNIQUE AND FULLY DEVELOPED):
   - ABSOLUTE REQUIREMENT: You MUST generate AT LEAST 6 characters (preferably 6-8). This is non-negotiable.
   - CRITICAL: EVERY SINGLE CHARACTER must be as detailed and unique as the first one. Do not start strong and then use generic placeholders.
   - NEVER use generic names like "Character 1", "Character 2", "Character X", or any variation
   - NEVER use generic roles like "Important figure", "Character", "Person", or any placeholder text
   - Each character must be fully developed, not a cardboard cutout
   
   EXAMPLE OF GOOD CHARACTERS (ALL characters must be like this):
   - Name: "Maya Chen" (NOT "Character 1")
   - Role: "The Curator of Lost Memories" (NOT "Important figure")
   - Description: "Maya is a 42-year-old archivist with silver-streaked hair who has spent two decades preserving forgotten stories. She moves through the world with deliberate grace, her hands always slightly stained with ink from her work. Maya is driven by a deep fear that important narratives will be lost forever, and she sees herself as a guardian of truth. She has a complex relationship with technology - she appreciates its power to preserve, but worries about the loss of tangible, physical artifacts. Her greatest desire is to create a bridge between the past and future, ensuring that wisdom isn't lost in the digital age. Maya's flaw is her tendency to hoard information, sometimes preventing her from sharing stories that could help others."
   
   - Name: "Dr. Jameson" (NOT "Character 2")
   - Role: "The Bridge Builder" (NOT "Generic role")
   - Description: "Dr. Jameson is a 58-year-old former engineer turned philosopher who believes in connecting disparate worlds. He has a weathered face that tells stories of many journeys, and eyes that seem to see connections others miss. Jameson is motivated by a vision of unity - he wants to break down barriers between different communities and perspectives. He fears fragmentation and isolation, seeing them as the greatest threats to progress. His strength is his ability to translate complex ideas between different domains, but his weakness is his idealism - he sometimes fails to see the practical obstacles that prevent his visions from becoming reality."
   
   REQUIREMENTS FOR ALL 6-8 CHARACTERS:
   - Each must have a unique, memorable name (like "Maya Chen", "Dr. Jameson", "Elena Vasquez", "The Keeper of Stories")
   - Each must have a specific, interesting role (like "The Curator of Lost Memories", "The Bridge Builder", "The Whisperer of Secrets")
   - Each description must be 5-7 sentences of rich, detailed content (like the examples above)
   - Include: What drives them, what they fear, what they want, how they interact with the world
   - Show how they connect to or represent aspects of the personas
   - Make them feel like real people with depth
   - Create a diverse cast with different roles, backgrounds, and perspectives
   - NO GENERIC PLACEHOLDERS - every character must be unique and compelling
   - ALL characters must be equally detailed - do not make some detailed and others generic

3. CONFLICT (Meaningful, compelling):
   - 5-7 sentences minimum
   - Must be a central tension that drives narrative
   - Should relate to the concept in meaningful ways
   - Include: What's at stake, who's involved, why it matters
   - Show multiple perspectives on the conflict
   - Make it feel urgent and important

4. MAP_DESCRIPTION (Vivid locations):
   - 5-7 sentences minimum
   - Describe 3-5 key locations in detail
   - Include: What makes each place unique, who goes there, what happens there
   - Add sensory details and atmosphere
   - Show how locations connect to the personas and story
   - Make places feel lived-in and real

5. MICRO_STORY (Immersive narrative):
   - 400-600 words minimum (significantly longer and more detailed)
   - Must be a complete, compelling story with a beginning, middle, and end
   - Should weave together multiple personas, world elements, and the concept
   - Include: Character actions, dialogue, sensory details, emotional beats, plot progression
   - Show the world in action, not just description
   - Feature multiple characters interacting and moving through the world
   - Include scenes, moments, and narrative arcs
   - Make it feel like a complete short story or chapter from a novel
   - Should be engaging enough to stand alone as a piece of creative writing
   - Leave the reader fully immersed and wanting to explore more

6. TONE (Detailed atmosphere):
   - 4-6 sentences minimum
   - Describe: Overall mood, emotional quality, narrative voice
   - Include: What genre it feels like, what emotions it evokes
   - Show how tone connects to the concept
   - Make it specific and vivid

For the creative world, provide:
- setting: Rich 6-8 sentence setting description (string) - immersive and sensory
- characters: Array of 6-8 main characters, each with:
  - name: Character name (string)
  - role: Specific character role (string) - be detailed
  - description: Detailed 5-7 sentence character description (string) - full personality and depth
- conflict: Detailed 5-7 sentence central conflict (string) - meaningful and compelling
- map_description: Detailed 5-7 sentence description of key locations (string) - vivid and immersive
- micro_story: 400-600 word immersive micro-story (string) - complete narrative that connects everything, featuring multiple characters and scenes
- tone: Detailed 4-6 sentence tone description (string) - specific atmosphere

═══════════════════════════════════════════════════════════════
QUALITY STANDARDS (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════

1. PERSONAS:
   - Must feel like real people you could meet tomorrow
   - No stereotypes or generic descriptions
   - Each persona should be memorable and distinct
   - Pain points must be specific enough to act on
   - Feedback should sound like real user interviews
   - Quotes should reveal personality and authenticity

2. WORLD:
   - Must feel fully realized and immersive
   - Should be a place you want to explore
   - Characters should feel three-dimensional
   - Conflict should be meaningful and compelling
   - Story should be engaging and complete
   - Everything should work together cohesively

3. INTEGRATION:
   - Personas and world should feel connected
   - The concept should be woven throughout naturally
   - Everything should support the overall narrative
   - No disconnected elements

4. WRITING QUALITY:
   - Professional creative writing standard
   - Vivid, engaging, immersive
   - Show, don't tell
   - Use specific details, not generic descriptions
   - Create emotional resonance

Return JSON with:
- personas: Array of 5-7 persona objects (each with all required fields)
- world: Object with setting, characters (array of 6-8 characters), conflict, map_description, micro_story (400-600 words), tone

⚠️ FINAL CHECK BEFORE RETURNING JSON:
1. Count the characters in your "characters" array. You MUST have at least 6. Count them: 1, 2, 3, 4, 5, 6 (minimum required), 7, 8 (ideal).
2. Go through EACH character one by one and verify:
   - Does character 1 have a unique name? (NOT "Character 1")
   - Does character 2 have a unique name? (NOT "Character 2")
   - Does character 3 have a unique name? (NOT "Character 3")
   - Does character 4 have a unique name? (NOT "Character 4")
   - Does character 5 have a unique name? (NOT "Character 5")
   - Does character 6 have a unique name? (NOT "Character 6")
3. Verify EACH character has a specific role (not "Important figure" or generic text)
4. Verify EACH character description is 5-7 sentences long and as detailed as the first character
5. Make sure ALL characters are equally detailed - do not make the first 2 detailed and then use generic placeholders for the rest

CRITICAL: If ANY character has a generic name, generic role, or generic description, REPLACE IT with a fully developed character. ALL 6+ characters must be unique and detailed.

Input to transform: {input}`;

async function generateCreativePersonas(inputText, retryCount = 0) {
  const maxRetries = 2;
  const prompt = CREATIVE_PERSONAS_PROMPT.replace('{input}', inputText);
  
  // Enhanced system prompt with even more emphasis on character count for retries
  let systemPrompt = `You are a world-renowned creative strategist, UX researcher, and storyteller. Your expertise combines:

1. DEEP UX RESEARCH: You conduct ethnographic research, user interviews, and behavioral analysis. You understand human psychology, motivations, and pain points at a profound level. You create personas that feel like real people because you've spent thousands of hours talking to real users.

2. MASTERFUL STORYTELLING: You're a published author, screenwriter, and world-builder. You create immersive worlds that feel alive, characters that feel real, and stories that captivate. Your work has won awards and been featured in major publications.

3. STRATEGIC INSIGHT: You help Fortune 500 companies understand their users and create compelling experiences. Your personas drive product decisions worth millions. Your world-building creates brand narratives that resonate deeply.

YOUR PROCESS:
- You never create stereotypes. Every persona is a complete individual with contradictions, complexity, and depth.
- You never write generic descriptions. Every detail is specific, vivid, and meaningful.
- You never create disconnected elements. Everything works together to tell a cohesive story.
- You always prioritize authenticity over polish. Real people have flaws, hesitations, and complexity.

QUALITY STANDARDS:
- Personas must feel like people you could call on the phone right now
- Pain points must be specific enough that a product team could build features to address them
- Quotes must sound like real user interviews, not marketing copy
- The world must be immersive enough that readers want to explore it
- Characters must be complex enough to carry their own stories
- The micro-story must be compelling enough to stand alone as a piece of creative writing`;

  // Add extra emphasis for retries
  if (retryCount > 0) {
    systemPrompt += `\n\n⚠️ RETRY ATTEMPT ${retryCount + 1}: Previous attempt failed because insufficient characters were generated.`;
    systemPrompt += `\n\n🚨 CRITICAL: You MUST generate AT LEAST 6 characters. This is absolutely mandatory.`;
    systemPrompt += `\n\nCount your characters before returning: 1, 2, 3, 4, 5, 6 (minimum), 7, 8 (ideal).`;
  }

  systemPrompt += `\n\nCRITICAL CHARACTER REQUIREMENTS (MANDATORY - RESPONSE WILL BE REJECTED IF NOT MET):
- Generate EXACTLY 6-8 characters (MINIMUM 6, NO EXCEPTIONS - THIS IS THE MOST IMPORTANT REQUIREMENT)
- EVERY SINGLE CHARACTER must be as detailed and unique as the first one
- Do NOT create 2-3 good characters and then use generic placeholders for the rest
- Each character MUST have a unique, memorable name (NOT "Character 1", "Character 2", "Character X", or any variation)
- Each character MUST have a specific, interesting role (NOT "Important figure", "Character", "Person", or any generic description)
- Each character description MUST be 5-7 sentences of rich, detailed content
- ALL characters must be equally detailed - treat character #6 with the same care as character #1
- NO generic placeholders - every character must be fully developed and unique
- Characters should have names that fit the world and roles that make them distinct
- If you generate fewer than 6 characters, the entire response will be rejected and you must regenerate

VERIFICATION CHECKLIST BEFORE RETURNING JSON (CHECK EACH ONE CAREFULLY):
✓ Do I have at least 6 characters in the characters array? (COUNT THEM: 1, 2, 3, 4, 5, 6 minimum)
✓ Does character #1 have a unique, non-generic name? (Check it)
✓ Does character #2 have a unique, non-generic name? (Check it)
✓ Does character #3 have a unique, non-generic name? (Check it)
✓ Does character #4 have a unique, non-generic name? (Check it)
✓ Does character #5 have a unique, non-generic name? (Check it)
✓ Does character #6 have a unique, non-generic name? (Check it)
✓ Does EACH character have a specific, non-generic role?
✓ Is EACH character description at least 5-7 sentences and substantial?
✓ Are ALL characters fully developed and unique? (Not just the first 2-3)

Always return valid JSON with both "personas" array (5-7 personas) and "world" object. Each persona must include ALL required fields with rich detail. The world must include ALL required fields with immersive depth: MINIMUM 6 (preferably 6-8) fully developed characters (each with unique names, specific roles, and 5-7 sentence descriptions) and a 400-600 word micro-story that tells a complete, engaging narrative. Everything must work together to create an extraordinary, integrated experience that blends realistic user insights with compelling creative storytelling.`;
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.9, true);
    
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
    
    // Validate and enhance personas
    const validatedPersonas = parsed.personas.map((persona, idx) => {
      // Ensure all required fields exist with defaults if needed
      return {
        name: persona.name || `Persona ${idx + 1}`,
        age: persona.age || 35,
        occupation: persona.occupation || 'Professional',
        pain_points: Array.isArray(persona.pain_points) && persona.pain_points.length > 0 
          ? persona.pain_points 
          : ['Needs better solutions for daily challenges'],
        likes: Array.isArray(persona.likes) && persona.likes.length > 0 
          ? persona.likes 
          : ['Quality experiences'],
        dislikes: Array.isArray(persona.dislikes) && persona.dislikes.length > 0 
          ? persona.dislikes 
          : ['Poorly designed solutions'],
        quote: persona.quote || 'This could be interesting if done right.',
        willingness_to_pay: typeof persona.willingness_to_pay === 'number' 
          ? Math.max(0, Math.min(10, persona.willingness_to_pay)) 
          : 5,
        background: persona.background || 'A person with unique experiences and perspectives.',
        feedback: persona.feedback || 'This concept has potential but needs refinement.'
      };
    });
    
    // Ensure world has required fields with rich defaults
    if (!parsed.world.setting || parsed.world.setting.length < 100) {
      parsed.world.setting = parsed.world.setting || 'A rich, immersive world waiting to be explored. A place where stories unfold and characters come to life.';
    }
    
    if (!parsed.world.characters || !Array.isArray(parsed.world.characters) || parsed.world.characters.length === 0) {
      throw new Error('No characters generated - world must include at least 6-8 fully developed characters');
    }
    
    // Validate and filter characters - remove any generic placeholders
    parsed.world.characters = parsed.world.characters
      .map((char, idx) => {
        // Skip characters with generic names or roles
        if (!char.name || 
            char.name.toLowerCase().includes('character') && /^\d+$/.test(char.name.replace(/[^0-9]/g, '')) ||
            char.name === `Character ${idx + 1}` ||
            char.name === `Character${idx + 1}`) {
          return null; // Mark for removal
        }
        
        if (!char.role || 
            char.role.toLowerCase().includes('important figure') ||
            char.role.toLowerCase().includes('generic')) {
          return null; // Mark for removal
        }
        
        // Ensure description is substantial and not generic
        if (!char.description || 
            char.description.length < 100 ||
            char.description.toLowerCase().includes('fully realized character with depth, motivations') ||
            char.description.toLowerCase().includes('interact with other characters and contribute to the overall narrative')) {
          return null; // Mark for removal
        }
        
        return {
          name: char.name,
          role: char.role,
          description: char.description
        };
      })
      .filter(char => char !== null); // Remove null entries
    
    // CRITICAL: Must have at least 6 characters - retry if not enough
    if (parsed.world.characters.length < 6) {
      const errorMsg = `Insufficient characters generated: ${parsed.world.characters.length} valid characters found. Required minimum: 6 characters.`;
      
      if (retryCount < maxRetries) {
        console.warn(`${errorMsg} Retrying... (Attempt ${retryCount + 2}/${maxRetries + 1})`);
        // Retry with more explicit instructions
        return await generateCreativePersonas(inputText, retryCount + 1);
      } else {
        console.error(`${errorMsg} Max retries reached.`);
        throw new Error(`${errorMsg} The LLM must generate 6-8 fully developed characters with unique names and specific roles.`);
      }
    }
    
    if (!parsed.world.conflict || parsed.world.conflict.length < 50) {
      parsed.world.conflict = parsed.world.conflict || 'A central conflict drives the narrative forward, creating tension and meaning.';
    }
    
    if (!parsed.world.map_description || parsed.world.map_description.length < 100) {
      parsed.world.map_description = parsed.world.map_description || 'Key locations that bring the world to life, each with its own character and significance.';
    }
    
    // Ensure micro_story is substantial (400-600 words = approximately 2000-3000 characters)
    if (!parsed.world.micro_story || parsed.world.micro_story.length < 2000) {
      parsed.world.micro_story = parsed.world.micro_story || 'A rich, immersive story unfolds, connecting personas to the world in meaningful ways. Multiple characters interact, scenes develop, and the narrative progresses through compelling moments that bring the world to life. The story weaves together different perspectives, creating a complete narrative experience that engages readers and leaves them wanting to explore more of this world.';
    }
    
    if (!parsed.world.tone || parsed.world.tone.length < 50) {
      parsed.world.tone = parsed.world.tone || 'A rich, immersive atmosphere that draws readers in.';
    }
    
    return {
      personas: validatedPersonas,
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

