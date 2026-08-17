# SDMS Backend

Express + MongoDB REST API for the Student Data Management System.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI to your local or Atlas connection string, and a real JWT_SECRET

npm run seed   # populates demo data (departments, faculty, students, attendance, marks, fees...)
npm run dev    # starts on http://localhost:5000 (nodemon)
```

## Demo Login Credentials (created by the seed script)

| Role    | Email                          | Password    |
|---------|---------------------------------|-------------|
| Admin   | admin@sdms.edu                 | Admin@123   |
| Faculty | (printed at end of `npm run seed`) | Faculty@123 |
| Student | (printed at end of `npm run seed`) | Student@123 |

## Notes

- All routes except `/api/auth/login`, `/api/auth/register`, and `/api/auth/forgot-password` require a `Bearer` token.
- Role-based authorization: `admin` (full access), `faculty` (students/attendance/marks they teach), `student` (read-only, own record).
- Cached student stats (`attendancePercentage`, `cgpa`, `backlogs`, fee totals) are recomputed automatically whenever attendance, marks, or fee records change — see `services/studentStatsService.js`.
