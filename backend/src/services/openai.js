const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Call OpenAI API with a prompt
 * @param {string} prompt - The user prompt
 * @param {string} systemPrompt - The system prompt
 * @param {number} temperature - Temperature (0-2), default 0.7
 * @param {boolean} jsonMode - Whether to force JSON response
 * @returns {Promise<string>} The response content
 */
async function callOpenAI(prompt, systemPrompt = '', temperature = 0.7, jsonMode = false) {
  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages,
      temperature,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

module.exports = { callOpenAI };

