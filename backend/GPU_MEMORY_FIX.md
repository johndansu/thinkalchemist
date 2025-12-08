# GPU Memory Fix - Force CPU Mode

## ❌ Problem
You're getting:
```
Error: 500 Internal Server Error: llama runner process no longer running: 2 cudaMalloc failed: out of memory
```

**Cause**: Ollama is trying to use your GPU, but it doesn't have enough VRAM.

## ✅ Solution: Force CPU Mode

### Option 1: Set Environment Variable (Recommended)

**Windows PowerShell:**
```powershell
$env:OLLAMA_NUM_GPU=0
ollama run llama3.2:1b "Hello, can you hear me?"
```

**Windows CMD:**
```cmd
set OLLAMA_NUM_GPU=0
ollama run llama3.2:1b "Hello, can you hear me?"
```

**Permanent Fix (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '0', 'User')
```

Then restart your terminal.

---

### Option 2: Use Even Smaller Model

Try the smallest available model:

```bash
ollama pull tinyllama
```

Then test:
```bash
ollama run tinyllama "Hello, can you hear me?"
```

Update `.env`:
```env
LLM_MODEL=tinyllama
```

---

### Option 3: Configure Ollama to Use CPU by Default

1. **Find Ollama config file location:**
   - Windows: `%USERPROFILE%\.ollama\config.json` or `%LOCALAPPDATA%\ollama\config.json`

2. **Create/edit config file:**
   ```json
   {
     "num_gpu": 0
   }
   ```

3. **Restart Ollama:**
   - Close all Ollama processes
   - Restart your terminal
   - Try again

---

## 🚀 Quick Fix (Try This First)

**In PowerShell:**
```powershell
# Set to use CPU only
$env:OLLAMA_NUM_GPU=0

# Test
ollama run llama3.2:1b "Hello, can you hear me?"
```

If this works, make it permanent:
```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '0', 'User')
```

**Restart your terminal** and test again.

---

## 📝 Update Backend to Use CPU Mode

You can also set this in your backend `.env` file, but Ollama reads the environment variable when it starts.

**Better approach**: Set the environment variable before starting your backend:

```powershell
# In PowerShell, before starting backend
$env:OLLAMA_NUM_GPU=0
cd backend
npm start
```

---

## 🔍 Check Your GPU

To see what GPU you have:
```powershell
nvidia-smi
```

If you don't have NVIDIA GPU or want to use CPU:
- Use `OLLAMA_NUM_GPU=0` to force CPU mode
- CPU mode is slower but will work with any amount of RAM

---

## ✅ Recommended Steps

1. **Force CPU mode:**
   ```powershell
   $env:OLLAMA_NUM_GPU=0
   ```

2. **Test:**
   ```powershell
   ollama run llama3.2:1b "Hello"
   ```

3. **If it works, make permanent:**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '0', 'User')
   ```

4. **Restart terminal and test again**

5. **Start backend with CPU mode:**
   ```powershell
   $env:OLLAMA_NUM_GPU=0
   cd backend
   npm start
   ```

---

## 💡 Alternative: Use TinyLlama

If CPU mode is too slow, try the smallest model:

```bash
ollama pull tinyllama
```

Update `.env`:
```env
LLM_MODEL=tinyllama
```

This is the smallest model and should work even with limited resources.

---

## 🎯 Summary

**Quick Fix:**
```powershell
$env:OLLAMA_NUM_GPU=0
ollama run llama3.2:1b "Hello"
```

**Permanent Fix:**
```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_NUM_GPU', '0', 'User')
```

Then restart terminal and try again!


