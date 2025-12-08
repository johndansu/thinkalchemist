# Setup Llama 3.2 - Step by Step Guide

## ✅ Step 1: Install Ollama

### For Windows:
1. Go to: https://ollama.ai/download
2. Download `OllamaSetup.exe`
3. Run the installer
4. Ollama will start automatically after installation

### Verify Installation:
Open a new terminal/command prompt and run:
```bash
ollama --version
```

You should see a version number. If not, restart your terminal or computer.

---

## ✅ Step 2: Download Llama Model

**⚠️ IMPORTANT: Choose based on your RAM:**
- **8GB RAM or less**: Use `llama3.2:1b` (smallest, fastest)
- **12GB RAM**: Use `llama3.1:8b` (good balance)
- **16GB+ RAM**: Use `llama3.2` (full model, best quality)

Open a terminal/command prompt and run:

```bash
# For 8GB RAM or less (recommended if you have memory issues)
ollama pull llama3.2:1b

# OR for 12GB RAM
ollama pull llama3.1:8b

# OR for 16GB+ RAM (full model)
ollama pull llama3.2
```

**What happens:**
- Downloads model data (1b = ~1GB, 8b = ~4GB, full = ~4GB)
- Takes 5-15 minutes depending on your internet speed
- Shows progress as it downloads

**When it's done**, you'll see: `"success"`

---

## ✅ Step 3: Verify Model is Downloaded

Check that the model is available:

```bash
ollama list
```

You should see `llama3.2` in the list.

---

## ✅ Step 4: Test Ollama

Test that Ollama is working:

```bash
ollama run llama3.2 "Hello, can you hear me?"
```

If it responds, Ollama is working! Press `Ctrl+C` to exit.

---

## ✅ Step 5: Configure Backend

The `.env` file has already been created in the `backend` folder. 

**Update it based on which model you downloaded:**

```env
LLM_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
LLM_MODEL=llama3.2:1b    # If you downloaded 1b model
# OR
LLM_MODEL=llama3.1:8b    # If you downloaded 8b model
```

---

## ✅ Step 6: Start the Backend

1. Open terminal in the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies (if not done):
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

You should see:
```
🚀 Think Alchemist backend running on port 3001
📡 Health check: http://localhost:3001/health
```

---

## ✅ Step 7: Test the Backend

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test forge endpoint (this will use Llama 3.2!)
curl -X POST http://localhost:3001/api/forge/transform ^
  -H "Content-Type: application/json" ^
  -d "{\"inputText\": \"A mobile app for tracking water intake\", \"mode\": \"personas\"}"
```

*(Note: Use `^` for line continuation in Windows CMD, or use PowerShell)*

---

## 🎉 You're Done!

Llama 3.2 is now set up and ready to use!

### What You Have:
- ✅ Ollama installed
- ✅ Llama 3.2 model downloaded
- ✅ Backend configured
- ✅ 100% free, local AI

### Next Steps:
- Start your frontend: `cd frontend && npm run dev`
- Test the full app
- Enjoy unlimited free AI transformations!

---

## Troubleshooting

### Ollama not found after installation:
- Restart your terminal/command prompt
- Restart your computer if needed
- Check if Ollama is in your PATH

### Model download fails:
- Check your internet connection
- Try again: `ollama pull llama3.2`
- Check available disk space (need ~5GB free)

### Backend can't connect to Ollama:
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Verify OLLAMA_URL in `.env` is correct

### Slow responses:
- This is normal for local models
- Llama 3.2 is fast but depends on your hardware
- GPU acceleration helps but is optional

---

## Need Help?

- See `OLLAMA_SETUP.md` for detailed troubleshooting
- Check Ollama status: `ollama list`
- Test Ollama directly: `ollama run llama3.2`

