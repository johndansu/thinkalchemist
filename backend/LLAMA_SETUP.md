# Llama Setup Guide

The backend now supports multiple Llama providers instead of OpenAI. Choose the provider that best fits your needs.

## Supported Providers

### 1. Groq (Recommended - Fast & Free Tier)
- **Speed**: Very fast (up to 1,345 tokens/sec for smaller models)
- **Cost**: ✅ **FREE tier available** for developers, then very cheap pay-as-you-go ($0.05-0.20 per million tokens)
- **Models**: Llama 3.1 70B, Llama 3 8B, Mixtral, Gemma
- **Best for**: Production use, fast responses, best free option
- **Free Tier**: Includes free API access with rate limits (perfect for development and small projects)

**Setup:**
1. Sign up at https://console.groq.com
2. Get your API key
3. Set in `.env`:
   ```
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key
   LLM_MODEL=llama-3.1-70b-versatile
   ```

### 2. Together.ai
- **Speed**: Fast
- **Cost**: Pay-as-you-go ($0.18-0.88 per million tokens), no free tier
- **Models**: Llama 3, Llama 2, Mistral, and more
- **Best for**: Production use with multiple model options

**Setup:**
1. Sign up at https://api.together.xyz
2. Get your API key
3. Set in `.env`:
   ```
   LLM_PROVIDER=together
   TOGETHER_API_KEY=your_together_api_key
   LLM_MODEL=meta-llama/Llama-3-70b-chat-hf
   ```

### 3. Ollama (Local/Self-Hosted) ⭐ 100% FREE
- **Speed**: Depends on your hardware (GPU recommended)
- **Cost**: ✅ **Completely FREE** - runs on your own hardware
- **Models**: Any model you download locally (Llama 3.1, Llama 3.2, Mistral, etc.)
- **Best for**: Privacy, offline use, development, unlimited usage
- **Requirements**: Your own computer/server with decent RAM/GPU

**Setup:**
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3.1`
3. Start Ollama server
4. Set in `.env`:
   ```
   LLM_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   LLM_MODEL=llama3.1
   ```

### 4. Replicate
- **Speed**: Variable (may have queue times)
- **Cost**: Pay-per-request (no free tier)
- **Models**: Many open-source models
- **Best for**: Experimenting with different models

**Setup:**
1. Sign up at https://replicate.com
2. Get your API token
3. Set in `.env`:
   ```
   LLM_PROVIDER=replicate
   REPLICATE_API_TOKEN=your_replicate_token
   LLM_MODEL=meta/meta-llama-3-70b-instruct
   ```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
# LLM Provider Configuration
LLM_PROVIDER=groq
LLM_API_KEY=your_api_key_here
LLM_MODEL=llama-3.1-70b-versatile

# Provider-specific keys (use if LLM_API_KEY is not set)
GROQ_API_KEY=your_groq_key
TOGETHER_API_KEY=your_together_key
REPLICATE_API_TOKEN=your_replicate_token

# Ollama Configuration (if using Ollama)
OLLAMA_URL=http://localhost:11434

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Recommended Models by Provider

### Groq
- `llama-3.1-70b-versatile` (default, best balance)
- `llama-3.1-8b-instant` (faster, smaller)
- `mixtral-8x7b-32768` (long context)

### Together.ai
- `meta-llama/Llama-3-70b-chat-hf` (default)
- `meta-llama/Llama-3-8b-chat-hf` (faster)
- `mistralai/Mixtral-8x7B-Instruct-v0.1`

### Ollama
- `llama3.1` (default)
- `llama3.2`
- `mistral`
- `mixtral`

### Replicate
- `meta/meta-llama-3-70b-instruct`
- `mistralai/mixtral-8x7b-instruct-v0.1`

## Testing Your Setup

1. Start the server:
   ```bash
   npm start
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

3. Test a forge request:
   ```bash
   curl -X POST http://localhost:3001/api/forge/transform \
     -H "Content-Type: application/json" \
     -d '{"inputText": "A mobile app for tracking water intake", "mode": "personas"}'
   ```

## Troubleshooting

### Groq Errors
- Verify API key at https://console.groq.com
- Check rate limits (free tier has limits)
- Try a different model if one fails

### Together.ai Errors
- Verify API key and billing status
- Check model name is correct
- Some models may require approval

### Ollama Errors
- Ensure Ollama is running: `ollama serve`
- Verify model is downloaded: `ollama list`
- Check OLLAMA_URL matches your setup

### Replicate Errors
- Verify API token
- Check model name format (must include namespace)
- Some models may have queue times

## Switching Providers

You can switch providers anytime by changing `LLM_PROVIDER` in your `.env` file and restarting the server. No code changes needed!

## Performance Tips

1. **Groq**: Fastest option, best for production
2. **Together.ai**: Good balance of speed and model variety
3. **Ollama**: Best for privacy, but requires local hardware
4. **Replicate**: Good for experimentation, but may have queue times

For best performance in production, we recommend **Groq** with the `llama-3.1-70b-versatile` model.

