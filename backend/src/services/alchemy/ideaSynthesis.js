const { callLLM } = require('../llm');

const CONCEPT_BREAKDOWN_PROMPT = `You are an expert concept analyst and breakdown specialist. Transform the following input into a comprehensive, structured breakdown that reveals the core essence, potential, and actionable insights of the concept.

CRITICAL REQUIREMENTS:
Break down the idea into multiple dimensions to provide deep understanding and actionable insights.

Return JSON with:
- core_essence: 2-3 sentence distillation of what the idea fundamentally is (string)
- key_components: Array of 4-6 core components/elements, each with:
  - name: Component name (string)
  - description: 2-3 sentence description of this component (string)
  - importance: "critical" | "important" | "supporting" (string)
- potential_applications: Array of 3-5 potential use cases or applications, each with:
  - title: Application title (string)
  - description: 2-3 sentence description (string)
  - feasibility: "high" | "medium" | "low" (string)
- strengths: Array of 4-6 key strengths or advantages (strings)
- challenges: Array of 4-6 potential challenges or obstacles (strings)
- refined_variations: Array of 3-4 alternative or refined versions of the idea, each with:
  - title: Variation title (string)
  - description: 2-3 sentence description of how this variation differs (string)
  - potential: "high" | "medium" | "low" (string)
- synthesis_insights: 3-4 sentence summary of key insights and recommendations (string)
- next_steps: Array of 3-5 actionable next steps (strings)

QUALITY STANDARDS:
- Be specific and actionable, not generic
- Provide real insights that help refine and develop the idea
- Make connections between different aspects
- Think strategically about potential and challenges
- Write in a clear, professional tone

Input to synthesize: {input}`;

async function breakdownConcept(inputText) {
  const prompt = CONCEPT_BREAKDOWN_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-class concept analyst and breakdown specialist with 20+ years of experience helping Fortune 500 companies and startups understand and structure complex concepts. You specialize in breaking down ideas into their fundamental components and identifying actionable pathways. Your breakdown work has led to successful product launches and strategic pivots. Always return valid JSON with all required fields. Your breakdown must: (1) Distill the core essence clearly, (2) Break down components systematically, (3) Identify realistic applications, (4) Balance strengths and challenges honestly, (5) Provide actionable variations, (6) Offer strategic insights and next steps. Be specific, actionable, and insightful - avoid generic advice.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.7, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.core_essence) {
      parsed.core_essence = 'A concept waiting to be fully explored.';
    }
    
    if (!parsed.key_components || !Array.isArray(parsed.key_components)) {
      parsed.key_components = [];
    }
    
    if (!parsed.potential_applications || !Array.isArray(parsed.potential_applications)) {
      parsed.potential_applications = [];
    }
    
    if (!parsed.strengths || !Array.isArray(parsed.strengths)) {
      parsed.strengths = [];
    }
    
    if (!parsed.challenges || !Array.isArray(parsed.challenges)) {
      parsed.challenges = [];
    }
    
    if (!parsed.refined_variations || !Array.isArray(parsed.refined_variations)) {
      parsed.refined_variations = [];
    }
    
    if (!parsed.synthesis_insights) {
      parsed.synthesis_insights = 'Key insights will emerge as the idea is developed further.';
    }
    
    if (!parsed.next_steps || !Array.isArray(parsed.next_steps)) {
      parsed.next_steps = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Idea synthesis error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to breakdown concept: ${error.message}`);
  }
}

module.exports = { breakdownConcept };

