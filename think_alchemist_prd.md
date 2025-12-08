THINK ALCHEMIST — PRODUCT REQUIREMENTS DOCUMENT (v2)

Tagline: Turn raw thoughts into refined clarity.
Product Type: Single-page idea transformation engine
Owner: John Dansu

1. Product Summary
Think Alchemist is a legendary-simple, single-screen app that transforms any text—an idea, a story, a messy paragraph—into refined, structured knowledge.
One input box. One button: Forge. The rest is magic.
Users can create an account to save their transformations ("Forges") privately, but the core experience stays uncluttered and minimal.

2. Product Philosophy
Think Alchemist must feel:
- Effortless — no learning curve
- Instant — results appear before users lift their eyes
- Magical — every output feels like more than the user gave
- Legendary — elegant, poetic, warm, timeless
- One-page — no dashboards, no complexity

3. Core Use Cases
1. Users want to turn raw ideas into structured clarity
2. Users want to clean messy text
3. Users want automatic timelines
4. Users want fictional user feedback
5. Users want world-building for creative writing
6. Users want to save their outputs
7. Users want to re-use or re-run their saved ideas

4. Key Features (Alchemy Modes)
4.1 Input Classification Engine
Automatically detects what kind of text was entered:
- Idea / concept
- Story / narrative
- Event sequence
- Messy document
- World-building keywords
- Mixed content
Triggers relevant alchemy modes automatically.

4.2 Personas & User Insight Simulation
For product or idea inputs:
- 3–5 fictional personas
- Pain points
- Likes & dislikes
- Brutally honest quote
- Willingness-to-pay score
- Persona written like by a real product researcher

4.3 Timeline Alchemy
If a narrative or sequence is detected:
- Vertical chronological timeline
- Clean timestamps (inferred if missing)
- Event summary
- Impact notes
- Smooth, minimal timeline UI

4.4 Document Purification
For messy, unstructured text:
- Better grammar
- Better clarity
- Clean headings
- Proper spacing
- Human tone (non-AI)

4.5 Idea Stress Test Engine
Shows the reality of the idea:
- Best-case scenario
- Worst-case scenario
- 3 hidden risks
- One-line pitch
- “If I had to make this 10× better…”

4.6 World-Building Alchemy
If story-like content is detected:
- Setting
- Characters
- Conflict
- Map description
- 150-word micro-story
- Tone: mature, immersive, not childish

5. User Accounts & Saved Forges
5.1 Authentication
Simple, clean, minimal:
- Email + password
- Google login (optional for v1)
- Password reset
- No bulky settings or profile pages

5.2 Saving Forges
After generating an output:
- Small button: Save This Forge
- Auto-generates title based on input
- Saves entire structured output as JSON
- Stored under the user's private account

5.3 “My Creations” Drawer
Not a dashboard. A side drawer that slides from the right.
Shows:
- List of saved forges
- Date
- Title
- Buttons:
  - Open
  - Re-Forge
  - Delete
Soft, minimal, poetic UI.

6. Non-Goals
- No multi-page dashboard
- No analytics
- No templates
- No complicated editors
- No collaboration
- No AI branding language anywhere in the UI

7. Success Metrics
- First output within < 3 seconds
- 40%+ of users save at least one Forge
- 70% of saved items re-opened later
- Bounce rate < 40% (landing page)
- >90% user rating on clarity & simplicity

8. System Architecture
Frontend
- Single-page React/Vue/Svelte app
- Right-side drawer for saved items
- Timeline renderer
- Authentication modals
- Everything rendered cleanly and instantly

Backend
- Node/Python backend
- Classifier engine
- Alchemy modules
- Auth (JWT or session)
- Database (PostgreSQL or Firestore)

Database
users
- id
- email
- password_hash
- created_at
forges
- id
- user_id
- title
- input_text
- output_json
- created_at

9. UI Design Language
- Legendary simplicity
- Plenty of white space
- Calm, warm tones
- Zero gradients
- Zero AI style cues

Color Palette (no blue, no purple, no teal)
- Primary: Charcoal (#2A2A2A)
- Secondary: Soft Gold (#D3B679)
- Surface: Warm Off-White (#FAF8F3)
- Accent: Burnt Umber (#6B4637)
- Action button: Deep Sand (#C1A46A)

10. Microcopy Tone Guide
Short. Confident. Mythic.
- “Forge”
- “Alchemy in progress…”
- “Clarity achieved.”
- “A refined version awaits.”
- “Saved to your library.”
- “Your thoughts deserve form.”

11. Future Expansion (v2+)
- Export to Markdown/PDF
- Shareable links
- Tags for saved forges
- Collaboration mode
- Mobile app
- Voice → idea alchemy

Final Thought
This PRD makes Think Alchemist feel like a mythical but extremely practical tool—simple enough to use in 5 seconds, powerful enough to impress anyone reviewing your portfolio.

