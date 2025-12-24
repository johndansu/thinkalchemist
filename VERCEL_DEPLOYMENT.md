# Vercel Deployment Guide

This guide will help you deploy Think Alchemist to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project connected to a Git repository (GitHub, GitLab, or Bitbucket)
3. All environment variables ready (see below)

## Deployment Steps

### 1. Prepare Environment Variables

Before deploying, you need to set up environment variables in Vercel. You'll need:

#### Backend/API Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (optional but recommended)
- `LLM_PROVIDER` - Choose: `groq`, `together`, `ollama`, or `replicate`
- `GROQ_API_KEY` - If using Groq (recommended for free tier)
- `TOGETHER_API_KEY` - If using Together.ai
- `REPLICATE_API_TOKEN` - If using Replicate
- `LLM_MODEL` - Model name (default: `llama-3.1-70b-versatile` for Groq)
- `OLLAMA_URL` - If using Ollama (default: `http://localhost:11434`)
- `FRONTEND_URL` - Your Vercel deployment URL (will be set automatically)

#### Frontend Variables:
- `VITE_API_URL` - Your API URL (will be `https://your-project.vercel.app/api`)

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as default (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd frontend && npm install && cd ../backend && npm install`

4. Add all environment variables in the "Environment Variables" section

5. Click "Deploy"

### 3. Deploy via Vercel CLI (Alternative)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project root:
   ```bash
   cd /path/to/thinkalchemist
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts and add environment variables when asked

6. For production deployment:
   ```bash
   vercel --prod
   ```

### 4. Set Environment Variables in Vercel Dashboard

After initial deployment:

1. Go to your project on Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all required variables (see list above)
4. Make sure to set them for **Production**, **Preview**, and **Development** environments
5. Redeploy your project for changes to take effect

### 5. Update Frontend API URL

After deployment, update the `VITE_API_URL` environment variable in Vercel:

- For production: `https://your-project.vercel.app/api`
- The frontend will automatically use this URL

### 6. Verify Deployment

1. Check your deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the health endpoint: `https://your-project.vercel.app/api/health`
3. Test the frontend: Navigate to your deployment URL

## Project Structure

```
thinkalchemist/
├── api/
│   └── index.js          # Vercel serverless function (API handler)
├── frontend/
│   ├── dist/             # Built frontend (generated)
│   ├── src/
│   └── package.json
├── backend/
│   ├── src/
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Important Notes

1. **API Routes**: All API routes are accessible at `/api/*` (e.g., `/api/forge/transform`)
2. **Frontend**: The frontend is served as a static site from `frontend/dist`
3. **Environment Variables**: Make sure all backend environment variables are set in Vercel
4. **CORS**: The API is configured to accept requests from your Vercel domain
5. **Build Time**: The build process installs dependencies for both frontend and backend

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json` files
- Verify Node.js version (should be 18.x or higher)
- Check build logs in Vercel dashboard

### API Not Working
- Verify all environment variables are set correctly
- Check API logs in Vercel dashboard
- Ensure `VITE_API_URL` is set to your Vercel deployment URL

### CORS Errors
- Make sure `FRONTEND_URL` is set to your Vercel deployment URL
- Check that the API handler allows your domain

### Database Connection Issues
- Verify Supabase credentials are correct
- Check that Supabase project is active
- Ensure database migrations have been run

## Continuous Deployment

Once connected to Git, Vercel will automatically:
- Deploy on every push to the main branch (production)
- Create preview deployments for pull requests
- Run builds automatically

## Next Steps

1. Set up a custom domain (optional)
2. Configure environment variables for different environments
3. Set up monitoring and analytics
4. Configure rate limiting if needed

