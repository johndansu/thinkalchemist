const { callLLM } = require('../llm');

const THOUGHT_CATALYST_PROMPT = `You are a master of creative thinking and unexpected connections. Transform the following input by generating random, creative, and thought-provoking insights, connections, and alternative ways of thinking about it. This is about sparking new thoughts, not analyzing systematically.

THOUGHT CATALYST FRAMEWORK:
Generate unexpected, creative, and thought-provoking insights that spark new ways of thinking.

Return JSON with:
- core_input: 1-2 sentence summary of what was provided (string)
- random_insights: Array of 6-8 unexpected insights or thoughts (array of strings) - these should be creative, surprising, or thought-provoking, not obvious
- unexpected_connections: Array of 4-5 connections to seemingly unrelated concepts, ideas, or domains (array of strings) - make them creative and interesting
- alternative_angles: Array of 4-5 completely different ways to think about or approach this (array of strings) - be creative and unexpected
- thought_experiments: Array of 3-4 "what if" scenarios or thought experiments (array of strings) - make them interesting and provocative
- creative_questions: Array of 5-6 questions that challenge assumptions or open new lines of thinking (array of strings) - make them thought-provoking
- synthesis: 3-4 sentence synthesis of what emerges when you think about this creatively and randomly (string) - should feel like a creative insight

QUALITY STANDARDS:
- Be creative, unexpected, and thought-provoking
- Don't be too systematic or analytical - this is about sparking thoughts
- Make connections that are surprising but make sense
- Challenge conventional thinking
- Generate ideas that feel fresh and interesting
- Write in an engaging, creative tone

Input to catalyze: {input}`;

async function catalyzeThoughts(inputText) {
  const prompt = THOUGHT_CATALYST_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a master creative thinker and idea catalyst. You specialize in generating unexpected insights, making surprising connections, and sparking new ways of thinking. Your work has been used by innovation labs, creative agencies, and thought leaders. You think like a combination of a creative director, a philosopher, and a mad scientist. Always return valid JSON with all required fields. Your thought catalysis must: (1) Generate truly unexpected and creative insights, (2) Make surprising but meaningful connections, (3) Challenge conventional thinking, (4) Spark curiosity and new questions, (5) Feel fresh and thought-provoking. Think outside the box - way outside. Be creative, be surprising, be thought-provoking.';
  
  try {
    const { parseJSONResponse } = require('../../utils/jsonParser');
    const result = await callLLM(prompt, systemPrompt, 0.9, true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw LLM response (first 500 chars):', result.substring(0, 500));
    }
    
    const parsed = parseJSONResponse(result);
    
    // Ensure structure
    if (!parsed.core_input) {
      parsed.core_input = 'A concept waiting to be catalyzed.';
    }
    
    if (!parsed.random_insights || !Array.isArray(parsed.random_insights)) {
      parsed.random_insights = [];
    }
    
    if (!parsed.unexpected_connections || !Array.isArray(parsed.unexpected_connections)) {
      parsed.unexpected_connections = [];
    }
    
    if (!parsed.alternative_angles || !Array.isArray(parsed.alternative_angles)) {
      parsed.alternative_angles = [];
    }
    
    if (!parsed.thought_experiments || !Array.isArray(parsed.thought_experiments)) {
      parsed.thought_experiments = [];
    }
    
    if (!parsed.creative_questions || !Array.isArray(parsed.creative_questions)) {
      parsed.creative_questions = [];
    }
    
    if (!parsed.synthesis) {
      parsed.synthesis = 'Creative thinking reveals new possibilities.';
    }
    
    return parsed;
  } catch (error) {
    console.error('Thought catalyst error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      result: error.result || 'N/A'
    });
    throw new Error(`Failed to catalyze thoughts: ${error.message}`);
  }
}

module.exports = { catalyzeThoughts };

