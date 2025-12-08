# Quick Start: Ollama Setup

## 🚀 3-Step Setup

### Step 1: Install Ollama
**Windows**: Download from https://ollama.ai/download and run the installer

**Mac/Linux**: 
```bash
# Mac
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Download Model
Open terminal/command prompt and run:
```bash
ollama pull llama3.2
```
*(This downloads ~4GB, takes a few minutes)*

### Step 3: Configure Backend
Create `backend/.env` file with:
```env
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=llama3.2
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## ✅ Test It

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Test:
   ```bash
   curl http://localhost:3001/health
   ```

That's it! You're now using 100% free, local Llama models! 🎉

## Need Help?

- See `OLLAMA_SETUP.md` for detailed instructions
- Check if Ollama is running: `ollama list`
- Start Ollama manually: `ollama serve`

