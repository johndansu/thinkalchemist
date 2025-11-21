/**
 * Validation utilities for API requests
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (maximum 128 characters)' };
  }
  
  return { valid: true };
}

/**
 * Validate input text length
 * @param {string} text - Text to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateTextLength(text, maxLength = 10000) {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text is required' };
  }
  
  if (text.length > maxLength) {
    return { valid: false, error: `Text is too long. Maximum length is ${maxLength} characters.` };
  }
  
  return { valid: true };
}

module.exports = {
  isValidEmail,
  validatePassword,
  validateTextLength,
};


