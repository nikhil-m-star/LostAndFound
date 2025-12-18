# Lost & Found

Monorepo containing a Vite + React frontend and an Express + MongoDB backend.

Quick start (development)

1. Start backend
   - cd backend
   - npm install
   - copy `.env.example` -> `.env` and set `MONGO_URI` and `JWT_SECRET` (and Cloudinary vars if used)
   - npm run dev

2. Start frontend
   - cd frontend
   - npm install
   - copy `.env.example` -> `.env` and set `VITE_API_BASE` (e.g., `http://localhost:5000/api`)
   - npm run dev

Notes
- The backend `POST /api/items` endpoint supports multipart/form-data image uploads (field `images`) and returns images saved to Cloudinary as `{ url, public_id }` entries.
- Auth: register/login endpoints available at `/api/auth` and used via `Authorization: Bearer <token>` header.

If you'd like, I can add a simple `concurrently` script to run both servers together.
