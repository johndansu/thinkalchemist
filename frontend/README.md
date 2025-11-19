# Think Alchemist - Frontend

Frontend application for Think Alchemist - a single-page idea transformation engine.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (or copy from `.env.example`):
```
VITE_API_URL=http://localhost:3001/api
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── InputBox.jsx          # Main input textarea
│   │   ├── ForgeButton.jsx        # Primary action button
│   │   ├── OutputDisplay.jsx      # Main output container
│   │   ├── TimelineView.jsx       # Timeline visualization
│   │   ├── PersonaCard.jsx        # Persona display card
│   │   ├── AuthModal.jsx          # Authentication modal
│   │   └── SavedForgesDrawer.jsx # Saved forges drawer
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── styles/
│   │   └── main.css               # Global styles
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Features

- ✅ Single-page design
- ✅ Input classification and transformation
- ✅ Multiple alchemy modes (Personas, Timeline, Purification, Stress Test, World-Building)
- ✅ User authentication
- ✅ Save and load forges
- ✅ Responsive design
- ✅ Legendary simple UI

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

