/**
 * Utility to parse JSON from LLM responses
 * Handles cases where JSON might be wrapped in markdown code blocks
 */

function parseJSONResponse(text) {
  if (!text) {
    throw new Error('Empty response from LLM');
  }

  const trimmed = text.trim();
  
  // Try to parse directly first
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Log the error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Direct parse failed, trying alternatives...');
      console.log('Response preview (first 500 chars):', trimmed.substring(0, 500));
      console.log('Parse error:', e.message);
    }
    
    // If that fails, try to extract JSON from markdown code blocks
    // Try to match code blocks (both ```json and ```)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const extracted = jsonMatch[1].trim();
        // Try parsing the extracted content
        return JSON.parse(extracted);
      } catch (e2) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Code block extraction failed, trying to find JSON structure...');
          console.log('Extracted content (first 300 chars):', jsonMatch[1].trim().substring(0, 300));
        }
        // Continue to try other methods - but use the extracted content as the base
        // Remove the code block markers and try again with the inner content
        const innerContent = jsonMatch[1].trim();
        // Try to find JSON in the inner content
        const innerObjectMatch = innerContent.match(/\{[\s\S]*\}/);
        if (innerObjectMatch) {
          try {
            return JSON.parse(innerObjectMatch[0]);
          } catch (e3) {
            // Continue to other methods
          }
        }
      }
    }
    
    // Try to find JSON object (non-greedy, balanced braces)
    let braceCount = 0;
    let startIdx = -1;
    let endIdx = -1;
    
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '{') {
        if (startIdx === -1) startIdx = i;
        braceCount++;
      } else if (trimmed[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIdx !== -1) {
          endIdx = i;
          break;
        }
      }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
      try {
        const jsonStr = trimmed.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
      } catch (e3) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Object extraction failed, trying array...');
        }
      }
    }
    
    // Try to find JSON array (non-greedy, balanced brackets)
    let bracketCount = 0;
    startIdx = -1;
    endIdx = -1;
    
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '[') {
        if (startIdx === -1) startIdx = i;
        bracketCount++;
      } else if (trimmed[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && startIdx !== -1) {
          endIdx = i;
          break;
        }
      }
    }
    
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = trimmed.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e4) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Array extraction failed');
          console.log('Extracted string (first 200 chars):', jsonStr.substring(0, 200));
          console.log('Parse error:', e4.message);
        }
      }
    }
    
    // Last resort: try to fix common JSON issues
    try {
      // Remove trailing commas before } or ]
      let fixed = trimmed.replace(/,(\s*[}\]])/g, '$1');
      // Try parsing again
      return JSON.parse(fixed);
    } catch (e5) {
      // Final error with more context
      const errorMsg = `Failed to parse JSON from LLM response. Response preview: ${trimmed.substring(0, 300)}...`;
      if (process.env.NODE_ENV === 'development') {
        console.error('All parsing attempts failed');
        console.error('Full response length:', trimmed.length);
        console.error('Last 200 chars:', trimmed.substring(Math.max(0, trimmed.length - 200)));
      }
      throw new Error(errorMsg);
    }
  }
}

module.exports = { parseJSONResponse };


