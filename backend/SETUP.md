# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your credentials:
   - `LLM_PROVIDER`: Choose provider - `groq` (recommended), `together`, `ollama`, or `replicate`
   - `LLM_API_KEY`: API key for your chosen provider (or provider-specific keys below)
   - `GROQ_API_KEY`: Get from https://console.groq.com (if using Groq)
   - `TOGETHER_API_KEY`: Get from https://api.together.xyz (if using Together.ai)
   - `REPLICATE_API_TOKEN`: Get from https://replicate.com (if using Replicate)
   - `LLM_MODEL`: Model name (default: `llama-3.1-70b-versatile` for Groq)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **Set Up Database**
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Run the SQL from `database.sql`
   - This creates the `forges` table with Row Level Security

4. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Test the Server**
   - Health check: `http://localhost:3001/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## API Testing

### Test Forge Endpoint (without auth)
```bash
curl -X POST http://localhost:3001/api/forge/transform \
  -H "Content-Type: application/json" \
  -d '{"inputText": "A mobile app for tracking water intake"}'
```

### Test with Specific Mode
```bash
curl -X POST http://localhost:3001/api/forge/transform \
  -H "Content-Type: application/json" \
  -d '{"inputText": "A mobile app for tracking water intake", "mode": "personas"}'
```

### Test Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "name": "Test User"}'
```

## Troubleshooting

### Server won't start
- Check that port 3001 is not in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has valid credentials

### LLM API errors
- Verify your API key is correct for your chosen provider
- Check you have credits/quota in your provider account
- Ensure the model name is correct for your provider
- For Groq: Default model is `llama-3.1-70b-versatile` (free tier available)
- For Ollama: Ensure Ollama is running locally on port 11434

### Supabase connection errors
- Verify your Supabase URL and keys are correct
- Check that the database migration has been run
- Ensure Row Level Security policies are set up

### CORS errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Default is `http://localhost:5173` for Vite

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:5173) |
| `LLM_PROVIDER` | LLM provider: `groq`, `together`, `ollama`, or `replicate` | No (default: groq) |
| `LLM_API_KEY` | Generic API key (or use provider-specific keys) | **Yes** (if not using provider-specific) |
| `GROQ_API_KEY` | Groq API key (if using Groq) | **Yes** (if using Groq) |
| `TOGETHER_API_KEY` | Together.ai API key (if using Together) | **Yes** (if using Together) |
| `REPLICATE_API_TOKEN` | Replicate API token (if using Replicate) | **Yes** (if using Replicate) |
| `LLM_MODEL` | Model name (varies by provider) | No (default: llama-3.1-70b-versatile) |
| `OLLAMA_URL` | Ollama server URL (if using Ollama) | No (default: http://localhost:11434) |
| `SUPABASE_URL` | Supabase project URL | **Yes** |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Recommended |

## Next Steps

1. Test all endpoints with Postman or curl
2. Connect frontend to backend
3. Test full user flow (signup → forge → save)
4. Deploy to production (Render, Railway, etc.)

