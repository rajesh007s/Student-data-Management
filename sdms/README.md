# Meridian College — Student Data Management System

A full-stack SDMS: React/Vite/Tailwind frontend + Node/Express/MongoDB backend.

## Quick start

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET
npm run seed               # creates demo data + prints login credentials
npm run dev                 # http://localhost:5000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173 and log in with the admin demo account:
`admin@sdms.edu` / `Admin@123` (faculty/student demo credentials print in the terminal after seeding).

## What's here

```
backend/    Express REST API, MongoDB models, JWT auth, seed script
frontend/   React app — 15 pages, charts, dark mode, role-based access
```

See `backend/README.md` and `frontend/README.md` for details on each half.

## Requirements this project fulfills

- All 15 pages from the spec (Login, Dashboard, Students ×4, Faculty, Courses, Attendance, Marks, Fees, Reports, Notifications, Profile, Settings)
- Full CRUD + search/filter/sort/pagination/export on every management module
- JWT auth with admin/faculty/student roles and route-level authorization
- Auto-calculated grades/GPA/CGPA, cached student stats recomputed on any related record change
- Smart insights (at-risk detection, performance scoring) and a dashboard with 5 chart types
- Toast feedback, confirm-before-delete modals, loading skeletons, empty/error states, 404 page
- Light/dark mode with localStorage persistence

## What you'll still need to do

- Run `npm install` in both folders on a machine with internet access (this build environment had network disabled, so dependencies were written but not installed or executed).
- Point `MONGO_URI` at a real MongoDB instance (local or Atlas) and set a real `JWT_SECRET`.
- Smoke-test the full flow yourself — forms, charts, and API wiring were built carefully and cross-checked, but weren't run live end-to-end in this environment.
- The original Figma file wasn't accessible to me (Figma blocks automated fetching), so the visual design is an original SaaS-quality academic-registrar aesthetic rather than a literal reproduction of your mockups. Swap colors/spacing in `frontend/tailwind.config.js` if you want a closer match once you can compare side-by-side.
