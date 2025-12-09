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

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama'; // groq, together, ollama, replicate
const LLM_MODEL = process.env.LLM_MODEL || 'llama3.2:1b'; // Using 1B model for better quality while still fast

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
    const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
    
    if (!apiKey) {
      throw new Error('Groq API key is not configured. Please set GROQ_API_KEY or LLM_API_KEY in your .env file.');
    }

    const Groq = require('groq-sdk');
    const groq = new Groq({
      apiKey: apiKey,
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
    
    // Provide more helpful error messages
    if (error.message.includes('API key') || error.message.includes('not configured')) {
      throw new Error('LLM API key is not configured. Please add GROQ_API_KEY or LLM_API_KEY to backend/.env file. Get a free key at https://console.groq.com');
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Invalid LLM API key. Please check your GROQ_API_KEY or LLM_API_KEY in backend/.env file.');
    }
    
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
    const model = process.env.LLM_MODEL || 'llama3.2:1b'; // 1B model for better quality
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    // Build messages array for chat API
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add JSON format instruction to user prompt if needed
    let userPrompt = prompt;
    if (jsonMode) {
      userPrompt = `${prompt}\n\nReturn ONLY valid JSON. No markdown, no code blocks.`;
    }
    messages.push({ role: 'user', content: userPrompt });

    console.log(`Calling Ollama at ${ollamaUrl} with model: ${model}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    try {
      // Simplified Ollama call - minimal options for speed
      const requestBody = {
        model,
        messages,
        stream: false,
      };
      
      // Only add options if temperature is provided
      if (temperature !== undefined) {
        requestBody.options = {
          temperature: temperature,
        };
      }

      const response = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: ollamaUrl,
          model: model
        });
        
        if (response.status === 404) {
          throw new Error(`Model "${model}" not found. Pull it with: ollama pull ${model}`);
        }
        
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Chat API returns message.content
      if (!data.message || !data.message.content) {
        console.error('Ollama Response Structure:', JSON.stringify(data, null, 2));
        throw new Error('Invalid response structure from Ollama');
      }
      
      return data.message.content;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 45 seconds. Ollama may be slow or overloaded. Try restarting Ollama or using a smaller model.');
      }
      throw fetchError;
    }
  } catch (error) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = process.env.LLM_MODEL || 'llama3.2:1b'; // 1B model for better quality
    
    console.error('Ollama API Error:', {
      message: error.message,
      stack: error.stack,
      url: ollamaUrl,
      model: model
    });
    
    // Provide helpful error messages
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running. Start it with: ollama serve`);
    }
    
    if (error.message.includes('not found')) {
      throw new Error(`Model "${model}" not found. Install it with: ollama pull ${model}`);
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

