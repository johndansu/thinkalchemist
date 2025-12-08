# Multi-Page Structure

## Pages Created

### 1. **Home Page** (`/`)
- Main forge interface
- Input box for text
- Forge button
- Output display
- Save functionality

### 2. **My Creations Page** (`/creations`)
- List of all saved forges
- View forge details
- Re-forge functionality
- Delete forges
- Two-column layout (list + detail view)

### 3. **Auth Page** (`/auth`)
- Sign in / Sign up form
- Toggle between sign in and sign up
- Error handling
- Redirects to home after authentication

## Navigation

- **Top Navigation Bar** with:
  - Logo (links to home)
  - "Forge" link (home page)
  - "My Creations" link (only when authenticated)
  - "Sign In" / "Sign Out" button

## Routing

Uses React Router DOM:
- `/` - Home page
- `/creations` - My Creations page
- `/auth` - Authentication page

## Features

- ✅ Multi-page navigation
- ✅ Protected routes (My Creations requires auth)
- ✅ State management across pages
- ✅ Re-forge functionality (navigates to home with input text)
- ✅ Responsive design
- ✅ Clean navigation bar

## File Structure

```
src/
├── pages/
│   ├── HomePage.jsx
│   ├── MyCreationsPage.jsx
│   └── AuthPage.jsx
├── components/
│   ├── Navigation.jsx
│   └── ... (other components)
├── App.jsx (router setup)
└── main.jsx
```

