const { callLLM } = require('../llm');

const STRESS_TEST_PROMPT = `You are a senior strategic consultant and business analyst. Conduct a comprehensive, brutally honest analysis of the following concept as if you're preparing a board-level strategic assessment.

ANALYSIS FRAMEWORK:
1. Best-Case Scenario: What happens if everything goes perfectly? Be specific about outcomes, metrics, and success indicators.
2. Worst-Case Scenario: What are the real failure modes? Be honest about what could go wrong and the consequences.
3. Hidden Risks: What are the non-obvious risks that could derail this? Think beyond surface-level concerns.
4. Pitch: How would you sell this to investors or stakeholders? Make it compelling.
5. 10× Improvement: How could this be dramatically better? Provide actionable, strategic recommendations.

CRITICAL REQUIREMENTS:
- Be brutally honest - this is a reality check, not a cheerleading session
- Provide specific, actionable insights, not generic advice
- Think like a seasoned consultant who has seen many projects succeed and fail
- Identify both opportunities and threats
- Make recommendations that are strategic and implementable

Return JSON with:
- best_case: Detailed 3-4 sentence best-case scenario (string) - include specific outcomes, metrics, market position, and success indicators
- worst_case: Detailed 3-4 sentence worst-case scenario (string) - include specific failure modes, consequences, and what could go wrong
- hidden_risks: Array of 5-7 specific hidden risks (array of strings) - each should be a detailed, specific risk with context, not generic warnings
- one_line_pitch: Compelling one-line pitch (string) - should be investor-ready and memorable
- improvement_suggestion: Detailed 4-5 sentence "10× improvement" recommendation (string) - should be strategic, actionable, and transformative

QUALITY STANDARDS:
- Analysis should feel like it came from a top-tier consulting firm
- Be specific and detailed, not vague
- Provide real strategic value
- Balance optimism with realism
- Make insights actionable and implementable

Concept to analyze: {input}`;

async function stressTestIdea(inputText) {
  const prompt = STRESS_TEST_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a partner-level strategic consultant at a top-tier firm (McKinsey, BCG, Bain level). You have 25+ years of experience analyzing business concepts, products, and strategic initiatives. You are known for your brutally honest, insightful analyses that help companies make critical decisions. Always return valid JSON with all required fields. Your analysis must: (1) Be brutally honest and realistic, (2) Provide specific, actionable insights, (3) Identify both opportunities and hidden risks, (4) Maintain the highest professional consulting standards, (5) Feel like a board-level strategic assessment. Think deeply about what could go right, what could go wrong, and how to make it dramatically better. Your insights are used by C-suite executives for major strategic decisions. Provide exceptional value regardless of input type.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.7, true);
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.best_case || !parsed.worst_case) {
      throw new Error('Invalid stress test structure');
    }
    
    if (!parsed.hidden_risks || !Array.isArray(parsed.hidden_risks)) {
      parsed.hidden_risks = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Stress test error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to stress test idea: ${error.message}`);
  }
}

module.exports = { stressTestIdea };

