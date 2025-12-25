import axios from 'axios';

// Auto-detect API URL based on environment
// In production (Vercel), use relative path since API is on same domain
// In development, use localhost or VITE_API_URL if set
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If we're on Vercel (production), use relative path
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.com')) {
    return '/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 second timeout for forge requests (increased for complex analyses)
});

// Log API configuration on startup
console.log('🔗 API Configuration:', {
  baseURL: API_BASE_URL,
  frontendURL: window.location.origin,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data;
      const errorStr = typeof errorData === 'object' 
        ? JSON.stringify(errorData, null, 2)
        : errorData;
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`);
      console.error('Error details:', errorStr);
    } else if (error.request) {
      // Request made but no response (network error)
      console.error(`❌ Network Error: Could not reach backend at ${error.config?.baseURL}${error.config?.url}`);
      console.error('💡 Make sure the backend server is running on port 3001');
    } else {
      // Something else happened
      console.error('❌ API Error:', error.message || error);
    }
    return Promise.reject(error);
  }
);

export const forgeAPI = {
  transform: async (inputText, mode = null) => {
    try {
      const payload = { inputText };
      if (mode) {
        payload.mode = mode;
      }
      // Use longer timeout for strategic analysis (3 minutes) due to complexity and potential retries
      const timeout = mode === 'strategic_analysis' ? 180000 : 120000; // 3 minutes for strategic, 2 minutes for others
      const response = await api.post('/forge/transform', payload, { timeout });
      return response.data;
    } catch (error) {
      // Get detailed error message from response
      let errorDetails = error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to connect to backend';
      
      // Provide more helpful error messages
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorDetails = `Request timed out. The analysis is taking longer than expected. ${mode === 'strategic_analysis' ? 'Strategic Analysis requires more processing time due to its comprehensive nature. Please try again or use a shorter input.' : 'Please try again.'}`;
      } else if (error.request && !error.response) {
        errorDetails = 'Could not reach backend server. Please make sure the backend is running on port 3001.';
      }
      
      const fullError = error.response?.data?.message ? `${error.response.data.message}: ${errorDetails}` : errorDetails;
      throw new Error(fullError);
    }
  },
};

export const authAPI = {
  signup: async (email, password, username, name) => {
    try {
      const response = await api.post('/auth/signup', { email, password, username, name });
      // Set auth token if session is returned (some providers require email confirmation)
      if (response.data.session?.access_token) {
        localStorage.setItem('auth_token', response.data.session.access_token);
        // Trigger event to update navigation
        window.dispatchEvent(new Event('auth-changed'));
      }
      return response.data;
    } catch (error) {
      // Extract error message properly, handling both string and object responses
      let errorMessage = 'Failed to sign up';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string' 
            ? error.response.data.error 
            : JSON.stringify(error.response.data.error);
        } else if (error.response.data.message) {
          errorMessage = typeof error.response.data.message === 'string'
            ? error.response.data.message
            : JSON.stringify(error.response.data.message);
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
  signin: async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data.session?.access_token) {
        localStorage.setItem('auth_token', response.data.session.access_token);
        // Trigger event to update navigation
        window.dispatchEvent(new Event('auth-changed'));
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to sign in';
      throw new Error(errorMessage);
    }
  },
  signout: async () => {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      // Trigger event to update navigation
      window.dispatchEvent(new Event('auth-changed'));
    }
  },
  resendConfirmation: async (email) => {
    try {
      const response = await api.post('/auth/resend-confirmation', { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to resend confirmation email';
      throw new Error(errorMessage);
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get user';
      throw new Error(errorMessage);
    }
  },
  updateUsername: async (username) => {
    try {
      const response = await api.post('/auth/update-username', { username });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update username';
      throw new Error(errorMessage);
    }
  },
};

export const savedAPI = {
  save: async (title, inputText, outputJson, alchemyMode) => {
    try {
      const response = await api.post('/saved/save', {
        title,
        inputText,
        outputJson,
        alchemyMode,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save';
      throw new Error(errorMessage);
    }
  },
  list: async () => {
    try {
      const response = await api.get('/saved/list');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load saved forges';
      throw new Error(errorMessage);
    }
  },
  get: async (id) => {
    try {
      const response = await api.get(`/saved/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load forge';
      throw new Error(errorMessage);
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/saved/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete';
      throw new Error(errorMessage);
    }
  },
};

