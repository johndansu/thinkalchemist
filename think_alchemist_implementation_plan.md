# THINK ALCHEMIST — IMPLEMENTATION EXECUTION PLAN

## Overview
This document provides a comprehensive, step-by-step guide to building Think Alchemist from scratch. Follow these steps in order to create a fully functional single-page idea transformation engine.

---

## Phase 1: Project Setup & Architecture

### Step 1.1: Choose Technology Stack
**Decision Matrix:**
- **Frontend:** React (with Vite for fast builds) or Next.js (for SSR if needed)
  - Recommendation: **React + Vite** for simplicity and speed
- **Backend:** Node.js with Express or Python with FastAPI
  - Recommendation: **Node.js + Express** for consistency with frontend
- **Database:** PostgreSQL (recommended) or Supabase (for faster setup)
  - Recommendation: **Supabase** for built-in auth and PostgreSQL
- **AI/LLM Integration:** OpenAI API (GPT-4) or Anthropic Claude
  - Recommendation: **OpenAI GPT-4** for classification and generation

**Action Items:**
1. Initialize frontend project: `npm create vite@latest think-alchemist-frontend -- --template react`
2. Initialize backend project: `mkdir think-alchemist-backend && cd think-alchemist-backend && npm init -y`
3. Set up Supabase project at supabase.com
4. Create `.env` files for both frontend and backend

---

### Step 1.2: Project Structure Setup
```
think-alchemist/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputBox.jsx
│   │   │   ├── ForgeButton.jsx
│   │   │   ├── OutputDisplay.jsx
│   │   │   ├── TimelineView.jsx
│   │   │   ├── PersonaCard.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   └── SavedForgesDrawer.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── utils/
│   │   │   ├── classifier.js
│   │   │   └── formatters.js
│   │   ├── styles/
│   │   │   └── main.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── forge.js
│   │   │   ├── auth.js
│   │   │   └── saved.js
│   │   ├── services/
│   │   │   ├── classifier.js
│   │   │   ├── alchemy/
│   │   │   │   ├── personas.js
│   │   │   │   ├── timeline.js
│   │   │   │   ├── purification.js
│   │   │   │   ├── stressTest.js
│   │   │   │   └── worldBuilding.js
│   │   │   └── openai.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── package.json
│   └── .env
└── README.md
```

**Action Items:**
1. Create the folder structure above
2. Install core dependencies:
   - Frontend: `npm install react react-dom axios`
   - Backend: `npm install express cors dotenv openai supabase @supabase/supabase-js`
3. Set up Vite config for frontend
4. Set up Express server with basic middleware

---

### Step 1.3: Database Schema Setup
**Supabase SQL Migration:**

```sql
-- Users table (Supabase handles this, but we'll add custom fields if needed)
-- Supabase Auth automatically creates auth.users

-- Forges table
CREATE TABLE forges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_json JSONB NOT NULL,
  alchemy_mode TEXT NOT NULL, -- 'personas', 'timeline', 'purification', 'stress_test', 'world_building'
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

**Action Items:**
1. Open Supabase SQL Editor
2. Run the migration above
3. Verify tables are created
4. Test RLS policies

---

## Phase 2: Backend Implementation

### Step 2.1: Backend Server Setup
**File: `backend/src/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const forgeRoutes = require('./routes/forge');
const authRoutes = require('./routes/auth');
const savedRoutes = require('./routes/saved');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/forge', forgeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Action Items:**
1. Create `server.js` with the code above
2. Test server starts: `node src/server.js`
3. Verify health endpoint works

---

### Step 2.2: OpenAI Service Setup
**File: `backend/src/services/openai.js`**

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI(prompt, systemPrompt, temperature = 0.7) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature,
      response_format: { type: 'json_object' }, // Force JSON when needed
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

module.exports = { callOpenAI };
```

**Action Items:**
1. Install OpenAI package: `npm install openai`
2. Add `OPENAI_API_KEY` to `.env`
3. Create the service file
4. Test with a simple prompt

---

### Step 2.3: Input Classification Engine
**File: `backend/src/services/classifier.js`**

**Implementation Strategy:**
1. Use GPT-4 to classify input text
2. Return structured classification with confidence scores
3. Determine which alchemy mode(s) to trigger

```javascript
const { callOpenAI } = require('./openai');

const CLASSIFICATION_PROMPT = `Analyze the following text and classify it into one or more categories. Return a JSON object with:
- primary_type: "idea" | "story" | "event_sequence" | "messy_document" | "world_building" | "mixed"
- confidence: 0-1
- suggested_modes: array of alchemy modes to apply
- keywords: array of relevant keywords

Categories:
- idea: Product concepts, business ideas, feature requests
- story: Narratives, creative writing, fictional content
- event_sequence: Historical events, timelines, chronological sequences
- messy_document: Unstructured text, poor grammar, needs cleaning
- world_building: Fantasy/sci-fi settings, character descriptions, lore
- mixed: Multiple types present

Text to classify: {input}`;

async function classifyInput(inputText) {
  const prompt = CLASSIFICATION_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a text classification expert. Always return valid JSON.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.3);
  return JSON.parse(result);
}

module.exports = { classifyInput };
```

**Action Items:**
1. Create classifier service
2. Test with sample inputs of each type
3. Verify JSON parsing works correctly
4. Add error handling

---

### Step 2.4: Alchemy Mode Implementations

#### Step 2.4.1: Personas & User Insight Simulation
**File: `backend/src/services/alchemy/personas.js`**

```javascript
const { callOpenAI } = require('../openai');

const PERSONAS_PROMPT = `Generate 3-5 fictional user personas for this product/idea. For each persona, provide:
- name: Full name
- age: Number
- occupation: String
- pain_points: Array of 3-5 pain points
- likes: Array of 3-5 things they like
- dislikes: Array of 3-5 things they dislike
- quote: One brutally honest quote about the product
- willingness_to_pay: Number 0-100 (score)
- background: 2-3 sentence background

Write like a real product researcher. Be specific and realistic.

Product/Idea: {input}`;

async function generatePersonas(inputText) {
  const prompt = PERSONAS_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are an expert product researcher. Return valid JSON with a "personas" array.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.8);
  return JSON.parse(result);
}

module.exports = { generatePersonas };
```

#### Step 2.4.2: Timeline Alchemy
**File: `backend/src/services/alchemy/timeline.js`**

```javascript
const { callOpenAI } = require('../openai');

const TIMELINE_PROMPT = `Extract and structure events from this text into a chronological timeline. Return JSON with:
- events: Array of objects, each with:
  - timestamp: ISO 8601 date string (infer if missing)
  - title: Short event title
  - description: 2-3 sentence description
  - impact: One sentence on significance
- summary: Overall timeline summary (2-3 sentences)

Text: {input}`;

async function generateTimeline(inputText) {
  const prompt = TIMELINE_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a timeline extraction expert. Return valid JSON.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.5);
  return JSON.parse(result);
}

module.exports = { generateTimeline };
```

#### Step 2.4.3: Document Purification
**File: `backend/src/services/alchemy/purification.js`**

```javascript
const { callOpenAI } = require('../openai');

const PURIFICATION_PROMPT = `Clean and refine this text. Improve:
- Grammar and spelling
- Clarity and flow
- Structure with proper headings
- Spacing and formatting
- Tone (make it human, not AI-like)

Return JSON with:
- cleaned_text: The refined version
- improvements: Array of what was improved
- original_length: Character count of original
- cleaned_length: Character count of cleaned

Original text: {input}`;

async function purifyDocument(inputText) {
  const prompt = PURIFICATION_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a professional editor. Return valid JSON. Write naturally, not like AI.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.6);
  return JSON.parse(result);
}

module.exports = { purifyDocument };
```

#### Step 2.4.4: Idea Stress Test Engine
**File: `backend/src/services/alchemy/stressTest.js`**

```javascript
const { callOpenAI } = require('../openai');

const STRESS_TEST_PROMPT = `Perform a reality check on this idea. Return JSON with:
- best_case: 2-3 sentence best-case scenario
- worst_case: 2-3 sentence worst-case scenario
- hidden_risks: Array of 3 risks with descriptions
- one_line_pitch: Single compelling pitch sentence
- improvement_suggestion: "If I had to make this 10× better..." (2-3 sentences)

Idea: {input}`;

async function stressTestIdea(inputText) {
  const prompt = STRESS_TEST_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a critical business analyst. Be honest and realistic. Return valid JSON.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.7);
  return JSON.parse(result);
}

module.exports = { stressTestIdea };
```

#### Step 2.4.5: World-Building Alchemy
**File: `backend/src/services/alchemy/worldBuilding.js`**

```javascript
const { callOpenAI } = require('../openai');

const WORLD_BUILDING_PROMPT = `Expand this into rich world-building content. Return JSON with:
- setting: Detailed setting description (3-4 sentences)
- characters: Array of 2-4 main characters, each with name, role, and 2-sentence description
- conflict: Main conflict or tension (2-3 sentences)
- map_description: Visual description of key locations (3-4 sentences)
- micro_story: 150-word immersive micro-story (mature tone, not childish)
- tone: Overall tone/mood description

Input: {input}`;

async function buildWorld(inputText) {
  const prompt = WORLD_BUILDING_PROMPT.replace('{input}', inputText);
  const systemPrompt = 'You are a masterful fantasy/sci-fi world builder. Write mature, immersive content. Return valid JSON.';
  
  const result = await callOpenAI(prompt, systemPrompt, 0.8);
  return JSON.parse(result);
}

module.exports = { buildWorld };
```

**Action Items:**
1. Create each alchemy service file
2. Test each service independently with sample inputs
3. Verify JSON structure matches frontend expectations
4. Add error handling and fallbacks

---

### Step 2.5: Main Forge Route
**File: `backend/src/routes/forge.js`**

```javascript
const express = require('express');
const router = express.Router();
const { classifyInput } = require('../services/classifier');
const { generatePersonas } = require('../services/alchemy/personas');
const { generateTimeline } = require('../services/alchemy/timeline');
const { purifyDocument } = require('../services/alchemy/purification');
const { stressTestIdea } = require('../services/alchemy/stressTest');
const { buildWorld } = require('../services/alchemy/worldBuilding');

router.post('/transform', async (req, res) => {
  try {
    const { inputText } = req.body;
    
    if (!inputText || inputText.trim().length === 0) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    // Step 1: Classify input
    const classification = await classifyInput(inputText);
    const modes = classification.suggested_modes || [];

    // Step 2: Run relevant alchemy modes
    const results = {};
    
    if (modes.includes('personas')) {
      results.personas = await generatePersonas(inputText);
    }
    
    if (modes.includes('timeline')) {
      results.timeline = await generateTimeline(inputText);
    }
    
    if (modes.includes('purification')) {
      results.purification = await purifyDocument(inputText);
    }
    
    if (modes.includes('stress_test')) {
      results.stressTest = await stressTestIdea(inputText);
    }
    
    if (modes.includes('world_building')) {
      results.worldBuilding = await buildWorld(inputText);
    }

    // Step 3: Return structured output
    res.json({
      success: true,
      classification,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Forge error:', error);
    res.status(500).json({ error: 'Failed to transform input', details: error.message });
  }
});

module.exports = router;
```

**Action Items:**
1. Create forge route
2. Test with Postman or curl
3. Verify all modes work correctly
4. Add rate limiting if needed

---

### Step 2.6: Authentication Routes
**File: `backend/src/routes/auth.js`**

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    res.json({ success: true, user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    res.json({ success: true, user: data.user, session: data.session });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

**Action Items:**
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Add Supabase credentials to `.env`
3. Test signup, signin, signout endpoints
4. Verify JWT tokens are returned

---

### Step 2.7: Saved Forges Routes
**File: `backend/src/routes/saved.js`**

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware to verify auth
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Save a forge
router.post('/save', verifyAuth, async (req, res) => {
  try {
    const { title, inputText, outputJson, alchemyMode } = req.body;
    
    const { data, error } = await supabase
      .from('forges')
      .insert({
        user_id: req.user.id,
        title: title || `Forge ${new Date().toLocaleDateString()}`,
        input_text: inputText,
        output_json: outputJson,
        alchemy_mode: alchemyMode,
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, forge: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all saved forges for user
router.get('/list', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('forges')
      .select('id, title, created_at, alchemy_mode')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, forges: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single forge
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('forges')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) throw error;
    res.json({ success: true, forge: data });
  } catch (error) {
    res.status(404).json({ error: 'Forge not found' });
  }
});

// Delete forge
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('forges')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

**Action Items:**
1. Create saved routes
2. Test all CRUD operations
3. Verify RLS policies work
4. Test with authenticated and unauthenticated requests

---

## Phase 3: Frontend Implementation

### Step 3.1: Frontend Setup & Styling
**File: `frontend/src/styles/main.css`**

```css
/* Color Palette */
:root {
  --charcoal: #2A2A2A;
  --soft-gold: #D3B679;
  --warm-off-white: #FAF8F3;
  --burnt-umber: #6B4637;
  --deep-sand: #C1A46A;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: var(--warm-off-white);
  color: var(--charcoal);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Input Box */
.input-container {
  width: 100%;
  margin-bottom: 2rem;
}

.input-box {
  width: 100%;
  min-height: 200px;
  padding: 1.5rem;
  border: 2px solid var(--charcoal);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: white;
  resize: vertical;
  transition: border-color 0.3s;
}

.input-box:focus {
  outline: none;
  border-color: var(--soft-gold);
}

/* Forge Button */
.forge-button {
  background: var(--deep-sand);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.forge-button:hover {
  background: var(--soft-gold);
  transform: translateY(-2px);
}

.forge-button:active {
  transform: translateY(0);
}

.forge-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Output Display */
.output-container {
  width: 100%;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--soft-gold);
}

.timeline-event {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 2rem;
}

.timeline-event::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--deep-sand);
  border: 2px solid var(--warm-off-white);
}

/* Persona Card */
.persona-card {
  background: var(--warm-off-white);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid var(--soft-gold);
}

/* Drawer */
.drawer {
  position: fixed;
  right: -400px;
  top: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem;
}

.drawer.open {
  right: 0;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 999;
}

.drawer-overlay.open {
  opacity: 1;
  pointer-events: all;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 2rem;
  color: var(--burnt-umber);
  font-style: italic;
}
```

**Action Items:**
1. Create CSS file with the styles above
2. Import in `main.jsx`
3. Verify colors match PRD
4. Test responsive design

---

### Step 3.2: API Service
**File: `frontend/src/services/api.js`**

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const forgeAPI = {
  transform: async (inputText) => {
    const response = await api.post('/forge/transform', { inputText });
    return response.data;
  },
};

export const authAPI = {
  signup: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },
  signin: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.session?.access_token) {
      localStorage.setItem('auth_token', response.data.session.access_token);
    }
    return response.data;
  },
  signout: async () => {
    await api.post('/auth/signout');
    localStorage.removeItem('auth_token');
  },
};

export const savedAPI = {
  save: async (title, inputText, outputJson, alchemyMode) => {
    const response = await api.post('/saved/save', {
      title,
      inputText,
      outputJson,
      alchemyMode,
    });
    return response.data;
  },
  list: async () => {
    const response = await api.get('/saved/list');
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/saved/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/saved/${id}`);
    return response.data;
  },
};
```

**Action Items:**
1. Install axios: `npm install axios`
2. Create API service file
3. Add `VITE_API_URL` to `.env`
4. Test API calls

---

### Step 3.3: Core Components

#### Step 3.3.1: InputBox Component
**File: `frontend/src/components/InputBox.jsx`**

```javascript
import React from 'react';

function InputBox({ value, onChange, placeholder = "Enter your thoughts here..." }) {
  return (
    <div className="input-container">
      <textarea
        className="input-box"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default InputBox;
```

#### Step 3.3.2: ForgeButton Component
**File: `frontend/src/components/ForgeButton.jsx`**

```javascript
import React from 'react';

function ForgeButton({ onClick, disabled, loading }) {
  return (
    <button
      className="forge-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Alchemy in progress...' : 'Forge'}
    </button>
  );
}

export default ForgeButton;
```

#### Step 3.3.3: OutputDisplay Component
**File: `frontend/src/components/OutputDisplay.jsx`**

```javascript
import React from 'react';
import TimelineView from './TimelineView';
import PersonaCard from './PersonaCard';

function OutputDisplay({ output, onSave }) {
  if (!output || !output.results) return null;

  const { results, classification } = output;

  return (
    <div className="output-container">
      {results.personas && (
        <section>
          <h2>Personas & Insights</h2>
          {results.personas.personas?.map((persona, idx) => (
            <PersonaCard key={idx} persona={persona} />
          ))}
        </section>
      )}

      {results.timeline && (
        <section>
          <h2>Timeline</h2>
          <TimelineView events={results.timeline.events} />
        </section>
      )}

      {results.purification && (
        <section>
          <h2>Refined Text</h2>
          <div className="purified-text">
            {results.purification.cleaned_text}
          </div>
        </section>
      )}

      {results.stressTest && (
        <section>
          <h2>Reality Check</h2>
          <div className="stress-test">
            <div><strong>Best Case:</strong> {results.stressTest.best_case}</div>
            <div><strong>Worst Case:</strong> {results.stressTest.worst_case}</div>
            <div><strong>One-Line Pitch:</strong> {results.stressTest.one_line_pitch}</div>
          </div>
        </section>
      )}

      {results.worldBuilding && (
        <section>
          <h2>World Building</h2>
          <div className="world-building">
            <p><strong>Setting:</strong> {results.worldBuilding.setting}</p>
            <p><strong>Conflict:</strong> {results.worldBuilding.conflict}</p>
            <p>{results.worldBuilding.micro_story}</p>
          </div>
        </section>
      )}

      {onSave && (
        <button onClick={onSave} className="save-button">
          Save This Forge
        </button>
      )}
    </div>
  );
}

export default OutputDisplay;
```

#### Step 3.3.4: TimelineView Component
**File: `frontend/src/components/TimelineView.jsx`**

```javascript
import React from 'react';

function TimelineView({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="timeline">
      {events.map((event, idx) => (
        <div key={idx} className="timeline-event">
          <div className="timeline-timestamp">
            {new Date(event.timestamp).toLocaleDateString()}
          </div>
          <div className="timeline-title">{event.title}</div>
          <div className="timeline-description">{event.description}</div>
          {event.impact && (
            <div className="timeline-impact">Impact: {event.impact}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TimelineView;
```

#### Step 3.3.5: PersonaCard Component
**File: `frontend/src/components/PersonaCard.jsx`**

```javascript
import React from 'react';

function PersonaCard({ persona }) {
  return (
    <div className="persona-card">
      <h3>{persona.name}, {persona.age} — {persona.occupation}</h3>
      <p className="persona-quote">"{persona.quote}"</p>
      <div className="persona-details">
        <div><strong>Pain Points:</strong> {persona.pain_points?.join(', ')}</div>
        <div><strong>Likes:</strong> {persona.likes?.join(', ')}</div>
        <div><strong>Dislikes:</strong> {persona.dislikes?.join(', ')}</div>
        <div><strong>Willingness to Pay:</strong> {persona.willingness_to_pay}/100</div>
      </div>
    </div>
  );
}

export default PersonaCard;
```

**Action Items:**
1. Create each component file
2. Test components in isolation
3. Verify styling matches design
4. Add error states

---

### Step 3.4: Authentication Components
**File: `frontend/src/components/AuthModal.jsx`**

```javascript
import React, { useState } from 'react';
import { authAPI } from '../services/api';

function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authAPI.signup(email, password);
      } else {
        await authAPI.signin(email, password);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}

export default AuthModal;
```

**Action Items:**
1. Create AuthModal component
2. Add modal styles to CSS
3. Test signup and signin flows
4. Handle token storage

---

### Step 3.5: Saved Forges Drawer
**File: `frontend/src/components/SavedForgesDrawer.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { savedAPI } from '../services/api';

function SavedForgesDrawer({ isOpen, onClose, onLoadForge, onReForge }) {
  const [forges, setForges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadForges();
    }
  }, [isOpen]);

  const loadForges = async () => {
    setLoading(true);
    try {
      const response = await savedAPI.list();
      setForges(response.forges || []);
    } catch (error) {
      console.error('Failed to load forges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this forge?')) return;
    try {
      await savedAPI.delete(id);
      loadForges();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>My Creations</h2>
          <button onClick={onClose}>×</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : forges.length === 0 ? (
          <div>No saved forges yet.</div>
        ) : (
          <div className="forge-list">
            {forges.map((forge) => (
              <div key={forge.id} className="forge-item">
                <h3>{forge.title}</h3>
                <div className="forge-meta">
                  {new Date(forge.created_at).toLocaleDateString()}
                </div>
                <div className="forge-actions">
                  <button onClick={() => onLoadForge(forge.id)}>Open</button>
                  <button onClick={() => onReForge(forge.id)}>Re-Forge</button>
                  <button onClick={() => handleDelete(forge.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SavedForgesDrawer;
```

**Action Items:**
1. Create SavedForgesDrawer component
2. Add drawer styles
3. Test open/close animations
4. Test CRUD operations

---

### Step 3.6: Main App Component
**File: `frontend/src/App.jsx`**

```javascript
import React, { useState } from 'react';
import InputBox from './components/InputBox';
import ForgeButton from './components/ForgeButton';
import OutputDisplay from './components/OutputDisplay';
import AuthModal from './components/AuthModal';
import SavedForgesDrawer from './components/SavedForgesDrawer';
import { forgeAPI, savedAPI, authAPI } from './services/api';
import './styles/main.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('auth_token')
  );

  const handleForge = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutput(null);

    try {
      const result = await forgeAPI.transform(inputText);
      setOutput(result);
    } catch (error) {
      console.error('Forge error:', error);
      alert('Failed to forge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!output) return;

    try {
      const title = inputText.substring(0, 50) + (inputText.length > 50 ? '...' : '');
      const primaryMode = output.classification?.suggested_modes?.[0] || 'mixed';
      
      await savedAPI.save(
        title,
        inputText,
        output,
        primaryMode
      );
      
      alert('Saved to your library.');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const handleLoadForge = async (id) => {
    try {
      const response = await savedAPI.get(id);
      setInputText(response.forge.input_text);
      setOutput(response.forge.output_json);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const handleReForge = async (id) => {
    try {
      const response = await savedAPI.get(id);
      setInputText(response.forge.input_text);
      setIsDrawerOpen(false);
      // Trigger forge automatically
      setTimeout(() => handleForge(), 100);
    } catch (error) {
      console.error('Re-forge error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    await authAPI.signout();
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      <header>
        <h1>Think Alchemist</h1>
        <p className="tagline">Turn raw thoughts into refined clarity.</p>
      </header>

      <InputBox value={inputText} onChange={setInputText} />
      
      <ForgeButton onClick={handleForge} loading={loading} />

      {output && <OutputDisplay output={output} onSave={handleSave} />}

      <div className="app-actions">
        {isAuthenticated ? (
          <>
            <button onClick={() => setIsDrawerOpen(true)}>My Creations</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)}>Sign In to Save</button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <SavedForgesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLoadForge={handleLoadForge}
        onReForge={handleReForge}
      />
    </div>
  );
}

export default App;
```

**Action Items:**
1. Create App.jsx with full logic
2. Wire up all components
3. Test complete user flow
4. Add error boundaries

---

## Phase 4: Testing & Refinement

### Step 4.1: Unit Testing
**Test Each Alchemy Mode:**
1. Test classification with various inputs
2. Test each alchemy service independently
3. Test API endpoints with Postman
4. Test frontend components in isolation

### Step 4.2: Integration Testing
1. Test full forge flow: input → classification → alchemy → output
2. Test authentication flow
3. Test save/load/delete flow
4. Test error handling

### Step 4.3: Performance Optimization
1. Add loading states
2. Implement request debouncing
3. Cache classification results
4. Optimize API calls (batch if needed)

### Step 4.4: UI/UX Polish
1. Add smooth animations
2. Improve microcopy (use PRD tone guide)
3. Test on mobile devices
4. Verify color palette matches PRD

---

## Phase 5: Deployment

### Step 5.1: Environment Setup
1. Set up production Supabase project
2. Configure production environment variables
3. Set up domain (if needed)
4. Configure CORS for production

### Step 5.2: Backend Deployment
**Options:**
- **Render.com** (recommended for Node.js)
- **Railway**
- **Heroku**
- **Vercel** (serverless)

**Steps:**
1. Push backend code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy and test

### Step 5.3: Frontend Deployment
**Options:**
- **Vercel** (recommended for React)
- **Netlify**
- **GitHub Pages**

**Steps:**
1. Build frontend: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables
4. Test production URL

### Step 5.4: Post-Deployment
1. Test all features in production
2. Monitor error logs
3. Set up analytics (optional)
4. Document API endpoints

---

## Phase 6: Launch Checklist

- [ ] All features working in production
- [ ] Authentication tested
- [ ] Save/load functionality verified
- [ ] Mobile responsive design tested
- [ ] Error handling in place
- [ ] Loading states working
- [ ] API rate limiting configured
- [ ] Environment variables secured
- [ ] Database backups enabled
- [ ] Domain configured (if applicable)
- [ ] SEO meta tags added
- [ ] Privacy policy/terms (if needed)

---

## Estimated Timeline

- **Phase 1 (Setup):** 1-2 days
- **Phase 2 (Backend):** 3-5 days
- **Phase 3 (Frontend):** 4-6 days
- **Phase 4 (Testing):** 2-3 days
- **Phase 5 (Deployment):** 1-2 days

**Total: 11-18 days** (depending on experience level)

---

## Key Success Criteria (from PRD)

- ✅ First output within < 3 seconds
- ✅ 40%+ users save at least one Forge
- ✅ 70% of saved items re-opened later
- ✅ Bounce rate < 40%
- ✅ >90% user rating on clarity & simplicity

---

## Next Steps After v1

1. Add export to Markdown/PDF
2. Implement shareable links
3. Add tags for saved forges
4. Mobile app development
5. Voice input feature

---

## Notes

- Keep the UI minimal and legendary-simple
- No AI branding language in UI
- Use warm, poetic microcopy
- Maintain the one-page philosophy
- Focus on speed and clarity

**Good luck building Think Alchemist! 🧪✨**

