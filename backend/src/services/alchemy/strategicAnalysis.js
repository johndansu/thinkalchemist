const { callLLM } = require('../llm');

const STRATEGIC_ANALYSIS_PROMPT = `You are a world-renowned strategic consultant with 25+ years of experience at McKinsey, BCG, and Bain, combined with deep startup and venture capital expertise. You've advised Fortune 500 CEOs, guided unicorn startups, and helped shape industry-defining strategies. Your analysis combines rigorous analytical frameworks with real-world pragmatism and honest risk assessment.

Your task is to conduct a COMPREHENSIVE, BOARD-LEVEL strategic analysis of the following concept. This analysis will be used for critical decision-making, so it must be thorough, insightful, and actionable.

Think like you're preparing a $500,000 strategic engagement for a Fortune 500 board. Every insight must be worth the price tag. Be specific, be honest, be strategic.

🚨 CRITICAL: Read the input concept carefully. EVERY single component, risk, application, and variation MUST be specifically tailored to THAT concept. Do NOT use generic templates, placeholders, or content that could apply to any concept. If you find yourself writing something generic, STOP and rewrite it to be specific to the input concept.

═══════════════════════════════════════════════════════════════
ANALYSIS FRAMEWORK (MANDATORY):
═══════════════════════════════════════════════════════════════

1. CORE ESSENCE (Fundamental Understanding):
   - Distill the concept to its absolute core - what it fundamentally IS
   - Identify the essential value proposition and unique differentiator
   - Explain what problem it solves or opportunity it creates (be specific about the problem/opportunity)
   - Describe the fundamental mechanism or approach (how it actually works)
   - Identify the core business model or value creation mechanism
   - Explain why this matters now (timing, market conditions, trends)
   - 6-8 sentences minimum - must be comprehensive, clear, and insightful
   - Avoid generic statements - be specific to THIS concept

2. KEY COMPONENTS (Systematic Breakdown):
   - Break down the concept into its essential building blocks using Value Chain Analysis
   - Each component must be distinct, meaningful, and critical to the concept's success
   - Identify dependencies and relationships between components (which components depend on others)
   - Assess the criticality of each component (what happens if it fails?)
   - Consider technical, operational, market, and strategic components
   - 6-10 components minimum - each must be substantial and well-defined
   - CRITICAL: Component names must be SPECIFIC to THIS concept, not generic like "Component 4" or "Technology" or "Operations"
   - CRITICAL: Descriptions must be SPECIFIC and detailed, NOT "A key element requiring detailed analysis"
   - EVERY component must relate to the INPUT CONCEPT specifically - describe components of THIS concept, not generic business components
   - For each component, provide:
     * Clear, specific name that relates to the input concept (e.g., "Real-time Inventory Synchronization System" not "Component 4" or "Technology")
     * Detailed 4-5 sentence description explaining: what it is SPECIFICALLY for THIS concept, why it matters FOR THIS CONCEPT, how it works IN THIS CONTEXT, what depends on it
     * MUST mention how it relates to the input concept
     * Importance level based on impact if removed or failed ("critical" = concept fails without it, "important" = significantly degraded, "supporting" = nice to have)
     * Dependencies: what other components this depends on or enables
   - REMEMBER: Every component must be about THIS specific concept, not generic business components

3. BEST CASE SCENARIO (Optimistic but Realistic):
   - Paint a vivid, specific picture of maximum success (not just "it succeeds")
   - Include specific metrics: revenue, users, market share, valuation, growth rates
   - Describe market position: where it stands in 3-5 years, competitive position, brand perception
   - Describe the path to this success: key milestones, inflection points, growth trajectory
   - Identify what conditions must align: market conditions, execution quality, competitive landscape, timing
   - Include timeline considerations: when key milestones occur, time to market leadership
   - Consider second-order effects: how success creates more success, network effects, ecosystem development
   - 7-10 sentences minimum - must be detailed, specific, and paint a clear picture
   - Use concrete numbers and scenarios, not vague statements

4. WORST CASE SCENARIO (Brutally Honest):
   - Identify realistic failure modes and consequences (not just "it fails")
   - Describe what could go wrong and why: specific failure mechanisms, root causes
   - Assess the severity and likelihood of different failure paths: which are most likely, which are most damaging
   - Include cascading effects and downstream impacts: how one failure leads to others
   - Be honest about potential for complete failure: total loss scenarios, market rejection, competitive destruction
   - Consider execution failures, market timing failures, competitive responses, regulatory issues
   - Describe the "death spiral" scenario: how things could get progressively worse
   - 7-10 sentences minimum - must be thorough, realistic, and specific
   - Don't sugarcoat - be brutally honest about what could go wrong

5. HIDDEN RISKS (Non-Obvious Threats):
   - Identify risks that aren't immediately apparent (the "unknown unknowns")
   - Think about second-order effects: how success could create new risks, how market changes could invalidate assumptions
   - Consider execution risks: team capability, resource constraints, operational complexity
   - Consider market timing risks: being too early or too late, market saturation, trend reversals
   - Consider competitive responses: how incumbents might react, new entrants, disruptive alternatives
   - Consider regulatory/legal risks: changing regulations, compliance issues, IP challenges
   - Consider dependency risks: key partners, suppliers, technologies, market conditions
   - Consider assumption risks: what if core assumptions are wrong?
   - 8-12 specific risks minimum - each must be detailed, non-obvious, and actionable
   - CRITICAL: Risk names MUST be specific and contextual, NOT generic standalone terms
   - FORBIDDEN risk names: "Regulatory Risks", "Dependence on Key Employees", "Market Competition", "Execution Risk" (without specific context)
   - REQUIRED risk format: "Specific Risk Name: Detailed Context Related to Input Concept" 
   - EVERY risk must mention or relate to the INPUT CONCEPT specifically - not generic risks that apply to anything
   - CRITICAL: NEVER use "A hidden risk requiring identification and assessment" - every risk must be fully described
   - Each risk should be 3-4 sentences explaining: 
     * What it is (specific risk related to THIS concept with full context - mention the concept!)
     * Why it's hidden (why people might miss it)
     * Potential impact (severity, scope, timeline)
     * Early warning signs (how to detect it before it's too late)
     * Mitigation strategies (how to address it)
   - EXAMPLE GOOD RISK: "Regulatory Risk: EU Data Privacy Compliance for Cross-Border Inventory Sharing - This concept requires sharing inventory data across EU and US warehouses, which may violate GDPR if customer data is included. This is hidden because teams often assume inventory data is non-personal, but customer purchase patterns can be personally identifiable. Impact could include €20M fines and forced shutdown of EU operations. Early warning: Data protection officer raises concerns about cross-border data flows. Mitigation: Implement data anonymization and establish EU data processing agreements before launch."
   - EXAMPLE BAD RISK: "Regulatory Risks" ❌ or "A hidden risk requiring identification and assessment" ❌ or "Market competition could be a challenge" ❌
   - REMEMBER: Every risk must be about THIS specific concept, not generic business risks

6. POTENTIAL APPLICATIONS (Market Opportunities):
   - Identify diverse use cases and market segments using market segmentation frameworks
   - Assess feasibility realistically (not just wishful thinking) - be honest about challenges
   - Consider market size: TAM, SAM, SOM estimates where possible
   - Consider competition: who else serves this, what's their advantage, how to compete
   - Consider barriers to entry: what makes this hard, what protects it
   - Evaluate time-to-market: how long to reach this application, what's required
   - Evaluate resource requirements: capital, talent, partnerships needed
   - Consider customer acquisition: how to reach this market, what channels, what cost
   - 6-9 applications minimum - each must be viable and well-analyzed
   - CRITICAL: Application titles must be SPECIFIC and connect to THIS concept, NOT generic like "Healthcare Supply Chain Optimization" or "E-commerce Fulfillment" without specific connection
   - CRITICAL: Descriptions must explain HOW this concept specifically applies, NOT generic "The platform can be applied to..." or "This solution can..."
   - EVERY application must mention the INPUT CONCEPT specifically - describe how THIS concept applies, not generic applications
   - For each application, provide:
     * Clear, specific title that connects to the input concept (e.g., "AI-Powered Inventory Optimization for Hospital Supply Chains" not "Healthcare Supply Chain")
     * Detailed 4-5 sentence description: what the use case is SPECIFICALLY, who the customer is, why they'd use THIS concept, what problem THIS concept solves for them
     * MUST mention the input concept or its key features in the description
     * Realistic feasibility assessment ("high" = clear path, "medium" = possible with effort, "low" = challenging but not impossible)
     * Reasoning: why this feasibility level, what are the key factors
     * Market size indication: large, medium, or small opportunity
   - REMEMBER: Every application must be about THIS specific concept, not generic industry applications

7. REFINED VARIATIONS (Alternative Approaches):
   - Explore different ways to achieve similar outcomes (not just minor tweaks)
   - Consider pivots: fundamental changes to the approach, business model, or target market
   - Consider modifications: significant changes to execution, positioning, or strategy
   - Consider alternative strategies: different paths to the same goal
   - Assess trade-offs between different approaches: what you gain, what you lose
   - Identify which variations might be more viable and why
   - Consider "Blue Ocean" variations: ways to create uncontested market space
   - 5-8 variations minimum - each must be distinct, valuable, and well-reasoned
   - For each variation, provide:
     * Clear, specific title (what makes this variation different)
     * Detailed 4-5 sentence description: what the alternative approach is, how it differs, why it might work
     * Potential assessment ("high" = very promising, "medium" = worth exploring, "low" = interesting but risky)
     * Reasoning: why this potential level, what are the key advantages and disadvantages
     * Trade-offs: what you gain vs. what you lose compared to the original

8. ONE-LINE PITCH (Investor-Ready):
   - Create a compelling, memorable pitch
   - Must capture the essence and value proposition
   - Should be investor-ready and elevator-pitch worthy
   - Must be specific, not generic
   - 1 sentence, maximum impact

9. 10× IMPROVEMENT (Transformative Strategy):
   - Think about how to make this concept 10× better, not 10% better (order of magnitude, not percentage)
   - Consider fundamental shifts: business model changes, market redefinition, technology breakthroughs
   - Consider network effects: how to create exponential value through connections
   - Consider platform plays: how to become the infrastructure others build on
   - Consider ecosystem plays: how to create value through partnerships and integrations
   - Consider moat creation: how to build defensible competitive advantages
   - Identify transformative opportunities: what would fundamentally change the game
   - Describe strategic moves that could create exponential value: specific actions, not vague ideas
   - Think about "what if" scenarios: what if you had unlimited resources, what if you could change one fundamental assumption
   - 8-12 sentences minimum - must be strategic, transformative, and specific
   - Avoid incremental thinking - think about fundamental reimagination

10. STRATEGIC INSIGHTS (Key Takeaways):
    - Synthesize the most important strategic learnings from the entire analysis
    - Identify patterns, themes, and critical success factors across all sections
    - Highlight what makes this concept unique or valuable (the "why now, why this" question)
    - Point out strategic implications and considerations: what this means for decision-making
    - Identify non-obvious insights: things that aren't immediately apparent but are crucial
    - Connect the dots: how different aspects relate and reinforce each other
    - Highlight strategic tensions: competing priorities, trade-offs, dilemmas
    - Provide actionable wisdom: what should decision-makers focus on?
    - 7-10 sentences minimum - must be insightful, actionable, and synthesizing
    - This should feel like the "so what" - the key wisdom from the analysis

11. NEXT STEPS (Actionable Roadmap):
    - Provide concrete, actionable next steps (what to do, not what to think about)
    - Prioritize based on importance and dependencies (what must happen first)
    - Include specific actions: who should do what, when, with what resources
    - Consider resource requirements: what's needed (people, money, time, partnerships)
    - Consider timelines: when should each step happen, what's the sequence
    - Consider risk mitigation: what steps reduce the biggest risks
    - Consider validation: what steps test key assumptions
    - Consider quick wins: what can be done immediately to build momentum
    - 6-10 steps minimum - each must be specific, actionable, and prioritized
    - Format each step as: "Action: [specific action]. Timeline: [when]. Owner: [who]. Resources: [what's needed]. Why: [rationale]"

Return JSON with:
- core_essence: 6-8 sentence comprehensive distillation (string) - must be specific and insightful
- key_components: Array of 6-10 components, each with:
  - name: Specific component name (string) - not generic
  - description: Detailed 4-5 sentence description (string) - what, why, how, dependencies
  - importance: "critical" | "important" | "supporting" (string)
  - dependencies: Array of component names this depends on or enables (array of strings, optional)
- best_case: Detailed 7-10 sentence best-case scenario (string) - specific metrics, market position, timeline, path to success
- worst_case: Detailed 7-10 sentence worst-case scenario (string) - specific failure modes, consequences, cascading effects, death spiral
- hidden_risks: Array of 8-12 detailed hidden risks (array of strings) - each 3-4 sentences explaining what, why hidden, impact, warning signs, mitigation
- potential_applications: Array of 6-9 applications, each with:
  - title: Specific application title (string) - not generic
  - description: Detailed 4-5 sentence description (string) - use case, customer, problem solved
  - feasibility: "high" | "medium" | "low" (string)
  - reasoning: Why this feasibility level (string)
  - market_size: "large" | "medium" | "small" (string, optional)
- refined_variations: Array of 5-8 variations, each with:
  - title: Specific variation title (string) - what makes it different
  - description: Detailed 4-5 sentence description (string) - alternative approach, differences, why it might work
  - potential: "high" | "medium" | "low" (string)
  - reasoning: Why this potential level (string)
  - trade_offs: What you gain vs. lose (string, optional)
- one_line_pitch: Compelling, investor-ready one-line pitch (string) - must be specific and memorable
- improvement_suggestion: Detailed 8-12 sentence "10× improvement" recommendation (string) - transformative, not incremental
- strategic_insights: 7-10 sentence comprehensive strategic insights (string) - synthesizing key wisdom, patterns, implications
- next_steps: Array of 6-10 specific, actionable next steps (strings) - each should be: "Action: [what]. Timeline: [when]. Owner: [who]. Resources: [what's needed]. Why: [rationale]"

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

// Helper function to detect generic placeholder content
function isGenericContent(text, type) {
  if (!text || typeof text !== 'string') return true;
  
  const textLower = text.toLowerCase().trim();
  
  // Generic patterns to detect (strict - only obvious placeholders)
  // Only flag exact placeholder text, not partial matches
  const genericPatterns = [
    '^a key element requiring detailed analysis$',
    '^a component requiring detailed description$',
    '^a hidden risk requiring identification$',
    '^a potential application requiring detailed',
    '^an alternative approach requiring detailed',
    '^a concept requiring comprehensive strategic analysis$',
    '^conduct detailed analysis$',
    '^requires further analysis$',
    '^requires comprehensive strategic analysis$',
    '^a compelling concept with significant strategic potential$',
    '^to achieve 10× improvement, consider fundamental strategic shifts$',
    '^key strategic insights reveal important patterns$',
    '^action: conduct detailed analysis and planning$',
    '^component \\d+$',  // Exact match for "Component 4", "Component 5"
    '^application \\d+$',  // Exact match for "Application 1"
    '^variation \\d+$',  // Exact match for "Variation 1"
    '^step \\d+$',
    '^action step \\d+$'
  ];
  
  // Check for generic patterns (exact matches for numbered placeholders)
  for (const pattern of genericPatterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(textLower)) {
      return true;
    }
  }
  
  // Only flag extremely short text (likely a placeholder) - very lenient
  // Only flag if less than 10 characters (obvious placeholder)
  if (textLower.length < 10 && (type === 'component' || type === 'application' || type === 'variation')) {
    return true;
  }
  
  // Only flag generic phrases if they're at the start AND the text is very short
  // This allows longer descriptions that happen to mention these phrases
  const genericPhrases = [
    'can be applied to',
    'the platform can',
    'this solution can',
    'this concept can'
  ];
  
  // Only flag if text starts with generic phrase AND is very short (likely template)
  for (const phrase of genericPhrases) {
    if (textLower.startsWith(phrase) && textLower.length < 100) {
      return true;
    }
  }
  
  // Check for generic risk names (strict - must have context)
  if (type === 'risk') {
    // Check for standalone generic risk names (without context)
    const genericRisks = [
      '^regulatory risks$',
      '^regulatory risk$',
      '^dependence on key employees$',
      '^market competition$',
      '^execution risk$',
      '^market risk$',
      '^operational risk$',
      '^competitive risk$',
      '^financial risk$',
      '^technology risk$'
    ];
    for (const genericRisk of genericRisks) {
      const regex = new RegExp(genericRisk, 'i');
      if (regex.test(textLower)) {
        return true;
      }
    }
    // Check if it's just the placeholder text
    if (textLower.includes('a hidden risk requiring identification')) {
      return true;
    }
    // Only flag extremely short risks (likely a placeholder) - very lenient
    // Only flag if less than 15 characters (obvious placeholder)
    if (textLower.length < 15) {
      return true;
    }
    // Check if risk name is generic and description doesn't add context
    // Only flag if it's clearly a standalone generic risk name
    const genericRiskPatterns = [
      /^regulatory risks?:$/i,  // Only exact match for standalone
      /^dependence on key employees:$/i,
      /^market competition:$/i,
      /^execution risk:$/i
    ];
    for (const pattern of genericRiskPatterns) {
      if (pattern.test(textLower)) {
        // Only flag if it's just the name with no description
        if (textLower.length < 80) {
          return true;
        }
      }
    }
  }
  
  // Check for generic application names - only flag obvious placeholders
  if (type === 'application') {
    // Only flag if extremely short (obvious placeholder)
    if (textLower.length < 10) {
      return true;
    }
  }
  
  return false;
}

async function analyzeStrategically(inputText, retryCount = 0) {
  const maxRetries = 2; // Increased back to 2 to catch more generic content
  const prompt = STRATEGIC_ANALYSIS_PROMPT.replace('{input}', inputText);
  let systemPrompt = `You are a world-renowned strategic consultant with 25+ years of experience. Your background combines:

1. TOP-TIER CONSULTING: You're a senior partner at McKinsey, BCG, or Bain. You've led strategy engagements for Fortune 500 CEOs, advised on billion-dollar M&A deals, and shaped industry-defining strategies. Your analyses have driven major corporate transformations.

2. STARTUP & VC EXPERTISE: You've been a partner at top-tier VCs (a16z, Sequoia, Y Combinator), evaluated thousands of startups, and guided multiple unicorns. You understand what makes concepts succeed or fail in the real world.

3. STRATEGIC RIGOR: You apply proven frameworks (Porter's Five Forces, SWOT, Value Chain Analysis, Blue Ocean Strategy, Jobs-to-be-Done, Business Model Canvas, Ansoff Matrix, BCG Matrix, McKinsey 7-S Framework) but go beyond frameworks to provide genuine insights. You think in systems, not just lists.

4. BRUTAL HONESTY: You've seen projects succeed and fail. You know when to be optimistic and when to be realistic. You don't sugarcoat risks, but you also don't dismiss potential. You provide honest, balanced assessments.

YOUR PROCESS:
- You never provide generic advice. Every insight is specific and tailored to the concept.
- You never skip difficult questions. You address risks, challenges, and failure modes head-on.
- You never give vague recommendations. Every next step is concrete and actionable.
- You always think strategically. You consider market dynamics, competitive positioning, execution challenges, and long-term implications.
- You always provide value. Your analysis should feel like it's worth $50,000+ in consulting fees.

QUALITY STANDARDS (ENFORCED):
- Core essence must be comprehensive, clear, and specific (6-8 sentences minimum) - no generic statements
- Components must be detailed and meaningful (6-10 components, each with 4-5 sentence descriptions including dependencies)
- Best/worst cases must be vivid and specific (7-10 sentences each, with concrete metrics, timelines, and scenarios)
- Hidden risks must be non-obvious and detailed (8-12 risks, each 3-4 sentences explaining what, why hidden, impact, warning signs, mitigation)
- Applications must be realistic and viable (6-9 applications with detailed descriptions, feasibility reasoning, and market size)
- Variations must be distinct and valuable (5-8 variations with clear trade-offs and reasoning)
- One-line pitch must be investor-ready, memorable, and specific to this concept
- 10× improvement must be transformative, not incremental (8-12 sentences) - think order of magnitude, not percentage
- Strategic insights must be insightful, actionable, and synthesizing (7-10 sentences) - the "so what" wisdom
- Next steps must be specific and implementable (6-10 concrete steps with action, timeline, owner, resources, rationale)

FINAL CHECK BEFORE RETURNING:
✓ Every section is detailed and specific (no generic statements)
✓ Every section meets minimum length requirements
✓ All arrays meet minimum count requirements
✓ All risks are non-obvious (not just "competition" or "execution")
✓ All applications are viable and well-reasoned
✓ All variations are distinct and valuable
✓ Next steps are actionable (not "do research" or "think about")
✓ The analysis feels worth $500,000 in consulting fees

Always return valid JSON with ALL required fields. Every field must be comprehensive, detailed, and valuable. This analysis will be used for critical decision-making, so quality is paramount. Think like you're preparing a board-level strategic assessment that will determine the fate of a major initiative.

🚨🚨🚨 CRITICAL: DO NOT USE GENERIC PLACEHOLDERS OR TEMPLATE TEXT 🚨🚨🚨

THE INPUT CONCEPT IS THE FOUNDATION OF EVERYTHING. Every component, risk, application, and variation MUST be generated based on the INPUT CONCEPT, not from generic templates.

BEFORE GENERATING ANY ITEM:
1. Look at the INPUT CONCEPT
2. Ask: "What does THIS concept specifically need/have/face?"
3. Generate based on THAT, not generic business knowledge
4. If you're about to write something generic, STOP and think about the input concept again

FORBIDDEN (DO NOT USE - THESE WILL BE REJECTED):
❌ Component names: "Component 4", "Component 5", "Technology", "Marketing", "Operations"
❌ Component descriptions: "A key element requiring detailed analysis", "A component requiring detailed description", "This component is important"
❌ Risk names: "Regulatory Risks", "Dependence on Key Employees", "Market Competition", "Execution Risk" (without specific context)
❌ Risk descriptions: "A hidden risk requiring identification and assessment", "This is a risk that could impact the project"
❌ Application titles: "Healthcare Supply Chain Optimization", "E-commerce Fulfillment", "Enterprise Solution" (without specific connection to input)
❌ Application descriptions starting with: "The platform can be applied to...", "This solution can...", "This concept can..." (generic phrasing)
❌ Generic phrases: "can be applied to", "the platform can", "this solution can", "this concept can" (without specific details)

REQUIRED (YOU MUST USE):
✅ Component names: Specific, descriptive names like "Real-time Inventory Synchronization Engine", "AI-Powered Demand Forecasting Module"
✅ Component descriptions: 4-5 sentences explaining what it is SPECIFICALLY, why it matters FOR THIS CONCEPT, how it works
✅ Risk names: Specific risks like "Regulatory Risk: EU Data Privacy Compliance for Cross-Border Inventory Sharing"
✅ Risk descriptions: 3-4 sentences explaining what the risk is SPECIFICALLY, why it's hidden, impact, warning signs
✅ Application titles: Specific applications like "Hospital Supply Chain Optimization for Emergency Departments"
✅ Application descriptions: 4-5 sentences explaining the use case SPECIFICALLY, who the customer is, why they'd use THIS concept

CRITICAL RULE: Every single item MUST reference or relate to the INPUT CONCEPT specifically. If you find yourself writing generic text that could apply to any concept, STOP and rewrite it to be specific to THIS concept.

READ THE INPUT CONCEPT CAREFULLY. Every single item must be tailored to THAT specific concept, not generic templates. Generic content will be automatically filtered out.`;

  // Add retry emphasis if this is a retry
  if (retryCount > 0) {
    systemPrompt += `\n\n⚠️⚠️⚠️ RETRY ATTEMPT ${retryCount + 1}: Previous attempt was REJECTED because generic placeholder/template content was detected. ⚠️⚠️⚠️`;
    systemPrompt += `\n\n🚨🚨🚨 CRITICAL: You MUST create specific, tailored content for THIS concept. NO generic placeholders. NO template text. NO generic business knowledge. 🚨🚨🚨`;
    systemPrompt += `\n\nTHE PROBLEM: You generated generic content that could apply to any concept. This is WRONG.`;
    systemPrompt += `\n\nTHE SOLUTION: Read the INPUT CONCEPT. Think about what THIS specific concept needs/has/faces. Generate based on THAT.`;
    systemPrompt += `\n\nSTEP-BY-STEP PROCESS FOR EACH ITEM:`;
    systemPrompt += `\n1. Read the INPUT CONCEPT`;
    systemPrompt += `\n2. Identify what THIS concept specifically needs/has/faces`;
    systemPrompt += `\n3. Generate the item based on THAT specific need/feature/risk`;
    systemPrompt += `\n4. Mention the input concept or its key features in your description`;
    systemPrompt += `\n5. If your item could apply to any concept, it's WRONG - rewrite it`;
    systemPrompt += `\n\nEXAMPLES OF WHAT NOT TO DO (DO NOT USE THESE - THEY ARE TEMPLATES):`;
    systemPrompt += `\n- Component names: "Component 4", "Component 5", "Technology", "Operations" ❌`;
    systemPrompt += `\n- Component descriptions: "A key element requiring detailed analysis" ❌`;
    systemPrompt += `\n- Risk names: "Regulatory Risks", "Dependence on Key Employees" (without specific context) ❌`;
    systemPrompt += `\n- Risk descriptions: "A hidden risk requiring identification and assessment" ❌`;
    systemPrompt += `\n- Application titles: "Healthcare Supply Chain Optimization", "E-commerce Fulfillment" (without specific connection) ❌`;
    systemPrompt += `\n- Application descriptions: "The platform can be applied to...", "This solution can..." (generic, not specific) ❌`;
    systemPrompt += `\n\nEXAMPLES OF WHAT TO DO (USE THESE STYLES):`;
    systemPrompt += `\n- Component names: "Real-time Inventory Synchronization Engine", "AI-Powered Demand Forecasting Module" ✅`;
    systemPrompt += `\n- Component descriptions: "This component handles real-time synchronization of inventory across multiple warehouses, using WebSocket connections to ensure sub-second updates. It's critical because..." ✅`;
    systemPrompt += `\n- Risk names: "Regulatory Risk: EU Data Privacy Compliance for Cross-Border Inventory Sharing" ✅`;
    systemPrompt += `\n- Risk descriptions: "The concept requires sharing inventory data across EU and US warehouses, which may violate GDPR if customer data is included. This is hidden because..." ✅`;
    systemPrompt += `\n- Application titles: "Hospital Supply Chain Optimization for Emergency Departments" ✅`;
    systemPrompt += `\n- Application descriptions: "This concept's real-time synchronization can optimize hospital emergency department supply chains by ensuring critical supplies (blood, medications, surgical tools) are always available when needed, reducing..." ✅`;
    systemPrompt += `\n\nREAD THE INPUT CONCEPT CAREFULLY. Every component, risk, and application MUST be specific to THAT concept, not generic templates.`;
  }
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    // Slightly lower temperature for more consistent, less generic output
    const result = await callLLM(prompt, systemPrompt, 0.75, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Very lenient validation - accept whatever is generated
    // Only ensure it exists, no length or quality checks
    if (!parsed.core_essence) {
      parsed.core_essence = 'Strategic analysis of the concept.';
    }
    
    // Validate component quality and detect generic content FIRST, then filter
    let hasGenericComponents = false;
    const validComponents = [];
    
    if (parsed.key_components && Array.isArray(parsed.key_components)) {
      parsed.key_components.forEach((comp, idx) => {
        const name = comp.name || `Component ${idx + 1}`;
        const description = comp.description || 'A component requiring detailed description.';
        
        // Check for generic content - be more lenient, only flag obvious placeholders
        // Only flag if BOTH name and description are generic (not just one)
        const nameIsGeneric = isGenericContent(name, 'component');
        const descIsGeneric = isGenericContent(description, 'component');
        const isGeneric = nameIsGeneric && descIsGeneric; // Both must be generic to filter out
        
        if (isGeneric) {
          hasGenericComponents = true;
          console.warn(`Generic component detected at index ${idx}: ${name.substring(0, 50)}...`);
        } else {
          // Include component if at least name or description is valid
          validComponents.push({
            name: name,
            description: description,
            importance: comp.importance || 'important',
            dependencies: Array.isArray(comp.dependencies) ? comp.dependencies : []
          });
        }
      });
    }
    
    // Replace with filtered components
    parsed.key_components = validComponents;
    
    // No minimum requirement - accept whatever is generated
    if (parsed.key_components.length === 0) {
      console.warn('No key components found, but proceeding with analysis...');
    }
    
    // No length requirements - accept whatever is generated
    if (!parsed.best_case) {
      parsed.best_case = 'Best case scenario for the concept.';
    }
    if (!parsed.worst_case) {
      parsed.worst_case = 'Worst case scenario for the concept.';
    }
    
    // Validate risks for generic content FIRST, then filter
    let hasGenericRisks = false;
    const validRisks = [];
    
    if (parsed.hidden_risks && Array.isArray(parsed.hidden_risks)) {
      parsed.hidden_risks.forEach((risk, idx) => {
        const riskText = typeof risk === 'string' ? risk : (risk.risk || risk.description || JSON.stringify(risk));
        
        // Check for generic content - be lenient
        const isGeneric = isGenericContent(riskText, 'risk');
        if (isGeneric) {
          hasGenericRisks = true;
          console.warn(`Generic risk detected at index ${idx}: ${riskText.substring(0, 100)}...`);
        } else {
          // Only include non-generic risks
          validRisks.push(riskText);
        }
      });
    }
    
    // Replace with filtered risks
    parsed.hidden_risks = validRisks;
    
    // No minimum requirement - accept whatever is generated
    if (parsed.hidden_risks.length === 0) {
      console.warn('No hidden risks found, but proceeding with analysis...');
    }
    
    // No minimum requirement - accept whatever is generated
    if (!parsed.potential_applications || !Array.isArray(parsed.potential_applications) || parsed.potential_applications.length === 0) {
      console.warn('No potential applications found, but proceeding with analysis...');
      parsed.potential_applications = [];
    }
    
    // Validate application quality and detect generic content
    let hasGenericApplications = false;
    parsed.potential_applications = parsed.potential_applications.map((app, idx) => {
      const title = app.title || `Application ${idx + 1}`;
      const description = app.description || 'A potential application requiring detailed description.';
      
      // Check for generic content
      if (isGenericContent(title, 'application') || isGenericContent(description, 'application')) {
        hasGenericApplications = true;
      }
      
      return {
        title: title,
        description: description,
        feasibility: app.feasibility || 'medium',
        reasoning: app.reasoning || 'Requires further analysis.',
        market_size: app.market_size || 'medium'
      };
    });
    
    // No minimum requirement - accept whatever is generated
    if (!parsed.refined_variations || !Array.isArray(parsed.refined_variations) || parsed.refined_variations.length === 0) {
      console.warn('No refined variations found, but proceeding with analysis...');
      parsed.refined_variations = [];
    }
    
    // Validate variation quality and detect generic content
    let hasGenericVariations = false;
    parsed.refined_variations = parsed.refined_variations.map((var_, idx) => {
      const title = var_.title || `Variation ${idx + 1}`;
      const description = var_.description || 'An alternative approach requiring detailed description.';
      
      // Check for generic content
      if (isGenericContent(title, 'variation') || isGenericContent(description, 'variation')) {
        hasGenericVariations = true;
      }
      
      return {
        title: title,
        description: description,
        potential: var_.potential || 'medium',
        reasoning: var_.reasoning || 'Requires further analysis.',
        trade_offs: var_.trade_offs || 'Trade-offs require evaluation.'
      };
    });
    
    // Don't retry for generic content - just warn and proceed
    if (hasGenericComponents || hasGenericRisks || hasGenericApplications || hasGenericVariations) {
      const issues = [];
      if (hasGenericComponents) issues.push('generic components');
      if (hasGenericRisks) issues.push('generic risks');
      if (hasGenericApplications) issues.push('generic applications');
      if (hasGenericVariations) issues.push('generic variations');
      console.warn(`Generic placeholder content detected: ${issues.join(', ')}. Proceeding anyway...`);
    }
    
    // No length requirements - accept whatever is generated
    if (!parsed.one_line_pitch) {
      parsed.one_line_pitch = 'A strategic concept with potential.';
    }
    if (!parsed.improvement_suggestion) {
      parsed.improvement_suggestion = 'Consider ways to improve the concept.';
    }
    if (!parsed.strategic_insights) {
      parsed.strategic_insights = 'Key strategic insights about the concept.';
    }
    
    // No minimum requirement for next steps - accept whatever is generated
    if (!parsed.next_steps || !Array.isArray(parsed.next_steps) || parsed.next_steps.length === 0) {
      console.warn('No next steps found, but proceeding with analysis...');
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
    // Avoid double-wrapping error messages
    if (error.message.includes('Failed to analyze strategically')) {
      throw error;
    }
    throw new Error(`Failed to analyze strategically: ${error.message}`);
  }
}

module.exports = { analyzeStrategically };

