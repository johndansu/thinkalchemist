# Storage Troubleshooting Guide

If you're having issues saving to storage, follow these steps:

## Common Issues and Solutions

### 1. **"You need to sign in to save your work"**
   - **Problem**: You're not authenticated
   - **Solution**: 
     - Click "Sign In" when prompted
     - Or go to `/auth` page and sign in/sign up
     - Make sure you have an account created

### 2. **"Your session has expired"**
   - **Problem**: Your authentication token has expired
   - **Solution**: 
     - Sign out and sign back in
     - The app will automatically redirect you to the auth page

### 3. **"Database not configured" or "Storage is not configured"**
   - **Problem**: Supabase credentials are missing or incorrect
   - **Solution**:
     1. Check your `backend/.env` file exists
     2. Make sure it contains:
        ```
        SUPABASE_URL=https://your-project.supabase.co
        SUPABASE_ANON_KEY=your-anon-key
        SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
        ```
     3. Restart your backend server after adding credentials

### 4. **"Database table not found"**
   - **Problem**: The `forges` table hasn't been created in Supabase
   - **Solution**: Run the database migration in Supabase SQL Editor:
   
   ```sql
   -- Forges table
   CREATE TABLE forges (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     input_text TEXT NOT NULL,
     output_json JSONB NOT NULL,
     alchemy_mode TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Index for faster queries
   CREATE INDEX idx_forges_user_id ON forges(user_id);
   CREATE INDEX idx_forges_created_at ON forges(created_at DESC);

   -- Enable Row Level Security
   ALTER TABLE forges ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can only see their own forges
   CREATE POLICY "Users can view own forges"
     ON forges FOR SELECT
     USING (auth.uid() = user_id);

   -- Policy: Users can insert their own forges
   CREATE POLICY "Users can insert own forges"
     ON forges FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can update their own forges
   CREATE POLICY "Users can update own forges"
     ON forges FOR UPDATE
     USING (auth.uid() = user_id);

   -- Policy: Users can delete their own forges
   CREATE POLICY "Users can delete own forges"
     ON forges FOR DELETE
     USING (auth.uid() = user_id);
   ```

### 5. **"Failed to connect to backend"**
   - **Problem**: Backend server is not running
   - **Solution**:
     1. Make sure the backend server is running on port 3001
     2. Check `http://localhost:3001/health` in your browser
     3. Start the backend: `cd backend && npm start`

### 6. **Network Error**
   - **Problem**: Frontend can't reach the backend
   - **Solution**:
     1. Check that `VITE_API_URL` in frontend `.env` matches your backend URL
     2. Default is `http://localhost:3001/api`
     3. Make sure CORS is configured correctly in backend

## How to Check Your Setup

1. **Check Authentication**:
   - Open browser console (F12)
   - Type: `localStorage.getItem('auth_token')`
   - If it returns `null`, you need to sign in

2. **Check Backend Connection**:
   - Visit: `http://localhost:3001/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check Supabase Configuration**:
   - Look at backend console when starting server
   - Should see: `✅ Supabase client initialized`
   - If you see: `⚠️ Supabase credentials not found`, add credentials to `.env`

4. **Check Database Table**:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM forges LIMIT 1;`
   - If you get an error, the table doesn't exist (run migration above)

## Still Having Issues?

1. Check the browser console (F12) for error messages
2. Check the backend console for error logs
3. Verify all environment variables are set correctly
4. Make sure you've run the database migration
5. Try signing out and signing back in

## Error Messages Reference

- **"No authentication token provided"** → Not signed in
- **"Invalid or expired token"** → Token expired, sign in again
- **"Database not configured"** → Missing Supabase credentials
- **"Database table not found"** → Run database migration
- **"Failed to save"** → Check backend logs for details

