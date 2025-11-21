# Think Alchemist Backend

Backend API server for Think Alchemist.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Set up your environment variables:
   - `LLM_PROVIDER`: Choose `groq` (recommended), `together`, `ollama`, or `replicate`
   - `LLM_API_KEY` or provider-specific key (see LLAMA_SETUP.md for details)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
   
   **See `LLAMA_SETUP.md` for detailed Llama provider setup instructions.**

4. Run the database migration in Supabase SQL Editor (see implementation plan)

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Forge
- `POST /api/forge/transform` - Transform input text (supports mode parameter)

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### Saved Forges
- `POST /api/saved/save` - Save a forge (requires auth)
- `GET /api/saved/list` - List all user's forges (requires auth)
- `GET /api/saved/:id` - Get specific forge (requires auth)
- `DELETE /api/saved/:id` - Delete forge (requires auth)

## Database Schema

See `think_alchemist_implementation_plan.md` for the complete database schema and migration SQL.

