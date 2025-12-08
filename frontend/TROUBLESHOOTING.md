# Troubleshooting - Can't See the App

## Quick Checks

1. **Is the server running?**
   - Check your terminal - you should see: `VITE v7.x.x  ready in xxx ms`
   - Look for: `➜  Local:   http://localhost:5173/`

2. **What URL are you using?**
   - Must be: `http://localhost:5173`
   - NOT: `http://localhost:5173/index.html`
   - NOT: `file:///C:/...` (file:// protocol won't work)

3. **Browser Console Errors?**
   - Press F12 to open DevTools
   - Check the Console tab for red errors
   - Check the Network tab - are files loading?

4. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Or: Open DevTools → Right-click refresh → "Empty Cache and Hard Reload"

5. **Try a different browser:**
   - Chrome, Firefox, Edge - try all three

6. **Check if port is correct:**
   - The terminal output will show the exact URL
   - It might be 5174, 5175 if 5173 is busy

## What You Should See

When the app loads correctly, you should see:
- "Think Alchemist" heading
- "Turn raw thoughts into refined clarity." tagline
- Large text input box
- "FORGE" button
- "Sign In to Save" button at bottom
- Warm off-white background (#FAF8F3)

## If Still Not Working

1. Stop the server (Ctrl+C in terminal)
2. Delete `node_modules` and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   npm run server
   ```

3. Check browser console for specific errors
4. Share the error messages you see

