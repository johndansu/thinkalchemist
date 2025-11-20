import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const forgeAPI = {
  transform: async (inputText, mode = null) => {
    const payload = { inputText };
    if (mode) {
      payload.mode = mode;
    }
    const response = await api.post('/forge/transform', payload);
    return response.data;
  },
};

export const authAPI = {
  signup: async (email, password, name) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  signin: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.session?.access_token) {
      localStorage.setItem('auth_token', response.data.session.access_token);
    }
    return response.data;
  },
  signout: async () => {
    await api.post('/auth/signout');
    localStorage.removeItem('auth_token');
  },
};

export const savedAPI = {
  save: async (title, inputText, outputJson, alchemyMode) => {
    const response = await api.post('/saved/save', {
      title,
      inputText,
      outputJson,
      alchemyMode,
    });
    return response.data;
  },
  list: async () => {
    const response = await api.get('/saved/list');
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/saved/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/saved/${id}`);
    return response.data;
  },
};

