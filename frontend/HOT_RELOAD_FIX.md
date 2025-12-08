# Hot Reload Not Working? Follow These Steps:

## Step 1: Restart the Dev Server
1. Stop the current server (press `Ctrl+C` in the terminal)
2. Start it again: `npm run server`

## Step 2: Hard Refresh Browser
- Press `Ctrl + Shift + R` (Windows)
- Or `Ctrl + F5`
- Or open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

## Step 3: Disable Browser Cache (for development)
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while developing

## Step 4: Check if HMR is Working
- After making a change, you should see in the terminal: `[vite] hmr update`
- The browser should update automatically without full page refresh

## Step 5: If Still Not Working
1. Close the browser tab completely
2. Restart the dev server
3. Open a fresh browser tab
4. Go to http://localhost:5173

## Quick Test
I added a ✨ emoji to the title. After restarting the server and hard refreshing, you should see "Think Alchemist ✨" instead of just "Think Alchemist".

