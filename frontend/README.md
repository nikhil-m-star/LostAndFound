# Lost & Found — Frontend

This is a minimal Vite + React frontend for the Lost & Found app.

Setup
1. cd frontend
2. npm install
3. Copy `.env.example` to `.env` and set `VITE_API_BASE` (e.g., `http://localhost:5000/api`).
4. npm run dev

Notes
- The report forms (`/report/found` and `/report/lost`) POST multipart/form-data with image files in the `images` field and require a JWT in `Authorization: Bearer <token>`.
- The `VITE_API_BASE` environment var is used to point at the backend API during development.
