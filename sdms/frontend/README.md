# SDMS Frontend

React + Vite + Tailwind CSS client for the Student Data Management System.

## Setup

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173, proxies /api to http://localhost:5000
```

Make sure the backend is running first (`cd ../backend && npm run dev`) and seeded (`npm run seed`).

## Design notes

- Palette and type system live in `tailwind.config.js` (ink/brass academic palette, Fraunces/Inter/IBM Plex Mono).
- Shared UI primitives are in `src/components/common/`.
- API calls are centralized in `src/services/index.js` — one object per resource.
- Auth state, theme (light/dark, persisted to localStorage), and toasts are React Context providers in `src/context/`.
- Role-based route access is enforced in `src/components/common/ProtectedRoute.jsx` and mirrored in `src/components/layout/Sidebar.jsx` (nav items are filtered by role).

## Known gaps to finish before shipping

- Real image upload for profile photos (currently URL-based `profilePhoto`/`avatar` fields only).
- The Reports page renders a generic table for any report shape — polish per-report layouts if needed.
- PDF export uses the browser print dialog (`window.print()`) rather than a generated PDF file; swap in a library like `jspdf` if a true PDF download is required.
- No automated tests included.
