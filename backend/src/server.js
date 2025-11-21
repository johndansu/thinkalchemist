const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const forgeRoutes = require('./routes/forge');
const authRoutes = require('./routes/auth');
const savedRoutes = require('./routes/saved');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

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
    const { callLLM } = require('./services/llm');
    const response = await callLLM('Say "Hello, Ollama is working!"', 'You are a helpful assistant.', 0.7, false);
    res.json({ 
      status: 'ok', 
      message: 'Ollama connection successful',
      response: response.substring(0, 100) // First 100 chars
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

app.listen(PORT, () => {
  console.log(`🚀 Think Alchemist backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

