const { callLLM } = require('../llm');

const STRESS_TEST_PROMPT = `Analyze the following input as a business idea, product concept, or strategic initiative. Provide a professional reality check and strategic analysis.

If the input is not explicitly a business idea, interpret it as a concept that could be evaluated strategically, and provide analysis accordingly.

Return JSON with:
- best_case: Best-case scenario description (string, professional and realistic)
- worst_case: Worst-case scenario description (string, professional and realistic)
- hidden_risks: Array of 3-5 hidden risks (array of strings, be specific and professional)
- one_line_pitch: One-line pitch for the concept (string, compelling and clear)
- improvement_suggestion: "If I had to make this 10× better..." suggestion (string, actionable and professional)

Be honest, realistic, and maintain a professional consulting tone. Identify real risks and opportunities. Always provide valuable strategic insights.

Concept to analyze: {input}`;

async function stressTestIdea(inputText) {
  const prompt = STRESS_TEST_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a senior business analyst and strategic consultant. Always return valid JSON with all required fields. Be honest, realistic, and maintain professional consulting standards. Provide valuable strategic insights regardless of input type.';
  
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

