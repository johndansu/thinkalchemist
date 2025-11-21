require('dotenv').config();

// Import node-fetch at the top level
let fetch;
try {
  // Try to use built-in fetch (Node.js 18+)
  if (typeof globalThis.fetch !== 'undefined') {
    fetch = globalThis.fetch;
  } else {
    // Fallback to node-fetch
    fetch = require('node-fetch');
  }
} catch (e) {
  // If node-fetch fails, try dynamic import
  fetch = require('node-fetch');
}

/**
 * LLM Service - Supports multiple providers (Groq, Together.ai, Ollama, etc.)
 * Default: Groq (fast, free tier available)
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq'; // groq, together, ollama, replicate
const LLM_MODEL = process.env.LLM_MODEL || 'llama-3.1-70b-versatile'; // Default Groq model

/**
 * Call LLM API with a prompt
 * @param {string} prompt - The user prompt
 * @param {string} systemPrompt - The system prompt
 * @param {number} temperature - Temperature (0-2), default 0.7
 * @param {boolean} jsonMode - Whether to force JSON response
 * @returns {Promise<string>} The response content
 */
async function callLLM(prompt, systemPrompt = '', temperature = 0.7, jsonMode = false) {
  switch (LLM_PROVIDER.toLowerCase()) {
    case 'groq':
      return callGroq(prompt, systemPrompt, temperature, jsonMode);
    case 'together':
      return callTogether(prompt, systemPrompt, temperature, jsonMode);
    case 'ollama':
      return callOllama(prompt, systemPrompt, temperature, jsonMode);
    case 'replicate':
      return callReplicate(prompt, systemPrompt, temperature, jsonMode);
    default:
      throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`);
  }
}

/**
 * Call Groq API (recommended - fast and free tier available)
 */
async function callGroq(prompt, systemPrompt, temperature, jsonMode) {
  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || process.env.LLM_API_KEY,
    });

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const model = process.env.LLM_MODEL || 'llama-3.1-70b-versatile';
    
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

/**
 * Call Together.ai API
 */
async function callTogether(prompt, systemPrompt, temperature, jsonMode) {
  try {
    
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const model = process.env.LLM_MODEL || 'meta-llama/Llama-3-70b-chat-hf';
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together.ai API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Together.ai API Error:', error);
    throw new Error(`Together.ai API error: ${error.message}`);
  }
}

/**
 * Call Ollama API (local/self-hosted)
 * Uses chat API for better system prompt handling
 */
async function callOllama(prompt, systemPrompt, temperature, jsonMode) {
  try {
    
    const model = process.env.LLM_MODEL || 'llama3.2';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    // Build messages array for chat API
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add JSON format instruction to user prompt if needed
    let userPrompt = prompt;
    if (jsonMode) {
      userPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.`;
    }
    messages.push({ role: 'user', content: userPrompt });

    // Use chat API for better prompt handling
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: ollamaUrl,
        model: model
      });
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.message || !data.message.content) {
      console.error('Ollama Response Structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response structure from Ollama');
    }
    
    return data.message.content;
  } catch (error) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = process.env.LLM_MODEL || 'llama3.2';
    
    console.error('Ollama API Error:', {
      message: error.message,
      stack: error.stack,
      url: ollamaUrl,
      model: model
    });
    
    // Provide helpful error message if connection fails
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running. Start it with: ollama serve`);
    }
    
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

/**
 * Call Replicate API
 */
async function callReplicate(prompt, systemPrompt, temperature, jsonMode) {
  try {
    const Replicate = require('replicate');
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || process.env.LLM_API_KEY,
    });

    const model = process.env.LLM_MODEL || 'meta/meta-llama-3-70b-instruct';
    
    // Combine system and user prompts
    let fullPrompt = prompt;
    if (systemPrompt) {
      fullPrompt = `${systemPrompt}\n\n${prompt}`;
    }

    if (jsonMode) {
      fullPrompt = `${fullPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.`;
    }

    const output = await replicate.run(model, {
      input: {
        prompt: fullPrompt,
        temperature,
      },
    });

    // Replicate returns an array, join it
    return Array.isArray(output) ? output.join('') : output;
  } catch (error) {
    console.error('Replicate API Error:', error);
    throw new Error(`Replicate API error: ${error.message}`);
  }
}

module.exports = { callLLM };

