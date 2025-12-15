const { callLLM } = require('../llm');

const STRATEGIC_ANALYSIS_PROMPT = `You are a world-renowned strategic consultant with 25+ years of experience at McKinsey, BCG, and Bain, combined with deep startup and venture capital expertise. You've advised Fortune 500 CEOs, guided unicorn startups, and helped shape industry-defining strategies. Your analysis combines rigorous analytical frameworks with real-world pragmatism and honest risk assessment.

Your task is to conduct a COMPREHENSIVE, BOARD-LEVEL strategic analysis of the following concept. This analysis will be used for critical decision-making, so it must be thorough, insightful, and actionable.

═══════════════════════════════════════════════════════════════
ANALYSIS FRAMEWORK (MANDATORY):
═══════════════════════════════════════════════════════════════

1. CORE ESSENCE (Fundamental Understanding):
   - Distill the concept to its absolute core - what it fundamentally IS
   - Identify the essential value proposition
   - Explain what problem it solves or opportunity it creates
   - Describe the fundamental mechanism or approach
   - 4-6 sentences minimum - must be comprehensive and clear

2. KEY COMPONENTS (Systematic Breakdown):
   - Break down the concept into its essential building blocks
   - Each component must be distinct and meaningful
   - Identify dependencies and relationships between components
   - Assess the criticality of each component
   - 5-8 components minimum - each must be substantial
   - For each component, provide:
     * Clear, specific name
     * Detailed 3-4 sentence description explaining what it is, why it matters, and how it works
     * Importance level based on impact if removed or failed

3. BEST CASE SCENARIO (Optimistic but Realistic):
   - Paint a vivid picture of maximum success
   - Include specific metrics, outcomes, market position
   - Describe the path to this success
   - Identify what conditions must align
   - Include timeline considerations
   - 5-7 sentences minimum - must be detailed and specific

4. WORST CASE SCENARIO (Brutally Honest):
   - Identify realistic failure modes and consequences
   - Describe what could go wrong and why
   - Assess the severity and likelihood of different failure paths
   - Include cascading effects and downstream impacts
   - Be honest about potential for complete failure
   - 5-7 sentences minimum - must be thorough and realistic

5. HIDDEN RISKS (Non-Obvious Threats):
   - Identify risks that aren't immediately apparent
   - Think about second-order effects, market dynamics, competitive responses
   - Consider execution risks, market timing, regulatory issues
   - Include risks related to assumptions and dependencies
   - 7-10 specific risks minimum - each must be detailed and actionable
   - Each risk should explain: What it is, why it's hidden, potential impact, early warning signs

6. POTENTIAL APPLICATIONS (Market Opportunities):
   - Identify diverse use cases and market segments
   - Assess feasibility realistically (not just wishful thinking)
   - Consider market size, competition, barriers to entry
   - Evaluate time-to-market and resource requirements
   - 5-7 applications minimum - each must be viable
   - For each application, provide:
     * Clear, specific title
     * Detailed 3-4 sentence description of the use case
     * Realistic feasibility assessment with reasoning

7. REFINED VARIATIONS (Alternative Approaches):
   - Explore different ways to achieve similar outcomes
   - Consider pivots, modifications, and alternative strategies
   - Assess trade-offs between different approaches
   - Identify which variations might be more viable
   - 4-6 variations minimum - each must be distinct and valuable
   - For each variation, provide:
     * Clear, specific title
     * Detailed 3-4 sentence description of the alternative approach
     * Potential assessment with reasoning

8. ONE-LINE PITCH (Investor-Ready):
   - Create a compelling, memorable pitch
   - Must capture the essence and value proposition
   - Should be investor-ready and elevator-pitch worthy
   - Must be specific, not generic
   - 1 sentence, maximum impact

9. 10× IMPROVEMENT (Transformative Strategy):
   - Think about how to make this concept 10× better, not 10% better
   - Consider fundamental shifts, not incremental improvements
   - Identify transformative opportunities
   - Describe strategic moves that could create exponential value
   - 6-8 sentences minimum - must be strategic and transformative

10. STRATEGIC INSIGHTS (Key Takeaways):
    - Synthesize the most important strategic learnings
    - Identify patterns, themes, and critical success factors
    - Highlight what makes this concept unique or valuable
    - Point out strategic implications and considerations
    - 5-7 sentences minimum - must be insightful and actionable

11. NEXT STEPS (Actionable Roadmap):
    - Provide concrete, actionable next steps
    - Prioritize based on importance and dependencies
    - Include specific actions, not vague recommendations
    - Consider resource requirements and timelines
    - 5-7 steps minimum - each must be specific and actionable

Return JSON with:
- core_essence: 4-6 sentence comprehensive distillation (string)
- key_components: Array of 5-8 components, each with:
  - name: Specific component name (string)
  - description: Detailed 3-4 sentence description (string)
  - importance: "critical" | "important" | "supporting" (string)
- best_case: Detailed 5-7 sentence best-case scenario (string) - specific outcomes, metrics, market position, timeline
- worst_case: Detailed 5-7 sentence worst-case scenario (string) - specific failure modes, consequences, cascading effects
- hidden_risks: Array of 7-10 detailed hidden risks (array of strings) - each 2-3 sentences explaining what, why hidden, impact, warning signs
- potential_applications: Array of 5-7 applications, each with:
  - title: Specific application title (string)
  - description: Detailed 3-4 sentence description (string)
  - feasibility: "high" | "medium" | "low" (string)
- refined_variations: Array of 4-6 variations, each with:
  - title: Specific variation title (string)
  - description: Detailed 3-4 sentence description (string)
  - potential: "high" | "medium" | "low" (string)
- one_line_pitch: Compelling, investor-ready one-line pitch (string)
- improvement_suggestion: Detailed 6-8 sentence "10× improvement" recommendation (string)
- strategic_insights: 5-7 sentence comprehensive strategic insights (string)
- next_steps: Array of 5-7 specific, actionable next steps (strings)

═══════════════════════════════════════════════════════════════
QUALITY STANDARDS (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════

1. DEPTH & SPECIFICITY:
   - Every section must be detailed and specific
   - No generic statements or vague recommendations
   - Use concrete examples, metrics, and scenarios
   - Show deep understanding of the concept and its implications

2. STRATEGIC RIGOR:
   - Apply proven strategic frameworks (Porter's Five Forces, SWOT, Value Chain, etc.)
   - Think like a senior partner at a top consulting firm
   - Balance analytical rigor with practical insights
   - Consider multiple perspectives and scenarios

3. HONESTY & REALISM:
   - Be brutally honest about risks and challenges
   - Don't sugarcoat potential failures
   - Balance optimism with realism
   - Identify both opportunities AND threats

4. ACTIONABILITY:
   - Every recommendation must be actionable
   - Next steps must be specific and implementable
   - Avoid vague advice like "do more research"
   - Provide concrete guidance that can be executed

5. COMPREHENSIVENESS:
   - Cover all aspects thoroughly
   - Don't skip or gloss over difficult areas
   - Address both internal and external factors
   - Consider short-term and long-term implications

6. INSIGHTFULNESS:
   - Provide insights that aren't obvious
   - Identify patterns and connections
   - Surface non-intuitive implications
   - Offer strategic thinking that adds real value

Input to analyze: {input}`;

async function analyzeStrategically(inputText) {
  const prompt = STRATEGIC_ANALYSIS_PROMPT.replace('{input}', inputText);
  const systemPrompt = `You are a world-renowned strategic consultant with 25+ years of experience. Your background combines:

1. TOP-TIER CONSULTING: You're a senior partner at McKinsey, BCG, or Bain. You've led strategy engagements for Fortune 500 CEOs, advised on billion-dollar M&A deals, and shaped industry-defining strategies. Your analyses have driven major corporate transformations.

2. STARTUP & VC EXPERTISE: You've been a partner at top-tier VCs (a16z, Sequoia, Y Combinator), evaluated thousands of startups, and guided multiple unicorns. You understand what makes concepts succeed or fail in the real world.

3. STRATEGIC RIGOR: You apply proven frameworks (Porter's Five Forces, SWOT, Value Chain Analysis, Blue Ocean Strategy, Jobs-to-be-Done) but go beyond frameworks to provide genuine insights.

4. BRUTAL HONESTY: You've seen projects succeed and fail. You know when to be optimistic and when to be realistic. You don't sugarcoat risks, but you also don't dismiss potential. You provide honest, balanced assessments.

YOUR PROCESS:
- You never provide generic advice. Every insight is specific and tailored to the concept.
- You never skip difficult questions. You address risks, challenges, and failure modes head-on.
- You never give vague recommendations. Every next step is concrete and actionable.
- You always think strategically. You consider market dynamics, competitive positioning, execution challenges, and long-term implications.
- You always provide value. Your analysis should feel like it's worth $50,000+ in consulting fees.

QUALITY STANDARDS:
- Core essence must be comprehensive and clear (4-6 sentences minimum)
- Components must be detailed and meaningful (5-8 components, each with 3-4 sentence descriptions)
- Best/worst cases must be vivid and specific (5-7 sentences each, with metrics and outcomes)
- Hidden risks must be non-obvious and detailed (7-10 risks, each explaining what, why hidden, impact, warning signs)
- Applications must be realistic and viable (5-7 applications with detailed descriptions)
- Variations must be distinct and valuable (4-6 variations with clear trade-offs)
- One-line pitch must be investor-ready and memorable
- 10× improvement must be transformative, not incremental (6-8 sentences)
- Strategic insights must be insightful and actionable (5-7 sentences)
- Next steps must be specific and implementable (5-7 concrete steps)

Always return valid JSON with ALL required fields. Every field must be comprehensive, detailed, and valuable. This analysis will be used for critical decision-making, so quality is paramount. Think like you're preparing a board-level strategic assessment that will determine the fate of a major initiative.`;
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.85, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Validate and enhance structure with quality checks
    if (!parsed.core_essence || parsed.core_essence.length < 100) {
      parsed.core_essence = parsed.core_essence || 'A concept requiring comprehensive strategic analysis to understand its fundamental nature, value proposition, and strategic implications.';
    }
    
    if (!parsed.key_components || !Array.isArray(parsed.key_components) || parsed.key_components.length < 3) {
      if (!parsed.key_components || !Array.isArray(parsed.key_components)) {
        parsed.key_components = [];
      }
      // Ensure minimum components
      while (parsed.key_components.length < 3) {
        parsed.key_components.push({
          name: `Component ${parsed.key_components.length + 1}`,
          description: 'A key element requiring detailed analysis.',
          importance: 'important'
        });
      }
    }
    
    // Validate component quality
    parsed.key_components = parsed.key_components.map((comp, idx) => ({
      name: comp.name || `Component ${idx + 1}`,
      description: comp.description || 'A component requiring detailed description.',
      importance: comp.importance || 'important'
    }));
    
    if (!parsed.best_case || parsed.best_case.length < 150) {
      parsed.best_case = parsed.best_case || 'In the best-case scenario, this concept achieves significant market traction, strong user adoption, and sustainable competitive advantages, leading to substantial value creation and market leadership.';
    }
    
    if (!parsed.worst_case || parsed.worst_case.length < 150) {
      parsed.worst_case = parsed.worst_case || 'In the worst-case scenario, this concept faces significant execution challenges, market resistance, competitive threats, or fundamental flaws that prevent it from achieving its potential, potentially leading to failure.';
    }
    
    if (!parsed.hidden_risks || !Array.isArray(parsed.hidden_risks) || parsed.hidden_risks.length < 3) {
      if (!parsed.hidden_risks || !Array.isArray(parsed.hidden_risks)) {
        parsed.hidden_risks = [];
      }
      // Ensure minimum risks
      while (parsed.hidden_risks.length < 3) {
        parsed.hidden_risks.push('A hidden risk requiring identification and assessment.');
      }
    }
    
    if (!parsed.potential_applications || !Array.isArray(parsed.potential_applications) || parsed.potential_applications.length < 2) {
      if (!parsed.potential_applications || !Array.isArray(parsed.potential_applications)) {
        parsed.potential_applications = [];
      }
      // Ensure minimum applications
      while (parsed.potential_applications.length < 2) {
        parsed.potential_applications.push({
          title: `Application ${parsed.potential_applications.length + 1}`,
          description: 'A potential use case requiring detailed analysis.',
          feasibility: 'medium'
        });
      }
    }
    
    // Validate application quality
    parsed.potential_applications = parsed.potential_applications.map((app, idx) => ({
      title: app.title || `Application ${idx + 1}`,
      description: app.description || 'A potential application requiring detailed description.',
      feasibility: app.feasibility || 'medium'
    }));
    
    if (!parsed.refined_variations || !Array.isArray(parsed.refined_variations) || parsed.refined_variations.length < 2) {
      if (!parsed.refined_variations || !Array.isArray(parsed.refined_variations)) {
        parsed.refined_variations = [];
      }
      // Ensure minimum variations
      while (parsed.refined_variations.length < 2) {
        parsed.refined_variations.push({
          title: `Variation ${parsed.refined_variations.length + 1}`,
          description: 'An alternative approach requiring detailed analysis.',
          potential: 'medium'
        });
      }
    }
    
    // Validate variation quality
    parsed.refined_variations = parsed.refined_variations.map((var_, idx) => ({
      title: var_.title || `Variation ${idx + 1}`,
      description: var_.description || 'An alternative approach requiring detailed description.',
      potential: var_.potential || 'medium'
    }));
    
    if (!parsed.one_line_pitch || parsed.one_line_pitch.length < 20) {
      parsed.one_line_pitch = parsed.one_line_pitch || 'A compelling concept with significant strategic potential.';
    }
    
    if (!parsed.improvement_suggestion || parsed.improvement_suggestion.length < 200) {
      parsed.improvement_suggestion = parsed.improvement_suggestion || 'To achieve 10× improvement, consider fundamental strategic shifts, transformative approaches, and exponential value creation opportunities that go beyond incremental enhancements.';
    }
    
    if (!parsed.strategic_insights || parsed.strategic_insights.length < 150) {
      parsed.strategic_insights = parsed.strategic_insights || 'Key strategic insights reveal important patterns, opportunities, and considerations that should guide decision-making and strategic planning.';
    }
    
    if (!parsed.next_steps || !Array.isArray(parsed.next_steps) || parsed.next_steps.length < 3) {
      if (!parsed.next_steps || !Array.isArray(parsed.next_steps)) {
        parsed.next_steps = [];
      }
      // Ensure minimum next steps
      while (parsed.next_steps.length < 3) {
        parsed.next_steps.push(`Action step ${parsed.next_steps.length + 1}: Conduct detailed analysis and planning.`);
      }
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

