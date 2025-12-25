const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from multiple possible locations
// On Vercel, env vars are set directly, but we try .env files for local development
const envPaths = [
  path.resolve(__dirname, '../backend/.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    require('dotenv').config({ path: envPath });
    if (process.env.SUPABASE_URL) {
      console.log(`✅ Loaded .env from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

// Log environment status (without exposing secrets)
console.log('Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV,
  envFileLoaded: envLoaded
});

// Load routes with error handling
let forgeRoutes, authRoutes, savedRoutes;
try {
  forgeRoutes = require('../backend/src/routes/forge');
  authRoutes = require('../backend/src/routes/auth');
  savedRoutes = require('../backend/src/routes/saved');
} catch (error) {
  console.error('Failed to load routes:', error);
  console.error('Stack:', error.stack);
  throw error; // Fail fast if routes can't be loaded
}

const app = express();

// Middleware
// CORS configuration - allow Vercel deployment URL and localhost for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
  // Allow any Vercel subdomain
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.vercel\.com$/,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production' || isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/forge', forgeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Ollama connection
app.get('/test-ollama', async (req, res) => {
  try {
    const { callLLM } = require('../backend/src/services/llm');
    const response = await callLLM('Say "Hello, Ollama is working!"', 'You are a helpful assistant.', 0.7, false);
    res.json({ 
      status: 'ok', 
      message: 'Ollama connection successful',
      response: response.substring(0, 100)
    });
  } catch (error) {
    console.error('Ollama test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ollama connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  console.error('Error stack:', err.stack);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    code: err.code,
    status: err.status
  });
  
  const statusCode = err.status || 500;
  const errorMessage = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: errorMessage,
    code: statusCode.toString(),
    ...(process.env.NODE_ENV !== 'production' && { 
      details: err.message,
      stack: err.stack 
    })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

// Export the Express app for Vercel
// Vercel handles Express apps automatically
module.exports = app;

