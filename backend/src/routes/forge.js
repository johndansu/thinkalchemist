const express = require('express');
const router = express.Router();
const { classifyInput } = require('../services/classifier');
const { generateCreativePersonas } = require('../services/alchemy/creativePersonas');
const { analyzeStrategically } = require('../services/alchemy/strategicAnalysis');
const { catalyzeThoughts } = require('../services/alchemy/thoughtCatalyst');
const { generateTimeline } = require('../services/alchemy/timeline');
const { purifyDocument } = require('../services/alchemy/purification');

router.post('/transform', async (req, res) => {
  try {
    const { inputText, mode } = req.body;
    
    // Validation
    if (!inputText || inputText.trim().length === 0) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    // Limit input length to prevent abuse
    const MAX_INPUT_LENGTH = 10000;
    if (inputText.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({ 
        error: `Input text is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.` 
      });
    }

    let classification;
    let results = {};

    // If specific mode is requested, use it directly
    if (mode) {
      const modeMap = {
        'creative_personas': 'creative_personas',
        'strategic_analysis': 'strategic_analysis',
        'thought_catalyst': 'thought_catalyst',
        'timeline': 'timeline',
        'purification': 'purification'
      };
      
      const targetMode = modeMap[mode];
      if (!targetMode) {
        return res.status(400).json({ 
          error: 'Invalid mode specified',
          valid_modes: Object.keys(modeMap)
        });
      }

      // Run only the requested mode
      switch (targetMode) {
        case 'creative_personas':
          results.creativePersonas = await generateCreativePersonas(inputText);
          break;
        case 'strategic_analysis':
          results.strategicAnalysis = await analyzeStrategically(inputText);
          break;
        case 'thought_catalyst':
          results.thoughtCatalyst = await catalyzeThoughts(inputText);
          break;
        case 'timeline':
          results.timeline = await generateTimeline(inputText);
          break;
        case 'purification':
          results.purification = await purifyDocument(inputText);
          break;
      }

      // Create a simple classification for the mode
      classification = {
        primary_type: mode,
        confidence: 1.0,
        suggested_modes: [mode],
        keywords: []
      };
    } else {
      // Auto-classify and run relevant modes
      classification = await classifyInput(inputText);
      const modes = classification.suggested_modes || [];

      // Run relevant alchemy modes based on classification
      if (modes.includes('creative_personas')) {
        results.creativePersonas = await generateCreativePersonas(inputText);
      }
      
      if (modes.includes('strategic_analysis')) {
        results.strategicAnalysis = await analyzeStrategically(inputText);
      }
      
      if (modes.includes('thought_catalyst')) {
        results.thoughtCatalyst = await catalyzeThoughts(inputText);
      }
      
      if (modes.includes('timeline')) {
        results.timeline = await generateTimeline(inputText);
      }
      
      if (modes.includes('purification')) {
        results.purification = await purifyDocument(inputText);
      }
    }

    // Return structured output
    res.json({
      success: true,
      classification,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Forge error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Extract more detailed error information
    const errorDetails = {
      message: error.message,
      ...(error.cause && { cause: error.cause }),
    };
    
    // Always include details in response for debugging
    res.status(500).json({ 
      error: 'Failed to transform input', 
      details: error.message,
      ...errorDetails
    });
  }
});

module.exports = router;

