const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from multiple possible locations
const envPaths = [
  path.resolve(__dirname, '../backend/.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env')
];

for (const envPath of envPaths) {
  try {
    require('dotenv').config({ path: envPath });
    if (process.env.SUPABASE_URL) {
      console.log(`✅ Loaded .env from: ${envPath}`);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

const forgeRoutes = require('../backend/src/routes/forge');
const authRoutes = require('../backend/src/routes/auth');
const savedRoutes = require('../backend/src/routes/saved');

const app = express();

// Middleware
// CORS configuration - allow Vercel deployment URL and localhost for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the Express app as a serverless function
// Vercel will automatically handle this as a serverless function
module.exports = app;

