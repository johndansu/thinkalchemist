const { callLLM } = require('../llm');

const STRATEGIC_ANALYSIS_PROMPT = `You are a world-class strategic consultant combining concept breakdown expertise with comprehensive risk analysis. Conduct a complete strategic analysis of the following concept that includes both structured breakdown AND reality-check stress testing.

ANALYSIS FRAMEWORK:
1. Core Essence: Distill what the concept fundamentally is
2. Component Breakdown: Break down into key components with importance levels
3. Strategic Analysis: Best-case, worst-case, and hidden risks
4. Applications: Potential use cases and feasibility
5. Variations: Alternative approaches and their potential
6. Strategic Recommendations: Actionable next steps and improvements

CRITICAL REQUIREMENTS:
- Provide both structured breakdown AND honest reality-check analysis
- Be specific and actionable, not generic
- Balance optimism with realism
- Think like a seasoned consultant who has seen many projects succeed and fail
- Identify both opportunities and threats

Return JSON with:
- core_essence: 2-3 sentence distillation of what the concept fundamentally is (string)
- key_components: Array of 4-6 core components/elements, each with:
  - name: Component name (string)
  - description: 2-3 sentence description (string)
  - importance: "critical" | "important" | "supporting" (string)
- best_case: Detailed 3-4 sentence best-case scenario (string) - include specific outcomes, metrics, market position
- worst_case: Detailed 3-4 sentence worst-case scenario (string) - include specific failure modes and consequences
- hidden_risks: Array of 5-7 specific hidden risks (array of strings) - each should be detailed and specific
- potential_applications: Array of 3-5 potential use cases, each with:
  - title: Application title (string)
  - description: 2-3 sentence description (string)
  - feasibility: "high" | "medium" | "low" (string)
- refined_variations: Array of 3-4 alternative approaches, each with:
  - title: Variation title (string)
  - description: 2-3 sentence description (string)
  - potential: "high" | "medium" | "low" (string)
- one_line_pitch: Compelling one-line pitch (string) - investor-ready and memorable
- improvement_suggestion: Detailed 4-5 sentence "10× improvement" recommendation (string) - strategic and transformative
- strategic_insights: 3-4 sentence summary of key strategic insights (string)
- next_steps: Array of 3-5 actionable next steps (strings)

QUALITY STANDARDS:
- Analysis should feel like it came from a top-tier consulting firm
- Be specific and detailed, not vague
- Provide real strategic value
- Balance breakdown clarity with honest risk assessment
- Everything should work together cohesively

Input to analyze: {input}`;

async function analyzeStrategically(inputText) {
  const prompt = STRATEGIC_ANALYSIS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a world-class strategic consultant with 20+ years of experience at top consulting firms. You combine deep analytical thinking with honest risk assessment. Your strategic analyses have guided Fortune 500 companies and successful startups. Always return valid JSON with all required fields. Your analysis must: (1) Distill the core essence clearly, (2) Break down components systematically, (3) Provide honest best/worst case scenarios, (4) Identify realistic applications and variations, (5) Surface hidden risks honestly, (6) Offer strategic insights and actionable next steps. Be specific, actionable, and insightful - avoid generic advice. Think like McKinsey meets Y Combinator.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.75, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.core_essence) {
      parsed.core_essence = 'A concept requiring strategic analysis.';
    }
    
    if (!parsed.key_components || !Array.isArray(parsed.key_components)) {
      parsed.key_components = [];
    }
    
    if (!parsed.best_case) {
      parsed.best_case = 'Best-case scenario analysis pending.';
    }
    
    if (!parsed.worst_case) {
      parsed.worst_case = 'Worst-case scenario analysis pending.';
    }
    
    if (!parsed.hidden_risks || !Array.isArray(parsed.hidden_risks)) {
      parsed.hidden_risks = [];
    }
    
    if (!parsed.potential_applications || !Array.isArray(parsed.potential_applications)) {
      parsed.potential_applications = [];
    }
    
    if (!parsed.refined_variations || !Array.isArray(parsed.refined_variations)) {
      parsed.refined_variations = [];
    }
    
    if (!parsed.one_line_pitch) {
      parsed.one_line_pitch = 'A compelling pitch for this concept.';
    }
    
    if (!parsed.improvement_suggestion) {
      parsed.improvement_suggestion = 'Strategic improvement recommendations.';
    }
    
    if (!parsed.strategic_insights) {
      parsed.strategic_insights = 'Key strategic insights will emerge through analysis.';
    }
    
    if (!parsed.next_steps || !Array.isArray(parsed.next_steps)) {
      parsed.next_steps = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Strategic analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to analyze strategically: ${error.message}`);
  }
}

module.exports = { analyzeStrategically };

