# Ollama Setup Guide

Ollama is 100% free and runs locally on your computer. Follow these steps to set it up.

## Step 1: Install Ollama

### Windows
1. Download the installer from: https://ollama.ai/download
2. Run the installer (OllamaSetup.exe)
3. Ollama will start automatically after installation

### Mac
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Step 2: Download a Llama Model

After installation, open a terminal/command prompt and run:

```bash
# Download Llama 3.2 (recommended, newer, ~4GB)
ollama pull llama3.2

# OR download Llama 3.1 (previous version, ~4GB)
ollama pull llama3.1

# OR download a smaller model for faster responses (~2GB)
ollama pull llama3.2:1b

# OR download a larger model for better quality (~7GB)
ollama pull llama3.1:70b
```

**Note**: The first download will take a few minutes depending on your internet speed.

## Step 3: Verify Ollama is Running

```bash
# Check if Ollama is running
ollama list

# You should see your downloaded model(s)
```

If Ollama isn't running, start it:
```bash
ollama serve
```

## Step 4: Configure Backend

1. Create a `.env` file in the `backend` directory (if it doesn't exist)

2. Add these settings:
```env
# LLM Provider Configuration
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=llama3.2

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (if using)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 5: Test the Setup

1. Start the backend server:
```bash
cd backend
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
  -d "{\"inputText\": \"A mobile app for tracking water intake\", \"mode\": \"personas\"}"
```

## Available Models

### Recommended Models:

**For General Use (Text Transformation, Writing, Analysis):**
- `llama3.2` - **Recommended** - Newest version, best balance (4GB, excellent quality)
- `llama3.1` - Previous version (4GB, still good)
- `llama3.2:1b` - Fastest (2GB, good for testing)
- `llama3.1:70b` - Best quality (7GB, slower, requires more RAM)

**For Coding Tasks:**
- `deepseek-coder` - **Best for coding** - Specialized for code generation (6GB, excellent)
- `codellama` - Meta's coding model (7GB, very good)
- `qwen2.5-coder` - Strong coding capabilities (7GB)
- `llama3.2` - Good general model that also handles code well (4GB)

### Download More Models:
```bash
ollama pull llama3.2  # Recommended - newest version
ollama pull llama3.1  # Previous version
ollama pull mistral
ollama pull mixtral
```

## Troubleshooting

### Ollama not found
- Make sure Ollama is installed
- Restart your terminal/command prompt
- On Windows, you may need to restart your computer after installation

### Connection refused
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Try: `curl http://localhost:11434/api/tags` to verify Ollama is accessible

### Model not found
- Make sure you've downloaded the model: `ollama pull llama3.2`
- Check available models: `ollama list`
- Verify the model name in `.env` matches exactly

### Slow responses
- Use a smaller model: `llama3.2:1b` or `llama3.1:8b`
- Make sure you have enough RAM (8GB+ recommended)
- GPU acceleration helps but is optional

### Out of memory
- Use a smaller model
- Close other applications
- Add more RAM to your system

## Performance Tips

1. **For Speed**: Use `llama3.2:1b` or `llama3.1:8b`
2. **For Quality**: Use `llama3.1:70b` (requires more RAM)
3. **For Balance**: Use `llama3.2` (default, recommended - newest and best)

## System Requirements

- **Minimum**: 8GB RAM
- **Recommended**: 16GB+ RAM
- **GPU**: Optional but recommended for faster responses
- **Storage**: ~4-7GB per model

## Next Steps

Once Ollama is set up and working:
1. Your backend will use Ollama automatically
2. All API calls will be processed locally
3. No internet required (after initial model download)
4. 100% free, unlimited usage!

Enjoy your free, local LLM setup! 🎉

