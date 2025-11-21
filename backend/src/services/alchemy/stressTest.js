const { callLLM } = require('../llm');

const STRESS_TEST_PROMPT = `Analyze this business idea or product concept. Provide a reality check. Return JSON with:
- best_case: Best-case scenario description (string)
- worst_case: Worst-case scenario description (string)
- hidden_risks: Array of 3 hidden risks (array of strings)
- one_line_pitch: One-line pitch for the idea (string)
- improvement_suggestion: "If I had to make this 10× better..." suggestion (string)

Be honest and realistic. Identify real risks and opportunities.

Idea/Concept: {input}`;

async function stressTestIdea(inputText) {
  const prompt = STRESS_TEST_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a business analyst. Return valid JSON with all required fields. Be honest and realistic.';
  
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

