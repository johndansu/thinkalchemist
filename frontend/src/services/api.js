import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`, error.response.data);
    } else if (error.request) {
      // Request made but no response (network error)
      console.error(`❌ Network Error: Could not reach backend at ${error.config?.baseURL}${error.config?.url}`);
      console.error('💡 Make sure the backend server is running on port 3001');
    } else {
      // Something else happened
      console.error('❌ API Error:', error.message);
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
      const response = await api.post('/forge/transform', payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to connect to backend';
      throw new Error(errorMessage);
    }
  },
};

export const authAPI = {
  signup: async (email, password, username) => {
    try {
      const response = await api.post('/auth/signup', { email, password, username });
      // Set auth token if session is returned (some providers require email confirmation)
      if (response.data.session?.access_token) {
        localStorage.setItem('auth_token', response.data.session.access_token);
        // Trigger event to update navigation
        window.dispatchEvent(new Event('auth-changed'));
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to sign up';
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

